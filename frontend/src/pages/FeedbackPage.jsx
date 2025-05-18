import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Rating, Paper, TextField, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const FeedbackPage = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${eventId}`);
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/feedback/${eventId}`, { rating, comment });
      setSubmitted(true);
      setTimeout(() => navigate('/events'), 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!event) return <Typography>Event not found</Typography>;

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        {submitted ? (
          <Box textAlign="center">
            <Typography variant="h5" gutterBottom>
              Thank you for your feedback!
            </Typography>
            <Typography>
              You'll be redirected back to the events page shortly.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>
              Feedback for: {event.title}
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography component="legend">Rating</Typography>
                <Rating
                  value={rating}
                  onChange={(e, newValue) => setRating(newValue)}
                  size="large"
                />
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comments"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ mb: 3 }}
              />
              
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
              >
                Submit Feedback
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default FeedbackPage;