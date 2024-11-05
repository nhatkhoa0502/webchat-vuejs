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
        />
        <div class="d-flex flex-column mx-2">
          <h5 class="mb-0">{{ mAnotherUser?.displayName }}</h5>
          <small class="text-muted"
            >{{ mAnotherUser?.isOnline ? "Online" : formattedLastOnline }}
          </small>
        </div>
      </div>
      <div>
        <button class="btn btn-outline-primary me-2 bounce-btn">
          <i class="bi bi-search"></i>
        </button>
        <button class="btn btn-outline-primary me-2 bounce-btn">
          <i class="bi bi-telephone"></i>
        </button>
        <button class="btn btn-outline-secondary bounce-btn">
          <i class="bi bi-info-circle"></i>
        </button>
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
        :isLastMessageFromCurrentUser="
          message.key === lastMessageFromCurrentUser?.key
        "
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

import { ref, computed, defineProps, onMounted, onUnmounted, watch } from "vue";
import { useStore } from "vuex";
import {
  getDatabase,
  push,
  get,
  ref as dbRef,
  set,
  query,
  limitToLast,
  onChildAdded,
  onChildChanged,
  update,
  increment,
} from "firebase/database";

import { nextTick } from "vue";

const props = defineProps({
  selectedUserId: {
    type: String,
    // default: '08EWqzrSzwgSfZlSexzaclW8Yoa2'
    default: "4pH0Oi9TUvhRIZzy4pH7kq20pYG2",
  },
});
const storeVuex = useStore();
const db = getDatabase();
let mCurrentUser = ref(null);
let mAnotherUser = ref(null);
const messages = ref([]);
const newMessage = ref("");
let mAddedChatMessageListener = null;
let mChangedChatMessageListener = null;
const messageListRef = ref(null);
const chatId = computed(() => {
  return [mCurrentUser.value?.uid, mAnotherUser.value?.uid].sort().join("_");
});
const chatMessagesRef = computed(() =>
  dbRef(db, `chat_messages/${chatId.value}`)
);
const lastMessageFromCurrentUser = computed(() => {
  const reversedMessages = [...messages.value].reverse();
  return reversedMessages.find((msg) => msg.sender === mCurrentUser.value?.uid);
});

const formattedLastOnline = computed(() => {
  if (!mAnotherUser.value?.lastOnline) return "";
  const date = new Date(mAnotherUser.value?.lastOnline);
  const minusDate = (Date.now() - date.getTime()) / 1000;
  if (minusDate < 60) {
    return "Online";
  } else if (minusDate < 3600) {
    return `Online ${Math.floor(minusDate / 60)} minutes ago`;
  } else if (minusDate < 86400) {
    return `Online ${Math.floor(minusDate / 3600)} hours ago`;
  } else {
    return `Online ${date.toLocaleString([], {
      dateStyle: "short",
      timeStyle: "short",
    })}`;
  }
});

let mediaRecorder = null;

onMounted(async () => {
  // Wait for the store to be initialized
  // await store.dispatch('initializeAuth');
  mCurrentUser.value = await getCurrentUser();
  await loadAnotherUserAndChatMessages(props.selectedUserId);
});

onUnmounted(() => {
  if (mAddedChatMessageListener) {
    mAddedChatMessageListener();
  }

  if (mChangedChatMessageListener) {
    mChangedChatMessageListener();
  }

  if (mediaRecorder) {
    mediaRecorder.stream.getTracks().forEach((track) => track.stop());
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

const getChatMessages = async (limit = 50) => {
  if (!mCurrentUser.value || !mAnotherUser.value) {
    console.error("getChatMessages: mCurrentUser or mAnotherUser is null");
    return;
  }

  const messagesQuery = query(chatMessagesRef.value, limitToLast(limit));

  // Lấy dữ liệu ban đầu
  try {
    const snapshot = await get(messagesQuery);
    const initialMessages = [];
    snapshot.forEach((childSnapshot) => {
      initialMessages.push({
        key: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });

    messages.value = initialMessages;
    markAllMessagesAsSeen();
    scrollToBottom();

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

          if (newMessage.sender == mCurrentUser.value.uid) {
            scrollToBottom();
          }

          if (newMessage.sender == mAnotherUser.value.uid) {
            markMessageAsSeen(newMessage.key);
          }
        }
      }
    );

    mChangedChatMessageListener = onChildChanged(
      chatMessagesRef.value,
      (childSnapshot) => {
        const changedMessage = {
          key: childSnapshot.key,
          ...childSnapshot.val(),
        };
        console.log("changedMessage in child change: " + changedMessage);
        const index = messages.value.findIndex(
          (msg) => msg.key === changedMessage.key
        );
        if (index !== -1) {
          messages.value[index] = changedMessage;
        }
      }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
};

const markMessageAsSeen = async (messageKey) => {
  const messageRef = dbRef(db, `chat_messages/${chatId.value}/${messageKey}`);
  await update(messageRef, { isSeen: true });
  await update(
    dbRef(db, `user_chats/${mCurrentUser.value.uid}/${mAnotherUser.value.uid}`),
    { unreadCount: increment(-1) }
  );
};

const markAllMessagesAsSeen = async () => {
  if (!mCurrentUser.value || !mAnotherUser.value) {
    console.error("markMessageAsSeen: mCurrentUser or mAnotherUser is null");
    return;
  }

  const unseenMessages = messages.value.filter(
    (msg) => msg.sender === mAnotherUser.value.uid && !msg.isSeen
  );

  for (const msg of unseenMessages) {
    const messageRef = dbRef(db, `chat_messages/${chatId.value}/${msg.key}`);
    await update(messageRef, { isSeen: true });
  }
  await update(
    dbRef(db, `user_chats/${mCurrentUser.value.uid}/${mAnotherUser.value.uid}`),
    { unreadCount: increment(-unseenMessages.length) }
  );
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  });
};

const sendMessage = async () => {
  if (newMessage.value.trim() && mCurrentUser.value && mAnotherUser.value) {
    const newMessageRef = push(chatMessagesRef.value);

    const messageData = {
      type: "text",
      content: newMessage.value,
      timestamp: Date.now(),
      sender: mCurrentUser.value.uid,
      isSeen: false,
    };

    try {
      await set(newMessageRef, messageData);

      newMessage.value = "";

      // Update last message in userChats for both users
      const updateData = {
        timestamp: messageData.timestamp,
        lastMessageKey: newMessageRef.key,
      };

      await updateUserChatsData(updateData);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
};

const updateUserChatsData = async (updateData) => {
  await update(
    dbRef(db, `user_chats/${mCurrentUser.value.uid}/${mAnotherUser.value.uid}`),
    updateData
  );

  await update(
    dbRef(db, `user_chats/${mAnotherUser.value.uid}/${mCurrentUser.value.uid}`),
    { ...updateData, unreadCount: increment(1) }
  );
};
</script>
