import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store";

const root = ReactDOM.createRoot(document.getElementById("root")); // Создаем корневой элемент реакт приложения
root.render(
  // Рендерим приложение
  // Оборачиваем приложение в Provider для доступа к Redux store
  <Provider store={store}>
    {/* Оборачиваем приложение в PersistGate для поддержки Redux Persist */}
    <PersistGate persistor={persistor} loading={null}>
      {/* Оборачиваем приложение в BrowserRouter для поддержки маршрутизации */}
      <BrowserRouter>
        <App /> {/* Рендерим основной компонент приложения */}
      </BrowserRouter>
    </PersistGate>
  </Provider>
);
