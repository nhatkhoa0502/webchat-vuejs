<template>
    <div :class="['file-message mb-3', isCurrentUser ? 'ms-auto' : 'me-auto']">
        <div class="image-container shadow-lg cursor-pointer" data-bs-toggle="tooltip" :data-bs-title="fileName"
            data-bs-delay='{"show":"500", "hide":"200"}'>
            <img :src="fileUrl" :alt="fileName" class="img-fluid rounded" @click="openFullImage">
        </div>
        <div
            :class="['p-2 d-flex align-items-center', isCurrentUser ? 'justify-content-end' : 'justify-content-start']">
            <span class="badge text-bg-secondary me-1">{{ formattedTime }}</span>
            <small v-if="isCurrentUser && isLastMessageFromCurrentUser" class="badge text-bg-secondary">{{isSeen ? 'Seen' : 'Already Sent'}}</small>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
    key: String,

    sender: String,
    type: String,
    fileUrl: String,
    fileType: String,
    fileSize: String,
    fileName: String,
    timestamp: String,
    isSeen: Boolean,

    isCurrentUser: Boolean,

    isLastMessageFromCurrentUser: Boolean,

});

const currentUser = ref(null);

const openFullImage = () => {
    window.open(props.fileUrl, '_blank');
};

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

.image-container {

    width: 100%;
    height: 200px;
    overflow: hidden;
}

.image-container img {
    width: 100%;
    height: 100%;
    /* object-fit: contain; */
}

.badge {
    opacity: 0.6;
}
</style>
