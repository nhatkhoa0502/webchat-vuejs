<template>
  <div class="chatbox d-flex flex-column vh-100">
    <!-- header chatbox -->
    <div
      class="p-3 bg-light border-bottom d-flex justify-content-between align-items-center"
    >
      <div class="d-flex align-items-center">
        <img
          :src="mAnotherUser?.avatar"
          class="rounded-circle me-2"
          width="40"
          height="40"
          alt="Avatar"
          style="object-fit: cover"
        />
        <div class="d-flex flex-column mx-2">
          <h5 class="mb-0">{{ mAnotherUser?.displayName }}</h5>
        </div>
      </div>
    </div>
    <!-- content chatbox -->
    <div
      ref="messageListRef"
      class="message-list flex-grow-1 overflow-auto p-3"
    >
      <component
        v-for="message in messages"
        :key="message.key"
        :is="getMessageComponent(message.type)"
        v-bind="message"
        :isCurrentUser="message.sender == mCurrentUser.uid"
        :avatar="mAnotherUser?.avatar"
      ></component>
    </div>

    <!-- footer chatbox (chat input) -->
    <div class="message-input bg-light">
      <div class="card">
        <div class="card-header">
          <div class="input-group">
            <input
              v-model="newMessage"
              @keyup.enter="sendMessage"
              type="text"
              class="form-control"
              placeholder="Type a message..."
            />
            <button @click="sendMessage" class="btn btn-primary bounce-btn">
              <i class="bi bi-send"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TextMessage from "./TextMessage.vue";

import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useStore } from "vuex";
import {
  getDatabase,
  push,
  get,
  ref as dbRef,
  set,
  onChildAdded,
} from "firebase/database";

const props = defineProps({
  selectedUserId: {
    type: String,
  },
});

const storeVuex = useStore();
const db = getDatabase();
let mCurrentUser = ref(null);
let mAnotherUser = ref(null);
const messages = ref([]);
const newMessage = ref("");
let mAddedChatMessageListener = null;
const messageListRef = ref(null);
const chatId = computed(() => {
  return [mCurrentUser.value?.uid, mAnotherUser.value?.uid].sort().join("_");
});
const chatMessagesRef = computed(() =>
  dbRef(db, `chat_messages/${chatId.value}`)
);

onMounted(async () => {
  mCurrentUser.value = await getCurrentUser();
  await loadAnotherUserAndChatMessages(props.selectedUserId);
});

onUnmounted(() => {
  if (mAddedChatMessageListener) {
    mAddedChatMessageListener();
  }
});

watch(
  () => props.selectedUserId,
  async (newUserId) => {
    loadAnotherUserAndChatMessages(newUserId);
  }
);

const getCurrentUser = async () => {
  return storeVuex.getters.getUser;
};

const loadAnotherUserAndChatMessages = async (selectedUserId) => {
  if (mCurrentUser.value && selectedUserId) {
    mAnotherUser.value = await loadAnotherUser(selectedUserId);
    getChatMessages();
  } else {
    console.error(
      "loadAnotherUserAndChatMessages: mCurrentUser or selectedUserId is null"
    );
  }
};

function getMessageComponent(type) {
  const components = {
    text: TextMessage,
  };
  return components[type] || TextMessage;
}

const loadAnotherUser = async (uid) => {
  const userRef = dbRef(db, "users/" + uid);
  let anotherUser = null;

  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      anotherUser = { uid: snapshot.key, ...snapshot.val() };
    } else {
      console.error("No user found with UID:", uid);
      anotherUser = null;
    }
  } catch (error) {
    console.error("Error loading user:", error);
    anotherUser = null;
  }

  return anotherUser;
};

const getChatMessages = async () => {
  if (!mCurrentUser.value || !mAnotherUser.value) {
    console.error("getChatMessages: mCurrentUser or mAnotherUser is null");
    return;
  }

  // Lấy dữ liệu tin nhắn ban đầu
  try {
    const snapshot = await get(chatMessagesRef.value);
    const initialMessages = [];
    snapshot.forEach((childSnapshot) => {
      initialMessages.push({
        key: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });

    messages.value = initialMessages;

    // Lắng nghe tin nhắn mới
    mAddedChatMessageListener = onChildAdded(
      chatMessagesRef.value,
      (childSnapshot) => {
        const newMessage = {
          key: childSnapshot.key,
          ...childSnapshot.val(),
        };
        // Chỉ thêm tin nhắn mới nếu nó chưa có trong danh sách
        if (!messages.value.some((msg) => msg.key === newMessage.key)) {
          messages.value.push(newMessage);
        }
      }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
};

const sendMessage = async () => {
  if (newMessage.value.trim() && mCurrentUser.value && mAnotherUser.value) {
    const newMessageRef = push(chatMessagesRef.value);

    const messageData = {
      type: "text",
      content: newMessage.value,
      timestamp: Date.now(),
      sender: mCurrentUser.value.uid,
    };

    try {
      await set(newMessageRef, messageData);

      newMessage.value = "";
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
};
</script>
