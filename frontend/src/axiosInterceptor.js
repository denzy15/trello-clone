import axios from "axios";
import { store } from "./store/index";
import { toast } from "react-toastify";
import { signOut } from "./store/slices/authSlice";

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

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response.data.message === "Срок действия токена истек" &&
      error.response.status === 403
    ) {
      toast.warn("Ваш сеанс истек, пожалуйста, выполните вход заново");
      store.dispatch(signOut());
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
