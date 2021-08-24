import React from "react";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
// import { FaHeart, FaYoutube, FaInstagram } from "react-icons/fa";

const useStyles = makeStyles({
  bg: {
    // backgroundColor: "grey",
  },
  copyright: {
    // color: "white",
  },
});

export default function Footer() {
  const classes = useStyles();
  return (
    <Typography
      variant="body2"
      color="textSecondary"
      align="center"
      className={classes.bg}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}.
    </Typography>
  );
}
