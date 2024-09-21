<template>
  <div id="container_main" class="container p-3 mt-5" show>
    <div class="row d-flex justify-content-center">
      <div class="col-sm-5 shadow-lg rounded-5 p-3">
        <!-- title -->
        <h1 class="text-center text-primary my-3 text-decoration-underline">
          Forgot Password
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

        <!-- btn login email/password -->
        <div class="mt-5 d-grid">
          <button
            @click="resetPassword"
            class="btn btn-lg btn-outline-primary btn-block"
          >
            <v-progress-circular
              v-if="loading"
              indeterminate
              color="dark"
            ></v-progress-circular>
            Submit
          </button>
        </div>

        <!-- Sang trang Login -->
        <div class="mt-5 text-center">
          <span
            >Remember your password?
            <router-link to="/login">Login</router-link>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { showInfoAlert } from "../utils/notification";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { showSuccessAlert, showErrorAlert } from "../utils/notification";
import router from "@/router";

const email = ref("");
const loading = ref(false);

const isTroll = true;

const resetPassword = async () => {
  loading.value = true;
  if (isTroll) {
    showInfoAlert("Relax and try to remember your password!");
  } else {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email.value);
      showSuccessAlert(
        "If the email address exists in the system, you will receive a password reset email."
      );
      router.push("/login");
    } catch (err) {
      console.log("reset password fail: ", err);
      showErrorAlert("Email address is missing.");
    }
  }
  loading.value = false; // Ẩn spinner
};
</script>
<style scoped></style>
