import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, Grid, Paper, Avatar, Chip, Divider } from '@mui/material';
import { CalendarToday, LocationOn, People, ArrowBack } from '@mui/icons-material';
import { format } from 'date-fns';
import RSVPForm from '../components/RSVPForm';
import { getEventById, rsvpToEvent } from '../services/events';
import { useAuth } from '../context/AuthContext';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRSVPForm, setShowRSVPForm] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await getEventById(id);
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRSVP = async (rsvpData) => {
    try {
      await rsvpToEvent(id, rsvpData);
      setRsvpSuccess(true);
      setShowRSVPForm(false);
      // Refresh event data to show updated RSVP count
      const updatedEvent = await getEventById(id);
      setEvent(updatedEvent);
    } catch (error) {
      console.error('RSVP failed:', error);
    }
  };

  if (loading) return <Typography>Loading event details...</Typography>;
  if (!event) return <Typography>Event not found</Typography>;

  const userHasRSVPd = isAuthenticated && event.rsvps?.some(rsvp => rsvp.user_id === user?.id);
  const rsvpCount = event.rsvps?.length || 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back to Events
      </Button>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h3" gutterBottom>{event.title}</Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Chip label={event.category} color="primary" sx={{ mr: 1 }} />
            {rsvpCount > 10 && <Chip label="🔥 Trending" color="secondary" />}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarToday sx={{ mr: 1 }} />
            <Typography>
              {format(new Date(event.date), 'EEEE, MMMM d, yyyy h:mm a')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <LocationOn sx={{ mr: 1 }} />
            <Typography>{event.location}</Typography>
          </Box>
          
          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            {event.description}
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h5" gutterBottom>About the Organizer</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ width: 56, height: 56, mr: 2 }} />
            <Box>
              <Typography variant="h6">{event.organizer?.name}</Typography>
              {event.organizer?.trust_score > 75 && (
                <Chip label="Verified Organizer" color="success" size="small" />
              )}
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <People sx={{ mr: 1 }} />
              <Typography>{rsvpCount} people attending</Typography>
            </Box>
            
            {new Date(event.date) > new Date() ? (
              isAuthenticated ? (
                userHasRSVPd ? (
                  <Typography color="success.main" sx={{ mb: 2 }}>
                    You're attending this event!
                  </Typography>
                ) : showRSVPForm ? (
                  <RSVPForm 
                    onSubmit={handleRSVP} 
                    onCancel={() => setShowRSVPForm(false)}
                    defaultValues={{ 
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      attendee_count: 1
                    }}
                  />
                ) : rsvpSuccess ? (
                  <Typography color="success.main">
                    RSVP confirmed! Check your email for details.
                  </Typography>
                ) : (
                  <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={() => setShowRSVPForm(true)}
                  >
                    RSVP Now
                  </Button>
                )
              ) : (
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={() => navigate('/login', { state: { from: `/event/${id}` } })}
                >
                  Login to RSVP
                </Button>
              )
            ) : (
              <Typography color="text.secondary">
                This event has already occurred.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventDetailPage;