import React from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  bg: {
    // backgroundColor: "grey",
  },
  copyright: {
    // color: "white",
  },
});

export default function RecaptchaTermsOfService() {
  // ESTE EH O ORIGINAL QUE EU ACHEI NA NET
  /* This site is protected by reCAPTCHA{"\n"} and the Google&nbsp;
      <a href="https://policies.google.com/privacy">Privacy Policy</a> and&nbsp;
      <a href="https://policies.google.com/terms">Terms of Service</a> apply. */

  // ESTE EH O QUE EU ENCONTREI EM PROD NO STRIPO.EMAIL
  // This page is protected by reCAPTCHA, and subject to the Google Privacy Policy and Terms of Service.
  // eslint-disable-next-line no-unused-vars
  const classes = useStyles();
  return (
    <Typography
      variant="body2"
      color="textSecondary"
      align="center"
      style={{ whiteSpace: "pre-line", fontSize: 10 }}
    >
      This site is protected by reCAPTCHA{"\n"} and subject to the&nbsp;
      <a href="https://policies.google.com/privacy">
        Google Privacy Policy
      </a>{" "}
      and&nbsp;
      <a href="https://policies.google.com/terms">Terms of Service</a>.
    </Typography>
  );
}
