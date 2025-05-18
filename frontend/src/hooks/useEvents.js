import { useState, useEffect } from 'react';
import { getEvents, getEventById } from '../services/events';

const useEvents = (initialFilters = {}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents(filters);
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventById = async (id) => {
    try {
      setLoading(true);
      const event = await getEventById(id);
      return event;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  return {
    events,
    loading,
    error,
    filters,
    setFilters,
    fetchEvents,
    fetchEventById,
  };
};

export default useEvents;