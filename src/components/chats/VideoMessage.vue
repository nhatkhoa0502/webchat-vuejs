<template>
    <div :class="['file-message card shadow-sm mb-3', isCurrentUser ? 'ms-auto' : 'me-auto']" class="">
        <div class="ratio ratio-16x9">
            <video :src="fileUrl" :type="videoType" class="rounded-top" controls preload="metadata"></video>
        </div>
        <span class="badge bottom-0 end-0 m-2 text-bg-secondary">{{ formattedTime }}</span>
    </div>
</template>

<script setup>
import { computed, defineProps } from 'vue';

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
});

const videoType = computed(() => {
    return props.fileType || 'video/mp4';
});

const formattedTime = computed(() => {
    return new Date(props.timestamp).toLocaleString();
});


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
