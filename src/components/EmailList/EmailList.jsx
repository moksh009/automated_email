import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { toast } from 'react-toastify';

const EmailList = ({ emails, onSendEmail, onScheduleEmail }) => {
  const [sendingStates, setSendingStates] = useState({});
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkScheduling, setBulkScheduling] = useState(false);

  const handleSendEmail = async (email, index) => {
    setSendingStates(prev => ({ ...prev, [index]: 'sending' }));
    try {
      await onSendEmail(email);
      setSendingStates(prev => ({ ...prev, [index]: 'sent' }));
      setTimeout(() => {
        setSendingStates(prev => {
          const newState = { ...prev };
          delete newState[index];
          return newState;
        });
      }, 2000);
    } catch (error) {
      setSendingStates(prev => ({ ...prev, [index]: 'error' }));
      toast.error(`Failed to send email to ${email.to}`);
    }
  };

  const handleSendAll = async () => {
    setBulkSending(true);
    try {
      await Promise.all(emails.map(email => onSendEmail(email)));
      toast.success('All emails sent successfully!');
    } catch (error) {
      toast.error('Failed to send some emails');
    } finally {
      setBulkSending(false);
    }
  };

  const handleScheduleAll = async () => {
    setBulkScheduling(true);
    try {
      await Promise.all(emails.map(email => onScheduleEmail(email)));
      toast.success('All emails scheduled successfully!');
    } catch (error) {
      toast.error('Failed to schedule some emails');
    } finally {
      setBulkScheduling(false);
    }
  };

  if (!emails.length) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2 
        }}
      >
        <Typography variant="h5" component="div" sx={{ color: 'primary.main' }}>
          Generated Emails ({emails.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendAll}
            disabled={bulkSending || bulkScheduling}
            startIcon={bulkSending ? <CircularProgress size={20} /> : <SendIcon />}
            sx={{
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {bulkSending ? 'Sending...' : 'Send All'}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleScheduleAll}
            disabled={bulkSending || bulkScheduling}
            startIcon={bulkScheduling ? <CircularProgress size={20} /> : <ScheduleIcon />}
            sx={{
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {bulkScheduling ? 'Scheduling...' : 'Schedule All'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <AnimatePresence>
          {emails.map((email, index) => (
            <Grid item xs={12} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  variant="outlined"
                  sx={{
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={8}>
                        <Typography variant="subtitle1" gutterBottom>
                          To: {email.recipientName} ({email.to})
                        </Typography>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Subject: {email.subject}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="textSecondary"
                          sx={{ 
                            whiteSpace: 'pre-wrap',
                            maxHeight: '100px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {email.content}
                        </Typography>
                        {email.attachments?.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="textSecondary">
                              Attachments:
                            </Typography>
                            {email.attachments.map((file, fileIndex) => (
                              <Chip
                                key={fileIndex}
                                label={file.name}
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            ))}
                          </Box>
                        )}
                      </Grid>
                      <Grid 
                        item 
                        xs={12} 
                        sm={4} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'flex-end',
                          alignItems: 'center' 
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Schedule Email">
                            <IconButton
                              color="primary"
                              onClick={() => onScheduleEmail(email)}
                              disabled={sendingStates[index] === 'sending'}
                              sx={{
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  backgroundColor: 'action.hover',
                                },
                                transition: 'all 0.2s ease-in-out',
                              }}
                            >
                              <ScheduleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send Email">
                            <IconButton
                              color="primary"
                              onClick={() => handleSendEmail(email, index)}
                              disabled={sendingStates[index] === 'sending'}
                              sx={{
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  backgroundColor: 'action.hover',
                                },
                                transition: 'all 0.2s ease-in-out',
                              }}
                            >
                              {sendingStates[index] === 'sending' && (
                                <CircularProgress size={24} />
                              )}
                              {sendingStates[index] === 'sent' && (
                                <CheckCircleIcon sx={{ color: 'success.main' }} />
                              )}
                              {!sendingStates[index] && <SendIcon />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>
    </Box>
  );
};

export default EmailList;
