<template>
    <div :class="['message mb-3 d-flex', isCurrentUser ? 'justify-content-end' : 'justify-content-start']">
        <div :class="['image-container', isCurrentUser ? 'ml-auto' : 'mr-auto']">
            <img :src="fileUrl" :alt="fileName" class="img-fluid rounded" style="max-width: 150px;" @click="openFullImage">
            <!-- <small v-if="sender === currentUser && seen" class="d-block text-muted">Seen</small> -->
        </div>
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

const openFullImage = () => {
    window.open(props.fileUrl, '_blank');
};


</script>

<style scoped>
.image-container {
    max-width: 70%; /* Adjust this value as needed */
}
</style>