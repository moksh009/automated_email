import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import Papa from 'papaparse';

const FileUpload = ({ onFileUpload, isRecipientUpload = false, onRecipientsParsed, onError }) => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (isRecipientUpload) {
      if (acceptedFiles.length !== 1) {
        onError?.('Please upload only one CSV file');
        return;
      }

      const file = acceptedFiles[0];
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        onError?.('Please upload a CSV file');
        return;
      }

      Papa.parse(file, {
        complete: (results) => {
          if (results.errors.length > 0) {
            onError?.('Error parsing CSV file');
            return;
          }

          // Skip header row if present
          const data = results.data.slice(results.data[0][0]?.toLowerCase() === 'name' ? 1 : 0);
          
          const recipients = data
            .filter(row => row.length >= 2 && row[0] && row[1]) // Ensure row has name and email
            .map(row => ({
              name: row[0].trim(),
              email: row[1].trim()
            }))
            .filter(({ email }) => {
              // Basic email validation
              const isValid = email.includes('@') && email.includes('.');
              return isValid;
            });

          if (recipients.length === 0) {
            onError?.('No valid recipients found in CSV. Format should be: Name, Email');
            return;
          }

          onRecipientsParsed?.(recipients);
        },
        error: (error) => {
          onError?.(`Error reading CSV file: ${error.message}`);
        },
        skipEmptyLines: true,
        header: false
      });
    } else {
      setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
      onFileUpload?.(acceptedFiles);
    }
  }, [isRecipientUpload, onFileUpload, onRecipientsParsed, onError]);

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: isRecipientUpload ? { 'text/csv': ['.csv'] } : undefined,
    multiple: !isRecipientUpload
  });

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 2,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
            transform: 'translateY(-2px)',
          }
        }}
      >
        <input {...getInputProps()} />
        <Button 
          variant="outlined" 
          component="span"
          sx={{
            '&:hover': {
              transform: 'scale(1.02)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {isRecipientUpload ? 'Upload CSV' : 'Upload Files'}
        </Button>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {isDragActive
            ? 'Drop the file here...'
            : isRecipientUpload
            ? 'Drag and drop a CSV file, or click to select'
            : 'Drag and drop files, or click to select'}
        </Typography>
        {isRecipientUpload && (
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            CSV format: Name, Email (one per line)
          </Typography>
        )}
      </Box>

      {!isRecipientUpload && files.length > 0 && (
        <List>
          {files.map((file, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={file.name}
                secondary={`${(file.size / 1024).toFixed(2)} KB`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => removeFile(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FileUpload;
