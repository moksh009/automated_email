import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Grid
} from '@mui/material';

const templates = [
  {
    id: 1,
    name: 'Welcome Template',
    content: 
`Dear {{first_name}},

Welcome aboard! We're excited to have you with us.

As a valued member, you'll get access to:
- Exclusive content
- Special offers
- Early access to new features

Best regards,
{{sender_name}}`
  },
  {
    id: 2,
    name: 'Newsletter Template',
    content: 
`Hello {{first_name}},

Here's your monthly newsletter update!

Check out our latest articles and updates that we've prepared just for you.

Don't hesitate to reach out if you have any questions.

Best wishes,
{{sender_name}}`
  },
  {
    id: 3,
    name: 'Event Invitation',
    content: 
`Dear {{first_name}},

You're invited to our exclusive event!

Join us for an evening of networking and insights.
Date: [Event Date]
Time: [Event Time]
Location: [Event Location]

We look forward to seeing you there.

Regards,
{{sender_name}}`
  }
];

const EmailTemplates = ({ onSelectTemplate }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Email Templates
      </Typography>
      <Grid container spacing={2}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6
                }
              }}
              onClick={() => onSelectTemplate(template)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {template.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {template.content}
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => onSelectTemplate(template)}
                  fullWidth
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EmailTemplates;
