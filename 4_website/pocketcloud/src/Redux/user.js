import wakeEvent from "wake-event";
import { push } from "connected-react-router";
import api from "./api";
// Aqui ele nomeou as ações. o bom disto é que ele pode fazer um import * as actions e depois usar actions. e ter todas disponiveis
// e caso ele precise mudar em algum lugar, ele muda tudo no mesmo lugar.
// Actions
export const SET_USER = "redux/users/SET_USER";
export const LOG_OUT = "redux/users/LOG_OUT";
export const SIGN_IN = "redux/users/SIGN_IN";
export const SIGN_UP = "redux/users/SIGN_UP";
export const REFRESHED_TOKEN = "redux/users/REFRESHED_TOKEN";
export const SIGN_UP_COMPLETE = "redux/users/SIGN_UP_COMPLETE";
export const SET_LOGIN_ERROR = "redux/users/SET_LOGIN_ERROR";
export const CLEAR_LOGIN_ERROR = "redux/users/CLEAR_LOGIN_ERROR";
export const SET_REGISTER_ERROR = "redux/users/SET_REGISTER_ERROR";
export const CLEAR_REGISTER_ERROR = "redux/users/CLEAR_REGISTER_ERROR";

// Reducer

const initialState = {
  profileName: null,
  isLoggedIn: false,
  isFetching: false,
  jwt: null,
  loginError: null,
  registerError: null,
};

// functional programing
// currying eh um conceito de ter 1 funcao que retorna funcao, ao inves de ter 2 parametros, tenho 1 so aninhado.

// isto aqui é uma funçao.. por causa do '() =>{}' que ele usou
// currentUser eh o export default entao eh so o nome de uma reducer que
// vai ser usada pelo redux.
// esta sendo exportada uma função, a reducer é uma função.
const currentUser = (state = initialState, action) => {
  switch (action.type) {
    case REFRESHED_TOKEN:
      return {
        ...state,
        jwt: action.payload.jwt,
      };
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
        registerError: null,
      };
    case SIGN_UP_COMPLETE:
      return {
        ...state,
        isFetching: false,
        registerError: null,
      };
    case SET_LOGIN_ERROR:
      return {
        ...state,
        isFetching: false,
        loginError: action.payload.error,
      };
    case CLEAR_LOGIN_ERROR:
      return {
        ...state,
        isFetching: false,
        loginError: null,
      };
    case SET_REGISTER_ERROR:
      return {
        ...state,
        isFetching: false,
        registerError: action.payload.error,
      };
    case CLEAR_REGISTER_ERROR:
      return {
        ...state,
        isFetching: false,
        registerError: null,
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

const refreshedToken = (userObj) => ({
  type: REFRESHED_TOKEN,
  payload: userObj,
});
const setLoginError = (error) => ({
  type: SET_LOGIN_ERROR,
  payload: { error },
});
const clearLoginError = (error) => ({
  type: CLEAR_LOGIN_ERROR,
  payload: { error },
});

const setGoogleLogInError = (error) => ({
  type: SET_LOGIN_ERROR,
  payload: { error },
});

const setRegisterError = (error) => ({
  type: SET_REGISTER_ERROR,
  payload: { error },
});
const clearRegisterError = (error) => ({
  type: CLEAR_REGISTER_ERROR,
  payload: { error },
});

const signIn = (userObj, recaptcha) => (dispatch) => {
  dispatch({
    type: SIGN_IN,
  });
  return api({
    method: "post",
    url: "/auth/login",
    data: {
      email: userObj.email,
      password: userObj.password,
      recaptcha,
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
      console.log(error);
      let errorMessage = "Network Error";
      if (error.response) {
        if (
          error.response.data.message ===
          "You need to confirm your e-mail address, please check your e-mail"
        ) {
          dispatch(push(`/openyourmailbox/${userObj.email}`));
        }

        errorMessage = error.response.data.message;
        errorMessage =
          errorMessage === "WRONG_CREDENTIAL"
            ? "Incorrect email or password"
            : errorMessage;
        // User does not exist. Register for an account
      }
      dispatch(setLoginError(errorMessage));
    })
    .then(() => {
      // always executed
    });
};

const googleSignIn = (userObj, recaptcha) => (dispatch) => {
  dispatch({
    type: SIGN_IN,
  });

  console.log(userObj);
  return api({
    method: "post",
    url: "/auth/login/google",
    data: {
      token: userObj.tokenId,
      recaptcha,
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
      console.log(error);
      let errorMessage = "Network Error";
      if (error.response) {
        errorMessage = error.response.data.message;
        errorMessage =
          errorMessage === "WRONG_CREDENTIAL"
            ? "Incorrect email or password"
            : errorMessage;
        // User does not exist. Register for an account
      }
      dispatch(setLoginError(errorMessage));
    })
    .then(() => {
      // always executed
    });
};

const register = (userObj, recaptcha) => (dispatch) => {
  dispatch({
    type: SIGN_UP,
  });
  api({
    method: "post",
    url: "/auth/register",
    data: {
      email: userObj.email,
      password: userObj.password,
      confirmPassword: userObj.confirmPassword,
      firstName: userObj.firstName,
      lastName: userObj.lastName,
      recaptcha,
    },
  })
    .then((response) => {
      dispatch({
        type: SIGN_UP_COMPLETE,
      });
      dispatch(push(`/openyourmailbox/${response.data.email}`));
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
      dispatch(setRegisterError(errorMessage));
    })
    .then(() => {
      // always executed
    });
};

const forgotPassword = (userObj, recaptcha) => (dispatch) => {
  dispatch({
    type: SIGN_IN,
  });
  return api({
    method: "post",
    url: "/auth/forgot-password",
    data: {
      email: userObj.email,
      recaptcha,
    },
  })
    .then(() => {
      // handle success
      dispatch(push(`/openyourmailbox/${userObj.email}`));
    })
    .catch((error) => {
      // handle error
      console.log(error);
      let errorMessage = "Network Error";
      if (error.response) {
        errorMessage = error.response.data.message;
        errorMessage =
          errorMessage === "WRONG_CREDENTIAL"
            ? "Incorrect email or password"
            : errorMessage;
        // User does not exist. Register for an account
      }
      dispatch(setLoginError(errorMessage));
    })
    .then(() => {
      // always executed
    });
};

// eslint-disable-next-line no-unused-vars
const logOut = (userObj) => (dispatch, getState) => {
  const state = getState();
  let token;
  if (state.user.jwt != null) {
    token = state.user.jwt.refresh.token;
    api({
      method: "post",
      url: "/auth/logout",
      data: {
        refreshToken: token,
      },
    })
      .then((response) => {
        // handle success
        console.log(response);
        dispatch({
          type: LOG_OUT,
        });
      })
      .catch((error) => {
        // AQUI PRECISA GERAR ERRO TBM, SE NAO CONSEGUIU CONECTAR
        // UMA MENSAGEM NA TELA/NOTIFICAÇÃO
        // handle error
        let errorMessage = "Network Error";
        if (error.response) {
          if (error.response.status === 400) {
            dispatch({
              type: LOG_OUT,
            });
          }
          errorMessage = error.response.data.message;
          errorMessage =
            errorMessage === "USERNAME_IS_NOT_AVAILABLE"
              ? "Username/Email is not available"
              : errorMessage;
        }
        dispatch(setRegisterError(errorMessage));
      });
  } else {
    // AQUI TEM UM ERRO EMBUTIDO QUE PRECISA SER LOGADO. ELE VAI DESLOGAR NO CLIENTE SEM DESLOGAR NA API
    dispatch({
      type: LOG_OUT,
    });
  }
};

const notify =
  (message, channel = 1) =>
  (dispatch) => {
    dispatch({
      type: SIGN_IN,
    });
    return api({
      method: "post",
      url: "/auth/login/errors",
      data: {
        message,
        channel,
      },
    })
      .catch((error) => {
        // handle error
        console.log(error);
        let errorMessage = "Network Error";
        if (error.response) {
          errorMessage = error.response.data.message;
          errorMessage =
            errorMessage === "WRONG_CREDENTIAL"
              ? "Incorrect email or password"
              : errorMessage;
          // User does not exist. Register for an account
        }
        dispatch(setLoginError(errorMessage));
      })
      .then(() => {
        // always executed
      });
  };

wakeEvent(function () {
  notify("computer woke up!");
});
export const actions = {
  setUser,
  logOut,
  logIn: signIn,
  googleLogIn: googleSignIn,
  register,
  setLoginError,
  clearLoginError,
  setGoogleLogInError,
  setRegisterError,
  clearRegisterError,
  forgotPassword,
  notify,
  refreshedToken,
};
