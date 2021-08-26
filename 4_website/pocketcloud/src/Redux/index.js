import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import user from "./user";
import counter from "./counter";

const rootReducer = (history) =>
  combineReducers({
    router: connectRouter(history),
    user,
    counter, // rest of your reducers
  });

export default rootReducer;
