const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
require('dotenv').config();

console.log('Creating email transporter with config:', {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER ? 'Set' : 'Not set',
    pass: process.env.EMAIL_PASSWORD ? 'Set' : 'Not set'
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Transporter verification failed:', error);
  } else {
    console.log('Transporter is ready to send emails');
  }
});

const sendEmail = async (emailData) => {
  try {
    console.log('Starting to send email with data:', {
      to: emailData.to,
      subject: emailData.subject,
      contentLength: emailData.content?.length,
      attachmentsCount: emailData.attachments?.length
    });
    
    const { to, subject, content, attachments = [] } = emailData;
    
    console.log('Preparing mail options');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: content,
      text: content.replace(/<[^>]*>/g, ''),
      attachments: attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType
      }))
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
    const info = await transporter.sendMail(mailOptions);
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
    console.log('Email data:', {
      to: emailData.to,
      subject: emailData.subject,
      contentLength: emailData.content?.length,
      attachmentsCount: emailData.attachments?.length
    });

    const job = schedule.scheduleJob(new Date(scheduledTime), async () => {
      try {
        await sendEmail(emailData);
        console.log('Scheduled email sent successfully');
      } catch (error) {
        console.error('Error sending scheduled email:', error);
      }
    });

    return {
      success: true,
      message: 'Email scheduled successfully',
      scheduledTime: scheduledTime
    };
  } catch (error) {
    console.error('Error scheduling email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  scheduleEmail
};
