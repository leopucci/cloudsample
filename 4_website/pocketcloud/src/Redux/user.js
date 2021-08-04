const pkg = require("../../package.json");
// eslint-disable-next-line import/order
const axios = require("axios").create({
  // .. where we make our configurations
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://www.siteproducao.com/v1/"
      : pkg.proxy,
});

// Aqui ele nomeou as ações. o bom disto é que ele pode fazer um import * as actions e depois usar actions. e ter todas disponiveis
// e caso ele precise mudar em algum lugar, ele muda tudo no mesmo lugar.
// Actions
export const SET_USER = "redux/users/SET_USER";
export const LOG_OUT = "redux/users/LOG_OUT";
export const SIGN_IN = "redux/users/SIGN_IN";
export const SIGN_UP = "redux/users/SIGN_UP";
export const SIGN_UP_COMPLETE = "redux/users/SIGN_UP_COMPLETE";
export const SET_LOGIN_ERROR = "redux/users/SET_LOGIN_ERROR";
export const SET_SIGNUP_ERROR = "redux/users/SET_SIGNUP_ERROR";

// Reducer

const initialState = {
  profileName: null,
  isLoggedIn: false,
  isFetching: false,
  jwt: null,
  loginError: null,
  signupError: null,
};

// functional programing
// currying eh um conceito de ter 1 funcao que retorna funcao, ao inves de ter 2 parametros, tenho 1 so aninhado.

// isto aqui é uma funçao.. por causa do '() =>{}' que ele usou
// currentUser eh o export default entao eh so o nome de uma reducer que
// vai ser usada pelo redux.
// esta sendo exportada uma função, a reducer é uma função.
const currentUser = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        profileName: action.payload.email,
        isLoggedIn: true,
        isFetching: false,
        jwt: action.payload.jwt,
        loginError: null,
      };
    case LOG_OUT:
      return initialState;
    case SIGN_IN:
      return {
        ...state,
        isFetching: true,
        loginError: null,
      };
    case SIGN_UP:
      return {
        ...state,
        isFetching: true,
        signupError: null,
      };
    case SIGN_UP_COMPLETE:
      return {
        ...state,
        isFetching: false,
        signupError: null,
      };
    case SET_LOGIN_ERROR:
      return {
        ...state,
        isFetching: false,
        loginError: action.payload.error,
      };
    case SET_SIGNUP_ERROR:
      return {
        ...state,
        isFetching: false,
        signupError: action.payload.error,
      };
    default:
      return state;
  }
};

export default currentUser;

// Action Creators
// Aqui ele esta devolvendo um objeto veja o () antes do {}
// Isso serve pra facilitar na hora de declarar.
// agora ele usa  dispatch(setLoginError(errorMessage)); e ja esta indo a estrutura pronta e ele só precisa declarar num lugar
const setUser = (userObj) => ({
  type: SET_USER,
  payload: userObj,
});

const setLoginError = (error) => ({
  type: SET_LOGIN_ERROR,
  payload: { error },
});

const setSignupError = (error) => ({
  type: SET_SIGNUP_ERROR,
  payload: { error },
});

const signIn = (userObj) => (dispatch) => {
  dispatch({
    type: SIGN_IN,
  });

  axios({
    method: "post",
    url: "/auth/login",
    data: {
      email: userObj.email,
      password: userObj.password,
    },
  })
    .then((response) => {
      // handle success
      dispatch(
        setUser({
          email: response.data.user.email,
          jwt: response.data.tokens,
        })
      );
    })
    .catch((error) => {
      // handle error
      let errorMessage = "Network Error";
      if (error.response) {
        errorMessage = error.response.data.message;
        errorMessage =
          errorMessage === "WRONG_CREDENTIAL"
            ? "Incorrect email or password"
            : errorMessage;
        // User does not exist. Sign up for an account
      }
      dispatch(setLoginError(errorMessage));
    })
    .then(() => {
      // always executed
    });
};

const signUp = (userObj) => (dispatch) => {
  dispatch({
    type: SIGN_UP,
  });
  axios({
    method: "post",
    url: "/auth/register",
    data: {
      email: userObj.email,
      password: userObj.password,
      firstName: userObj.firstName,
      lastName: userObj.lastName,
    },
  })
    .then((response) => {
      // handle success
      console.log("FOI");
      if (response.data.id) {
        console.log("TEM ID");
        dispatch({
          type: SIGN_UP_COMPLETE,
        });
        dispatch(signIn(userObj)); // Auto login on successful register
      } else {
        console.log("NAO TEM ID");
      }
    })
    .catch((error) => {
      // handle error
      let errorMessage = "Network Error";
      if (error.response) {
        errorMessage = error.response.data.message;
        errorMessage =
          errorMessage === "USERNAME_IS_NOT_AVAILABLE"
            ? "Username/Email is not available"
            : errorMessage;
      }
      dispatch(setSignupError(errorMessage));
    })
    .then(() => {
      // always executed
    });
};

const getProfile = (access_token) => {
  axios({
    method: "get",
    url: "/api/user/me",
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      // handle success
      console.log(response);
    })
    .catch((error) => {
      // handle error
      console.log(error.response);
    })
    .then(() => {
      // always executed
    });
};

const logOut = () => ({
  type: LOG_OUT,
});

export const actions = {
  setUser,
  logOut,
  logIn: signIn,
  signUp,
  setLoginError,
  setSignupError,
  getProfile,
};
