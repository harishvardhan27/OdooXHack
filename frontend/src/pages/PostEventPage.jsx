import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, TextField, Button, Box, Grid, 
  InputAdornment, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import { CalendarToday, LocationOn, Category, Description } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const PostEventPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    date: '',
    max_attendees: 50
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/events', {
        ...eventData,
        latitude: 0,  // You would get these from a map component
        longitude: 0
      });
      navigate(`/event/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container>
        <Typography variant="h4" sx={{ mt: 4 }}>
          Please log in to post an event
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mt: 4, mb: 3 }}>
        Create New Event
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Event Title"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              multiline
              rows={4}
              label="Description"
              name="description"
              value={eventData.description}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={eventData.category}
                onChange={handleChange}
                label="Category"
                startAdornment={
                  <InputAdornment position="start">
                    <Category />
                  </InputAdornment>
                }
              >
                <MenuItem value="sports">Sports</MenuItem>
                <MenuItem value="music">Music</MenuItem>
                <MenuItem value="food">Food</MenuItem>
                <MenuItem value="art">Art</MenuItem>
                <MenuItem value="education">Education</MenuItem>
                <MenuItem value="community">Community</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Location"
              name="location"
              value={eventData.location}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Date & Time"
              type="datetime-local"
              name="date"
              value={eventData.date}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Max Attendees"
              name="max_attendees"
              type="number"
              value={eventData.max_attendees}
              onChange={handleChange}
              inputProps={{ min: 1, max: 1000 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
              sx={{ mt: 2 }}
            >
              {loading ? 'Creating Event...' : 'Create Event'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PostEventPage;