import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

class EmailService {
  static async verifyCredentials() {
    try {
      const response = await axios.post(`${API_BASE_URL}/verify-credentials`);
      return response.data;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      throw error;
    }
  }

  static async sendEmail(emailData) {
    try {
      // First verify credentials
      await this.verifyCredentials();

      const formData = new FormData();
      formData.append('to', emailData.to);
      formData.append('subject', emailData.subject);
      formData.append('content', emailData.content);

      if (emailData.attachments) {
        emailData.attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const response = await axios.post(`${API_BASE_URL}/send-email`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  static async scheduleEmail(emailData, scheduledTime) {
    try {
      // First verify credentials
      await this.verifyCredentials();

      const formData = new FormData();
      formData.append('to', emailData.to);
      formData.append('subject', emailData.subject);
      formData.append('content', emailData.content);
      formData.append('scheduledTime', scheduledTime);

      if (emailData.attachments) {
        emailData.attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const response = await axios.post(`${API_BASE_URL}/schedule-email`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error scheduling email:', error);
      throw error;
    }
  }
}

export default EmailService;
