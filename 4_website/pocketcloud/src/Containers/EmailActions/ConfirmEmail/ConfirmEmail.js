import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
// import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
// import AllInboxIcon from "@material-ui/icons/AllInbox";
import DraftsIcon from "@material-ui/icons/Drafts";
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
  const classes = useStyles();
  const dispatch = useDispatch();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { token } = useParams();
  // remove token from url to prevent http referer leakage
  // Eu tentei fazer isto com o proprio router nao consegui.
  // Tem um ponto de atencao aqui que é a troca do title, nao sei como fica em prod
  window.history.pushState("", "Email Confirmation", "/confirmemail/");

  // Create an event handler so you can call the verification on button click event or form submit
  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      console.log("Execute recaptcha not yet available");
      return;
    }

    const recaptchatoken = await executeRecaptcha("yourAction");
    console.log(recaptchatoken);

    if (token) {
      if (recaptchatoken != null) {
        dispatch(actions.confirmEmailTokenValidation(token, recaptchatoken));
      } else {
        dispatch(
          actions.notify("Recaptcha esta vindo em branco no ConfirmEmail", 1)
        );
      }
    }
    // Do whatever you want with the token
  }, []);

  // You can use useEffect to trigger the verification as soon as the component being loaded
  useEffect(() => {
    handleReCaptchaVerify();
  }, [handleReCaptchaVerify]);

  const isFetching = useSelector((state) => state.isFetching);

  // if (isLoggedIn) return <Redirect to="/Home" />;
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
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
            {isFetching ? (
              <FormattedMessage
                id="emailConfirmationScreeen.ConfirmEmailH1Text"
                defaultMessage="To complete the process please check <b>{ token }</b> and click to confirm e-mail address"
                description="Log In H1 Text"
                values={{
                  b: (...chunks) => <b>{chunks}</b>,
                  token,
                }}
              />
            ) : (
              <FormattedMessage
                id="emailConfirmationScreeen.ConfirmEmailH1Text"
                defaultMessage="To complete the process please check your email and click to confirm e-mail address"
                description="Log In H1 Text"
              />
            )}
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
    </Container>
  );
}
