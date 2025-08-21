// src/api/axiosConfig.js (créez ce fichier dans les deux projets)
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://myhospital.archipel-dutyfree.com', // Votre backend Symfony
  withCredentials: true, // Important pour les cookies/sessions
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Intercepteur pour ajouter le token JWT
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;