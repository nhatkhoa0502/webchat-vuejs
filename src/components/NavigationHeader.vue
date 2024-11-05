<template>
  <div class="container-fluid mt-3">
    <!-- Navbar brand with avatar and display name -->
    <div class="navbar-brand d-flex align-items-center mb-3">
      <img
        :src="avatar"
        alt="avatar"
        style="width: 40px; height: 40px"
        class="rounded-circle"
      />
      <span class="ms-3 fw-bold">{{ displayName }}</span>
    </div>

    <!-- Navigation Links -->
    <ul class="navbar-nav">
      <li class="nav-item mb-2">
        <router-link
          to="/chats"
          :class="[
            'nav-link text-center',
            { active: $route.path === '/chats' },
          ]"
        >
          <i class="mdi mdi-message-text me-2"></i> Chat
        </router-link>
      </li>
      <li class="nav-item mb-2">
        <router-link
          to="/friends"
          :class="[
            'nav-link text-center',
            { active: $route.path === '/friends' },
          ]"
        >
          <i class="mdi mdi-account-multiple-check-outline me-2"></i> Friend
        </router-link>
      </li>
      <li class="nav-item mb-2">
        <router-link
          to="/users"
          :class="[
            'nav-link text-center',
            { active: $route.path === '/users' },
          ]"
        >
          <i class="mdi mdi-account-group-outline me-2"></i> User
        </router-link>
      </li>
      <li class="nav-item mb-2">
        <router-link
          to="/profile"
          :class="[
            'nav-link text-center',
            { active: $route.path === '/profile' },
          ]"
        >
          <i class="mdi mdi-account me-2"></i> Profile
        </router-link>
      </li>
      <li class="nav-item mb-2">
        <button
          @click="handleLogout"
          class="btn btn-danger w-100 fw-bold text-white logout-button"
        >
          <i class="mdi mdi-logout me-2"></i> Logout
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { getAuth, signOut } from "firebase/auth";
import router from "@/router";
import { showSuccessAlert, showErrorAlert } from "../utils/notification";
import { useStore } from "vuex";
import { getDatabase, ref as dbRef, get, child } from "firebase/database";

const displayName = ref("Display Name");
const avatar = ref("favicon.ico");
const store = useStore();
const user = computed(() => store.getters.getUser);

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
</script>

<style scoped>
.nav-link.active {
  font-weight: bold; /* Tô đậm liên kết đang chọn */
  color: #007bff; /* Thay đổi màu sắc nếu cần */
}
</style>
