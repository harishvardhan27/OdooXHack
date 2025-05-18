import { Card, CardContent, CardMedia, Typography, Button, Chip, Box } from '@mui/material';
import { CalendarToday, LocationOn, People } from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event, isAuthenticated }) => {
  const navigate = useNavigate();
  const rsvpCount = event.rsvps?.length || 0;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="140"
        image={event.image || '/default-event.jpg'}
        alt={event.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip label={event.category} color="primary" size="small" />
          {rsvpCount > 10 && <Chip label="🔥 Trending" color="secondary" size="small" />}
        </Box>
        
        <Typography gutterBottom variant="h5" component="div">
          {event.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalendarToday fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">
            {format(new Date(event.date), 'MMM dd, yyyy h:mm a')}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {event.location}
          </Typography>
        </Box>
        
        <Typography variant="body2" paragraph sx={{ mb: 2 }}>
          {event.description.length > 100 
            ? `${event.description.substring(0, 100)}...` 
            : event.description}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <People fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">{rsvpCount} attending</Typography>
          </Box>
          <Button 
            size="small" 
            onClick={() => navigate(`/event/${event.id}`)}
          >
            {isAuthenticated ? 'View Details' : 'Learn More'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventCard;