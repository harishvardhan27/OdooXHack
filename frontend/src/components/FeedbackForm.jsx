import { useState } from 'react';
import { Box, Typography, Rating, TextField, Button, Grid } from '@mui/material';
import { SentimentSatisfiedAlt, SentimentVeryDissatisfied } from '@mui/icons-material';

const FeedbackForm = ({ eventId, onSubmit }) => {
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ eventId, rating, comment });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        How was the event?
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography component="legend">Rating</Typography>
        <Rating
          value={rating}
          onChange={(e, newValue) => setRating(newValue)}
          icon={<SentimentSatisfiedAlt fontSize="inherit" />}
          emptyIcon={<SentimentVeryDissatisfied fontSize="inherit" />}
        />
      </Box>
      
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Comments"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      <Grid container justifyContent="flex-end">
        <Button type="submit" variant="contained" color="primary">
          Submit Feedback
        </Button>
      </Grid>
    </Box>
  );
};

export default FeedbackForm;