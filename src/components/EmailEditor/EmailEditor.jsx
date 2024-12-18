import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Box, Paper, Typography } from '@mui/material';

const EmailEditor = ({ value, onChange }) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Email Content
      </Typography>
      <Box sx={{
        '.ql-container': {
          minHeight: '200px',
          fontSize: '16px',
        },
        '.ql-editor': {
          minHeight: '200px',
        }
      }}>
        <ReactQuill
          value={value}
          onChange={onChange}
          modules={modules}
          theme="snow"
        />
      </Box>
    </Paper>
  );
};

export default EmailEditor;
