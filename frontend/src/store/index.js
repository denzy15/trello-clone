import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import boardsReducer from "./slices/boardsSlice";
import metadataReducer from "./slices/metadataSlice";
import invitationsReducer from "./slices/invitationsSlice";
import themeReducer from "./slices/themeSlice";
import storage from "redux-persist/lib/storage";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";

// Конфигурация для хранения состояния с помощью redux-persist
const persistConfig = {
  key: "root", // Ключ корневого хранилища
  storage, // Используемое хранилище (localStorage, AsyncStorage и т. д.)
  whitelist: ["auth", "theme"], // Список срезов, которые будут сохранены при перезагрузке страницы
};

// Комбинирование всех редукторов в один корневой редуктор
const rootReducer = combineReducers({
  theme: themeReducer,
  auth: authReducer,
  boards: boardsReducer,
  metadata: metadataReducer,
  invitations: invitationsReducer,
});

// Создание персистентного редуктора
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Создание хранилища Redux с использованием конфигурации
export const store = configureStore({
  reducer: persistedReducer, // Использование персистентного редуктора
  // Применение middleware и игнорирование сериализации для redux-persist actions
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Создание персистора для Redux store
export const persistor = persistStore(store);
