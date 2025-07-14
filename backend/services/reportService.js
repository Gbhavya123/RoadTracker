const Report = require('../models/Report');
const User = require('../models/User');
const Admin = require('../models/Admin');

class ReportService {
  // Create new report
  static async createReport(reportData, userId) {
    try {
      const report = new Report({
        ...reportData,
        reporter: userId
      });

      await report.save();

      // Update user stats
      const user = await User.findById(userId);
      if (user) {
        await user.updateStats('reportSubmitted');
      }

      // Update admin stats for all admins when new report is created
      console.log('🔄 Updating admin stats after new report creation...');
      const allAdmins = await Admin.find({ isActive: true });
      for (const adminUser of allAdmins) {
        try {
          await adminUser.updateStats();
        } catch (error) {
          console.error('❌ Error updating stats for admin:', adminUser._id, error);
        }
      }

      return report;
    } catch (error) {
      throw new Error(`Create report failed: ${error.message}`);
    }
  }

  // Get all reports with filtering and pagination
  static async getReports(filters = {}, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sort = 'createdAt',
        order = 'desc',
        type,
        status,
        severity,
        reporter,
        dateFrom,
        dateTo,
        q
      } = filters;

      const {
        lat,
        lng,
        radius = 5000
      } = pagination;

      // Build query
      const query = {};

      if (type) query.type = type;
      if (status) query.status = status;
      if (severity) query.severity = severity;
      if (reporter) query.reporter = reporter;

      // Date range filter
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
      }

      // Text search
      if (q) {
        query.$or = [
          { 'location.address': { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { 'location.city': { $regex: q, $options: 'i' } },
          { 'location.state': { $regex: q, $options: 'i' } }
        ];
      }

      // Location-based query
      if (lat && lng) {
        query['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseFloat(radius)
          }
        };
      }

      // Build sort object
      const sortObj = {};
      sortObj[sort] = order === 'desc' ? -1 : 1;

      // Execute query
      const skip = (page - 1) * limit;
      const reports = await Report.find(query)
        .populate('reporter', 'name email picture')
        .populate('verification.verifiedBy', 'name email')
        .populate('resolution.resolvedBy', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count
      const total = await Report.countDocuments(query);

      return {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Get reports failed: ${error.message}`);
    }
  }

  // Get report by ID
  static async getReportById(reportId) {
    try {
      const report = await Report.findById(reportId)
        .populate('reporter', 'name email picture')
        .populate('verification.verifiedBy', 'name email')
        .populate('resolution.resolvedBy', 'name email')
        .populate('adminNotes.admin', 'name email')
        .populate('upvotes.user', 'name email picture')
        .populate('downvotes.user', 'name email picture');

      if (!report) {
        throw new Error('Report not found');
      }

      return report;
    } catch (error) {
      throw new Error(`Get report failed: ${error.message}`);
    }
  }

  // Update report
  static async updateReport(reportId, updateData, userId) {
    try {
      const report = await Report.findById(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      // Check if user can update this report
      if (report.reporter.toString() !== userId.toString()) {
        const user = await User.findById(userId);
        if (user.role !== 'admin') {
          throw new Error('Not authorized to update this report');
        }
      }

      // Update allowed fields
      const allowedFields = ['type', 'severity', 'description', 'location', 'tags'];
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          report[field] = updateData[field];
        }
      }

      await report.save();
      return report;
    } catch (error) {
      throw new Error(`Update report failed: ${error.message}`);
    }
  }

  // Delete report
  static async deleteReport(reportId, userId) {
    try {
      const report = await Report.findById(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      // Check if user can delete this report
      if (report.reporter.toString() !== userId.toString()) {
        const user = await User.findById(userId);
        if (user.role !== 'admin') {
          throw new Error('Not authorized to delete this report');
        }
      }

      await Report.findByIdAndDelete(reportId);
      return true;
    } catch (error) {
      throw new Error(`Delete report failed: ${error.message}`);
    }
  }

  // Update report status (admin only)
  static async updateReportStatus(reportId, status, adminId, notes = '') {
    try {
      const report = await Report.findById(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      // Check if admin has permission
      const admin = await Admin.findOne({ user: adminId });
      if (!admin || !admin.hasPermission('edit_reports')) {
        throw new Error('Insufficient permissions');
      }

      await report.updateStatus(status, adminId, notes);

      // Update admin activity
      await admin.updateActivity(status === 'resolved' ? 'resolve' : 'review');

      // Update admin stats for all admins when report status changes
      console.log('🔄 Updating admin stats after report status change...');
      const allAdmins = await Admin.find({ isActive: true });
      for (const adminUser of allAdmins) {
        try {
          await adminUser.updateStats();
        } catch (error) {
          console.error('❌ Error updating stats for admin:', adminUser._id, error);
        }
      }

      // Update user stats for all status changes
        const user = await User.findById(report.reporter);
        if (user) {
        // Recalculate user stats based on all their reports
        const userReports = await Report.find({ reporter: report.reporter });
        const reportsSubmitted = userReports.length;
        const reportsResolved = userReports.filter(r => r.status === 'resolved').length;
        const reportsInProgress = userReports.filter(r => r.status === 'in-progress').length;
        const reportsPending = userReports.filter(r => r.status === 'pending').length;
        const reportsVerified = userReports.filter(r => r.status === 'verified').length;
        
        // Calculate points
        const points = reportsSubmitted * 10 + reportsResolved * 20;
        
        // Determine level
        let level = 'Bronze';
        if (points >= 1000) level = 'Platinum';
        else if (points >= 500) level = 'Gold';
        else if (points >= 100) level = 'Silver';
        
        // Update user stats
        user.stats = {
          reportsSubmitted,
          reportsResolved,
          reportsInProgress,
          reportsPending,
          reportsVerified,
          points,
          level
        };
        
        await user.save();
      }

      return report;
    } catch (error) {
      throw new Error(`Update report status failed: ${error.message}`);
    }
  }

  // Add admin note
  static async addAdminNote(reportId, note, adminId) {
    try {
      const report = await Report.findById(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      // Check if admin has permission
      const admin = await Admin.findOne({ user: adminId });
      if (!admin || !admin.hasPermission('edit_reports')) {
        throw new Error('Insufficient permissions');
      }

      await report.addAdminNote(note, adminId);
      return report;
    } catch (error) {
      throw new Error(`Add admin note failed: ${error.message}`);
    }
  }

  // Assign contractor
  static async assignContractor(reportId, contractorData, adminId) {
    try {
      const report = await Report.findById(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      // Check if admin has permission
      const admin = await Admin.findOne({ user: adminId });
      if (!admin || !admin.hasPermission('assign_contractors')) {
        throw new Error('Insufficient permissions');
      }

      report.contractor = {
        ...contractorData,
        assignedAt: new Date()
      };

      await report.save();
      return report;
    } catch (error) {
      throw new Error(`Assign contractor failed: ${error.message}`);
    }
  }

  // Vote on report
  static async voteOnReport(reportId, vote, userId) {
    try {
      const report = await Report.findById(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      if (vote === 'upvote') {
        await report.addUpvote(userId);
      } else if (vote === 'downvote') {
        await report.addDownvote(userId);
      }

      return report;
    } catch (error) {
      throw new Error(`Vote on report failed: ${error.message}`);
    }
  }

  // Get user's reports
  static async getUserReports(userId, filters = {}) {
    try {
      const query = { reporter: userId, ...filters };
      
      const reports = await Report.find(query)
        .populate('verification.verifiedBy', 'name email')
        .populate('resolution.resolvedBy', 'name email')
        .sort({ createdAt: -1 });

      return reports;
    } catch (error) {
      throw new Error(`Get user reports failed: ${error.message}`);
    }
  }

  // Get reports by location
  static async getReportsByLocation(lat, lng, radius = 5000) {
    try {
      return await Report.getReportsByLocation(lat, lng, radius);
    } catch (error) {
      throw new Error(`Get reports by location failed: ${error.message}`);
    }
  }

  // Get report statistics
  static async getReportStats() {
    try {
      return await Report.getReportStats();
    } catch (error) {
      throw new Error(`Get report stats failed: ${error.message}`);
    }
  }

  // Get reports by type
  static async getReportsByType() {
    try {
      return await Report.getReportsByType();
    } catch (error) {
      throw new Error(`Get reports by type failed: ${error.message}`);
    }
  }

  // Get urgent reports
  static async getUrgentReports() {
    try {
      const reports = await Report.find({
        $or: [
          { severity: 'critical' },
          { safetyRisk: 'critical' },
          { priority: { $gte: 8 } }
        ],
        status: { $ne: 'resolved' }
      })
      .populate('reporter', 'name email picture')
      .sort({ priority: -1, createdAt: 1 })
      .limit(20);

      return reports;
    } catch (error) {
      throw new Error(`Get urgent reports failed: ${error.message}`);
    }
  }

  // Get recent reports
  static async getRecentReports(limit = 10) {
    try {
      const reports = await Report.find()
        .populate('reporter', 'name email picture')
        .sort({ createdAt: -1 })
        .limit(limit);

      return reports;
    } catch (error) {
      throw new Error(`Get recent reports failed: ${error.message}`);
    }
  }

  // Search reports
  static async searchReports(searchTerm, filters = {}) {
    try {
      const query = {
        $or: [
          { 'location.address': { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { type: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ],
        ...filters
      };

      const reports = await Report.find(query)
        .populate('reporter', 'name email picture')
        .sort({ createdAt: -1 });

      return reports;
    } catch (error) {
      throw new Error(`Search reports failed: ${error.message}`);
    }
  }

  // Get duplicate reports
  static async getDuplicateReports(reportId) {
    try {
      const report = await Report.findById(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      // Find reports with similar location and type
      const duplicates = await Report.find({
        _id: { $ne: reportId },
        type: report.type,
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [report.location.coordinates.longitude, report.location.coordinates.latitude]
            },
            $maxDistance: 100 // Within 100 meters
          }
        },
        createdAt: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      })
      .populate('reporter', 'name email picture')
      .sort({ createdAt: -1 });

      return duplicates;
    } catch (error) {
      throw new Error(`Get duplicate reports failed: ${error.message}`);
    }
  }

  // Link duplicate reports
  static async linkDuplicateReports(reportId, duplicateIds) {
    try {
      const report = await Report.findById(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      for (const duplicateId of duplicateIds) {
        const duplicate = await Report.findById(duplicateId);
        if (duplicate) {
          report.duplicateReports.push({ report: duplicateId });
          duplicate.duplicateReports.push({ report: reportId });
          await duplicate.save();
        }
      }

      await report.save();
      return report;
    } catch (error) {
      throw new Error(`Link duplicate reports failed: ${error.message}`);
    }
  }
}

module.exports = ReportService; 