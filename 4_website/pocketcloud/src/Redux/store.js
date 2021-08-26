import { createBrowserHistory } from "history";
import { routerMiddleware } from "connected-react-router";
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

export const history = createBrowserHistory();

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const reduxStateSyncConfig = {
  // TOGGLE_TODO will not be triggered in other tabs
  predicate: (action) => {
    const blacklist = [PERSIST, PURGE, REHYDRATE];
    if (typeof action !== "function") {
      if (Array.isArray(blacklist)) {
        return blacklist.indexOf(action.type) < 0;
      }
    }
    return false;
  },
};

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer(history));

export const store = createStore(
  persistedReducer,
  composeEnhancers(
    applyMiddleware(
      routerMiddleware(history),
      createStateSyncMiddleware(reduxStateSyncConfig),
      thunkMiddleware
    )
  )
);

export const persistor = persistStore(store);
