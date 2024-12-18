import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Papa from "papaparse";

function FileUpload({
  onFileUpload,
  onRecipientsParsed,
  onError,
  acceptedFileTypes = "*",
}) {
  const [files, setFiles] = useState([]);

  const handleFileUpload = (event) => {
    const newFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    onFileUpload && onFileUpload(newFiles);

    // If CSV file is uploaded, parse it for recipients
    if (
      newFiles.some((file) => file.name.toLowerCase().endsWith(".csv")) &&
      onRecipientsParsed
    ) {
      const csvFile = newFiles.find((file) =>
        file.name.toLowerCase().endsWith(".csv")
      );
      Papa.parse(csvFile, {
        complete: (results) => {
          const recipients = results.data
            .filter((row) => row.length > 0 && row[0])
            .map((row) => ({
              email: row[0],
              name: row[1] || "",
              variables: row.slice(2).reduce((acc, val, idx) => {
                acc[`var${idx + 1}`] = val;
                return acc;
              }, {}),
            }));
          onRecipientsParsed(recipients);
        },
        error: (error) => {
          onError && onError("Error parsing CSV file: " + error.message);
        },
      });
    }
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <input
        type="file"
        multiple
        onChange={handleFileUpload}
        accept={acceptedFileTypes}
        style={{ display: "none" }}
        id="file-upload-input"
      />
      <label htmlFor="file-upload-input">
        <Button variant="contained" component="span">
          Upload Files
        </Button>
      </label>

      <List>
        {files.map((file, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={file.name}
              secondary={`${(file.size / 1024).toFixed(2)} KB`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleRemoveFile(index)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default FileUpload;
