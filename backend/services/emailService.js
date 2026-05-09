const nodemailer = require('nodemailer');
const Admin = require('../models/Admin');
const User = require('../models/User'); // Added missing import for User

// Create transporter
const createTransporter = () => {
  console.log('📧 Email configuration check:');
  console.log('- EMAIL_HOST:', process.env.EMAIL_HOST ? 'Set' : 'Missing');
  console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
  console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? (process.env.EMAIL_PASS === 'your-gmail-app-password' ? 'Placeholder' : 'Set') : 'Missing');
  
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('❌ Email configuration missing. Email notifications will be disabled.');
    return null;
  }
  if (process.env.EMAIL_PASS === 'your-gmail-app-password') {
    console.warn('❌ Email password is still placeholder. Email notifications will be disabled.');
    return null;
  }

  console.log('✅ Email configuration looks good. Creating transporter...');

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // Use TLS instead of SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 5 // Limit to 5 emails per second
  });
};

// Initialize transporter lazily
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

/**
 * Get admin emails from database
 */
async function getAdminEmails() {
  try {
    console.log('🔍 Fetching admin emails from database...');
    
    // First try to get admin users directly
    const adminUsers = await User.find({ role: 'admin', isActive: true })
      .select('email');
    
    console.log(`Found ${adminUsers.length} admin users in database`);
    
    const emails = adminUsers
      .map(user => user.email)
      .filter(email => email); // Remove any undefined emails
    
    console.log('📧 Admin emails found:', emails);
    
    if (emails.length === 0) {
      console.warn('⚠️ No admin emails found. Email notifications will not be sent.');
      console.log('💡 To fix this:');
      console.log('1. Create admin users in the database');
      console.log('2. Ensure admin users have email addresses');
      console.log('3. Make sure users have admin role');
    }
    
    return emails;
  } catch (error) {
    console.error('❌ Error fetching admin emails:', error);
    return [];
  }
}

/**
 * Send a simple email
 */
async function sendEmail({ to, subject, text }) {
  console.log(`📧 Attempting to send email to: ${to}`);
  console.log(`📧 Subject: ${subject}`);
  
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('❌ Email transporter not available. Skipping email send.');
    return { success: false, error: 'Email service not configured' };
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'RoadTracker <noreply@roadtracker.com>',
    to,
    subject,
    text
  };

  try {
    console.log('📧 Sending email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email send failed:', error);
    console.error('❌ Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    return { success: false, error: error.message };
  }
}

/**
 * Send new report notification to admins
 */
async function sendNewReportNotification(report, reporter) {
  // Check if email service is configured
  const transporter = getTransporter();
  if (!transporter) {
    console.log('📧 Email service not configured, skipping notification');
    return { success: false, error: 'Email service not configured' };
  }
  
  const adminEmails = await getAdminEmails();
  
  if (adminEmails.length === 0) {
    console.warn('No admin emails found in database for notifications');
    return { success: false, error: 'No admin emails found' };
  }

  const text = `New Road Issue Report

Type: ${report.type}
Severity: ${report.severity}
Location: ${report.location.address}
Description: ${report.description}
Reporter: ${reporter.name} (${reporter.email})
Date: ${new Date().toLocaleString()}

View in admin dashboard: ${process.env.CLIENT_URL}/admin`;

  return await sendEmail({
    to: adminEmails.join(','),
    subject: `New ${report.severity} Priority Road Issue - ${report.type}`,
    text
  });
}

/**
 * Send status update notification to user
 */
async function sendStatusUpdateNotification(report, newStatus, adminName, notes = '') {
  // Check if email service is configured
  const transporter = getTransporter();
  if (!transporter) {
    console.log('📧 Email service not configured, skipping notification');
    return { success: false, error: 'Email service not configured' };
  }
  
  if (!report.reporter?.email) {
    console.warn('No reporter email available for status update notification');
    return { success: false, error: 'No reporter email available' };
  }

  const text = `Road Issue Status Update

Issue Type: ${report.type}
Location: ${report.location.address}
New Status: ${newStatus}
Updated by: ${adminName}
Date: ${new Date().toLocaleString()}
${notes ? `Notes: ${notes}` : ''}

View report details: ${process.env.CLIENT_URL}/reports/${report._id}`;

  return await sendEmail({
    to: report.reporter.email,
    subject: `Road Issue Status Updated - ${newStatus}`,
    text
  });
}

/**
 * Send welcome email to new user
 */
async function sendWelcomeEmail(user) {
  // Check if email service is configured
  const transporter = getTransporter();
  if (!transporter) {
    console.log('📧 Email service not configured, skipping welcome email');
    return { success: false, error: 'Email service not configured' };
  }
  
  const text = `Welcome to RoadTracker!

Hello ${user.name},

Welcome to RoadTracker, where you can help make our roads safer for everyone.

You can:
- Report road issues with photos
- Get AI-powered issue analysis
- View live map of reported issues
- Track the status of your reports
- Chat with our AI assistant

Get started by reporting your first issue: ${process.env.CLIENT_URL}/report

Thank you for joining our community!`;

  return await sendEmail({
    to: user.email,
    subject: 'Welcome to RoadTracker!',
    text
  });
}

/**
 * Send contractor assignment notification to user
 */
async function sendContractorAssignmentNotification(report, contractor, assignedBy) {
  // Check if email service is configured
  const transporter = getTransporter();
  if (!transporter) {
    console.log('📧 Email service not configured, skipping contractor notification');
    return { success: false, error: 'Email service not configured' };
  }
  
  if (!report.reporter?.email) {
    console.warn('No reporter email available for contractor notification');
    return { success: false, error: 'No reporter email available' };
  }

  const text = `Contractor Assigned to Your Report

Issue Type: ${report.type}
Location: ${report.location.address}
Contractor: ${contractor.name}
Assigned by: ${assignedBy}
Date: ${new Date().toLocaleString()}

Your road issue has been assigned to a contractor and work will begin soon.

View report details: ${process.env.CLIENT_URL}/reports/${report._id}`;

  return await sendEmail({
    to: report.reporter.email,
    subject: `Contractor Assigned - ${report.type} Issue`,
    text
  });
}

/**
 * Send a weather-based notification to the user for their report
 */
async function sendWeatherAffectedReportNotification(report, weatherData) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('📧 Email service not configured, skipping weather notification');
    return { success: false, error: 'Email service not configured' };
  }

  if (!report.reporter?.email) {
    console.warn('No reporter email available for weather notification');
    return { success: false, error: 'No reporter email available' };
  }

  // Customize message based on weather condition
  let subject = `Update on Your Road Issue: Weather Alert`;
  let weatherInfo = ``;

  if (weatherData && weatherData.condition) {
    weatherInfo = `Current weather at your report location (${report.location.address}): ${weatherData.description} (${weatherData.temperature}°C).`;
    if (weatherData.condition.toLowerCase().includes('rain') || weatherData.condition.toLowerCase().includes('drizzle')) {
      subject = `Important Update: Rain Affecting Your Road Issue at ${report.location.address}`; 
      weatherInfo += ` Due to current rain, resolution of your report might be delayed. We appreciate your patience.`;
    } else if (weatherData.condition.toLowerCase().includes('snow')) {
      subject = `Important Update: Snow Affecting Your Road Issue at ${report.location.address}`; 
      weatherInfo += ` Due to snow, resolution of your report might be delayed. We appreciate your patience.`;
    } else if (weatherData.condition.toLowerCase().includes('storm') || weatherData.condition.toLowerCase().includes('thunderstorm')) {
      subject = `Urgent Update: Storm Warning for Your Road Issue at ${report.location.address}`; 
      weatherInfo += ` Severe weather conditions might prevent immediate resolution. Your safety is our priority.`;
    }
  } else {
    weatherInfo = `We are currently checking weather conditions at your report location (${report.location.address}).`;
  }

  const text = `Hello ${report.reporter.name},

This is an update regarding your reported road issue:

Issue Type: ${report.type}
Location: ${report.location.address}

${weatherInfo}

For more details, please visit your report page: ${process.env.CLIENT_URL}/reports/${report._id}

Thank you for using RoadTracker.`;

  return await sendEmail({
    to: report.reporter.email,
    subject,
    text
  });
}

/**
 * Send daily summary to admins
 */
async function sendDailySummary(stats) {
  const adminEmails = await getAdminEmails();
  
  if (adminEmails.length === 0) {
    console.warn('No admin emails found in database for daily summary');
    return { success: false, error: 'No admin emails found' };
  }

  const text = `Daily Summary Report

New Reports: ${stats.newReports}
Resolved: ${stats.resolved}
Critical Issues: ${stats.critical}
Pending Review: ${stats.pending}

View full dashboard: ${process.env.CLIENT_URL}/admin`;

  return await sendEmail({
    to: adminEmails.join(','),
    subject: 'RoadTracker Daily Summary Report',
    text
  });
}

/**
 * Send confirmation email to user when they submit a report
 */
async function sendReportSubmissionConfirmation(report, user) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('📧 Email service not configured, skipping user confirmation email');
    return { success: false, error: 'Email service not configured' };
  }

  if (!user?.email) {
    console.warn('No user email available for report submission confirmation');
    return { success: false, error: 'No user email available' };
  }

  const text = `Thank you for submitting a road issue on RoadTracker!\n\nIssue Type: ${report.type}\nLocation: ${report.location.address}\nDescription: ${report.description}\nDate: ${new Date().toLocaleString()}\n\nYou can track the status of your report here: ${process.env.CLIENT_URL}/my-reports\n\nThank you for helping make our roads safer!`;

  return await sendEmail({
    to: user.email,
    subject: 'Your Road Issue Report Has Been Received',
    text
  });
}

module.exports = {
  sendEmail,
  sendNewReportNotification,
  sendStatusUpdateNotification,
  sendWelcomeEmail,
  sendContractorAssignmentNotification,
  sendDailySummary,
  getAdminEmails,
  sendReportSubmissionConfirmation,
}; 