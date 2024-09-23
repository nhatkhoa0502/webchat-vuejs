<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    permanent
    @click="rail = false"
    app
  >
    <!-- header -->
    <v-list-item :prepend-avatar="avatar" :title="displayName" nav>
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
import { getDatabase, ref as dbRef, get, child } from "firebase/database";

const drawer = ref(true);
const rail = ref(true);

const displayName = ref("Display Name");
const avatar = ref("favicon.ico");

const getUserData = async (uid) => {
  try {
    const db = getDatabase();
    const dbReference = dbRef(db); // Tham chiếu tới gốc của database

    // Lấy dữ liệu từ đường dẫn 'users/' + uid
    const snapshot = await get(child(dbReference, `users/${uid}`));

    if (snapshot.exists()) {
      // Nếu dữ liệu tồn tại
      const userData = snapshot.val();
      console.log("User data:", userData);
      return userData;
    } else {
      console.log("No data available for this user.");
      return null;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

const store = useStore();
const user = computed(() => store.getters.getUser);

getUserData(user.value.uid)
  .then((userData) => {
    if (userData) {
      displayName.value = userData.displayName || "Display Name";
      avatar.value = userData.avatar || "favicon.ico";
    }
  })
  .catch((error) => {
    console.error("Error fetching user data:", error);
  });

const handleLogout = async () => {
  const auth = getAuth();
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
