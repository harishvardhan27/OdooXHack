import { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminPage = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [trustScores, setTrustScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.is_admin) {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [eventsRes, analyticsRes, scoresRes] = await Promise.all([
        api.get('/admin/pending-events'),
        api.get('/admin/analytics'),
        api.get('/admin/trust-scores')
      ]);
      setPendingEvents(eventsRes.data);
      setAnalytics(analyticsRes.data);
      setTrustScores(scoresRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId, approve) => {
    try {
      await api.post(`/admin/approve-event/${eventId}`, { approve });
      fetchAdminData();
    } catch (error) {
      console.error('Error approving event:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!user?.is_admin) {
    return (
      <Container>
        <Typography variant="h4" sx={{ mt: 4 }}>
          Access Denied
        </Typography>
        <Typography sx={{ mt: 2 }}>
          You must be an administrator to view this page.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Admin Dashboard
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Pending Events" />
          <Tab label="Analytics" />
          <Tab label="Trust Scores" />
        </Tabs>
      </Box>
      
      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Organizer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{event.organizer?.name}</TableCell>
                    <TableCell>
                      {new Date(event.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleApproveEvent(event.id, true)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleApproveEvent(event.id, false)}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {tabValue === 1 && analytics && (
          <Box>
            <Typography variant="h6" sx={{ mt: 2 }}>Event Statistics</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Paper sx={{ p: 2, flex: 1 }}>
                <Typography variant="subtitle1">Total Events</Typography>
                <Typography variant="h4">{analytics.events.total}</Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1 }}>
                <Typography variant="subtitle1">Upcoming Events</Typography>
                <Typography variant="h4">{analytics.events.upcoming}</Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1 }}>
                <Typography variant="subtitle1">Total Feedback</Typography>
                <Typography variant="h4">{analytics.feedback.total}</Typography>
              </Paper>
            </Box>
            
            <Typography variant="h6" sx={{ mt: 4 }}>Event Categories</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              {Object.entries(analytics.events.categories).map(([category, count]) => (
                <Chip key={category} label={`${category}: ${count}`} variant="outlined" />
              ))}
            </Box>
          </Box>
        )}
        
        {tabValue === 2 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Organizer</TableCell>
                  <TableCell align="right">Events</TableCell>
                  <TableCell align="right">Attendance Rate</TableCell>
                  <TableCell align="right">Avg Rating</TableCell>
                  <TableCell align="right">Cancellation Rate</TableCell>
                  <TableCell align="right">Trust Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trustScores.map((organizer) => (
                  <TableRow key={organizer.user_id}>
                    <TableCell>{organizer.name}</TableCell>
                    <TableCell align="right">{organizer.events_hosted}</TableCell>
                    <TableCell align="right">
                      {Math.round(organizer.attendance_rate * 100)}%
                    </TableCell>
                    <TableCell align="right">
                      {organizer.avg_rating.toFixed(1)}/5
                    </TableCell>
                    <TableCell align="right">
                      {Math.round(organizer.cancellation_rate * 100)}%
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={organizer.trust_score.toFixed(0)} 
                        color={
                          organizer.trust_score > 75 ? 'success' : 
                          organizer.trust_score > 50 ? 'warning' : 'error'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default AdminPage;