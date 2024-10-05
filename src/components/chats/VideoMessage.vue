<template>
    <div :class="['message mb-3 d-flex', isCurrentUser ? 'justify-content-end' : 'justify-content-start']">
        <div :class="['video-container', isCurrentUser ? 'ml-auto' : 'mr-auto']">
            <video 
                :src="fileUrl" 
                :type="videoType" 
                class="rounded" 
                style="max-width: 300px; max-height: 200px; cursor: pointer;"
                @click="openFullVideo"
                controls
                preload="metadata"
            ></video>
            <small class="d-block text-muted mt-1">{{ fileName }} ({{ formattedSize }})</small>
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

const videoType = computed(() => {
    return props.fileType || 'video/mp4';
});

const formattedSize = computed(() => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (props.fileSize === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(props.fileSize) / Math.log(1024)));
    return Math.round(props.fileSize / Math.pow(1024, i), 2) + ' ' + sizes[i];
});

const openFullVideo = () => {
    window.open(props.fileUrl, '_blank');
};
</script>

<style scoped>
.video-container {
    max-width: 70%;
}
</style>