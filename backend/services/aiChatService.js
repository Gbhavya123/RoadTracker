const axios = require('axios');

// Helper function to provide contextual suggestions
function getHelpfulSuggestions(userMessage) {
  const message = userMessage.toLowerCase();
  
  if (message.includes('report') || message.includes('submit') || message.includes('issue')) {
    return "💡 Go to /report to submit issues with photos.";
  }
  
  if (message.includes('map') || message.includes('view') || message.includes('see')) {
    return "🗺️ Check /map for live issue tracking.";
  }
  
  if (message.includes('dashboard') || message.includes('track') || message.includes('status')) {
    return "📊 Visit /dashboard/user to track your reports.";
  }
  
  if (message.includes('login') || message.includes('sign in') || message.includes('account')) {
    return "🔐 Use Google OAuth to sign in quickly.";
  }
  
  if (message.includes('photo') || message.includes('image') || message.includes('upload')) {
    return "📸 Upload photos for AI analysis.";
  }
  
  if (message.includes('admin') || message.includes('manage') || message.includes('verify')) {
    return "⚙️ Admins can verify reports and assign contractors.";
  }
  
  if (message.includes('points') || message.includes('level') || message.includes('bronze') || message.includes('silver') || message.includes('gold')) {
    return "🏆 Earn points: Bronze → Silver → Gold → Platinum.";
  }
  
  return null;
}

async function sendAIChatMessage({ message, userId }) {
  console.log('AI Chat Service called with:', { message, userId });
  console.log('Environment variables:', {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Set' : 'Not set',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Not set'
  });
  
  // Check if API keys are configured
  const geminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key';
  const openaiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key';
  
  console.log('API key status:', { geminiKey: !!geminiKey, openaiKey: !!openaiKey });
  
  // Use Gemini API if key is present and valid
  if (geminiKey) {
    try {
      console.log('Attempting Gemini API call...');
      // Use the correct model name for v1beta API
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY;
    const body = {
        contents: [{ 
          parts: [{ 
            text: `You are a professional AI assistant for RoadTracker. Give CONCISE, CLEAR, and PERFECT answers.

RULES:
- Keep responses to 1-2 sentences maximum
- Be direct and actionable
- Use simple, clear language
- Focus on the most important information
- Be helpful and professional

RoadTracker features:
- Report road issues (potholes, cracks, debris, signage)
- Upload photos for AI analysis
- View live map of issues
- Track report status
- Earn points and levels

User message: ${message}` 
          }] 
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 120,
          topP: 0.8,
          topK: 40
        }
      };
      
      console.log('Gemini API URL:', url);
      console.log('Gemini API body:', JSON.stringify(body, null, 2));
      
      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      
      console.log('Gemini API response status:', response.status);
      
      const responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        console.log('Gemini API response received successfully');
        
        // Ensure response is concise (max 200 characters)
        let finalResponse = responseText.trim();
        if (finalResponse.length > 200) {
          finalResponse = finalResponse.substring(0, 197) + '...';
        }
        
        // Add helpful suggestions based on user's message
        const suggestions = getHelpfulSuggestions(message);
        if (suggestions) {
          return finalResponse + '\n\n' + suggestions;
        }
        
        return finalResponse;
      } else {
        console.log('No response text in Gemini API response, falling back to demo mode');
        throw new Error('No response from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API error:', error.message);
      console.error('Gemini API error response:', error.response?.data);
      console.error('Gemini API error status:', error.response?.status);
      
      // If it's a 404, 403, or any API error, fall back to demo mode
      if (error.response?.status === 404 || error.response?.status === 403 || error.response?.status === 400) {
        console.log('Gemini API error, falling back to demo mode');
        return `Hi! I'm your RoadTracker assistant. Ask me about reporting issues, using the map, or tracking reports. I'm in demo mode - configure an API key for full features.`;
      }
      
      throw new Error('AI service temporarily unavailable');
    }
  } 
  // Use OpenAI API if key is present and valid
  else if (openaiKey) {
    try {
    const url = 'https://api.openai.com/v1/chat/completions';
    const body = {
      model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: `You are a professional AI assistant for RoadTracker. Give CONCISE, CLEAR, and PERFECT answers.

RULES:
- Keep responses to 1-2 sentences maximum
- Be direct and actionable
- Use simple, clear language
- Focus on the most important information
- Be helpful and professional

RoadTracker features:
- Report road issues (potholes, cracks, debris, signage)
- Upload photos for AI analysis
- View live map of issues
- Track report status
- Earn points and levels

Provide quick, helpful answers.` 
          },
          { role: 'user', content: message }
        ],
      user: userId
    };
    const response = await axios.post(url, body, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
      return response.data.choices?.[0]?.message?.content || 'I apologize, but I couldn\'t generate a response at the moment.';
    } catch (error) {
      console.error('OpenAI API error:', error.message);
      throw new Error('AI service temporarily unavailable');
    }
  } 
  // Fallback response when no API key is configured
  else {
    console.log('Using fallback response (no API key configured)');
    return `Hi! I'm your RoadTracker assistant. Ask me about reporting issues, using the map, or tracking reports. I'm in demo mode - configure an API key for full features.`;
  }
}

module.exports = { sendAIChatMessage }; 