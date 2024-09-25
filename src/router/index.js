import { createRouter, createWebHistory } from "vue-router";
import RegisterView from "../views/RegisterView.vue";
import LoginView from "../views/LoginView.vue";
import ChatsView from "../views/ChatsView.vue";
import FriendsView from "../views/FriendsView.vue";
import Profile from "../views/ProfileView.vue";
import UsersView from "../views/UsersView.vue";
import ForgotPasswordView from "../views/ForgotPasswordView.vue";
// import { useStore } from "vuex";
// import { computed } from "vue";

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
