import React, { useState } from 'react';
import {
  Container,
  CssBaseline,
  Paper,
  Typography,
  Box,
  Button,
  useMediaQuery,
  useTheme,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  CircularProgress,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import SendIcon from '@mui/icons-material/Send';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EmailForm from './components/EmailForm/EmailForm';
import EmailList from './components/EmailList/EmailList';
import EmailPreview from './components/EmailPreview/EmailPreview';
import FileUpload from './components/FileUpload/FileUpload';
import EmailTemplates from './components/EmailTemplates/EmailTemplates';

const API_BASE_URL = 'http://localhost:3001';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App = () => {
  const [recipients, setRecipients] = useState([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [generatedEmails, setGeneratedEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(null);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [sendingEmails, setSendingEmails] = useState({});
  const [schedulingStatus, setSchedulingStatus] = useState({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);

  const generatePersonalizedEmail = (recipient) => {
    let personalizedContent = content
      .replace(/{{first_name}}/g, recipient.name)
      .replace(/{{name}}/g, recipient.name)
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\n\s*\n/g, '\n\n');

    let personalizedSubject = subject
      .replace(/{{first_name}}/g, recipient.name)
      .replace(/{{name}}/g, recipient.name);

    return {
      to: recipient.email,
      subject: personalizedSubject,
      content: personalizedContent,
      recipientName: recipient.name
    };
  };

  const handleGenerateEmails = () => {
    if (!recipients.length) {
      toast.error('Please add recipients first');
      return;
    }

    if (!subject || !content) {
      toast.error('Please fill in subject and content');
      return;
    }

    const emails = recipients.map(recipient => {
      const personalizedSubject = subject
        .replace(/{{name}}/g, recipient.name)
        .replace(/{{first_name}}/g, recipient.name.split(' ')[0]);
      
      const personalizedContent = content
        .replace(/{{name}}/g, recipient.name)
        .replace(/{{first_name}}/g, recipient.name.split(' ')[0])
        .replace(/{{sender_name}}/g, 'Your Name')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\n\s*\n/g, '\n\n');

      return {
        recipientName: recipient.name,
        to: recipient.email,
        subject: personalizedSubject,
        content: personalizedContent
      };
    });

    setGeneratedEmails(emails);
    toast.success(`Generated ${emails.length} personalized emails`);
  };

  const sendEmail = async (emailData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('to', emailData.to);
      formData.append('subject', emailData.subject);
      formData.append('content', emailData.content);
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch(`${API_BASE_URL}/send-email`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      toast.success(`Email sent to ${emailData.to}`);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(`Failed to send email to ${emailData.to}: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const scheduleEmail = async (emailData, scheduledTime) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('to', emailData.to);
      formData.append('subject', emailData.subject);
      formData.append('content', emailData.content);
      formData.append('scheduledTime', scheduledTime);
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch(`${API_BASE_URL}/schedule-email`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      toast.success(`Email scheduled for ${emailData.to}`);
      return result;
    } catch (error) {
      console.error('Error scheduling email:', error);
      toast.error(`Failed to schedule email for ${emailData.to}: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSendIndividual = async (email) => {
    try {
      const emailKey = `${email.to}-${Date.now()}`;
      setSendingEmails(prev => ({ ...prev, [emailKey]: true }));

      await sendEmail(email);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(`Failed to send email to ${email.recipientName}: ${error.message}`);
    } finally {
      const emailKey = `${email.to}-${Date.now()}`;
      setSendingEmails(prev => {
        const newState = { ...prev };
        delete newState[emailKey];
        return newState;
      });
    }
  };

  const handleScheduleIndividual = async (email) => {
    if (!scheduledTime) {
      toast.error('Please select a schedule time');
      return;
    }

    try {
      const emailKey = `${email.to}-${Date.now()}`;
      setSchedulingStatus(prev => ({ ...prev, [emailKey]: true }));

      await scheduleEmail(email, scheduledTime.toISOString());
    } catch (error) {
      console.error('Error scheduling email:', error);
      toast.error(`Failed to schedule email for ${email.recipientName}: ${error.message}`);
    } finally {
      const emailKey = `${email.to}-${Date.now()}`;
      setSchedulingStatus(prev => {
        const newState = { ...prev };
        delete newState[emailKey];
        return newState;
      });
    }
  };

  const handleSendBulk = async () => {
    if (!recipients.length) {
      toast.error('Please add recipients first');
      return;
    }

    if (!subject || !content) {
      toast.error('Please fill in subject and content');
      return;
    }

    setIsSendingBulk(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const recipient of recipients) {
        const email = generatePersonalizedEmail(recipient);
        try {
          await sendEmail(email);
          successCount++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          failCount++;
        }
      }
    } finally {
      setIsSendingBulk(false);
      if (successCount > 0) {
        toast.success(`Successfully sent ${successCount} emails`);
      }
      if (failCount > 0) {
        toast.error(`Failed to send ${failCount} emails`);
      }
    }
  };

  const handleScheduleAll = async () => {
    if (!scheduledTime) {
      toast.error('Please select a schedule time');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    try {
      for (const recipient of recipients) {
        const email = generatePersonalizedEmail(recipient);
        try {
          await scheduleEmail(email, scheduledTime.toISOString());
          successCount++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          failCount++;
        }
      }
    } finally {
      if (successCount > 0) {
        toast.success(`Successfully scheduled ${successCount} emails`);
      }
      if (failCount > 0) {
        toast.error(`Failed to schedule ${failCount} emails`);
      }
    }
  };

  const handleOpenAllInGmail = () => {
    generatedEmails.forEach(email => {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email.to)}&su=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.content)}`;
      window.open(gmailUrl, '_blank');
    });
  };

  const handlePreviewEmail = (email) => {
    setSelectedEmail(email);
    setPreviewOpen(true);
  };

  const handleTemplateSelect = (template) => {
    setSubject(template.name);
    setContent(template.content);
    toast.success(`Template "${template.name}" loaded successfully`);
  };

  const handleFileUpload = (files) => {
    console.log('Handling file upload:', files.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size
    })));

    setAttachments(files);
    toast.success(`Added ${files.length} attachment(s)`);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddRecipient = (recipient) => {
    if (!recipient.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setRecipients(prev => {
      const exists = prev.some(r => r.email === recipient.email);
      if (exists) {
        toast.warning('This email is already in the list');
        return prev;
      }
      return [...prev, recipient];
    });
  };

  const handleCSVUpload = (newRecipients) => {
    const uniqueRecipients = newRecipients.filter(
      newRecip => !recipients.some(existing => existing.email === newRecip.email)
    );
    setRecipients(prev => [...prev, ...uniqueRecipients]);
    toast.success(`${uniqueRecipients.length} recipients added successfully!`);
  };

  const handleRemoveRecipient = (index) => {
    setRecipients(prev => prev.filter((_, i) => i !== index));
  };

  const renderEmailControls = () => (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Email Controls
      </Typography>
      
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateTimePicker
          label="Schedule Time"
          value={scheduledTime}
          onChange={(newValue) => {
            if (newValue && newValue > new Date()) {
              setScheduledTime(newValue);
            } else {
              toast.error('Please select a future date and time');
            }
          }}
          renderInput={(params) => <TextField {...params} fullWidth />}
          minDateTime={new Date()}
        />
      </LocalizationProvider>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSendBulk}
          disabled={!recipients.length || !subject || !content}
          startIcon={<SendIcon />}
        >
          Send All
        </Button>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          onClick={handleScheduleAll}
          disabled={!recipients.length || !subject || !content || !scheduledTime}
          startIcon={<ScheduleIcon />}
        >
          Schedule All
        </Button>
      </Box>
    </Paper>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          component="h1" 
          gutterBottom 
          sx={{ 
            textAlign: 'center',
            mb: 4,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Personalized Email Sender
        </Typography>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Email Templates
          </Typography>
          <EmailTemplates onSelectTemplate={handleTemplateSelect} />
        </Paper>

        <Box sx={{ 
          display: 'grid', 
          gap: 3,
          gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' } 
        }}>
          <Box>
            <EmailForm
              subject={subject}
              setSubject={setSubject}
              content={content}
              setContent={setContent}
            />

            <Paper sx={{ p: 2, mt: 2 }}>
              <FileUpload
                onFileUpload={handleFileUpload}
                attachments={attachments}
                onRemoveAttachment={handleRemoveAttachment}
                onCSVUpload={handleCSVUpload}
              />
            </Paper>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleGenerateEmails}
                disabled={!recipients.length || !subject || !content}
                sx={{ mb: 2 }}
              >
                Generate Personalized Emails
              </Button>
            </Box>

            {renderEmailControls()}

            <Paper sx={{ p: 2, mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSendBulk}
                disabled={!recipients.length || !subject || !content}
                sx={{ mb: 2 }}
              >
                Send All
              </Button>
            </Paper>
          </Box>

          <Box>
            <EmailList
              recipients={recipients}
              onAddRecipient={handleAddRecipient}
              onRemoveRecipient={handleRemoveRecipient}
            />

            {generatedEmails.length > 0 && (
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Generated Emails ({generatedEmails.length})
                </Typography>
                {generatedEmails.map((email, index) => {
                  const emailKey = `${email.to}-${Date.now()}`;
                  const isEmailSending = sendingEmails[emailKey];
                  const isEmailScheduling = schedulingStatus[emailKey];

                  return (
                    <Box 
                      key={index} 
                      sx={{ 
                        mb: 2, 
                        p: 2, 
                        bgcolor: 'background.default', 
                        borderRadius: 1,
                        border: '1px solid rgba(0, 0, 0, 0.12)'
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        To: {email.recipientName} ({email.to})
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        Subject: {email.subject}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          mb: 2,
                          p: 2,
                          bgcolor: 'grey.100',
                          borderRadius: 1
                        }}
                      >
                        {email.content}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleSendIndividual(email)}
                          disabled={isEmailSending || isSendingBulk}
                          startIcon={isEmailSending ? <CircularProgress size={20} /> : <SendIcon />}
                        >
                          {isEmailSending ? 'Sending...' : 'Send Now'}
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleScheduleIndividual(email)}
                          disabled={isEmailScheduling || !scheduledTime}
                          startIcon={isEmailScheduling ? <CircularProgress size={20} /> : <ScheduleIcon />}
                        >
                          {isEmailScheduling ? 'Scheduling...' : 'Schedule'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handlePreviewEmail(email)}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleOpenAllInGmail()}
                        >
                          Open in Gmail
                        </Button>
                      </Box>
                    </Box>
                  );
                })}
              </Paper>
            )}
          </Box>
        </Box>
      </Container>
      <ToastContainer position="bottom-right" />
    </ThemeProvider>
  );
};

export default App;
