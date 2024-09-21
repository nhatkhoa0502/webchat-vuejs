<template>
  <v-app>
    <NavigationDrawer v-if="isAuthenticated" />
    <v-main>
      <router-view />
    </v-main>
    <v-footer app>
      <span>{{ user }}</span>
    </v-footer>
  </v-app>
</template>
<script setup>
import {
  computed,
  // onMounted
} from "vue";
import NavigationDrawer from "./components/NavigationDrawer.vue";
import { useStore } from "vuex";
// import { getRedirectResult, getAuth } from "firebase/auth";
// import router from "@/router";

const store = useStore();
const isAuthenticated = computed(() => store.getters.isAuthenticated);
const user = computed(() => store.getters.getUser);

// onMounted(async () => {
//   const auth = getAuth();
//   try {
//     console.log("getRedirectResult");
//     const result = await getRedirectResult(auth);
//     if (result) {
//       // Lấy thông tin người dùng từ result.user
//       console.log("User logged in with Google", result.user);

//       // Tiếp tục xử lý sau khi đăng nhập thành công
//       router.push("/");
//     }
//   } catch (error) {
//     console.error("Error during Google sign-in:", error);
//   }
// });
</script>
<style scoped></style>
