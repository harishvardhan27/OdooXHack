import { useState, useEffect } from 'react';
import { Container, Grid, Typography, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import EventCard from '../components/EventCard';
import { getEvents } from '../services/events';
import { useAuth } from '../context/AuthContext';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    upcoming: true
  });
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents(filters);
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <Typography>Loading events...</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Upcoming Events</Typography>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="sports">Sports</MenuItem>
              <MenuItem value="music">Music</MenuItem>
              <MenuItem value="food">Food</MenuItem>
              <MenuItem value="art">Art</MenuItem>
              <MenuItem value="education">Education</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Time</InputLabel>
            <Select
              name="upcoming"
              value={filters.upcoming}
              onChange={(e) => setFilters(prev => ({ ...prev, upcoming: e.target.value }))}
              label="Time"
            >
              <MenuItem value={true}>Upcoming</MenuItem>
              <MenuItem value={false}>Past Events</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {events.length > 0 ? (
          events.map(event => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <EventCard event={event} isAuthenticated={isAuthenticated} />
            </Grid>
          ))
        ) : (
          <Typography variant="body1" sx={{ mt: 2 }}>No events found matching your criteria.</Typography>
        )}
      </Grid>
    </Container>
  );
};

export default EventsPage;