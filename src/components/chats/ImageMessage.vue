<template>
    <div :class="['file-message card shadow-sm mb-3 ', isCurrentUser ? 'ms-auto' : 'me-auto']" class="cursor-pointer">
        <div class="image-container">
            <img :src="fileUrl" :alt="fileName" class="img-fluid rounded" @click="openFullImage">
        </div>
        <span class="badge bottom-0 end-0 m-2 text-bg-secondary">{{ formattedTime }}</span>
    </div>

</template>

<script setup>
import { ref, computed } from 'vue';

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

const currentUser = ref(null);

const openFullImage = () => {
    window.open(props.fileUrl, '_blank');
};

const formattedTime = computed(() => {
    return new Date(props.timestamp).toLocaleString();
});


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
