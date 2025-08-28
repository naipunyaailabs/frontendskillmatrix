// src/utils/axiosInstance.js
import axios from 'axios';

 export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // optional - if you use cookies or sessions
});

// export default axiosInstance;
// export const setAuthToken = (token) => {
//   if (token) {
//     axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   } else {
//     delete axiosInstance.defaults.headers.common['Authorization'];
//   }
// };