import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { actions } from "../../Redux/user";

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
  const isLoggedIn = useSelector(
    (state) => state.user.isLoggedIn && state.user.jwt !== null
  );
  const loginError = useSelector((state) => state.user.loginError);
  // eslint-disable-next-line no-unused-vars
  const isLoginError = !!loginError;

  const classes = useStyles();
  const dispatch = useDispatch();

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

        <Box mt={9}>
          <Typography component="h1" variant="subtitle1">
            <FormattedMessage
              id="forgotpwScreeen.ForgotPasswordH1Text"
              defaultMessage="Please access your e-mail to login to your account"
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
    </Container>
  );
}
