<template>
    <div :class="['file-message  mb-3', isCurrentUser ? 'ms-auto' : 'me-auto']">
        <div class="ratio ratio-16x9 shadow-lg" data-bs-toggle="tooltip" :data-bs-title="fileName"
            data-bs-delay='{"show":"500", "hide":"200"}'>
            <video :src="fileUrl" :type="videoType" class="rounded-top" controls preload="metadata"></video>
        </div>
        <div
            :class="['p-2 d-flex align-items-center', isCurrentUser ? 'justify-content-end' : 'justify-content-start']">
            <span class="badge text-bg-secondary me-1">{{ formattedTime }}</span>
            <small v-if="isCurrentUser && isLastMessageFromCurrentUser" class="badge text-bg-secondary">{{isSeen ? 'Seen' : 'Already Sent'}}</small>
        </div>
    </div>
</template>

<script setup>
import { computed, defineProps, onMounted } from 'vue';

const props = defineProps({
    key: String,

    sender: String,
    type: String,
    fileUrl: String,
    fileType: String,
    fileSize: String,
    fileName: String,
    timestamp: String,

    isCurrentUser: Boolean,

    isLastMessageFromCurrentUser: Boolean,
});

const videoType = computed(() => {
    return props.fileType || 'video/mp4';
});

const formattedTime = computed(() => {
    return new Date(props.timestamp).toLocaleString();
});

onMounted(() => {
    setupTooltip();
})

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

.badge {
    opacity: 0.6;
}
</style>
