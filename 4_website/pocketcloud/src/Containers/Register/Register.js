import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, Link as RouterLink } from "react-router-dom";

import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import {
  GoogleLoginButton,
  AppleLoginButton,
} from "react-social-login-buttons";
import AppleSignin from "react-apple-signin-auth";
import GoogleLogin from "react-google-login";

import { actions } from "../../Redux/user";
import RecaptchaTermsOfService from "../../Components/RecaptchaTermsOfService";
import Footer from "../../Components/Footer";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function Register() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const isLoggedIn = useSelector(
    (state) => state.user.isLoggedIn && state.user.jwt !== null
  );
  const registerError = useSelector((state) => state.user.registerError);
  const isSignupError = !!registerError;
  const classes = useStyles();
  const dispatch = useDispatch();

  const [values, setValues] = React.useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const handleOnChange = (value, name) => {
    setValues({ ...values, [name]: value });
  };

  useEffect(() => {
    dispatch(actions.logOut()); // reset state and clear any errors
  }, [dispatch]);

  const onClickRegister = async () => {
    dispatch(actions.clearLoginError());
    if (
      values.email === "" ||
      values.password === "" ||
      values.confirmPassword === "" ||
      values.firstName === "" ||
      values.lastName === ""
    ) {
      dispatch(
        actions.setSignupError("Please add Email and Password to continue")
      );
    } else {
      if (!executeRecaptcha) {
        dispatch(actions.notify("Execute recaptcha not yet available", 1));
        return;
      }
      const recaptcha = await executeRecaptcha("Register");
      if (recaptcha != null) {
        dispatch(actions.signUp(values, recaptcha));
      } else {
        dispatch(
          actions.notify("Recaptcha esta vindo em branco no register", 1)
        );
      }
    }
  };

  const onSuccessGoogleLogin = async (response) => {
    dispatch(actions.clearLoginError());
    const recaptcha = await executeRecaptcha("LoginViaGoogle");
    dispatch(actions.googleLogIn(response, recaptcha));
  };

  if (isLoggedIn) return <Redirect to="/Home" />;

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        <form className={classes.form} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="fname"
                name="firstName"
                variant="outlined"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
                onChange={(e) => handleOnChange(e.target.value, e.target.name)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="lname"
                onChange={(e) => handleOnChange(e.target.value, e.target.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                error={isSignupError}
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                helperText={registerError}
                onChange={(e) => handleOnChange(e.target.value, e.target.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) => handleOnChange(e.target.value, e.target.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="confirmPassword"
                onChange={(e) => handleOnChange(e.target.value, e.target.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox value="allowExtraEmails" color="primary" />}
                label="I want to receive inspiration, marketing promotions and updates via email."
              />
            </Grid>
          </Grid>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={onClickRegister}
          >
            Register
          </Button>
          <GoogleLogin
            style={{
              textAlign: "center",
              alignItems: "center",
              borderRadius: 50,
              justifyContent: "center",
              width: "900",
            }}
            className={classes.submit}
            render={(renderProps) => (
              <GoogleLoginButton
                text="Register with Google"
                align="center"
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
              />
            )}
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            onSuccess={onSuccessGoogleLogin}
            onFailure={(response) => {
              if (response.error) {
                switch (response.error) {
                  case "popup_closed_by_user":
                    console.log("popup_closed_by_user");
                    break;
                  default:
                    console.log(response.error);
                    dispatch(actions.setGoogleLogInError(response.error));
                    dispatch(
                      actions.notify(
                        `Erro no login do google: ${response.error}`,
                        1
                      )
                    );
                }
              } else {
                console.log(response);
                dispatch(
                  actions.notify(
                    `Erro no login do google response: ${response}`,
                    1
                  )
                );
              }
            }}
            cookiePolicy="single_host_origin"
          />
          <AppleSignin
            /** Auth options passed to AppleID.auth.init() */
            authOptions={{
              /** Client ID - eg: 'com.example.com' */
              clientId: process.env.REACT_APP_APPLE_CLIENT_ID,
              /** Requested scopes, seperated by spaces - eg: 'email name' */
              scope: "email name",
              /** Apple's redirectURI - must be one of the URIs you added to the serviceID - the undocumented trick in apple docs is that you should call auth from a page that is listed as a redirectURI, localhost fails */
              redirectURI: "https://example.com",
              /** State string that is returned with the apple response */
              state: "state",
              /** Nonce */
              nonce: "nonce",
              /** Uses popup auth instead of redirection */
              usePopup: true,
            }} // REQUIRED
            /** General props */
            uiType="light"
            /** className */
            className="apple-auth-btn"
            /** Removes default style tag */
            noDefaultStyle={false}
            /** Allows to change the button's children, eg: for changing the button text */
            // buttonExtraChildren="Continue with Apple"
            /** Extra controlling props */
            /** Called upon login success in case authOptions.usePopup = true -- which means auth is handled client side */
            onSuccess={(response) => {
              dispatch(actions.googleLogIn(response));
            }} // default = undefined
            /** Called upon login error */
            onError={(response) => {
              // PRECISA TESTAR ESTA RESPOSTA E AJUSTAR ISTO, SO COPIEI E COLEI
              if (response.error) {
                switch (response.error) {
                  case "popup_closed_by_user":
                    console.log("popup_closed_by_user");
                    break;
                  default:
                    console.log(response.error);
                    dispatch(actions.setGoogleLogInError(response.error));
                    dispatch(
                      actions.notify(
                        `Erro no login da apple: ${response.error}`,
                        1
                      )
                    );
                }
              } else {
                console.log(response);
                dispatch(
                  actions.notify(
                    `Erro no login da apple response: ${response}`,
                    1
                  )
                );
              }
            }} // default = undefined
            /** Skips loading the apple script if true */
            skipScript={false} // default = undefined
            /** Apple image props */
            // iconProp={{ style: { marginTop: "10px" } }} // default = undefined
            /** render function - called with all props - can be used to fully customize the UI by rendering your own component  */
            render={(renderProps) => (
              <AppleLoginButton onClick={renderProps.onClick} text="Register with Apple" align="center" />
            )}

            //     render={(renderProps) => (
            //         <button onClick={renderProps.onClick}>My Custom Button</button>
            //       )}
          />
          <Grid container justify="flex-end">
            <Grid item>
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                href="/#"
                className={classes.link}
              >
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={3}>
        <RecaptchaTermsOfService />
      </Box>
      <Footer />
    </Container>
  );
}
