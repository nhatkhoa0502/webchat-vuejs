import { createStore } from "vuex";

export default createStore({
  state: {
    user: null, // Lưu thông tin người dùng
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    LOGOUT(state) {
      state.user = null;
    },
  },
  actions: {
    login({ commit }, user) {
      commit("SET_USER", user);
    },
    logout({ commit }) {
      commit("LOGOUT");
    },
  },
  getters: {
    getUser: (state) => state.user,
  },
});
