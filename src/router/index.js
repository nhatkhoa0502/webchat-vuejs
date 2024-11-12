import { createRouter, createWebHistory } from "vue-router";
import RegisterView from "../views/RegisterView.vue";
import LoginView from "../views/LoginView.vue";
import ChatsView from "../views/ChatsView.vue";
import Profile from "../views/ProfileView.vue";
import ForgotPasswordView from "../views/ForgotPasswordView.vue";

const routes = [
  {
    path: "/chats",
    component: ChatsView,
  },
  {
    path: "/profile",
    component: Profile,
  },
  {
    path: "/forgot-password",
    components: {
      unAuthenticated: ForgotPasswordView,
    },
  },
  {
    path: "/register",
    components: {
      unAuthenticated: RegisterView,
    },
  },
  {
    path: "/login",
    components: {
      unAuthenticated: LoginView,
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
