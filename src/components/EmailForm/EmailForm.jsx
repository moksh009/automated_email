import React, { useState } from 'react';
import { Box, TextField, Typography, Paper, Grid, Button, Chip, Stack, Divider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FileUpload from '../FileUpload/FileUpload';
import EmailTemplates from '../EmailTemplates/EmailTemplates';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';

function EmailForm({ onEmailsGenerated, loading }) {
  const [recipients, setRecipients] = useState([]);
  const [recipientInput, setRecipientInput] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [scheduledTime, setScheduledTime] = useState(null);

  const parseRecipients = (text) => {
    return text.split('\n')
      .map(line => {
        const [name, email] = line.split(',').map(item => item.trim());
        return email && email.includes('@') ? { name, email } : null;
      })
      .filter(Boolean);
  };

  const handleAddRecipients = () => {
    if (!recipientInput.trim()) {
      toast.error('Please enter recipients');
      return;
    }

    const newRecipients = parseRecipients(recipientInput);
    if (newRecipients.length === 0) {
      toast.error('No valid recipients found. Use format: Name, email@example.com');
      return;
    }

    setRecipients(prev => {
      // Filter out duplicates
      const existingEmails = prev.map(r => r.email);
      const uniqueNewRecipients = newRecipients.filter(r => !existingEmails.includes(r.email));
      
      if (uniqueNewRecipients.length === 0) {
        toast.info('All recipients already added');
        return prev;
      }

      toast.success(`Added ${uniqueNewRecipients.length} recipients`);
      return [...prev, ...uniqueNewRecipients];
    });

    setRecipientInput(''); // Clear input after adding
  };

  const handleRecipientsParsed = (csvRecipients) => {
    if (!Array.isArray(csvRecipients)) {
      toast.error('Invalid CSV data format');
      return;
    }
    
    setRecipients(prev => {
      const existingEmails = prev.map(r => r.email);
      const uniqueNewRecipients = csvRecipients.filter(r => !existingEmails.includes(r.email));
      
      if (uniqueNewRecipients.length === 0) {
        toast.info('All recipients already added');
        return prev;
      }

      toast.success(`Added ${uniqueNewRecipients.length} recipients from CSV`);
      return [...prev, ...uniqueNewRecipients];
    });
  };

  const removeRecipient = (email) => {
    setRecipients(prev => prev.filter(r => r.email !== email));
    toast.info('Recipient removed');
  };

  const handleTemplateSelect = (template) => {
    setSubject(template.subject);
    setContent(template.content);
    toast.success('Template loaded successfully!');
  };

  const handleGenerateEmails = () => {
    if (!recipients.length) {
      toast.error('Please add at least one recipient');
      return;
    }

    if (!subject || !content) {
      toast.error('Please fill in both subject and content');
      return;
    }

    try {
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
          content: personalizedContent,
          attachments
        };
      });

      onEmailsGenerated(emails);
      toast.success(`Generated ${emails.length} personalized emails`);
    } catch (error) {
      console.error('Error generating emails:', error);
      toast.error('Error generating emails: ' + error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Grid container spacing={3}>
        {/* Left side - Email Details */}
        <Grid item xs={12} md={7}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              backgroundColor: '#ffffff',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(45deg, #2196f3 30%, #f50057 90%)',
              },
            }}
          >
            <Typography 
              variant="h5" 
              component="div" 
              gutterBottom
              sx={{ 
                color: 'primary.main',
                fontWeight: 'medium'
              }}
            >
              Email Templates
            </Typography>
            <EmailTemplates onSelectTemplate={handleTemplateSelect} />

            <Box sx={{ mt: 4 }}>
              <TextField
                fullWidth
                required
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                sx={{ mb: 3 }}
                variant="outlined"
              />

              <TextField
                fullWidth
                required
                multiline
                rows={8}
                label="Email Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                sx={{ mb: 3 }}
                variant="outlined"
                placeholder="Use {{name}} or {{first_name}} for personalization"
              />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Attachments
                </Typography>
                <FileUpload
                  onFileUpload={(files) => setAttachments([...attachments, ...files])}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right side - Recipients */}
        <Grid item xs={12} md={5}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              backgroundColor: '#ffffff',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(45deg, #f50057 30%, #2196f3 90%)',
              },
            }}
          >
            <Typography 
              variant="h5" 
              component="div" 
              gutterBottom
              sx={{ color: 'primary.main' }}
            >
              Recipients ({recipients.length})
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                placeholder="Enter recipients in format:&#10;John Doe, john@example.com&#10;Jane Smith, jane@example.com"
                helperText="Enter one recipient per line"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddRecipients}
                disabled={!recipientInput.trim()}
                startIcon={<PersonAddIcon />}
                sx={{ 
                  mb: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Add Recipients
              </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Recipients
              </Typography>
              <FileUpload
                isRecipientUpload={true}
                onRecipientsParsed={handleRecipientsParsed}
                onError={(error) => toast.error(error)}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3, maxHeight: '200px', overflowY: 'auto' }}>
              <AnimatePresence>
                {recipients.map((recipient, index) => (
                  <motion.div
                    key={recipient.email}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Chip
                      icon={<PersonAddIcon />}
                      label={`${recipient.name} (${recipient.email})`}
                      onDelete={() => removeRecipient(recipient.email)}
                      deleteIcon={<DeleteIcon />}
                      sx={{ 
                        m: 0.5, 
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </Box>

            <Stack spacing={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleGenerateEmails}
                disabled={!recipients.length || !subject || !content || loading}
                sx={{ 
                  py: 1.5,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Generate Emails
              </Button>

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
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      variant="outlined"
                    />
                  )}
                  minDateTime={new Date()}
                />
              </LocalizationProvider>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </motion.div>
  );
}

export default EmailForm;
