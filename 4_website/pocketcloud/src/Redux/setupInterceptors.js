/* eslint-disable no-underscore-dangle */
import axiosInstance from "./api";
import { actions } from "./user";

// Esta eh  outra forma de usar refresh,
// só que eh um middleware que vai antes do thunk
// https://stackoverflow.com/a/36986329/3156756
// neste caso ele só da refresh pela aplicação, e nao pelo erro http.
// ou seja, achei melhor confiar no erro http, assim ela nunca para.
// ideal era ter as 2, pra quando der erro e pra quando a aplicação achar conveniente atualizar (tipo 5 dias antes de dar pau).

function getAccessToken(store) {
  const { jwt } = store.getState();
  if (jwt != null) {
    const { token } = jwt.access;
    return token;
  }
  return null;
}

function getRefreshToken(store) {
  const { jwt } = store.getState();
  if (jwt != null) {
    const { token } = jwt.refresh;
    return token;
  }
  return null;
}

const setup = (store) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getAccessToken(store);
      if (token) {
        // config.headers["Authorization"] = 'Bearer ' + token;  // for Spring Boot back-end
        // eslint-disable-next-line no-param-reassign
        config.headers["x-access-token"] = token; // for Node.js Express back-end
      }
      return config;
    },
    (error) => {
      console.log(error);
      return Promise.reject(error);
    }
  );

  const { dispatch } = store;
  axiosInstance.interceptors.response.use(
    (res) => {
      return res;
    },
    async (err) => {
      const originalConfig = err.config;
      // URl de login e de registro, corre sem token
      if (originalConfig.url !== "/auth/login" && err.response) {
        // Access Token was expired
        if (err.response.status === 401 && !originalConfig.isRetryAttempt) {
          originalConfig.isRetryAttempt = true;

          try {
            let configRefresh = {};
            const refreshToken = getRefreshToken(store);
            if (refreshToken) {
              configRefresh = { refreshToken };
              const rs = await axiosInstance.post("/auth/refreshtoken", {
                configRefresh,
              });

              const { accessToken } = rs.data;

              dispatch(actions.refreshedToken(accessToken));
              return axiosInstance(originalConfig);
            }
            // AQUI TEM QUE TER UM ERRO QUE MANDA MSG PRA MIM.
            // PORUQE ELE TA TENTANDO ACESSAR ALGO E NAO TEM O REFRESH PRA PODER REAUTENTICAR
            return axiosInstance(originalConfig);
          } catch (_error) {
            console.log(_error);
            return Promise.reject(_error);
          }
        }
      }

      return Promise.reject(err);
    }
  );
};

export default setup;
