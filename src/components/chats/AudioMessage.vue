<template>
    <div :class="['file-message card shadow-sm mb-3', isCurrentUser ? 'ms-auto' : 'me-auto']">
        <div class="card-body p-2">
            <div class="flex-grow-1">
                <audio :src="fileUrl" class="w-100" controls></audio>
            </div>
            <small class="text-muted d-block text-end mt-1">{{ formattedTimestamp }}</small>
        </div>
    </div>
</template> 

<script setup>
import { computed } from 'vue';

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

const formattedTimestamp = computed(() => {
    return new Date(props.timestamp).toLocaleString();
});


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
</style>
