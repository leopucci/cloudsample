import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link as RouterLink } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
// import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
// import AllInboxIcon from "@material-ui/icons/AllInbox";
import DraftsIcon from "@material-ui/icons/Drafts";

import { CircularProgress } from "@mui/material";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { actions } from "../../../Redux/user";

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

export default function ConfirmEmail() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const classes = useStyles();
  const dispatch = useDispatch();

  const { token } = useParams();
  const confirmEmailError = useSelector(
    (state) => state.user.confirmEmailError
  );
  const isConfirmEmailError = !!confirmEmailError;
  const isFetching = useSelector((state) => state.user.isFetching);
  const confirmEmailSuccess = useSelector(
    (state) => state.user.confirmEmailSuccess
  );
  const isConfirmEmailSuccess = !!confirmEmailSuccess;

  // remove token from url to prevent http referer leakage
  // Eu tentei fazer isto com o proprio router nao consegui.
  // Tem um ponto de atencao aqui que é a troca do title, nao sei como fica em prod
  // window.history.pushState("", "Email Confirmation", "/confirmemail/");

  // Create an event handler so you can call the verification on button click event or form submit
  const handleReCaptchaVerify = useCallback(async () => {
    dispatch(actions.clearConfirmEmailError());
    if (!executeRecaptcha) {
      console.log("Execute recaptcha not yet available");
      return;
    }

    const recaptchatoken = await executeRecaptcha("confirmemail");

    if (token) {
      if (recaptchatoken != null) {
        dispatch(actions.confirmEmailTokenValidation(token, recaptchatoken));
      } else {
        dispatch(
          actions.notify("Recaptcha esta vindo em branco no ConfirmEmail", 1)
        );
        dispatch(actions.confirmEmailTokenValidation(token, "RECAPTCHA_ERROR"));
      }
    }
    // Do whatever you want with the token
  }, [executeRecaptcha]);

  // You can use useEffect to trigger the verification as soon as the component being loaded
  useEffect(() => {
    handleReCaptchaVerify();
  }, [handleReCaptchaVerify]);

  let TextoNaTela;
  if (isConfirmEmailError) {
    TextoNaTela = (
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <DraftsIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          <FormattedMessage
            id="emailConfirmationScreeen.emailConfirmationH1Text"
            defaultMessage="Confirm your e-mail address"
            description="Log In H1 Text"
          />
        </Typography>

        <Box mt={9}>
          <Typography component="h1" variant="subtitle1">
            <FormattedMessage
              id="emailConfirmationScreeen.ConfirmEmailH1Text"
              defaultMessage="<b>{ confirmEmailError }</b>"
              description="Log In H1 Text"
              values={{
                b: (...chunks) => <b>{chunks}</b>,
                confirmEmailError,
              }}
            />
          </Typography>
          <Button
            component={RouterLink}
            to="/login"
            color="primary"
            variant="contained"
            className={classes.link}
          >
            Click here to login
          </Button>
        </Box>

        <Grid container>
          <Grid item xs>
            {/* <Link href="/#" variant="body2">
                <FormattedMessage
                  id="loginScreen.ForgotPasswordButton"
                  defaultMessage="Forgot password?"
                  description="Forgot password Button Text"
                />
              </Link> */}
          </Grid>
          <Grid item>
            {/* <Link
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
              </Link> */}
          </Grid>
        </Grid>
        <br />
      </div>
    );
  } else if (isConfirmEmailSuccess) {
    TextoNaTela = (
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <DraftsIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          <FormattedMessage
            id="emailConfirmationScreeen.emailConfirmationH1Text"
            defaultMessage="Email Address Confirmed"
            description="Log In H1 Text"
          />
        </Typography>

        <Box mt={9}>
          <Typography component="h1" variant="subtitle1">
            <FormattedMessage
              id="emailConfirmationScreeen.ConfirmEmailH1Text"
              defaultMessage="Email Address Confirmed"
              description="Log In H1 Text"
              values={{
                b: (...chunks) => <b>{chunks}</b>,
              }}
            />
          </Typography>
          <Button
            component={RouterLink}
            to="/login"
            color="primary"
            variant="contained"
            className={classes.link}
          >
            Click here to login
          </Button>
        </Box>

        <Grid container>
          <Grid item xs>
            {/* <Link href="/#" variant="body2">
                <FormattedMessage
                  id="loginScreen.ForgotPasswordButton"
                  defaultMessage="Forgot password?"
                  description="Forgot password Button Text"
                />
              </Link> */}
          </Grid>
          <Grid item>
            {/* <Link
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
              </Link> */}
          </Grid>
        </Grid>
        <br />
      </div>
    );
  } else if (isFetching === true) {
    TextoNaTela = (
      <div className={classes.paper}>
        <CircularProgress />

        <Typography component="h1" variant="h5">
          <FormattedMessage
            id="emailConfirmationScreeen.emailConfirmationH1Text"
            defaultMessage="Confirming your e-mail address"
            description="Log In H1 Text"
          />
        </Typography>

        <Box mt={9}>
          <Typography component="h1" variant="subtitle1">
            <FormattedMessage
              id="emailConfirmationScreeen.ConfirmEmailH1Text"
              defaultMessage="Confirming your e-mail address ... "
              description="Log In H1 Text"
              values={{
                b: (...chunks) => <b>{chunks}</b>,
                token,
              }}
            />
          </Typography>
        </Box>

        <Grid container>
          <Grid item xs>
            {/* <Link href="/#" variant="body2">
                <FormattedMessage
                  id="loginScreen.ForgotPasswordButton"
                  defaultMessage="Forgot password?"
                  description="Forgot password Button Text"
                />
              </Link> */}
          </Grid>
          <Grid item>
            {/* <Link
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
              </Link> */}
          </Grid>
        </Grid>
        <br />
      </div>
    );
  } else {
    TextoNaTela = (
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <DraftsIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          <FormattedMessage
            id="emailConfirmationScreeen.emailConfirmationH1Text"
            defaultMessage="Confirm your e-mail address"
            description="Log In H1 Text"
          />
        </Typography>

        <Box mt={9}>
          <Typography component="h1" variant="subtitle1">
            <FormattedMessage
              id="emailConfirmationScreeen.ConfirmEmailH1Text"
              defaultMessage="Please wait while we confirm your e-mail address"
              description="Log In H1 Text"
            />
          </Typography>
        </Box>

        <Grid container>
          <Grid item xs>
            {/* <Link href="/#" variant="body2">
                <FormattedMessage
                  id="loginScreen.ForgotPasswordButton"
                  defaultMessage="Forgot password?"
                  description="Forgot password Button Text"
                />
              </Link> */}
          </Grid>
          <Grid item>
            {/* <Link
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
              </Link> */}
          </Grid>
        </Grid>
        <br />
      </div>
    );
  }

  // if (isLoggedIn) return <Redirect to="/Home" />;
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />

      {TextoNaTela}
    </Container>
  );
}
