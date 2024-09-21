<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    permanent
    @click="rail = false"
    app
  >
    <!-- header -->
    <v-list-item :prepend-avatar="avatar" :title="username" nav>
      <template v-slot:append>
        <v-btn
          icon="mdi-chevron-left"
          variant="text"
          @click.stop="rail = !rail"
        ></v-btn>
      </template>
    </v-list-item>

    <v-divider></v-divider>

    <!-- list option -->
    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-message-text"
        title="Chats"
        value="home"
        to="/chats"
      >
      </v-list-item>
      <v-list-item
        prepend-icon="mdi-account-multiple-check-outline"
        title="Friends"
        value="friends"
        to="/friends"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-account-group-outline"
        title="Users"
        value="users"
        to="/users"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-account"
        title="My Account"
        value="my-account"
        to="/my-account"
      ></v-list-item>
      <v-list-item
        id="logout-item"
        prepend-icon="mdi-logout"
        title="Logout"
        value="logout"
        @click="handleLogout"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from "vue";
import { getAuth, signOut } from "firebase/auth";
import router from "@/router";
import { showSuccessAlert, showErrorAlert } from "../utils/notification";
import { useStore } from "vuex";

const drawer = ref(true);
const rail = ref(true);

const store = useStore();
const user = computed(() => store.getters.getUser);
const username = ref(user.value.displayName);
const avatar = ref(user.value.photoURL);

console.log(user.value.userName);

const auth = getAuth();
const handleLogout = async () => {
  try {
    await signOut(auth);
    showSuccessAlert("User signed out successfully");
    router.push("/login");
  } catch (error) {
    showErrorAlert("Error signing out");
    console.error("Error signing out:", error);
  }
};
</script>

<style scoped>
#logout-item {
  color: red; /* Thay đổi màu chữ và icon thành đỏ */
}
</style>
