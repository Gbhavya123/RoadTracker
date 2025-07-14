const { GoogleGenerativeAI } = require('@google/generative-ai');
const asyncHandler = require('express-async-handler');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyze road image using Gemini AI to detect and categorize issues
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} imageMimeType - Image MIME type
 * @returns {Object} Analysis result with issue type, severity, and confidence
 */
const analyzeRoadImage = asyncHandler(async (imageBuffer, imageMimeType) => {
  const startTime = Date.now();
  console.log('Starting AI image analysis...');
  console.log('Image MIME type:', imageMimeType);
  console.log('Image buffer size:', imageBuffer.length, 'bytes');

  // Set timeout duration (ms)
  const TIMEOUT_MS = parseInt(process.env.AI_ANALYSIS_TIMEOUT_MS) || 10000;

  function timeoutPromise(ms) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error('AI analysis timed out')), ms));
  }

  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
      console.log('No valid Gemini API key configured, using fallback analysis');
      return {
        success: false,
        data: {
          issueType: 'other',
          severity: 'medium',
          confidence: 0.0,
          description: 'AI analysis not available. Please categorize manually.',
          details: {
            size: 'unknown',
            location: 'unknown',
            trafficImpact: 'unknown',
            safetyRisk: 'unknown'
          }
        },
        error: 'No AI API key configured'
      };
    }

    // Initialize Gemini 1.5 Flash model (free tier, good for image analysis)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('Gemini 1.5 Flash model initialized successfully');

    // Convert image buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Create image part for Gemini
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: imageMimeType
      }
    };

    // Enhanced prompt for road issue analysis (improved for real-world images)
    // PROMPT IMPROVEMENTS: More explicit instructions, real-world edge cases, and clarity for ambiguous images
    const prompt = `
    You are an expert road infrastructure analyst. Analyze this real-world road image and identify any road issues with the highest possible accuracy.

    CATEGORIZATION RULES:
    - pothole: Circular or irregular holes/depressions in asphalt/concrete surface, varying depths. May be filled with water, debris, or shadowed.
    - crack: Linear fissures, spider cracks, or structural cracks in road surface. May be single or networked, thin or wide.
    - waterlogged: Standing water, flooding, or excessive water accumulation on road. May obscure the road surface.
    - debris: Foreign objects, construction materials, fallen branches, rocks, or obstructions. May be partially embedded or scattered.
    - signage: Damaged, missing, obscured, or malfunctioning traffic signs/signals. May be bent, faded, blocked, or fallen.
    - other: Any other road infrastructure issues not covered above, or if the image is unclear/ambiguous.

    SEVERITY ASSESSMENT:
    - critical: Life-threatening, immediate danger, severe safety hazard, major structural damage, or blocks all traffic.
    - high: Significant safety risk, major traffic disruption, requires immediate attention, or blocks a lane.
    - medium: Moderate safety concern, affects traffic flow, needs prompt repair, or partial obstruction.
    - low: Minor inconvenience, cosmetic damage, minimal safety impact, or not urgent.

    DETAILED ANALYSIS:
    - Size: small (<30cm), medium (30-100cm), large (>100cm)
    - Location: road surface, shoulder, center, edge, intersection, curve
    - Traffic Impact: none, low, medium, high, severe
    - Safety Risk: none, low, medium, high, critical

    IMPORTANT:
    - If the image is blurry, dark, or does not clearly show a road issue, respond with "other" and low severity.
    - If multiple issues are visible, describe the most severe one.
    - Be very precise and concise. If unsure, choose "other".
    - Respond ONLY in this exact JSON format (no additional text):
    {
      "issueType": "pothole|crack|waterlogged|debris|signage|other",
      "severity": "critical|high|medium|low",
      "confidence": 0.95,
      "description": "Detailed description of the issue with specific details",
      "details": {
        "size": "small|medium|large",
        "location": "road surface|shoulder|center|edge|intersection|curve",
        "trafficImpact": "none|low|medium|high|severe",
        "safetyRisk": "none|low|medium|high|critical"
      }
    }
    `;

    // Generate content with image, enforcing timeout
    let result, response, text;
    try {
      await Promise.race([
        (async () => {
          result = await model.generateContent([prompt, imagePart]);
          response = await result.response;
          text = response.text();
        })(),
        timeoutPromise(TIMEOUT_MS)
      ]);
    } catch (err) {
      if (err.message === 'AI analysis timed out') {
        console.error('AI analysis timed out after', TIMEOUT_MS, 'ms');
        return {
          success: false,
          data: {
            issueType: 'other',
            severity: 'medium',
            confidence: 0.0,
            description: 'AI analysis timed out. Please try again later or categorize manually.',
            details: {
              size: 'unknown',
              location: 'unknown',
              trafficImpact: 'unknown',
              safetyRisk: 'unknown'
            }
          },
          error: 'AI analysis timed out'
        };
      } else {
        throw err;
      }
    }

    // Parse JSON response
    let analysis;
    try {
      console.log('Raw AI response:', text);
      
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
        console.log('Parsed AI analysis:', analysis);
      } else {
        console.error('No JSON found in AI response');
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response text:', text);
      return {
        success: false,
        data: {
          issueType: 'other',
          severity: 'medium',
          confidence: 0.0,
          description: 'AI response format invalid. Please categorize manually.',
          details: {
            size: 'unknown',
            location: 'unknown',
            trafficImpact: 'unknown',
            safetyRisk: 'unknown'
          }
        },
        error: 'Invalid AI response format'
      };
    }

    // Validate and sanitize the response
    const validTypes = ['pothole', 'crack', 'waterlogged', 'debris', 'signage', 'other'];
    const validSeverities = ['critical', 'high', 'medium', 'low'];
    const validSizes = ['small', 'medium', 'large'];
    const validLocations = ['road surface', 'shoulder', 'center', 'edge', 'intersection', 'curve'];
    const validTrafficImpacts = ['none', 'low', 'medium', 'high', 'severe'];
    const validSafetyRisks = ['none', 'low', 'medium', 'high', 'critical'];

    // Validate and sanitize main fields
    if (!validTypes.includes(analysis.issueType)) {
      console.log(`Invalid issue type: ${analysis.issueType}, defaulting to 'other'`);
      analysis.issueType = 'other';
    }

    if (!validSeverities.includes(analysis.severity)) {
      console.log(`Invalid severity: ${analysis.severity}, defaulting to 'medium'`);
      analysis.severity = 'medium';
    }

    // Ensure confidence is a number between 0 and 1
    analysis.confidence = Math.max(0, Math.min(1, analysis.confidence || 0.5));

    // Validate and sanitize details
    if (!analysis.details) {
      analysis.details = {};
    }

    if (!validSizes.includes(analysis.details.size)) {
      analysis.details.size = 'medium';
    }

    if (!validLocations.includes(analysis.details.location)) {
      analysis.details.location = 'road surface';
    }

    if (!validTrafficImpacts.includes(analysis.details.trafficImpact)) {
      analysis.details.trafficImpact = 'medium';
    }

    if (!validSafetyRisks.includes(analysis.details.safetyRisk)) {
      analysis.details.safetyRisk = 'medium';
    }

    const processingTime = (Date.now() - startTime) / 1000; // Convert to seconds

    console.log('Final validated analysis:', analysis);
    console.log('Processing time:', processingTime, 'seconds');

    return {
      success: true,
      data: {
        ...analysis,
        processingTime
      }
    };

  } catch (error) {
    console.error('AI Analysis Error:', error);
    
    // Fallback to default analysis if AI fails
    return {
      success: false,
      data: {
        issueType: 'other',
        severity: 'medium',
        confidence: 0.0,
        description: 'Unable to analyze image automatically. Please categorize manually.',
        details: {
          size: 'unknown',
          location: 'unknown',
          trafficImpact: 'unknown',
          safetyRisk: 'unknown'
        }
      },
      error: error.message
    };
  }
});

/**
 * Batch analyze multiple images
 * @param {Array} images - Array of image buffers and metadata
 * @returns {Array} Array of analysis results
 */
const analyzeMultipleImages = asyncHandler(async (images) => {
  const results = [];
  
  for (const image of images) {
    const analysis = await analyzeRoadImage(image.buffer, image.mimeType);
    results.push({
      ...analysis,
      imageId: image.id
    });
  }
  
  return results;
});

/**
 * Get AI analysis statistics
 * @returns {Object} Statistics about AI analysis performance
 */
const getAIAnalysisStats = asyncHandler(async () => {
  try {
    // Import Report model to query AI analysis data
    const Report = require('../models/Report');
    
    // Get all reports that have AI analysis data
    const reportsWithAI = await Report.find({
      'aiAnalysis': { $exists: true, $ne: null }
    });
    
    if (reportsWithAI.length === 0) {
      // Return default stats if no AI analysis data exists
  return {
    totalAnalyses: 0,
        accuracyRate: 0.0,
        averageConfidence: 0.0,
        mostCommonIssues: [],
    processingTime: {
          average: 0,
          min: 0,
          max: 0
        }
      };
    }
    
    // Calculate statistics
    const totalAnalyses = reportsWithAI.length;
    
    // Calculate average confidence
    const totalConfidence = reportsWithAI.reduce((sum, report) => {
      return sum + (report.aiAnalysis.confidence || 0);
    }, 0);
    const averageConfidence = totalConfidence / totalAnalyses;
    
    // Calculate processing times
    const processingTimes = reportsWithAI
      .map(report => report.aiAnalysis.processingTime || 0)
      .filter(time => time > 0);
    
    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
      : 0;
    
    const minProcessingTime = processingTimes.length > 0 ? Math.min(...processingTimes) : 0;
    const maxProcessingTime = processingTimes.length > 0 ? Math.max(...processingTimes) : 0;
    
    // Get most common issues
    const issueCounts = {};
    reportsWithAI.forEach(report => {
      const issueType = report.aiAnalysis.issueType || 'other';
      issueCounts[issueType] = (issueCounts[issueType] || 0) + 1;
    });
    
    const mostCommonIssues = Object.entries(issueCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue);
    
    // Calculate accuracy rate (this would need admin feedback to be truly accurate)
    // For now, we'll use a heuristic based on confidence scores
    const highConfidenceAnalyses = reportsWithAI.filter(report => 
      (report.aiAnalysis.confidence || 0) > 0.8
    ).length;
    const accuracyRate = totalAnalyses > 0 ? highConfidenceAnalyses / totalAnalyses : 0;
    
    return {
      totalAnalyses,
      accuracyRate,
      averageConfidence,
      mostCommonIssues,
      processingTime: {
        average: avgProcessingTime,
        min: minProcessingTime,
        max: maxProcessingTime
      }
    };
    
  } catch (error) {
    console.error('Error getting AI analysis stats:', error);
    
    // Return fallback data on error
    return {
      totalAnalyses: 0,
      accuracyRate: 0.0,
      averageConfidence: 0.0,
      mostCommonIssues: [],
      processingTime: {
        average: 0,
        min: 0,
        max: 0
    }
  };
  }
});

module.exports = {
  analyzeRoadImage,
  analyzeMultipleImages,
  getAIAnalysisStats
}; 