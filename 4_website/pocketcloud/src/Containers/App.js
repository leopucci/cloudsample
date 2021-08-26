import React from "react";
import { useSelector } from "react-redux";
import { Route, Switch, Redirect } from "react-router-dom";

import LogIn from "./LogIn/LogIn";
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import Register from "./Register/Register";
import Home from "./Home/Home";
import Public from "./PublicPage/Public";
import NotFound from "./NotFound/NotFound";
import Header from "../Components/Header";

export default function App() {
  const isLoggedIn = useSelector(
    (state) => state.user.isLoggedIn && state.user.jwt !== null
  );

  // eslint-disable-next-line react/prop-types
  const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
      render={(props) =>
        isLoggedIn === true ? (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );

  return (
    <div>
      <Header isLoggedIn={isLoggedIn} />
      <Switch>
        <Route path="/" component={Public} exact />
        <Route path="/login" component={LogIn} />
        <Route path="/register" component={Register} />
        <Route path="/forgotpassword" component={ForgotPassword} />
        <PrivateRoute path="/Home" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}
