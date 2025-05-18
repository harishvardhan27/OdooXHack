import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/login', {
    username: email,
    password,
  });
  localStorage.setItem('token', response.data.access_token);
  return getCurrentUser();
};

export const signup = async (name, email, phone, password) => {
  await api.post('/signup', {
    name,
    email,
    phone,
    password,
  });
  return login(email, password);
};

export const getCurrentUser = async () => {
  const response = await api.get('/me');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};