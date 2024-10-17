<template>
    <div :class="['message mb-3 d-flex flex-column', isCurrentUser ? 'align-items-end' : 'align-items-start']">
        <div class="d-flex">
            <img v-show="!isCurrentUser" :src="props.avatar" class="rounded-circle me-2" width="30" height="30"
                alt="Avatar">
            <div
                :class="['rounded p-2 max-width-70', props.isCurrentUser ? 'bg-primary text-white' : 'bg-secondary-subtle']">
                <p class="mb-0">{{ content }}</p>
                <small :class="[isCurrentUser ? 'text-white-50' : 'text-muted']">{{ formattedTime }}</small>
            </div>
        </div>
        <small v-if="isCurrentUser && isLastMessageFromCurrentUser" :class="['badge text-bg-secondary mt-1']">{{ isSeen ? 'Seen' : 'Already Sent' }}</small>
    </div>
</template>

<script setup>
import { onMounted, computed } from "vue"

const props = defineProps({
    key: String,
    sender: String,
    type: String,
    content: String,
    avatar: String,
    isSeen: Boolean,
    isCurrentUser: Boolean,
    timestamp: String,

    isLastMessageFromCurrentUser: Boolean,
})

const formattedTime = computed(() => {
    return new Date(props.timestamp).toLocaleString();
});


</script>

<style scoped>
.badge {
    opacity: 0.6;
}
</style>
