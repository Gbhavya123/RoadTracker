const Report = require('../models/Report');
const { sendDailySummary } = require('./emailService');

/**
 * Generate daily statistics
 */
async function generateDailyStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const stats = await Report.aggregate([
    {
      $match: {
        createdAt: {
          $gte: today,
          $lt: tomorrow
        }
      }
    },
    {
      $group: {
        _id: null,
        newReports: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        verified: { $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } }
      }
    }
  ]);

  return stats[0] || {
    newReports: 0,
    resolved: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    pending: 0,
    verified: 0,
    inProgress: 0
  };
}

/**
 * Send daily summary email to admins
 */
async function sendDailySummaryEmail() {
  try {
    const stats = await generateDailyStats();
    
    // Only send if there are new reports or resolved issues
    if (stats.newReports > 0 || stats.resolved > 0) {
      const result = await sendDailySummary(stats);
      
      if (result.success) {
        console.log('Daily summary email sent successfully');
      } else {
        console.error('Failed to send daily summary email:', result.error);
      }
    } else {
      console.log('No activity today, skipping daily summary email');
    }
  } catch (error) {
    console.error('Error sending daily summary email:', error);
  }
}

/**
 * Get weekly statistics
 */
async function generateWeeklyStats() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const stats = await Report.aggregate([
    {
      $match: {
        createdAt: {
          $gte: weekAgo
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt'
          }
        },
        count: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  return stats;
}

/**
 * Get monthly statistics
 */
async function generateMonthlyStats() {
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const stats = await Report.aggregate([
    {
      $match: {
        createdAt: {
          $gte: monthAgo
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt'
          }
        },
        count: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  return stats;
}

module.exports = {
  generateDailyStats,
  sendDailySummaryEmail,
  generateWeeklyStats,
  generateMonthlyStats
}; 