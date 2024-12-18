import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';
import PreviewIcon from '@mui/icons-material/Preview';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TemplatePreviewModal from './TemplatePreviewModal';

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

const EmailTemplates = ({ onSelectTemplate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template);
  };

  const handlePreview = (template, event) => {
    event.stopPropagation();
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  return (
    <>
      <Grid container spacing={2}>
        {templates.map((template, index) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                variant="outlined"
                onClick={() => handleSelectTemplate(template)}
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1
                    }}
                  >
                    <Typography variant="h6" component="div" gutterBottom>
                      {template.name}
                    </Typography>
                    <Box>
                      <Tooltip title="Preview Template">
                        <IconButton
                          size="small"
                          onClick={(e) => handlePreview(template, e)}
                          sx={{
                            '&:hover': {
                              transform: 'scale(1.1)',
                              backgroundColor: 'action.hover',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <PreviewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Use Template">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTemplate(template);
                          }}
                          sx={{
                            '&:hover': {
                              transform: 'scale(1.1)',
                              backgroundColor: 'action.hover',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <ContentCopyIcon />
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
                    }}
                  >
                    {template.content}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <TemplatePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={selectedTemplate}
      />
    </>
  );
};

export default EmailTemplates;
