<template>
  <v-app>
    <!-- NavigationDrawer Chỉ hiện thị khi người dùng đã đăng nhập -->
    <NavigationDrawer v-if="user" />

    <!-- Router-view cho người dùng đã đăng nhập -->
    <v-main v-if="user">
      <router-view />
    </v-main>

    <!-- Router-view cho người dùng chưa đăng nhập -->
    <v-main v-else>
      <router-view name="unAuthenticated" />
    </v-main>
  </v-app>
</template>
<script setup>
import { computed, ref } from "vue";
import NavigationDrawer from "./components/NavigationDrawer.vue";
import { useStore } from "vuex";

const store = useStore();
const user = computed(() => store.getters.getUser);
</script>
<style scoped></style>
