import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  IconButton, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  Stack,
  Divider,
  useTheme,
  Checkbox,
  FormControlLabel,
  alpha,
  Badge,
  Tooltip
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SendIcon from '@mui/icons-material/Send';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EmailIcon from '@mui/icons-material/Email';
import AttachmentIcon from '@mui/icons-material/Attachment';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

function EmailList({ 
  emails, 
  onSendEmail, 
  onScheduleEmail, 
  onBulkSchedule,
  onDeleteEmail,
  onDeleteAllEmails,
  sendingEmails,
  schedulingEmails 
}) {
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(null);
  const [expandedEmail, setExpandedEmail] = useState(null);
  const theme = useTheme();

  const handleSelectEmail = (emailId, event) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedEmails(prev => {
      if (prev.size === emails.length) {
        return new Set();
      }
      return new Set(emails.map(email => email.id));
    });
  };

  const handleDelete = (emailId, event) => {
    event.preventDefault();
    event.stopPropagation();
    onDeleteEmail(emailId);
  };

  const handleScheduleDialogOpen = () => {
    if (selectedEmails.size === 0) {
      toast.warn('Please select emails to schedule');
      return;
    }
    setScheduleDialogOpen(true);
  };

  const handleScheduleDialogClose = () => {
    setScheduleDialogOpen(false);
    setScheduledTime(null);
  };

  const handleBulkSchedule = () => {
    if (!scheduledTime) {
      toast.warn('Please select a schedule time');
      return;
    }

    const emailsToSchedule = emails.filter(email => selectedEmails.has(email.id));
    onBulkSchedule(emailsToSchedule, scheduledTime);
    handleScheduleDialogClose();
    setSelectedEmails(new Set());
  };

  const handleBulkSend = () => {
    if (selectedEmails.size === 0) {
      toast.warn('Please select emails to send');
      return;
    }

    const emailsToSend = emails.filter(email => selectedEmails.has(email.id));
    emailsToSend.forEach(email => onSendEmail(email));
    setSelectedEmails(new Set());
  };

  const handleExpand = (emailId) => {
    setExpandedEmail(expandedEmail === emailId ? null : emailId);
  };

  if (!emails.length) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 6,
          textAlign: 'center',
          bgcolor: 'background.paper',
          borderRadius: 3,
          position: 'relative',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: `0 4px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3,
          }}
        >
          <EmailIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
        </Box>
        <Typography variant="h5" color="primary.main" gutterBottom fontWeight={600}>
          No Emails Generated
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
          Fill in the form to generate personalized emails. You can send them immediately or schedule for later.
        </Typography>
      </Paper>
    );
  }

  const getStatusIcon = (email) => {
    if (email.status === 'sent') return <CheckCircleIcon fontSize="small" color="success" />;
    if (email.status === 'error') return <ErrorIcon fontSize="small" color="error" />;
    if (email.scheduledTime) return <AccessTimeIcon fontSize="small" color="primary" />;
    return null;
  };

  return (
    <>
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Badge badgeContent={emails.length} color="primary" max={999}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <EmailIcon /> Generated Emails
                </Typography>
              </Badge>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedEmails.size === emails.length && emails.length > 0}
                    indeterminate={selectedEmails.size > 0 && selectedEmails.size < emails.length}
                    onChange={handleSelectAll}
                    sx={{
                      color: theme.palette.primary.main,
                      '&.Mui-checked': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Select All
                  </Typography>
                }
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
            <Stack direction="row" spacing={2}>
              {emails.length > 0 && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SendIcon />}
                    onClick={handleBulkSend}
                    disabled={selectedEmails.size === 0}
                    sx={{
                      py: 1.5,
                      px: 3,
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
                    Send Selected ({selectedEmails.size})
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<ScheduleIcon />}
                    onClick={handleScheduleDialogOpen}
                    disabled={selectedEmails.size === 0}
                    sx={{
                      py: 1.5,
                      px: 3,
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
                    Schedule ({selectedEmails.size})
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteSweepIcon />}
                    onClick={onDeleteAllEmails}
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    Delete All
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        </Box>

        <List sx={{ width: '100%', bgcolor: 'background.paper', p: 2 }}>
          <AnimatePresence>
            {emails.map((email) => (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    '&:hover': {
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <ListItem
                    sx={{
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      p: 0,
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 2,
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        width: '100%',
                        bgcolor: selectedEmails.has(email.id) 
                          ? alpha(theme.palette.primary.main, 0.05)
                          : 'transparent',
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Checkbox
                          checked={selectedEmails.has(email.id)}
                          onChange={(e) => handleSelectEmail(email.id, e)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            color: theme.palette.primary.main,
                            '&.Mui-checked': {
                              color: theme.palette.primary.main,
                            },
                          }}
                        />
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {email.to}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {email.subject}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {email.status && (
                          <Chip
                            icon={getStatusIcon(email)}
                            label={email.status}
                            color={email.status === 'error' ? 'error' : 'success'}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              borderRadius: 1,
                              height: 28,
                              '& .MuiChip-label': {
                                px: 1,
                                textTransform: 'capitalize',
                              },
                            }}
                          />
                        )}
                        <Tooltip title="Send Now">
                          <IconButton
                            onClick={() => onSendEmail(email)}
                            disabled={sendingEmails.has(email.id) || schedulingEmails.has(email.id)}
                            color="primary"
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                                transform: 'translateY(-2px)',
                              },
                              transition: 'all 0.2s',
                            }}
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Schedule">
                          <IconButton
                            onClick={() => {
                              setSelectedEmails(new Set([email.id]));
                              setScheduleDialogOpen(true);
                            }}
                            disabled={sendingEmails.has(email.id) || schedulingEmails.has(email.id)}
                            color="secondary"
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.secondary.main, 0.2),
                                transform: 'translateY(-2px)',
                              },
                              transition: 'all 0.2s',
                            }}
                          >
                            <ScheduleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={(e) => handleDelete(email.id, e)}
                            color="error"
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.2),
                                transform: 'translateY(-2px)',
                              },
                              transition: 'all 0.2s',
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={expandedEmail === email.id ? "Show Less" : "Show More"}>
                          <IconButton
                            onClick={() => handleExpand(email.id)}
                            size="small"
                            sx={{
                              transform: expandedEmail === email.id ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.3s',
                            }}
                          >
                            {expandedEmail === email.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>

                    <Collapse in={expandedEmail === email.id} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Email Content
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            mb: 2,
                            borderRadius: 2,
                            bgcolor: theme.palette.background.paper,
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {email.content}
                          </Typography>
                        </Paper>

                        {email.attachments?.length > 0 && (
                          <Box sx={{ mt: 3 }}>
                            <Typography 
                              variant="subtitle2" 
                              gutterBottom 
                              sx={{ 
                                color: 'text.secondary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                fontWeight: 600,
                              }}
                            >
                              <AttachmentIcon fontSize="small" /> Attachments
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {email.attachments.map((file) => (
                                <Chip
                                  key={file.name}
                                  label={file.name}
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

                        {email.scheduledTime && (
                          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTimeIcon fontSize="small" color="primary" />
                            <Typography variant="body2" color="text.secondary">
                              Scheduled for: {new Date(email.scheduledTime).toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </ListItem>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
        </List>
      </Paper>

      <Dialog 
        open={scheduleDialogOpen} 
        onClose={handleScheduleDialogClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 24,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Schedule {selectedEmails.size} Email{selectedEmails.size > 1 ? 's' : ''}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Schedule Time"
              value={scheduledTime}
              onChange={setScheduledTime}
              minDateTime={new Date()}
              sx={{ 
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleScheduleDialogClose}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBulkSchedule}
            variant="contained" 
            disabled={!scheduledTime}
            sx={{ 
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              },
            }}
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EmailList;
