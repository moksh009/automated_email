import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from '@mui/material';
import { toast } from 'react-toastify';

const EmailList = ({ recipients, onAddRecipient, onRemoveRecipient }) => {
  const [recipientText, setRecipientText] = useState('');

  const handleTextChange = (event) => {
    setRecipientText(event.target.value);
  };

  const parseRecipients = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsedRecipients = [];
    const errors = [];

    lines.forEach((line, index) => {
      // Try different formats:
      // 1. Name,email format
      // 2. name,email@example.com format
      // 3. Just email format
      const commaMatch = line.match(/^([^,]+),(.+@.+\..+)$/);
      const emailOnlyMatch = line.match(/^(.+@.+\..+)$/);

      if (commaMatch) {
        const [, name, email] = commaMatch;
        parsedRecipients.push({
          name: name.trim(),
          email: email.trim()
        });
      } else if (emailOnlyMatch) {
        const [, email] = emailOnlyMatch;
        // Use part before @ as name if no name provided
        const name = email.split('@')[0];
        parsedRecipients.push({
          name: name.trim(),
          email: email.trim()
        });
      } else {
        errors.push(`Line ${index + 1}: Invalid format - "${line}"`);
      }
    });

    return { parsedRecipients, errors };
  };

  const handleAddRecipients = () => {
    if (!recipientText.trim()) {
      return;
    }

    const { parsedRecipients, errors } = parseRecipients(recipientText);

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (parsedRecipients.length > 0) {
      parsedRecipients.forEach(recipient => {
        onAddRecipient(recipient);
      });
      setRecipientText(''); // Clear the input after adding
      toast.success(`Added ${parsedRecipients.length} recipients`);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recipients
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Enter recipients in the format: "Name, email@example.com" (one per line)
      </Typography>
      
      <TextField
        multiline
        rows={6}
        fullWidth
        value={recipientText}
        onChange={handleTextChange}
        placeholder="John Doe, john@example.com&#10;Jane Smith, jane@example.com"
        variant="outlined"
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddRecipients}
          disabled={!recipientText.trim()}
        >
          Add Recipients
        </Button>
      </Box>

      {recipients.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Current Recipients ({recipients.length}):
          </Typography>
          {recipients.map((recipient, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
                borderBottom: '1px solid #eee',
                '&:last-child': {
                  borderBottom: 'none'
                }
              }}
            >
              <Typography>
                {recipient.name} ({recipient.email})
              </Typography>
              <Button
                size="small"
                color="error"
                onClick={() => onRemoveRecipient(index)}
              >
                Remove
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default EmailList;
