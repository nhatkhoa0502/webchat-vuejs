<template>
  <div class="container-fluid vh-100">
    <div class="row h-100">
      <!-- Danh sách chat -->
      <div class="col-md-4 border-end p-0 h-100 d-flex flex-column">
        <div class="p-3 bg-light border-bottom">
          <input type="text" class="form-control" placeholder="Tìm kiếm" />
        </div>
        <div class="overflow-auto flex-grow-1">
          <div class="list-group list-group-flush">
            <ChatBubble
              v-for="chat in mChats"
              :key="chat.user.uid"
              :user="chat.user"
              :lastMessageKey="chat.lastMessageKey"
              :timestamp="chat.timestamp"
              :unreadCount="chat.unreadCount"
              :isSelected="chat.user.uid === selectedUserId"
              @select="selectChat"
            />
          </div>
        </div>
      </div>

      <!-- Khu vực chat chính -->

      <ChatBox :selectedUserId="selectedUserId" class="col-md-8 p-0 h-100" />
    </div>
  </div>
</template>

<script setup>
import ChatBox from "@/components/chats/ChatBox.vue";
import ChatBubble from "@/components/chats/ChatBubble.vue";
import { ref, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { getDatabase, get, ref as dbRef } from "firebase/database";

const db = getDatabase();
const storeVuex = useStore();
let mCurrentUser = ref(null);
let mChats = ref([]);
let selectedUserId = ref(null);

const selectChat = (userId) => {
  selectedUserId.value = userId;
};

onMounted(async () => {
  mCurrentUser.value = await getCurrentUser();
  await fetchChatBubbleList();
});

onUnmounted(() => {});

const getCurrentUser = async () => {
  return storeVuex.getters.getUser;
};

const fetchChatBubbleList = async () => {
  if (!mCurrentUser.value) {
    console.error("fetchChatBubbleList: mCurrentUser is null!");
    return;
  }

  const chatsRef = dbRef(db, `user_chats/${mCurrentUser.value?.uid}`);
  const snapshot = await get(chatsRef);
  if (snapshot.exists()) {
    const chats = [];
    for (const [userId, chatData] of Object.entries(snapshot.val())) {
      const userSnapshot = await get(dbRef(db, `users/${userId}`));
      if (userSnapshot.exists()) {
        chats.push({
          user: { uid: userId, ...userSnapshot.val() },
          ...chatData,
        });
      }
    }
    mChats.value = chats;
  } else {
    console.error(
      "fetchChatBubbleList: No data available when fetching chat bubble list"
    );
  }
};
</script>

<style scoped>
.max-width-70 {
  max-width: 70%;
}
</style>
