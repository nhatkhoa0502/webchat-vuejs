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
    </div>
    <div class="chat-info flex-grow-1">
      <h6 class="mb-0">{{ user?.displayName }}</h6>
      <p
        class="mb-0 small text-black-50 text-muted text-truncate"
        style="max-width: 180px"
      ></p>
    </div>
    <div class="chat-meta text-end"></div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  user: Object,
  isSelected: Boolean,
});

// Emits
const emit = defineEmits(["select"]);

// Methods
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
