import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, Link as RouterLink } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import GoogleLogin from "react-google-login";
import {
  GoogleLoginButton,
  AppleLoginButton,
} from "react-social-login-buttons";
import AppleSignin from "react-apple-signin-auth";
// import AppleLogin from "react-apple-login";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { actions } from "../../Redux/user";
import RecaptchaTermsOfService from "../../Components/RecaptchaTermsOfService";
import Footer from "../../Components/Footer";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(1),
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
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function LogIn() {
  /* useLayoutEffect(() => {
    const captcha = document.getElementsByClassName("grecaptcha-badge")[0];
    if (captcha) {
      captcha.style.visibility = "hidden";
    }
  }, []);

  */
  const { executeRecaptcha } = useGoogleReCaptcha();
  const isLoggedIn = useSelector(
    (state) => state.user.isLoggedIn && state.user.jwt !== null
  );
  const loginError = useSelector((state) => state.user.loginError);
  const isLoginError = !!loginError;

  const classes = useStyles();
  const dispatch = useDispatch();

  const [values, setValues] = React.useState({
    email: "",
    password: "",
    recaptcha: "",
  });

  const handleOnChange = (value, name) => {
    setValues({ ...values, [name]: value });
  };

  const onClickLogin = async () => {
    dispatch(actions.clearLoginError());
    if (values.email === "" || values.password === "") {
      dispatch(
        actions.setGoogleLogInError("Please add Email and Password to continue")
      );
    } else {
      if (!executeRecaptcha) {
        dispatch(actions.notify("Execute recaptcha not yet available", 1));
        return;
      }
      const recaptcha = await executeRecaptcha("SimpleLogin");
      if (recaptcha != null) {
        dispatch(actions.logIn(values, recaptcha));
      } else {
        dispatch(actions.notify("Recaptcha esta vindo em branco no login", 1));
      }
    }
  };

  const onSuccessGoogleLogin = async (response) => {
    dispatch(actions.clearLoginError());
    const recaptcha = await executeRecaptcha("LoginViaGoogle");
    dispatch(actions.googleLogIn(response, recaptcha));
  };

  useEffect(() => {
    dispatch(actions.logOut()); // reset state and clear any errors
  }, [dispatch]);

  if (isLoggedIn) return <Redirect to="/Home" />;
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          <FormattedMessage
            id="loginScreen.LogInH1Text"
            defaultMessage="Log in"
            description="Log In H1 Text"
          />
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            error={isLoginError}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label={
              <FormattedMessage
                id="loginScreen.EmailAddressField"
                defaultMessage="Email Address"
                description="Email Address TextField Text"
              />
            }
            name="email"
            autoComplete="email"
            helperText={loginError}
            autoFocus
            onChange={(e) => handleOnChange(e.target.value, e.target.name)}
          />
          <TextField
            error={isLoginError}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label={
              <FormattedMessage
                id="loginScreen.PasswordField"
                defaultMessage="Password"
                description="Password TextField Text"
              />
            }
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={(e) => handleOnChange(e.target.value, e.target.name)}
          />
          {/*
          <Reaptcha
            ref={recaptchaRef}
            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_ID}
            onVerify={(e) => console.log(e)}
            size="invisible"
          />
          
          <ReCAPTCHA
            align="center"
            ref={recaptchaRef}
            size="invisible"
            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_ID}
            onChange={recaptchaOnChange}
            onErrored={(error) => {
              dispatch(actions.setGoogleLogInError(error));
              console.log(error);
            }}
            asyncScriptOnLoad={() => console.log("asyncScriptOnLoad")}
            onExpired={() => console.log("EXPIROU")}
          />
*/}
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            size="large"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={onClickLogin}
          >
            <FormattedMessage
              id="loginScreen.LogInButton"
              defaultMessage="Log In"
              description="Log In Button Text"
            />
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
              <AppleLoginButton onClick={renderProps.onClick} align="center" />
            )}

            //     render={(renderProps) => (
            //         <button onClick={renderProps.onClick}>My Custom Button</button>
            //       )}
          />

          {/*
          <AppleLogin
            clientId="com.react.apple.login"
            redirectURI="https://redirectUrl.com"
            responseType="code"
            responseMode="query"
            usePopup
            render={(renderProps) => (
              <AppleLoginButton onClick={renderProps.onClick} align="center" />
            )}
          /> */}
          <Grid container>
            <Grid item xs>
              <Link href="/#" variant="body2">
                <FormattedMessage
                  id="loginScreen.ForgotPasswordButton"
                  defaultMessage="Forgot password?"
                  description="Forgot password Button Text"
                />
              </Link>
            </Grid>
            <Grid item>
              <Link
                component={RouterLink}
                to="/register"
                variant="body2"
                href="/#"
                className={classes.link}
              >
                <FormattedMessage
                  id="loginScreen.RegisterButton"
                  defaultMessage="Don't have an account? Register"
                  description="Register Button Text"
                />
              </Link>
            </Grid>
          </Grid>
        </form>
        <br />
      </div>
      <Box mt={8}>
        <RecaptchaTermsOfService />
      </Box>
      <Footer />
    </Container>
  );
}
