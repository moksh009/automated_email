import React from 'react';
import { Box, TextField, Typography } from '@mui/material';

function EmailForm({
  subject,
  setSubject,
  content,
  setContent,
}) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Email Details
      </Typography>

      <TextField
        fullWidth
        label="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Email Content"
        multiline
        rows={6}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        sx={{ mb: 2 }}
        placeholder="Enter your email content here. You can use {{name}} as a placeholder for recipient's name."
      />
    </Box>
  );
}

export default EmailForm;
