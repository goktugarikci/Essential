import axios from 'axios';

// C++ Backend'inizin çalıştığı adres (Sonundaki /api kısmını kaldırdık!)
const apiClient = axios.create({
  baseURL: 'http://localhost:8080', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Her API isteğinden önce araya girip LocalStorage'daki Token'ı ekler
apiClient.interceptors.request.use((config) => {
  // Projende token ismini hangisiyle kaydediyorsan garantiye almak için ikisini de kontrol edelim
  const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`; // Veya C++ beklentisine göre sadece token
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;