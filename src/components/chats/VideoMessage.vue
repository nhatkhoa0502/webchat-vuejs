<template>
    <div :class="['message', sender === currentUser ? 'text-end' : 'text-start']">
        <video controls class="rounded" style="max-width: 200px;">
            <source :src="content" :type="videoType">
        </video>
        <small v-if="sender === currentUser && seen" class="d-block text-muted">Seen</small>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    key: String,

    sender: String,
    type: String,
    timestamp: String,
    fileUrl: String,
    fileType: String,
    fileSize: String,
    fileName: String,

    
    isCurrentUser: Boolean,
   
});


const currentUser = ref(null);

const videoType = computed(() => {
    const extension = props.content.split('.').pop().toLowerCase();
    switch (extension) {
        case 'mp4': return 'video/mp4';
        case 'webm': return 'video/webm';
        case 'ogg': return 'video/ogg';
        default: return 'video/mp4';
    }
});



</script>