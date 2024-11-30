<template>
  <div class="container-fluid vh-100">
    <div class="row h-100">
      <!-- Danh sách chat -->
      <div class="col-md-4 border-end p-0 h-100 d-flex flex-column">
        <div class="p-3 bg-light border-bottom"></div>
        <div class="overflow-auto flex-grow-1">
          <div class="list-group list-group-flush">
            <ChatBubble
              v-for="user in mUsers"
              :key="user.uid"
              :user="user"
              :isSelected="user.uid === selectedUserId"
              @select="selectChat"
            />
          </div>
        </div>
      </div>

      <div class="row g-3 col-md-8 p-0 h-100">
        <!-- Mỗi màu là một cột -->
        <div
          v-for="color in colorList"
          :key="color"
          class="col-1 d-flex justify-content-center"
        >
          <ChatColor :color="color" @select="selectColor" />
        </div>
        <!-- Khu vực chat chính -->
        <ChatBox
          :selectedUserId="selectedUserId"
          :selectedColor="selectedColor"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import ChatBox from "@/components/chats/ChatBox.vue";
import ChatBubble from "@/components/chats/ChatBubble.vue";
import ChatColor from "@/components/chats/ChatColor.vue";
import { ref, onMounted } from "vue";
import { useStore } from "vuex";
import { getDatabase, get, ref as dbRef } from "firebase/database";
import { showErrorAlert } from "../utils/notification";

const db = getDatabase();
const storeVuex = useStore();
let mCurrentUser = ref(null);
let mUsers = ref([]);
let selectedUserId = ref(null);
let selectedColor = ref(null);
const colorList = ref([
  "bg-success text-white",
  "bg-danger text-white",
  "bg-dark text-white",
]);

onMounted(async () => {
  mCurrentUser.value = storeVuex.getters.getUser;
  await fetchChatBubbleList();
});

const selectChat = (userId) => {
  selectedUserId.value = userId;
};
const selectColor = (c) => {
  selectedColor.value = c;
};

const fetchChatBubbleList = async () => {
  try {
    const usersRef = dbRef(db, `users`);
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const users = [];
      snapshot.forEach((childSnapshot) => {
        if (childSnapshot.key !== mCurrentUser.value.uid)
          users.push(childSnapshot.val());
      });
      mUsers.value = users;
      console.log("users: ", users);
    }
  } catch (error) {
    showErrorAlert("Error: " + error);
  }
};
</script>

<style scoped>
.max-width-70 {
  max-width: 70%;
}
</style>
