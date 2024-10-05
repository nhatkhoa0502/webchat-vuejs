<template>
    <div :class="['file-message card shadow-sm mb-3', isCurrentUser ? 'ms-auto' : 'me-auto']">
        <div class="card-body p-3">
            <div class="d-flex align-items-center">
                <div class="file-icon me-3">
                    <i class="bi" :class="[fileIconClass, 'display-4 text-primary']"></i>
                </div>
                <div class="file-info flex-grow-1">
                    <h6 class="mb-1 text-truncate fw-bold">{{ fileName }}</h6>
                    <p class="mb-0 text-muted small">{{ formattedSize }}</p>
                </div>
                <div class="file-actions ms-2">
                    <button @click="downloadFile" class="btn btn-outline-primary btn-sm">
                        <i class="bi bi-download me-1"></i>Download
                    </button>
                </div>
            </div>
            <div class="mt-2 d-flex justify-content-between align-items-center border-top pt-2">
                <small class="text-muted">{{ formattedTime }}</small>
                <!-- <span v-if="sender === currentUser && seen" class="text-muted small">Seen</span> -->
            </div>
        </div>
    </div>
</template>

<script setup>
import {computed, ref} from 'vue';

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

const fileIconClass = computed(() => {
    const iconMap = {
        'pdf': 'bi-file-earmark-pdf',
        'doc': 'bi-file-earmark-word',
        'xls': 'bi-file-earmark-excel',
        'jpg': 'bi-file-earmark-image',
        'png': 'bi-file-earmark-image',
        'mp3': 'bi-file-earmark-music',
        'mp4': 'bi-file-earmark-play',
    };
    const extension = props.fileName.split('.').pop().toLowerCase();
    return iconMap[extension] || 'bi-file-earmark';
});


const formattedSize = computed(() => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (props.fileSize === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(props.fileSize) / Math.log(1024)));
    return Math.round(props.fileSize / Math.pow(1024, i), 2) + ' ' + sizes[i];
});

const formattedTime = computed(() => {
    const date = new Date(props.timestamp);
    return date.toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true });
});

const downloadFile = () => {
    // Implement file download logic here
    window.open(props.fileUrl, '_blank');
};


</script>


<style scoped>
.file-message {
  max-width: 400px;
  width: 100%;
}

.file-icon i {
  font-size: 2rem;
}

.file-info h6 {
  max-width: 200px;
}
</style>