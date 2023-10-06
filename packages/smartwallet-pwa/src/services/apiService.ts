import axios from "axios";
const apiService = axios.create({
  baseURL: import.meta.env.VITE_MONCON_API_BASE_URL,
});

export default apiService;
