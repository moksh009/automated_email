const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
require('dotenv').config();

let transporter = null;

// Function to create and verify transporter
const createTransporter = () => {
  console.log('Creating email transporter with config:', {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER ? 'Set' : 'Not set',
      pass: process.env.EMAIL_PASSWORD ? 'Set' : 'Not set'
    }
  });

  // Create transporter with current credentials
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Verify transporter configuration
  return transporter.verify()
    .then(() => {
      console.log('Transporter is ready to send emails');
      return true;
    })
    .catch((error) => {
      console.error('Transporter verification failed:', error);
      transporter = null;
      throw error;
    });
};

// Initialize transporter
createTransporter().catch(console.error);

// Function to ensure transporter is valid
const getTransporter = async () => {
  if (!transporter) {
    await createTransporter();
  }
  return transporter;
};

// Helper function to preserve line breaks and formatting
const preserveFormatting = (content) => {
  return content
    .replace(/\n/g, '<br>')  // Convert newlines to <br> tags
    .replace(/\r/g, '')      // Remove carriage returns
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
    .trim();                 // Remove leading/trailing whitespace
};

// Helper function to convert HTML to plain text while preserving formatting
const htmlToPlainText = (html) => {
  return html
    .replace(/<br\s*\/?>/gi, '\n')  // Convert <br> to newline
    .replace(/<\/p>/gi, '\n\n')     // Convert </p> to double newline
    .replace(/<[^>]*>/g, '')        // Remove remaining HTML tags
    .replace(/&nbsp;/g, ' ')        // Convert &nbsp; to space
    .replace(/\n\s*\n\s*\n/g, '\n\n')  // Remove excessive newlines
    .trim();
};

const sendEmail = async (emailData) => {
  try {
    const currentTransporter = await getTransporter();
    
    if (!currentTransporter) {
      throw new Error('Email service not configured properly. Please check your credentials.');
    }

    console.log('Starting to send email with data:', {
      to: emailData.to,
      subject: emailData.subject,
      contentLength: emailData.content?.length,
      attachmentsCount: emailData.attachments?.length
    });
    
    const { to, subject, content, attachments = [] } = emailData;
    
    // Preserve formatting in both HTML and plain text
    const htmlContent = preserveFormatting(content);
    const plainTextContent = htmlToPlainText(htmlContent);
    
    console.log('Preparing mail options');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
      text: plainTextContent,
      attachments: attachments.map(attachment => {
        const base = {
          filename: attachment.filename || attachment.name,
          content: attachment.content || attachment.buffer,
          contentType: attachment.contentType || attachment.mimetype
        };

        // Special handling for video attachments
        if (base.contentType && base.contentType.startsWith('video/')) {
          base.contentDisposition = 'attachment'; // Force download for videos
        }

        return base;
      })
    };

    console.log('Mail options prepared:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasHtml: !!mailOptions.html,
      hasText: !!mailOptions.text,
      attachmentsCount: mailOptions.attachments.length
    });

    console.log('Sending email...');
    const info = await currentTransporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info);
    
    return { 
      success: true, 
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected
    };
  } catch (error) {
    console.error('Detailed error in sendEmail:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

const scheduleEmail = async (emailData, scheduledTime) => {
  try {
    console.log('Scheduling email for:', scheduledTime);
    
    // Parse the scheduled time
    const scheduledDate = new Date(scheduledTime);
    
    // Validate the scheduled time
    if (scheduledDate <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }

    // Create a draft email in Gmail
    const { to, subject, content, attachments = [] } = emailData;
    
    // Preserve formatting in both HTML and plain text
    const htmlContent = preserveFormatting(content);
    const plainTextContent = htmlToPlainText(htmlContent);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
      text: plainTextContent,
      attachments: attachments.map(attachment => ({
        filename: attachment.filename || attachment.name,
        content: attachment.content || attachment.buffer,
        contentType: attachment.contentType || attachment.mimetype
      })),
      sendAt: scheduledDate, // Gmail API scheduling
      timeZone: 'Asia/Kolkata' // Use Indian timezone
    };

    // Schedule the email using node-schedule
    const job = schedule.scheduleJob(scheduledDate, async () => {
      try {
        console.log('Executing scheduled email to:', to);
        const currentTransporter = await getTransporter();
        const info = await currentTransporter.sendMail(mailOptions);
        console.log('Scheduled email sent successfully:', info);
      } catch (error) {
        console.error('Error sending scheduled email:', error);
      }
    });

    // Store the scheduled job for potential cancellation
    scheduledJobs[`${to}-${scheduledDate.getTime()}`] = job;

    console.log('Email scheduled successfully for:', scheduledDate);
    return {
      success: true,
      message: `Email scheduled for ${scheduledDate.toLocaleString()}`,
      scheduledTime: scheduledDate
    };
  } catch (error) {
    console.error('Error scheduling email:', error);
    throw error;
  }
};

// Store scheduled jobs
const scheduledJobs = {};

// Add function to get all scheduled jobs
const getScheduledJobs = () => {
  return Object.entries(scheduledJobs).map(([key, job]) => ({
    id: key,
    nextInvocation: job.nextInvocation(),
  }));
};

// Add function to cancel a scheduled job
const cancelScheduledJob = (jobId) => {
  const job = scheduledJobs[jobId];
  if (job) {
    job.cancel();
    delete scheduledJobs[jobId];
    return true;
  }
  return false;
};

module.exports = {
  sendEmail,
  scheduleEmail,
  getScheduledJobs,
  cancelScheduledJob
};
