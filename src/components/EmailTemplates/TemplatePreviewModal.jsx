import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';

const TemplatePreviewModal = ({ open, onClose, template }) => {
  if (!template) return null;

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="md"
          fullWidth
          PaperComponent={motion.div}
          PaperProps={{
            initial: { opacity: 0, y: -20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 20 },
            transition: { duration: 0.3 },
            style: { overflow: 'hidden' }
          }}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" component="span" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                Template Preview
              </Typography>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Paper 
              elevation={2}
              sx={{ 
                p: 3,
                backgroundColor: '#ffffff',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(45deg, #2196f3 30%, #f50057 90%)',
                },
              }}
            >
              <Box mb={3}>
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  Subject
                </Typography>
                <Typography variant="h6">
                  {template.subject}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  Content
                </Typography>
                <Typography 
                  variant="body1" 
                  component="div"
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    '& p': { mt: 1, mb: 1 },
                  }}
                >
                  {template.content}
                </Typography>
              </Box>

              <Box mt={3}>
                <Typography variant="subtitle2" color="textSecondary">
                  Available Variables:
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    flexWrap: 'wrap',
                    mt: 1 
                  }}
                >
                  {['{{name}}', '{{first_name}}', '{{sender_name}}'].map((variable) => (
                    <Paper
                      key={variable}
                      variant="outlined"
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: 'action.hover',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {variable}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Paper>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={onClose}
              variant="outlined"
              sx={{
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                onClose();
              }}
              variant="contained"
              color="primary"
              sx={{
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Use Template
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default TemplatePreviewModal;
