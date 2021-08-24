import axios from "axios";
import { loadProgressBar } from "axios-progress-bar";

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
loadProgressBar(null, instance);

export default instance;
