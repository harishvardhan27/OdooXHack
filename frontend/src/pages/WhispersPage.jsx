import { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, TextField, Paper } from '@mui/material';
import { Add, LocationOn } from '@mui/icons-material';
import api from '../services/api';
import WhisperCard from '../components/WhisperCard';
import { useAuth } from '../context/AuthContext';

const WhispersPage = () => {
  const { user } = useAuth();
  const [whispers, setWhispers] = useState([]);
  const [newWhisper, setNewWhisper] = useState({
    text: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWhispers = async () => {
      try {
        const response = await api.get('/whispers');
        setWhispers(response.data);
      } catch (error) {
        console.error('Error fetching whispers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWhispers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
              const response = await api.post('/whispers', newWhisper);
      setWhispers([response.data, ...whispers]);
      setNewWhisper({ text: '', location: '' });
    } catch (error) {
      console.error('Error creating whisper:', error);
    }
  };

  const handleModerate = async (whisperId, approve) => {
    try {
      await api.post(`/whispers/moderate/${whisperId}`, { approve });
      // Refresh whispers after moderation
      const response = await api.get('/whispers');
      setWhispers(response.data);
    } catch (error) {
      console.error('Error moderating whisper:', error);
    }
  };

  if (loading) return <Typography>Loading whispers...</Typography>;

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Community Whispers</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Share anonymous quick local posts (e.g., "Lost pet at park")
        </Typography>
      </Box>

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Your whisper"
          value={newWhisper.text}
          onChange={(e) => setNewWhisper({ ...newWhisper, text: e.target.value })}
          sx={{ mb: 2 }}
          required
        />
        <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 2 }}>
          <LocationOn sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
          <TextField
            fullWidth
            label="Location"
            value={newWhisper.location}
            onChange={(e) => setNewWhisper({ ...newWhisper, location: e.target.value })}
            required
          />
        </Box>
        <Button type="submit" variant="contained" startIcon={<Add />}>
          Post Whisper
        </Button>
      </Paper>

      {whispers.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No whispers yet. Be the first to post!</Typography>
        </Paper>
      ) : (
        whispers.map(whisper => (
          <WhisperCard 
            key={whisper.id} 
            whisper={whisper} 
            isAdmin={user?.is_admin}
            onModerate={handleModerate}
          />
        ))
      )}
    </Container>
  );
};

export default WhispersPage;