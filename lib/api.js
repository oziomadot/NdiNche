// lib/api.js

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


const API_URL = 'http://127.0.0.1:8000/api';


const API = axios.create({
  // baseURL: 'http://127.0.0.1:8000/api', // replace with your Laravel backend URL
  // baseURL: 'http://192.168.2.4:8000/api',
  baseURL: ' https://4f078e912cda.ngrok-free.app/api',

  headers: {
    Accept: 'application/json',
  },
  timeout: 10000,
});

API.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;



export const login = async (email, password) => {
  const res = await API.post(`${API_URL}/login`, { email, password });
  return res.data;
};

export const sendLocation = async (token, latitude, longitude) => {
  const res = await API.post(`${API_URL}/location`, {
    latitude,
    longitude
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};
