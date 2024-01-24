import axios from "axios";
import { store } from "./store/index";

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const { auth } = store.getState();

    if (auth && !!auth.token) {
      config.headers["Authorization"] = `Bearer ${auth.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
