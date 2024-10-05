<template>
    <div :class="['message mb-3 d-flex', isCurrentUser ? 'justify-content-end' : 'justify-content-start']">
        <img v-show="isCurrentUser == false" :src="props.avatarUrl" class="rounded-circle me-2" width="30" height="30" alt="Avatar">
        <div :class="[' rounded p-2 max-width-70', props.isCurrentUser ? 'bg-primary text-white' : 'bg-secondary-subtle']">
            <p class="mb-0">{{ content }}</p>
            <small :class="[isCurrentUser ? 'text-white-50' : 'text-muted']">{{timestamp}}</small>
            
        </div>
        <!-- <small v-if="isCurrentUser && seen" class="d-block text-muted">Seen</small> -->
    </div>
</template>

<script setup>
import { onMounted, computed } from "vue"

const props = defineProps({
    key: String,
    sender: String,
    type: String,
    content: String,
    timestamp: String,
    avatarUrl: String,
    isCurrentUser: Boolean,
})

// const dateSent= computed(()=> new Date(props.timestamp).toTimeString())

onMounted(() => {

    console.log(props.avatarUrl)
})

</script>