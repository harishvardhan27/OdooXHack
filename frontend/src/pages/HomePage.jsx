import { Container, Typography, Button, Box, Grid } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import useEvents from '../hooks/useEvents';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { events, loading } = useEvents({ upcoming: true, limit: 3 });

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Community Pulse
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Discover and create local events in your community
        </Typography>
        <Box sx={{ mt: 3 }}>
          {isAuthenticated ? (
            <Button variant="contained" size="large" href="/post-event">
              Create an Event
            </Button>
          ) : (
            <Button variant="contained" size="large" href="/signup">
              Join Now
            </Button>
          )}
        </Box>
      </Box>

      <Typography variant="h4" sx={{ mt: 6, mb: 3 }}>Featured Events</Typography>
      
      {loading ? (
        <Typography>Loading events...</Typography>
      ) : (
        <Grid container spacing={4}>
          {events.map(event => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <EventCard event={event} isAuthenticated={isAuthenticated} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default HomePage;