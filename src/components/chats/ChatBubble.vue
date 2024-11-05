<template>
  <div
    @click="selectChat"
    class="chat-bubble d-flex align-items-center p-2 border-bottom"
    :class="{ active: isSelected }"
  >
    <div class="avatar me-3">
      <img
        :src="user?.avatar"
        class="rounded-circle"
        width="50"
        height="50"
        :alt="user?.displayName"
      />
      <span v-if="user?.isOnline" class="online-indicator"></span>
    </div>
    <div class="chat-info flex-grow-1">
      <h6 class="mb-0">{{ user?.displayName }}</h6>
      <p
        class="mb-0 small text-black-50 text-muted text-truncate"
        style="max-width: 180px"
      >
        {{ formattedText }}
      </p>
    </div>
    <div class="chat-meta text-end">
      <small class="text-muted">{{ formattedTime }}</small>
      <span
        v-if="mUserChatData?.unreadCount > 0"
        class="badge bg-primary rounded-pill ms-2"
        >{{ mUserChatData?.unreadCount }}</span
      >
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import {
  getDatabase,
  get,
  child,
  ref as dbRef,
  onValue,
} from "firebase/database";

// Props
const props = defineProps({
  user: Object,
  isSelected: Boolean,
});
// Emits
const emit = defineEmits(["select"]);

// Vuex
const storeVuex = useStore();

// Properties
const db = getDatabase();
let mUserChatData = ref({});
let mMessageData = ref({});
const mCurrentUser = ref(null);

onMounted(() => {
  mCurrentUser.value = storeVuex.getters.getUser;
  const chatRef = dbRef(
    db,
    `user_chats/${mCurrentUser.value?.uid}/${props.user?.uid}`
  );
  onValue(chatRef, async (snapshot) => {
    if (snapshot.exists()) {
      mUserChatData.value = snapshot.val();
    } else {
      console.error("ChatBubble.vue: No user chat data available");
      return;
    }

    const chatId = [mCurrentUser.value?.uid, props.user?.uid].sort().join("_");
    const messageDataSnapshot = await get(
      child(
        dbRef(db),
        `chat_messages/${chatId}/${mUserChatData.value?.lastMessageKey}`
      )
    );

    if (messageDataSnapshot.exists()) {
      mMessageData.value = messageDataSnapshot.val();
    } else {
      console.error("ChatBubble.vue: No message data available");
      return;
    }
  });
});

const formattedText = computed(() => {
  switch (mMessageData.value?.type) {
    case "image":
      return "Sent a photo";
    case "video":
      return "Sent a video";
    case "file":
      return "Sent a file";
    case "audio":
      return "Sent an audio";
    default:
      return mMessageData.value?.content || "";
  }
});

const formattedTime = computed(() => {
  if (!mUserChatData.value?.timestamp) return "";
  const date = new Date(mUserChatData.value?.timestamp);
  const minusDate = (Date.now() - date.getTime()) / 1000;
  if (minusDate < 60) {
    return "Just now";
  } else if (minusDate < 3600) {
    return `${Math.floor(minusDate / 60)} minutes ago`;
  } else if (minusDate < 86400) {
    return `${Math.floor(minusDate / 3600)} hours ago`;
  } else {
    return date.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
  }
});

const selectChat = () => {
  emit("select", props.user.uid);
};
</script>

<style scoped>
.chat-bubble {
  cursor: pointer;
  transition: background-color 0.3s;
}

.chat-bubble:hover,
.chat-bubble.active {
  background-color: #c3d5e7;
}

.avatar {
  position: relative;
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: #28a745;
  border-radius: 50%;
  border: 2px solid white;
}
</style>
