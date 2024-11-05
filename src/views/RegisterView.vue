<template>
  <form @submit.prevent="handleRegister">
    <div id="container_main" class="container p-3 mt-5" show>
      <div class="row d-flex justify-content-center">
        <div class="col-sm-5 shadow-lg rounded-5 p-3">
          <h1 class="text-center text-primary my-3 text-decoration-underline">
            Register
          </h1>

          <!-- input username -->
          <div class="mb-3 input-group">
            <h5 for="pwd" class="input-group form-label text-primary">
              Display Name
            </h5>
            <input
              type="text"
              class="form-control"
              placeholder="Enter Display Name"
              v-model="displayName"
            />
          </div>

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
          <div class="mb-3 input-group-lg">
            <h5 for="pwd" class="form-label text-primary">Confirm Password</h5>
            <div class="input-group">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-control"
                placeholder="Enter Password"
                v-model="confirmPassword"
              />
              <!-- Button nằm ở cuối ô input -->
              <div class="input-group-append">
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="togglePasswordVisibility('confirmPassword')"
                >
                  <i
                    :class="
                      showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'
                    "
                  ></i>
                </button>
              </div>
            </div>
          </div>
          <div class="mt-3 d-grid">
            <button
              @click="handleRegister"
              class="btn btn-lg btn-primary btn-block"
            >
              <div
                v-if="loading"
                class="spinner-border spinner-border-sm text-white me-2"
                role="status"
              >
                <span class="visually-hidden">Loading...</span>
              </div>
              <span v-if="!loading">Register</span>
            </button>
          </div>

          <!-- Thêm dòng chữ Login -->
          <div class="mt-5 text-center">
            <span
              >You have an account?
              <router-link to="/login">Login</router-link>
            </span>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { showSuccessAlert, showErrorAlert } from "../utils/notification";
import { getDatabase, ref as dbRef, set } from "firebase/database";

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const displayName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    showErrorAlert("Passwords do not match!!");
    return;
  }
  if (displayName.value === "") {
    showErrorAlert("Display Name require!!");
    return;
  }

  loading.value = true; // Hiển thị spinner

  try {
    // Tạo người dùng mới
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    const user = userCredential.user;

    showSuccessAlert("Register Successfully!");
    console.log("Register Successfully!", user);

    const db = getDatabase();
    set(dbRef(db, "users/" + user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName.value,
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/webchat-24af1.appspot.com/o/avatar-user%2Fuser-profile-icon-free-vector.jpg?alt=media&token=d75dc0a3-8183-4d22-a4a8-07b9f4599487",
      gender: "",
      phone: "",
      address: "",
    });
  } catch (error) {
    showErrorAlert("Register Fail!\n" + error.message);
  } finally {
    loading.value = false; // Ẩn spinner
  }
};

const togglePasswordVisibility = (show) => {
  show == "password"
    ? (showPassword.value = !showPassword.value)
    : (showConfirmPassword.value = !showConfirmPassword.value);
};
</script>

<style scoped>
/* Tùy chọn CSS để định dạng nút ẩn/hiện mật khẩu */
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
