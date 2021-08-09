import axios from "axios";

const pkg = require("../../package.json");

const instance = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://www.siteproducao.com/v1/"
      : pkg.proxy,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
