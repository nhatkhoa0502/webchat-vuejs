import { createRouter, createWebHistory } from "vue-router";
import RegisterView from "../views/RegisterView.vue";
import LoginView from "../views/LoginView.vue";
import ChatsView from "../views/ChatsView.vue";
import FriendsView from "../views/FriendsView.vue";
import Profile from "../views/ProfileView.vue";
import UsersView from "../views/UsersView.vue";
import ForgotPasswordView from "../views/ForgotPasswordView.vue";

const routes = [
  {
    path: "/chats",
    component: ChatsView,
  },
  {
    path: "/friends",
    component: FriendsView,
  },
  {
    path: "/profile",
    component: Profile,
  },
  {
    path: "/users",
    component: UsersView,
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
