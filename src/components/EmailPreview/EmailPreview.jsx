import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachmentIcon from '@mui/icons-material/Attachment';

function EmailPreview({
  open,
  onClose,
  email,
  attachments,
  onSend,
  onSchedule,
}) {
  const [scheduleDate, setScheduleDate] = useState('');
  const [showScheduler, setShowScheduler] = useState(false);

  const handleSend = () => {
    onSend(email);
    onClose();
  };

  const handleSchedule = () => {
    const scheduledDateTime = new Date(scheduleDate);
    if (isNaN(scheduledDateTime.getTime())) {
      alert('Please select a valid date and time');
      return;
    }
    onSchedule(email, scheduledDateTime);
    onClose();
  };

  if (!email) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Email Preview</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="textSecondary">To:</Typography>
          <Typography>{email.recipientName} &lt;{email.to}&gt;</Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="textSecondary">Subject:</Typography>
          <Typography>{email.subject}</Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="textSecondary">Content:</Typography>
          <Typography
            component="pre"
            sx={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              mt: 1,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1,
            }}
          >
            {email.content}
          </Typography>
        </Box>

        {attachments && attachments.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Attachments:
            </Typography>
            <List dense>
              {attachments.map((file, index) => (
                <ListItem key={index}>
                  <AttachmentIcon sx={{ mr: 1 }} />
                  <ListItemText 
                    primary={file.name}
                    secondary={`${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {showScheduler && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Schedule Date and Time"
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: new Date().toISOString().slice(0, 16),
              }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowScheduler(!showScheduler)} color="primary">
          {showScheduler ? 'Cancel Schedule' : 'Schedule'}
        </Button>
        {showScheduler ? (
          <Button 
            onClick={handleSchedule} 
            variant="contained" 
            color="primary"
            disabled={!scheduleDate}
          >
            Schedule Email
          </Button>
        ) : (
          <Button onClick={handleSend} variant="contained" color="primary">
            Send Now
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default EmailPreview;
