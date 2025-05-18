import api from './api';

export const getEvents = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.location) params.append('location', filters.location);
  if (filters.upcoming !== undefined) params.append('upcoming', filters.upcoming);
  
  const response = await api.get('/events', { params });
  return response.data;
};

export const getEventById = async (id) => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await api.post('/events', eventData);
  return response.data;
};

export const rsvpToEvent = async (eventId, rsvpData) => {
  const response = await api.post(`/rsvp/${eventId}`, rsvpData);
  return response.data;
};