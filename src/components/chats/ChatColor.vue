<template>
  <button
    @click="selectColor"
    :class="$props.color"
    :style="{ backgroundColor: $props.color, width: '100%', height: '20px' }"
  ></button>
</template>

<script setup>
// Props
const props = defineProps({
  color: String,
});

// Emits
const emit = defineEmits(["select"]);

// Methods
const selectColor = () => {
  emit("select", props.color);
};
</script>
