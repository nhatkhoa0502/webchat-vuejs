<template>
    <div :class="['file-message mb-3 ', isCurrentUser ? 'ms-auto' : 'me-auto']">

        <img v-show="!isCurrentUser" :src="props.avatar" class="rounded-circle me-2" width="30" height="30"
            alt="Avatar">
        <div class="d-flex align-items-center shadow-lg p-3" data-bs-toggle="tooltip" :data-bs-title="fileName"
            data-bs-delay='{"show":"500", "hide":"200"}'>
            <div class="file-icon me-3">
                <i class="bi" :class="[fileIconClass, 'display-4 text-primary']"></i>
            </div>
            <div class="file-info flex-grow-1">
                <h6 class="mb-1 fw-bold text-truncate">{{ fileName }}</h6>
                <p class="mb-0 text-muted small">{{ formattedSize }}</p>
            </div>
            <div class="file-actions ms-2">
                <button @click="downloadFile" class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-download "></i>
                </button>
            </div>
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
import { computed, ref, onMounted } from 'vue';

const props = defineProps({
    key: String,

    sender: String,
    type: String,
    timestamp: String,
    fileUrl: String,
    fileType: String,
    fileSize: String,
    fileName: String,
    isSeen: Boolean,

    avatar: String,
    isCurrentUser: Boolean,

    isLastMessageFromCurrentUser: Boolean,
});

const fileIconClass = computed(() => {
    const iconMap = {
        'pdf': 'bi-file-earmark-pdf ',
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
    return new Date(props.timestamp).toLocaleString();
});

const downloadFile = () => {
    window.open(props.fileUrl, '_blank');
};

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

.file-icon i {
    font-size: 2rem;
}

.file-info h6 {
    max-width: 200px;
}

.badge {
    opacity: 0.6;
}
</style>
