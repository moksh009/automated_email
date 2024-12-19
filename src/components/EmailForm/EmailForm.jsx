import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  useTheme,
  alpha,
  Chip,
  Card,
  CardContent,
  Collapse,
  Divider,
  Tooltip,
  Grid,
  IconButton,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import EmailIcon from '@mui/icons-material/Email';
import SubjectIcon from '@mui/icons-material/Subject';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import TemplateIcon from '@mui/icons-material/AutoAwesome';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import UploadIcon from '@mui/icons-material/Upload';
import PreviewIcon from '@mui/icons-material/Preview';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { toast } from 'react-toastify';

// Email templates
const templates = [
  {
    id: 1,
    name: 'Professional Introduction',
    subject: 'Introduction and Collaboration Opportunity',
    content: 'Dear {{name}},\n\nI hope this email finds you well. My name is {{sender_name}}, and I\'m reaching out to discuss potential collaboration opportunities.\n\nI would love to schedule a brief call to explore how we might work together.\n\nBest regards,\n{{sender_name}}'
  },
  {
    id: 2,
    name: 'Meeting Follow-up',
    subject: 'Follow-up: Our Discussion',
    content: 'Hi {{first_name}},\n\nThank you for taking the time to meet with me today. I wanted to follow up on our discussion and outline the next steps we discussed.\n\nLooking forward to our next conversation.\n\nBest,\n{{sender_name}}'
  },
  {
    id: 3,
    name: 'Event Invitation',
    subject: 'You\'re Invited: Special Event',
    content: 'Dear {{name}},\n\nI\'m excited to invite you to our upcoming event. We would be honored to have you join us.\n\nPlease let me know if you can attend.\n\nBest wishes,\n{{sender_name}}'
  }
];

function EmailForm({ onEmailGeneration, loading }) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    attachments: []
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [recipientInput, setRecipientInput] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
    toast.success(`${files.length} file(s) attached`);
  };

  const handleRemoveFile = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
    toast.info('File removed');
  };

  const parseRecipients = (text) => {
    return text.split('\n')
      .map(line => {
        const [name, email] = line.split(',').map(item => item.trim());
        if (name && email && email.includes('@')) {
          return { name, email };
        }
        return null;
      })
      .filter(item => item !== null);
  };

  const handleAddRecipients = () => {
    const newRecipients = parseRecipients(recipientInput);
    if (newRecipients.length === 0) {
      toast.error('Please enter valid recipients in the format: Name, email@example.com');
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

      toast.success(`Added ${uniqueNewRecipients.length} recipient(s)`);
      return [...prev, ...uniqueNewRecipients];
    });
    setRecipientInput('');
  };

  const handleCSVUpload = async (file) => {
    try {
      const text = await file.text();
      const rows = text.split('\n')
        .map(row => row.trim())
        .filter(row => row.length > 0);

      const newRecipients = rows.map(row => {
        const [name, email] = row.split(',').map(item => item.trim());
        if (name && email && email.includes('@')) {
          return { name, email };
        }
        return null;
      }).filter(item => item !== null);

      if (newRecipients.length === 0) {
        toast.error('No valid recipients found in CSV file');
        return;
      }

      setRecipients(prev => {
        const existingEmails = prev.map(r => r.email);
        const uniqueNewRecipients = newRecipients.filter(r => !existingEmails.includes(r.email));
        
        if (uniqueNewRecipients.length === 0) {
          toast.info('All recipients from CSV already added');
          return prev;
        }

        toast.success(`Added ${uniqueNewRecipients.length} recipient(s) from CSV`);
        return [...prev, ...uniqueNewRecipients];
      });
    } catch (error) {
      toast.error('Error parsing CSV file: ' + error.message);
    }
  };

  const removeRecipient = (email) => {
    setRecipients(prev => prev.filter(r => r.email !== email));
    toast.info('Recipient removed');
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      subject: template.subject || '',
      content: template.content || ''
    }));
    setShowTemplates(false);
    toast.success('Template applied');
  };

  const handlePreview = (template, e) => {
    e.stopPropagation();
    setPreviewTemplate(template);
    // You can add a modal or dialog to show the preview
    toast.info('Preview: ' + template.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recipients.length || !formData.subject || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const emails = recipients.map(recipient => {
        const personalizedSubject = formData.subject
          .replace(/{{name}}/g, recipient.name)
          .replace(/{{first_name}}/g, recipient.name.split(' ')[0]);
        
        const personalizedContent = formData.content
          .replace(/{{name}}/g, recipient.name)
          .replace(/{{first_name}}/g, recipient.name.split(' ')[0])
          .replace(/{{sender_name}}/g, 'Your Name')
          .replace(/{{company_name}}/g, 'Your Company');

        return {
          to: recipient.email,
          subject: personalizedSubject,
          content: personalizedContent,
          attachments: formData.attachments
        };
      });

      onEmailGeneration(emails);
    } catch (error) {
      toast.error('Error generating emails: ' + error.message);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: `0 4px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Box
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2,
                }}
              >
                <EmailIcon /> Compose Email
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Tooltip title="Choose from email templates">
                  <Button
                    variant={showTemplates ? "contained" : "outlined"}
                    color="primary"
                    startIcon={<TemplateIcon />}
                    onClick={() => setShowTemplates(!showTemplates)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    Email Templates
                  </Button>
                </Tooltip>
              </Stack>

              <Collapse in={showTemplates} timeout={300}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                    Select a Template
                  </Typography>
                  <Grid container spacing={2}>
                    {templates.map((template, index) => (
                      <Grid item xs={12} sm={6} md={4} key={template.id}>
                        <Card
                          onClick={() => handleTemplateSelect(template)}
                          sx={{
                            cursor: 'pointer',
                            height: '100%',
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.primary.main, selectedTemplate?.id === template.id ? 0.3 : 0.1)}`,
                            bgcolor: selectedTemplate?.id === template.id ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 3,
                              borderColor: alpha(theme.palette.primary.main, 0.3),
                            },
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {template.name}
                              </Typography>
                              <Box>
                                <Tooltip title="Preview">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handlePreview(template, e)}
                                  >
                                    <PreviewIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Use Template">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTemplateSelect(template);
                                    }}
                                  >
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'pre-line',
                              }}
                            >
                              {template.content}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Collapse>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                    Recipients
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Enter one recipient per line in the format: Name, email@example.com"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    InputProps={{
                      startAdornment: <PersonAddIcon sx={{ mr: 1, color: 'text.secondary', mt: 1 }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<PersonAddIcon />}
                      onClick={handleAddRecipients}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      Add Recipients
                    </Button>

                    <Button
                      variant="outlined"
                      color="secondary"
                      component="label"
                      startIcon={<UploadIcon />}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      Upload CSV
                      <input
                        type="file"
                        hidden
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleCSVUpload(file);
                            e.target.value = ''; // Reset input
                          }
                        }}
                      />
                    </Button>
                  </Stack>
                </Box>

                {recipients.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                      Added Recipients ({recipients.length})
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {recipients.map((recipient, index) => (
                        <Chip
                          key={index}
                          label={`${recipient.name} (${recipient.email})`}
                          onDelete={() => removeRecipient(recipient.email)}
                          color="primary"
                          variant="outlined"
                          size="medium"
                          sx={{
                            m: 0.5,
                            borderRadius: 2,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                <Divider />

                <TextField
                  fullWidth
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <SubjectIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={6}
                  placeholder="Use {{name}}, {{first_name}}, {{sender_name}}, {{company_name}} for personalization"
                  InputProps={{
                    startAdornment: <DescriptionIcon sx={{ mr: 1, mt: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <Box>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="file-input"
                  />
                  <label htmlFor="file-input">
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<AttachFileIcon />}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      Attach Files
                    </Button>
                  </label>

                  {formData.attachments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
                        Attachments ({formData.attachments.length})
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {formData.attachments.map((file, index) => (
                          <Chip
                            key={index}
                            label={file.name}
                            onDelete={() => handleRemoveFile(index)}
                            size="small"
                            variant="outlined"
                            sx={{
                              m: 0.5,
                              borderRadius: 1,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SendIcon />}
                    disabled={loading || !recipients.length || !formData.subject || !formData.content}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: 2,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    {loading ? 'Generating...' : 'Generate Email'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}

export default EmailForm;
