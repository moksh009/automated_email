import React, { useState, useContext } from 'react';
import { Box, TextField, Typography, Paper, Grid, Button, Chip, Stack, Divider, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FileUpload from '../FileUpload/FileUpload';
import EmailTemplates from '../EmailTemplates/EmailTemplates';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TemplateIcon from '@mui/icons-material/Description';

function EmailForm({ onEmailGeneration, loading }) {
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

      onEmailGeneration(emails);
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
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3,
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                mb: 3,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.shadows[6],
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                },
              }}
            >
              <Typography 
                variant="h5" 
                component="div" 
                gutterBottom
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 600,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <TemplateIcon /> Email Templates
              </Typography>

              <EmailTemplates onSelectTemplate={handleTemplateSelect} />
            </Paper>

            <Paper 
              elevation={3} 
              sx={{ 
                p: 3,
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.shadows[6],
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                },
              }}
            >
              <Typography 
                variant="h5" 
                component="div" 
                gutterBottom
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 600,
                  mb: 3,
                }}
              >
                Compose Email
              </Typography>

              <TextField
                fullWidth
                required
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
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
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
                variant="outlined"
                placeholder="Use {{name}} or {{first_name}} for personalization"
              />

              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'text.secondary',
                  }}
                >
                  <AttachFileIcon /> Attachments
                </Typography>
                <FileUpload
                  onFileUpload={(files) => setAttachments([...attachments, ...files])}
                />
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                  <AnimatePresence>
                    {attachments.map((file, index) => (
                      <motion.div
                        key={file.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Chip
                          label={file.name}
                          onDelete={() => {
                            const newAttachments = [...attachments];
                            newAttachments.splice(index, 1);
                            setAttachments(newAttachments);
                          }}
                          sx={{
                            m: 0.5,
                            '&:hover': {
                              backgroundColor: 'primary.light',
                            },
                          }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Stack>
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={handleGenerateEmails}
                disabled={loading || !recipients.length || !subject || !content}
                startIcon={<SendIcon />}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Generate Emails
              </Button>
            </Paper>
          </motion.div>
        </Grid>

        {/* Right side - Recipients */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3,
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.shadows[6],
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: (theme) => `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.primary.main} 90%)`,
                },
              }}
            >
              <Typography 
                variant="h5" 
                component="div" 
                gutterBottom
                sx={{ 
                  color: 'secondary.main',
                  fontWeight: 600,
                  mb: 3,
                }}
              >
                Recipients
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Add Recipients"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                placeholder="Name, email@example.com"
                helperText="Enter one recipient per line in the format: Name, email@example.com"
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'secondary.main',
                    },
                  },
                }}
              />

              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={handleAddRecipients}
                startIcon={<PersonAddIcon />}
                sx={{
                  mb: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Add Recipients
              </Button>

              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'text.secondary',
                  }}
                >
                  <UploadFileIcon /> Upload Recipients CSV
                </Typography>
                <FileUpload
                  isRecipientUpload={true}
                  onRecipientsParsed={handleRecipientsParsed}
                  onError={(error) => toast.error(error)}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                <Stack spacing={1}>
                  <AnimatePresence>
                    {recipients.map((recipient) => (
                      <motion.div
                        key={recipient.email}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Chip
                          label={`${recipient.name} (${recipient.email})`}
                          onDelete={() => removeRecipient(recipient.email)}
                          color="secondary"
                          variant="outlined"
                          deleteIcon={<DeleteIcon />}
                          sx={{
                            width: '100%',
                            justifyContent: 'space-between',
                            py: 2,
                            px: 1,
                            '& .MuiChip-label': {
                              whiteSpace: 'normal',
                            },
                            '&:hover': {
                              backgroundColor: 'secondary.light',
                              color: 'secondary.contrastText',
                            },
                          }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Stack>
              </Box>

              {recipients.length > 0 && (
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    mt: 2,
                    textAlign: 'right',
                    color: 'text.secondary',
                  }}
                >
                  Total Recipients: {recipients.length}
                </Typography>
              )}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
}

export default EmailForm;
