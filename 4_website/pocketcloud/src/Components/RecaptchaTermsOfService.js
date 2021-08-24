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
  // eslint-disable-next-line no-unused-vars
  const classes = useStyles();
  return (
    <Typography
      variant="body2"
      color="textSecondary"
      align="center"
      style={{ whiteSpace: "pre-line", fontSize: 10 }}
    >
      This site is protected by reCAPTCHA{"\n"} and the Google&nbsp;
      <a href="https://policies.google.com/privacy">Privacy Policy</a> and&nbsp;
      <a href="https://policies.google.com/terms">Terms of Service</a> apply.
    </Typography>
  );
}
