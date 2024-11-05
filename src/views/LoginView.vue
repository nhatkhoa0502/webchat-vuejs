<template>
  <div id="container_main" class="container p-3 mt-5" show>
    <div class="row d-flex justify-content-center">
      <div class="col-sm-5 shadow-lg rounded-5 p-3">
        <!-- title login -->
        <h1 class="text-center text-primary my-3 text-decoration-underline">
          Login
        </h1>

        <!-- input email -->
        <div class="mb-3 input-group">
          <h5 for="pwd" class="input-group form-label text-primary">Email</h5>
          <input
            type="text"
            class="form-control"
            placeholder="Enter Email"
            v-model="email"
          />
        </div>

        <!-- input password -->
        <div class="mb-3 input-group-lg">
          <h5 for="pwd" class="form-label text-primary">Password</h5>
          <div class="input-group">
            <input
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              placeholder="Enter Password"
              v-model="password"
            />
            <!-- Button show password -->
            <div class="input-group-append">
              <button
                class="btn btn-outline-secondary"
                type="button"
                @click="togglePasswordVisibility('password')"
              >
                <i
                  :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                ></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Forgot Password link -->
        <div class="text-end mt-2">
          <router-link to="/forgot-password">Forgot Password?</router-link>
        </div>

        <!-- btn login email/password -->
        <div class="mt-3 d-grid">
          <button @click="handleLogin" class="btn btn-lg btn-primary btn-block">
            <v-progress-circular
              v-if="loading"
              indeterminate
              color="white"
            ></v-progress-circular>
            Login
          </button>
        </div>

        <!-- Đường kẻ ngăn cách -->
        <!-- <div class="divider-container">
          <span>OR</span>
        </div> -->

        <!-- btn login with google -->
        <!-- <div class="mt-3 d-grid">
          <button
            class="btn btn-lg btn-outline-primary btn-block"
            @click="handleLoginGoogle"
          >
            <v-progress-circular
              v-if="loadingLoginGoogle"
              indeterminate
              color="dark"
            ></v-progress-circular>
            <i class="fab fa-google"></i> Login With Google
          </button>
        </div> -->

        <!-- Thêm dòng chữ Register -->
        <div class="mt-5 text-center">
          <span
            >Don't have an account?
            <router-link to="/register">Register</router-link>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { showSuccessAlert, showErrorAlert } from "../utils/notification";

const email = ref("");
const password = ref("");
const loading = ref(false);
const showPassword = ref(false);

// login email/password
const handleLogin = async () => {
  loading.value = true; // Hiển thị spinner
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    const user = userCredential.user;
    showSuccessAlert("Login Successful!");
    console.log("user", user);
  } catch (error) {
    showErrorAlert("Login Failed!\n" + error.message);
  } finally {
    loading.value = false; // Ẩn spinner
  }
};

// show, hide password
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>
<style scoped>
.divider-container {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
}
.divider-container::before,
.divider-container::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #000000; /* Màu sắc và độ dày của đường kẻ */
  margin: 0 1rem;
}
.divider-container span {
  white-space: nowrap;
  color: #6c757d; /* Màu chữ 'OR' */
}
</style>
