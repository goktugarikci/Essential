import axios from 'axios';

// C++ Backend'inizin çalıştığı adres ve portu buraya yazın
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Her API isteğinden önce araya girip LocalStorage'daki Token'ı başlığa (Header) ekler
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;