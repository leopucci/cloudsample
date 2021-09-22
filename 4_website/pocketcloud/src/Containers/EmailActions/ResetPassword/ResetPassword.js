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
// import AutorenewIcon from "@material-ui/icons/Autorenew";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import TextField from "@material-ui/core/TextField";
import { CircularProgress } from "@mui/material";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import RecaptchaTermsOfService from "../../../Components/RecaptchaTermsOfService";
import { actions } from "../../../Redux/user";
import Footer from "../../../Components/Footer";

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

export default function ResetPassword() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const classes = useStyles();
  const dispatch = useDispatch();
  const { token: urltoken } = useParams();

  const [values, setValues] = React.useState({
    password: "",
    confirmPassword: "",
    token: "",
    recaptcha: "",
  });

  const handleOnChange = (value, name) => {
    setValues({ ...values, [name]: value });
  };

  const resetPasswordError = useSelector(
    (state) => state.user.resetPasswordError
  );
  const isResetPasswordError = !!resetPasswordError;
  const isFetching = useSelector((state) => state.user.isFetching);
  const resetPasswordSuccess = useSelector(
    (state) => state.user.resetPasswordSuccess
  );
  const isResetPasswordSuccess = !!resetPasswordSuccess;

  // remove token from url to prevent http referer leakage
  // Eu tentei fazer isto com o proprio router nao consegui.
  // Tem um ponto de atencao aqui que é a troca do title, nao sei como fica em prod
  window.history.pushState("", "Reset Password", "/resetpassword/");

  // Create an event handler so you can call the verification on button click event or form submit
  const handleReCaptchaVerify = useCallback(async () => {
    handleOnChange(urltoken, "token");
    dispatch(actions.clearResetPasswordError());
    if (!executeRecaptcha) {
      console.log("Execute recaptcha not yet available");
    }

    // Do whatever you want with the token
  }, [executeRecaptcha]);

  // You can use useEffect to trigger the verification as soon as the component being loaded
  useEffect(() => {
    handleReCaptchaVerify();
  }, [handleReCaptchaVerify]);

  const onClickResetPassword = async () => {
    dispatch(actions.clearResetPasswordError());

    if (values.password === "" || values.confirmPassword === "") {
      dispatch(
        actions.setResetPasswordError("Please complete the form to continue")
      );
    } else if (values.password !== values.confirmPassword) {
      dispatch(actions.setResetPasswordError("Passwords are not equal"));
    } else {
      if (!executeRecaptcha) {
        dispatch(
          actions.notify(
            "Forgot password Execute recaptcha not yet available",
            1
          )
        );
        return;
      }
      const recaptchatoken = await executeRecaptcha("ForgotPassword");
      if (urltoken) {
        if (recaptchatoken != null) {
          handleOnChange(recaptchatoken, "recaptcha");
          dispatch(actions.resetPasswordApiRequest(values, recaptchatoken));
        } else {
          dispatch(
            actions.notify("RESETPASSWORD: Recaptcha esta vindo em branco", 1)
          );
          dispatch(actions.resetPasswordApiRequest(values, "RECAPTCHA_ERROR"));
        }
      }
    }
  };

  let TextoNaTela;
  if (isResetPasswordSuccess) {
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
            defaultMessage="Changing your password..."
            description="Log In H1 Text"
          />
        </Typography>

        <Box mt={9}>
          <Typography component="h1" variant="subtitle1">
            <FormattedMessage
              id="emailConfirmationScreeen.ConfirmEmailH1Text"
              defaultMessage="Changing your password..."
              description="Log In H1 Text"
              values={{
                b: (...chunks) => <b>{chunks}</b>,
                token: urltoken,
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
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            <FormattedMessage
              id="forgotpwScreeen.ForgotPasswordH1Text"
              defaultMessage="Set the new Password"
              description="Log In H1 Text"
            />
          </Typography>
          <form className={classes.form} noValidate>
            <TextField
              error={isResetPasswordError}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="password"
              type="password"
              label={
                <FormattedMessage
                  id="forgotpwScreeen.EmailAddressField"
                  defaultMessage="New Password"
                  description="New Password TextField Text"
                />
              }
              name="password"
              autoComplete="password"
              helperText={resetPasswordError}
              autoFocus
              onChange={(e) => handleOnChange(e.target.value, e.target.name)}
            />
            <TextField
              error={isResetPasswordError}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="confirmPassword"
              type="password"
              label={
                <FormattedMessage
                  id="forgotpwScreeen.EmailAddressField"
                  defaultMessage="Confirm New Password"
                  description="New Password TextField Text"
                />
              }
              name="confirmPassword"
              autoComplete="password"
              helperText={resetPasswordError}
              autoFocus
              onChange={(e) => handleOnChange(e.target.value, e.target.name)}
            />
            <Button
              size="large"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={onClickResetPassword}
            >
              <FormattedMessage
                id="forgotpwScreeen.ResetPasswordButton"
                defaultMessage="Change Password"
                description="Change Password Button Text"
              />
            </Button>
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

  // if (isLoggedIn) return <Redirect to="/Home" />;
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />

      {TextoNaTela}
    </Container>
  );
}
