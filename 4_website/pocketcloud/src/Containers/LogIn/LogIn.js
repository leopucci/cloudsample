import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, Link as RouterLink } from "react-router-dom";
import { FormattedMessage } from "react-intl";
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
import GoogleLogin from "react-google-login";
import {
  GoogleLoginButton,
  AppleLoginButton,
} from "react-social-login-buttons";

import { actions } from "../../Redux/user";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}.
    </Typography>
  );
}

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
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function LogIn() {
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
  });

  const handleOnChange = (value, name) => {
    setValues({ ...values, [name]: value });
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
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={() => dispatch(actions.logIn(values))}
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
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
              />
            )}
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            onSuccess={(response) => {
              dispatch(actions.googleLogIn(response));
            }}
            onFailure={(response) => {
              if (response.error) {
                switch (response.error) {
                  case "popup_closed_by_user":
                    console.log("popup_closed_by_user");
                    break;
                  default:
                    console.log(response.error);
                    dispatch(actions.setGoogleLogInError(response.error));
                }
              } else {
                console.log(response);
              }
            }}
            cookiePolicy="single_host_origin"
          />
          <AppleLoginButton />
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
                to="/signup"
                variant="body2"
                href="/#"
                className={classes.link}
              >
                <FormattedMessage
                  id="loginScreen.SignUpButton"
                  defaultMessage="Don't have an account? Sign Up"
                  description="SignUp Button Text"
                />
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}
