import React from "react";
import ReactDOM from "react-dom";
import thunkMiddleware from "redux-thunk";
import persistState from "redux-localstorage";
import { BrowserRouter as Router } from "react-router-dom";
import { createStore, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import { IntlProvider } from "react-intl";

import rootReducer from "./Redux";
import App from "./Containers/App";
import reportWebVitals from "./reportWebVitals";

// eslint-disable-next-line camelcase
import messages_de from "./locales/compiled_locales/de.json";
// eslint-disable-next-line camelcase
import messages_en from "./locales/compiled_locales/en.json";

const messages = {
  // eslint-disable-next-line camelcase
  de: messages_de,
  // eslint-disable-next-line camelcase
  en: messages_en,
};

// https://www.npmjs.com/package/react-intl-redux
// Pra colocar no redux a parte de lingua, junto com as demais infos. 

const language = navigator.language.split(/[-_]/)[0]; // language without region code

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(thunkMiddleware),
    persistState(/* paths, config */)
  )
);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <IntlProvider
          messages={messages[language]}
          locale={language}
          defaultLocale="en"
        >
          <App />
        </IntlProvider>
        ,
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
