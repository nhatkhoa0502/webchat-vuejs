<template>
  <div v-if="loading" class="loading-overlay">
    <div class="spinner-border" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>
  <div class="container">
    <div class="text-center mt-5">
      <div class="position-relative d-inline-block">
        <img
          :src="profile.avatar"
          alt="Avatar"
          class="rounded-circle img-thumbnail"
          style="width: 150px; height: 150px; object-fit: cover"
        />
        <i
          v-if="isEditing"
          class="fas fa-pen position-absolute bottom-0 end-0 p-1 bg-light rounded-circle text-primary"
          @click="triggerFileInput"
        ></i>
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          style="display: none"
          @change="uploadAvatar"
        />
      </div>
      <h2 class="mt-3 text-primary">{{ profile.displayName }}</h2>
      <p class="text-muted">UID: {{ profile.uid }}</p>
    </div>

    <div class="mt-5">
      <div class="row">
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title text-primary">Email:</h5>
              <input
                type="email"
                v-model="profile.email"
                disabled="true"
                class="form-control"
              />
            </div>
          </div>
        </div>
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title text-primary">Display Name:</h5>
              <input
                type="email"
                v-model="profile.displayName"
                :disabled="!isEditing"
                class="form-control"
              />
            </div>
          </div>
        </div>
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title text-primary">Gender:</h5>
              <div class="mb-3 input-group">
                <div class="form-check me-3">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="gender"
                    id="genderMale"
                    value="male"
                    :disabled="!isEditing"
                    v-model="profile.gender"
                  />
                  <label class="form-check-label" for="genderMale">
                    <i class="fa-solid fa-mars"></i>
                    Male
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="gender"
                    id="genderFemale"
                    value="female"
                    :disabled="!isEditing"
                    v-model="profile.gender"
                  />
                  <label class="form-check-label" for="genderFemale">
                    <i class="fa-solid fa-venus"></i>
                    Female
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Ngày sinh -->
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title text-primary">Date Of Birth:</h5>
              <input
                type="date"
                v-model="profile.dob"
                :disabled="!isEditing"
                class="form-control"
              />
            </div>
          </div>
        </div>
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title text-primary">Phone Number:</h5>
              <input
                type="text"
                v-model="profile.phone"
                :disabled="!isEditing"
                class="form-control"
              />
            </div>
          </div>
        </div>
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title text-primary">Address:</h5>
              <input
                type="text"
                v-model="profile.address"
                :disabled="!isEditing"
                class="form-control"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mt-4">
      <button v-if="!isEditing" @click="enableEdit" class="btn btn-primary">
        Modify
      </button>
      <div v-else>
        <button @click="cancelEdit" class="btn btn-danger me-3">Cancel</button>
        <button @click="saveProfile" class="btn btn-success">Save</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, reactive } from "vue";
import { getDatabase, ref as dbRef, get, set, child } from "firebase/database";
import { useStore } from "vuex";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { showSuccessAlert, showErrorAlert } from "../utils/notification";

const isEditing = ref(false);
const profile = reactive({
  uid: "123456789",
  email: "khoa@example.com",
  displayName: "Nguyễn Nhật Khoa",
  avatar:
    "https://firebasestorage.googleapis.com/v0/b/webchat-24af1.appspot.com/o/avatar-user%2Fuser-profile-icon-free-vector.jpg?alt=media&token=d75dc0a3-8183-4d22-a4a8-07b9f4599487",
  gender: "male",
  phone: "0123456789",
  address: "123 Main St, City, Country",
  dob: "",
});
const store = useStore();
const user = computed(() => store.getters.getUser);
const fileInput = ref(null);
const db = getDatabase();
const loading = ref(false);

const getUserData = async (uid) => {
  try {
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

const enableEdit = () => {
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
};

const saveProfile = async () => {
  loading.value = true;
  console.log("Profile saved", profile);
  try {
    await set(dbRef(db, "users/" + user.value.uid), {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      avatar: profile.avatar,
      gender: profile.gender,
      phone: profile.phone,
      address: profile.address,
      dob: profile.dob,
    });
    console.log("User data updated successfully");
    isEditing.value = false;
    showSuccessAlert("User data updated successfully");
  } catch (error) {
    console.error("Error updating user data: ", error);
    showErrorAlert("Error updating user data: " + error);
  } finally {
    loading.value = false;
  }
};

// Hàm để kích hoạt input file
const triggerFileInput = () => {
  fileInput.value.click();
};

// Hàm xử lý việc chọn và upload hình ảnh lên Firebase
const uploadAvatar = async (event) => {
  loading.value = true;
  const file = event.target.files[0];
  if (!file) return;

  // Kiểm tra loại file
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    console.error("Invalid file type. Only JPEG, PNG, and GIF are allowed.");
    return;
  }

  // Kiểm tra kích thước file (ví dụ: không quá 5MB)
  if (file.size > 5 * 1024 * 1024) {
    console.error("File size exceeds 5MB");
    return;
  }

  const currentTime = new Date();
  const formattedTime = `
  ${currentTime.getFullYear()}-
  ${currentTime.getMonth() + 1}-
  ${currentTime.getDate()}_
  ${currentTime.getHours()}-
  ${currentTime.getMinutes()}-
  ${currentTime.getSeconds()}`.replace(/\s+/g, "");

  const storage = getStorage();
  const storageReference = storageRef(
    storage,
    `avatar-user/${profile.uid}/${formattedTime}.jpg`
  );

  try {
    // Tải file lên Firebase Storage
    const snapshot = await uploadBytes(storageReference, file);

    // Lấy URL của ảnh đã tải lên
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Cập nhật URL avatar trong profile
    profile.avatar = downloadURL;

    console.log("Image uploaded successfully:", downloadURL);
    showSuccessAlert(
      "Image uploaded successfully. Click save button to save changes."
    );
  } catch (error) {
    console.error("Error uploading image:", error);
  } finally {
    loading.value = false;
  }
};
console.log("user.value: ", user.value);
getUserData(user.value.uid)
  .then((userData) => {
    if (userData) {
      profile.uid = userData.uid;
      profile.email = userData.email;
      profile.displayName = userData.displayName;
      profile.avatar = userData.avatar;
      profile.gender = userData.gender;
      profile.phone = userData.phone;
      profile.address = userData.address;
      profile.dob = userData.dob;
    }
  })
  .catch((error) => {
    console.error("Error fetching user data:", error);
  });
</script>
<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1000;
}
</style>
