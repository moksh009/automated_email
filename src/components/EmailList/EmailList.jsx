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
  FormControlLabel
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
        elevation={3} 
        sx={{ 
          p: 4,
          textAlign: 'center',
          bgcolor: 'background.paper',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
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
        <EmailIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No emails generated yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Fill in the form to generate personalized emails
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
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
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                <EmailIcon /> Generated Emails ({emails.length})
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedEmails.size === emails.length && emails.length > 0}
                    indeterminate={selectedEmails.size > 0 && selectedEmails.size < emails.length}
                    onChange={handleSelectAll}
                  />
                }
                label="Select All"
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
                      py: 1,
                      px: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s',
                    }}
                  >
                    Send Selected
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<ScheduleIcon />}
                    onClick={handleScheduleDialogOpen}
                    disabled={selectedEmails.size === 0}
                    sx={{
                      py: 1,
                      px: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s',
                    }}
                  >
                    Schedule Selected
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteSweepIcon />}
                    onClick={onDeleteAllEmails}
                    sx={{
                      py: 1,
                      px: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s',
                    }}
                  >
                    Delete All
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        </Box>

        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          <AnimatePresence>
            {emails.map((email) => (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <ListItem
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    p: 2,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Checkbox
                        checked={selectedEmails.has(email.id)}
                        onChange={(e) => handleSelectEmail(email.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ '&:hover': { cursor: 'pointer' } }}
                      />
                      <Stack spacing={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {email.to}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          Subject: {email.subject}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {email.status && (
                        <Chip 
                          label={email.status}
                          color={email.status === 'error' ? 'error' : 'success'}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      )}
                      <IconButton
                        onClick={() => onSendEmail(email)}
                        disabled={sendingEmails.has(email.id) || schedulingEmails.has(email.id)}
                        color="primary"
                        sx={{
                          '&:hover': {
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.2s',
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setSelectedEmails(new Set([email.id]));
                          setScheduleDialogOpen(true);
                        }}
                        disabled={sendingEmails.has(email.id) || schedulingEmails.has(email.id)}
                        color="secondary"
                        sx={{
                          '&:hover': {
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.2s',
                        }}
                      >
                        <ScheduleIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => handleDelete(email.id, e)}
                        color="error"
                        sx={{
                          '&:hover': {
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.2s',
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleExpand(email.id)}
                        sx={{
                          transform: expandedEmail === email.id ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.3s',
                        }}
                      >
                        {expandedEmail === email.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                  </Box>

                  <Collapse in={expandedEmail === email.id} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2, pl: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
                        Content:
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          mb: 2,
                          bgcolor: 'action.hover',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {email.content}
                        </Typography>
                      </Paper>

                      {email.attachments?.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography 
                            variant="subtitle2" 
                            gutterBottom 
                            sx={{ 
                              color: 'text.secondary',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <AttachmentIcon fontSize="small" /> Attachments:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {email.attachments.map((file) => (
                              <Chip
                                key={file.name}
                                label={file.name}
                                size="small"
                                variant="outlined"
                                sx={{ m: 0.5 }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {email.scheduledTime && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                          Scheduled for: {new Date(email.scheduledTime).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </Collapse>

                  <Divider sx={{ mt: 2 }} />
                </ListItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </List>
      </Paper>

      <Dialog open={scheduleDialogOpen} onClose={handleScheduleDialogClose}>
        <DialogTitle>Schedule {selectedEmails.size} Email{selectedEmails.size > 1 ? 's' : ''}</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Schedule Time"
              value={scheduledTime}
              onChange={setScheduledTime}
              minDateTime={new Date()}
              sx={{ mt: 2 }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleScheduleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleBulkSchedule}
            variant="contained" 
            disabled={!scheduledTime}
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EmailList;
