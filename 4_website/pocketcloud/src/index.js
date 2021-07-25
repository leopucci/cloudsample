import React from 'react';
import ReactDOM from 'react-dom';
import thunkMiddleware from 'redux-thunk'
import persistState from 'redux-localstorage'
import { BrowserRouter as Router } from 'react-router-dom'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import rootReducer from './Redux'
import App from './Containers/App';
import reportWebVitals from './reportWebVitals';
import {IntlProvider} from "react-intl";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(
      thunkMiddleware
    ),
    persistState(/*paths, config*/)
  )
)

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
      <IntlProvider locale='en'>
        <App />
    </IntlProvider>,
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
