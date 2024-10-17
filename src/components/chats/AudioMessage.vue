<template>
    <div :class="['file-message mb-3', isCurrentUser ? 'ms-auto' : 'me-auto']">

        <img v-show="!isCurrentUser" :src="props.avatar" class="rounded-circle me-2" width="30" height="30"
            alt="Avatar">
        <div class="flex-grow-1 shadow-lg" data-bs-toggle="tooltip" :data-bs-title="fileName"
            data-bs-delay='{"show":"500", "hide":"200"}'>
            <audio :src="fileUrl" class="w-100" controls></audio>
        </div>

        <div
            :class="['p-2 d-flex align-items-center', isCurrentUser ? 'justify-content-end' : 'justify-content-start']">
            <span class="badge text-bg-secondary me-1">{{ formattedTime }}</span>
            <small v-if="isCurrentUser && isLastMessageFromCurrentUser" class="badge text-bg-secondary">{{ isSeen ?
                'Seen' : 'Already Sent'}}</small>
        </div>
    </div>

</template>

<script setup>
import { computed, onMounted } from 'vue';

const props = defineProps({
    key: String,

    sender: String,
    type: String,
    fileUrl: String,
    fileType: String,
    fileSize: String,
    fileName: String,
    isSeen: Boolean,
    timestamp: String,
    avatar: String,
    isCurrentUser: Boolean,

    isLastMessageFromCurrentUser: Boolean,

});

const formattedTime = computed(() => {
    return new Date(props.timestamp).toLocaleString();
});

onMounted(() => {
    setupTooltip();
});

const setupTooltip = () => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

</script>

<style scoped>
.file-message {
    max-width: 350px;
    width: 100%;
}

audio::-webkit-media-controls-panel {
    background-color: #f8f9fa;
}

audio::-webkit-media-controls-play-button {
    background-color: #007bff;
    border-radius: 50%;
}

.text-truncate {
    max-width: 200px;
}

.badge {
    opacity: 0.6;
}
</style>
