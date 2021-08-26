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

export default function ForgotPassword() {
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
    recaptcha: "",
  });

  const handleOnChange = (value, name) => {
    setValues({ ...values, [name]: value });
  };

  const onClickResetPassword = async () => {
    dispatch(actions.clearLoginError());
    if (values.email === "") {
      dispatch(actions.setGoogleLogInError("Please add Email to continue"));
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
      const recaptcha = await executeRecaptcha("ForgotPassword");
      if (recaptcha != null) {
        dispatch(actions.forgotPassword(values, recaptcha));
      } else {
        dispatch(
          actions.notify("FORGOTPASSWORD: Recaptcha esta vindo em branco", 1)
        );
      }
    }
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
            id="forgotpwScreeen.ForgotPasswordH1Text"
            defaultMessage="Forgot Password"
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
                id="forgotpwScreeen.EmailAddressField"
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
              defaultMessage="Reset Password"
              description="Log In Button Text"
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
