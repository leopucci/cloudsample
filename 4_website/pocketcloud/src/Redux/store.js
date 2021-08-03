import { createStore, applyMiddleware, compose } from "redux";
import thunkMiddleware from "redux-thunk";
import { createStateSyncMiddleware } from "redux-state-sync";
import {
  PERSIST,
  PURGE,
  REHYDRATE,
  persistStore,
  persistReducer,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "./index";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const reduxStateSyncConfig = {
  // TOGGLE_TODO will not be triggered in other tabs
  blacklist: [PERSIST, PURGE, REHYDRATE],
};

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(
  persistedReducer,
  composeEnhancers(
    applyMiddleware(
      createStateSyncMiddleware(reduxStateSyncConfig),
      thunkMiddleware
    )
  )
);

export const persistor = persistStore(store);
