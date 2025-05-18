import { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { Add } from '@mui/icons-material';
import api from '../services/api';
import PollCard from '../components/PollCard';
import { useAuth } from '../context/AuthContext';

const PollsPage = () => {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await api.get('/polls');
        setPolls(response.data);
      } catch (error) {
        console.error('Error fetching polls:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, []);

  const handleVote = async (pollId, option) => {
    try {
      await api.post('/votes', { poll_id: pollId, option });
      // Refresh polls after voting
      const response = await api.get('/polls');
      setPolls(response.data);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (loading) return <Typography>Loading polls...</Typography>;

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Community Polls</Typography>
        {user?.is_admin && (
          <Button variant="contained" startIcon={<Add />}>
            Create Poll
          </Button>
        )}
      </Box>
      
      {polls.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No polls available yet.</Typography>
        </Paper>
      ) : (
        polls.map(poll => (
          <PollCard 
            key={poll.id} 
            poll={poll} 
            onVote={handleVote} 
          />
        ))
      )}
    </Container>
  );
};

export default PollsPage;