import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, Box } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

// Import components
import EmailForm from './components/EmailForm/EmailForm';
import EmailList from './components/EmailList/EmailList';
import EmailPreview from './components/EmailPreview/EmailPreview';
import EmailTemplates from './components/EmailTemplates/EmailTemplates';

const API_BASE_URL = 'http://localhost:3001';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Arial", sans-serif',
  },
});

const App = () => {
  const [generatedEmails, setGeneratedEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleEmailGeneration = (emails) => {
    setGeneratedEmails(emails);
  };

  const handleEmailSend = async (email, isScheduled = false, scheduledTime = null) => {
    try {
      setLoading(true);
      const endpoint = isScheduled ? `${API_BASE_URL}/schedule-email` : `${API_BASE_URL}/send-email`;
      
      const formData = new FormData();
      formData.append('to', email.to);
      formData.append('subject', email.subject);
      formData.append('content', email.content);
      
      if (isScheduled) {
        formData.append('scheduledTime', scheduledTime.toISOString());
      }

      if (email.attachments?.length > 0) {
        email.attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const result = await response.json();
      
      // Remove sent email from the list
      setGeneratedEmails(prev => prev.filter(e => e.to !== email.to));
      
      toast.success(isScheduled 
        ? `Email scheduled for ${email.recipientName} at ${scheduledTime.toLocaleString()}`
        : `Email sent successfully to ${email.recipientName}`
      );
      
      return result;
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to ${isScheduled ? 'schedule' : 'send'} email: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleBulkOperation = async (operation, scheduledTime = null) => {
    setLoading(true);
    let successCount = 0;
    let failCount = 0;
    const totalEmails = generatedEmails.length;

    try {
      for (const email of generatedEmails) {
        try {
          await handleEmailSend(email, operation === 'schedule', scheduledTime);
          successCount++;
          toast.info(`Progress: ${successCount}/${totalEmails} emails ${operation === 'schedule' ? 'scheduled' : 'sent'}`, {
            autoClose: 1000,
          });
          await new Promise(resolve => setTimeout(resolve, 1000)); // Prevent rate limiting
        } catch (error) {
          failCount++;
        }
      }

      if (successCount === totalEmails) {
        toast.success(`Successfully ${operation === 'schedule' ? 'scheduled' : 'sent'} all ${successCount} emails!`);
      } else {
        toast.info(`${operation === 'schedule' ? 'Scheduled' : 'Sent'} ${successCount} emails, ${failCount} failed`);
      }
    } catch (error) {
      console.error(`Error in bulk ${operation}:`, error);
      toast.error(`Error ${operation === 'schedule' ? 'scheduling' : 'sending'} emails: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <EmailForm 
              onEmailsGenerated={handleEmailGeneration}
              loading={loading}
            />
            
            {generatedEmails.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <EmailList
                  emails={generatedEmails}
                  onSendEmail={(email) => handleEmailSend(email, false)}
                  onScheduleEmail={(email, time) => handleEmailSend(email, true, time)}
                  onBulkSend={() => handleBulkOperation('send')}
                  onBulkSchedule={(time) => handleBulkOperation('schedule', time)}
                  loading={loading}
                />
              </motion.div>
            )}
          </Box>
        </Container>
      </motion.div>

      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </ThemeProvider>
  );
};

export default App;
