import { createRouter, createWebHistory } from "vue-router";
import RegisterView from "../views/RegisterView.vue";
import LoginView from "../views/LoginView.vue";
import HomeView from "../views/HomeView.vue";
import ChatsView from "../views/ChatsView.vue";
import FriendsView from "../views/FriendsView.vue";
import MyAccountView from "../views/MyAccountView.vue";
import UsersView from "../views/UsersView.vue";
import ForgotPasswordView from "../views/ForgotPasswordView.vue";
// import { useStore } from "vuex";
// import { computed } from "vue";

const routes = [
  {
    path: "/",
    component: HomeView,
    // meta: { requiresAuth: true },
  },
  {
    path: "/forgot-password",
    component: ForgotPasswordView,
  },
  {
    path: "/chats",
    component: ChatsView,
    // meta: { requiresAuth: true },
  },
  {
    path: "/friends",
    component: FriendsView,
    // meta: { requiresAuth: true },
  },
  {
    path: "/my-account",
    component: MyAccountView,
    // meta: { requiresAuth: true },
  },
  {
    path: "/users",
    component: UsersView,
    // meta: { requiresAuth: true },
  },
  {
    path: "/register",
    component: RegisterView,
  },
  {
    path: "/login",
    component: LoginView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

//Router Guard
// router.beforeEach((to, from, next) => {
//   const store = useStore();
//   const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

//   if (requiresAuth) {
//     const isAuthenticated = computed(() => store.getters.isAuthenticated);
//     if (!isAuthenticated.value) {
//       next("/login");
//     } else {
//       next();
//     }
//   } else {
//     next();
//   }
// });

export default router;
