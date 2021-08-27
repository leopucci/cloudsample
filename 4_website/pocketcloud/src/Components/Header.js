import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { useDispatch } from "react-redux";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import "axios-progress-bar/dist/nprogress.css";
// import logow from "./logo4-removebg-preview.png";
import { actions } from "../Redux/user";

const useStyles = makeStyles((theme) => ({
  "@global": {
    ul: {
      margin: 0,
      padding: 0,
    },
    li: {
      listStyle: "none",
    },
    // Isto tira o recaptcha badge, so que eu fiz no app.js
    ".grecaptcha-badge": {
      visibility: "hidden",
    },
    body: {
      margin: 0,
      // minHeight: "100%",
      // height: "100%",
    },
  },
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbar: {
    flexWrap: "wrap",
  },
  toolbarTitle: {
    flexGrow: 1,
  },
  link: {
    margin: theme.spacing(1, 1.5),
  },
}));

// eslint-disable-next-line react/prop-types
export default function Header({ isLoggedIn }) {
  const dispatch = useDispatch();
  const classes = useStyles();

  const loginStatus = () =>
    isLoggedIn ? (
      <Button
        component={RouterLink}
        to="/"
        onClick={() => dispatch(actions.logOut())}
        color="primary"
        variant="outlined"
        className={classes.link}
      >
        Logout
      </Button>
    ) : (
      <Button
        component={RouterLink}
        to="/login"
        color="primary"
        variant="outlined"
        className={classes.link}
      >
        Login
      </Button>
    );

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      className={classes.appBar}
    >
      <Toolbar className={classes.toolbar}>
        {/* <div
          style={{
            width: "200px",
            height: "48px",

            overflow: "hidden",
            objectFit: "cover",
          }}
        >
           <img src={logow} alt="logo" className="img-fluid" /> 
        </div>
        */}
        <Typography
          variant="h6"
          color="inherit"
          noWrap
          className={classes.toolbarTitle}
        >
          Pocket Cloud
        </Typography>
        <nav>
          <Link
            component={RouterLink}
            to="/"
            variant="button"
            color="textPrimary"
            href="/#"
            className={classes.link}
          >
            Public
          </Link>
          <Link
            component={RouterLink}
            to="/Home"
            variant="button"
            color="textPrimary"
            href="/#"
            className={classes.link}
          >
            Home
          </Link>
          <Button
            component={RouterLink}
            to="/register"
            color="primary"
            variant="contained"
            className={classes.link}
          >
            Register
          </Button>
        </nav>
        {loginStatus()}
      </Toolbar>
    </AppBar>
  );
}
