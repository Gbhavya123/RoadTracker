const asyncHandler = require('express-async-handler');
const ReportService = require('../services/reportService');
const AIService = require('../services/aiService');
const { sendNewReportNotification, sendStatusUpdateNotification, sendContractorAssignmentNotification, sendReportSubmissionConfirmation } = require('../services/emailService');
const { processReportsWithGeocoding } = require('../utils/geocodingUtils');

// @desc    Create new report
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
  try {
    const report = await ReportService.createReport(req.body, req.user._id);
    
    // Emit real-time events for immediate updates
    const io = req.app.get('io');
    io.emit('report:new', report);
    io.emit('user:stats:update', { userId: req.user._id });
    io.emit('admin:stats:update');

    // Send professional email notification to admins
    try {
      await sendNewReportNotification(report, req.user);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }

    // Send confirmation email to user
    try {
      await sendReportSubmissionConfirmation(report, req.user);
    } catch (emailError) {
      console.error('User confirmation email failed:', emailError);
    }

    res.status(201).json({
      success: true,
      data: report,
      message: 'Report created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private
const getReports = asyncHandler(async (req, res) => {
  try {
    const result = await ReportService.getReports(req.query, req.query);

    // Process reports with geocoding if reports array exists
    if (result.reports && Array.isArray(result.reports)) {
      result.reports = await processReportsWithGeocoding(result.reports);
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Reports retrieved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Private
const getReportById = asyncHandler(async (req, res) => {
  try {
    const report = await ReportService.getReportById(req.params.id);

    res.status(200).json({
      success: true,
      data: report,
      message: 'Report retrieved successfully'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 404
      }
    });
  }
});

// @desc    Update report
// @route   PUT /api/reports/:id
// @access  Private
const updateReport = asyncHandler(async (req, res) => {
  try {
    const report = await ReportService.updateReport(req.params.id, req.body, req.user._id);

    res.status(200).json({
      success: true,
      data: report,
      message: 'Report updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
const deleteReport = asyncHandler(async (req, res) => {
  try {
    await ReportService.deleteReport(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Update report status (Admin only)
// @route   PUT /api/reports/:id/status
// @access  Private (Admin)
const updateReportStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Status is required',
        statusCode: 400
      }
    });
  }

  try {
    const report = await ReportService.updateReportStatus(req.params.id, status, req.user._id, notes);
    
    // Emit real-time events for immediate updates
    const io = req.app.get('io');
    io.emit('report:status', report);
    io.emit('user:stats:update', { userId: report.reporter });
    io.emit('admin:stats:update');

    // Send professional email notification to reporter
    try {
      await sendStatusUpdateNotification(report, status, req.user.name, notes);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }

    res.status(200).json({
      success: true,
      data: report,
      message: `Report status updated to ${status}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Add admin note (Admin only)
// @route   POST /api/reports/:id/notes
// @access  Private (Admin)
const addAdminNote = asyncHandler(async (req, res) => {
  const { note } = req.body;

  if (!note) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Note is required',
        statusCode: 400
      }
    });
  }

  try {
    const report = await ReportService.addAdminNote(req.params.id, note, req.user._id);

    res.status(200).json({
      success: true,
      data: report,
      message: 'Admin note added successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Assign contractor (Admin only)
// @route   PUT /api/reports/:id/contractor
// @access  Private (Admin)
const assignContractor = asyncHandler(async (req, res) => {
  try {
    const report = await ReportService.assignContractor(req.params.id, req.body, req.user._id);
    
    // Emit real-time events for immediate updates
    const io = req.app.get('io');
    io.emit('contractor:assign', {
      reportId: report._id,
      contractor: report.contractor
    });
    io.emit('user:stats:update', { userId: report.reporter });
    io.emit('admin:stats:update');

    // Send email notification to user about contractor assignment
    try {
      await sendContractorAssignmentNotification(report, report.contractor, req.user.name);
    } catch (emailError) {
      console.error('Contractor assignment email notification failed:', emailError);
    }

    res.status(200).json({
      success: true,
      data: report,
      message: 'Contractor assigned successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Vote on report
// @route   POST /api/reports/:id/vote
// @access  Private
const voteOnReport = asyncHandler(async (req, res) => {
  const { vote } = req.body;

  if (!vote || !['upvote', 'downvote'].includes(vote)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Valid vote is required (upvote or downvote)',
        statusCode: 400
      }
    });
  }

  try {
    const report = await ReportService.voteOnReport(req.params.id, vote, req.user._id);

    res.status(200).json({
      success: true,
      data: report,
      message: `Vote ${vote} recorded successfully`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Get user's reports
// @route   GET /api/reports/user/me
// @access  Private
const getUserReports = asyncHandler(async (req, res) => {
  try {
    const reports = await ReportService.getUserReports(req.user._id, req.query);

    // Process reports with geocoding
    const processedReports = await processReportsWithGeocoding(reports);

    res.status(200).json({
      success: true,
      data: processedReports,
      message: 'User reports retrieved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Get reports by location
// @route   GET /api/reports/location
// @access  Public
const getReportsByLocation = asyncHandler(async (req, res) => {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Latitude and longitude are required',
        statusCode: 400
      }
    });
  }

  try {
    const reports = await ReportService.getReportsByLocation(lat, lng, radius);

    res.status(200).json({
      success: true,
      data: reports,
      message: 'Location-based reports retrieved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Get report statistics
// @route   GET /api/reports/stats
// @access  Private (Admin)
const getReportStats = asyncHandler(async (req, res) => {
  try {
    const stats = await ReportService.getReportStats();

    res.status(200).json({
      success: true,
      data: stats,
      message: 'Report statistics retrieved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Get reports by type
// @route   GET /api/reports/stats/by-type
// @access  Private (Admin)
const getReportsByType = asyncHandler(async (req, res) => {
  try {
    const stats = await ReportService.getReportsByType();

    res.status(200).json({
      success: true,
      data: stats,
      message: 'Reports by type retrieved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Get urgent reports
// @route   GET /api/reports/urgent
// @access  Private (Admin)
const getUrgentReports = asyncHandler(async (req, res) => {
  try {
    const reports = await ReportService.getUrgentReports();

    res.status(200).json({
      success: true,
      data: reports,
      message: 'Urgent reports retrieved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Get recent reports
// @route   GET /api/reports/recent
// @access  Public
const getRecentReports = asyncHandler(async (req, res) => {
  const { limit } = req.query;

  try {
    const reports = await ReportService.getRecentReports(limit);

    res.status(200).json({
      success: true,
      data: reports,
      message: 'Recent reports retrieved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Search reports
// @route   GET /api/reports/search
// @access  Public
const searchReports = asyncHandler(async (req, res) => {
  const { q, ...filters } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Search query is required',
        statusCode: 400
      }
    });
  }

  try {
    const reports = await ReportService.searchReports(q, filters);

    res.status(200).json({
      success: true,
      data: reports,
      message: 'Search results retrieved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Get duplicate reports
// @route   GET /api/reports/:id/duplicates
// @access  Private (Admin)
const getDuplicateReports = asyncHandler(async (req, res) => {
  try {
    const duplicates = await ReportService.getDuplicateReports(req.params.id);

    res.status(200).json({
      success: true,
      data: duplicates,
      message: 'Duplicate reports retrieved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Link duplicate reports
// @route   POST /api/reports/:id/link-duplicates
// @access  Private (Admin)
const linkDuplicateReports = asyncHandler(async (req, res) => {
  const { duplicateIds } = req.body;

  if (!duplicateIds || !Array.isArray(duplicateIds)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Duplicate IDs array is required',
        statusCode: 400
      }
    });
  }

  try {
    const report = await ReportService.linkDuplicateReports(req.params.id, duplicateIds);

    res.status(200).json({
      success: true,
      data: report,
      message: 'Duplicate reports linked successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Analyze image with AI
// @route   POST /api/reports/analyze-image
// @access  Private
const analyzeImage = asyncHandler(async (req, res) => {
  try {
    // Check if image file is provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Image file is required',
          statusCode: 400
        }
      });
    }

    // Analyze image with AI
    const analysis = await AIService.analyzeRoadImage(
      req.file.buffer,
      req.file.mimetype
    );

    res.status(200).json({
      success: true,
      data: analysis.data,
      message: 'Image analyzed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

// @desc    Get AI analysis statistics
// @route   GET /api/reports/ai-stats
// @access  Private (Admin)
const getAIAnalysisStats = asyncHandler(async (req, res) => {
  try {
    const stats = await AIService.getAIAnalysisStats();

    res.status(200).json({
      success: true,
      data: stats,
      message: 'AI analysis statistics retrieved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        statusCode: 400
      }
    });
  }
});

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  updateReportStatus,
  addAdminNote,
  assignContractor,
  voteOnReport,
  getUserReports,
  getReportsByLocation,
  getReportStats,
  getReportsByType,
  getUrgentReports,
  getRecentReports,
  searchReports,
  getDuplicateReports,
  linkDuplicateReports,
  analyzeImage,
  getAIAnalysisStats
}; 