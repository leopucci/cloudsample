import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import React from "react";
import ReactDOM from "react-dom";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import { IntlProvider } from "react-intl";
import { initMessageListener } from "redux-state-sync";
import { ConnectedRouter } from "connected-react-router";
import { store, persistor, history } from "./Redux/store";
import App from "./Containers/App";
import reportWebVitals from "./reportWebVitals";
import setupAxiosApiInterceptors from "./Redux/setupInterceptors";
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

const language = navigator.language.split(/[-_]/)[0]; // language without region code
initMessageListener(store);
setupAxiosApiInterceptors(store);
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GoogleReCaptchaProvider
          reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_ID}
          language={language}
          useRecaptchaNet={false}
          useEnterprise={false}
          scriptProps={{
            async: false, // optional, default to false,
            defer: false, // optional, default to false
            appendTo: "head", // optional, default to "head", can be "head" or "body",
            nonce: undefined, // optional, default undefined
          }}
        >
          <ConnectedRouter history={history}>
            <IntlProvider
              messages={messages[language]}
              locale={language}
              defaultLocale="en"
            >
              <App />
            </IntlProvider>
            ,
          </ConnectedRouter>
        </GoogleReCaptchaProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
