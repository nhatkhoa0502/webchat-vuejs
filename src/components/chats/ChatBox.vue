<template>
    <div class="chatbox d-flex flex-column vh-100">
        <!-- header chatbox -->
        <div class="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <img src="../../assets/logo.png" class="rounded-circle me-2" width="40" height="40" alt="Avatar">
                <div class="d-flex flex-column mx-2">
                    <h5 class="mb-0">{{ mAnotherUser?.displayName }}</h5>
                    <small class="text-muted">Truy cập {{ mAnotherUser?.lastOnline }} giờ trước</small>
                </div>

            </div>
            <div>
                <button class="btn btn-outline-primary me-2 bounce-btn"><i class="bi bi-search"></i></button>
                <button class="btn btn-outline-primary me-2 bounce-btn"><i class="bi bi-telephone"></i></button>
                <button class="btn btn-outline-primary me-2 bounce-btn"><i class="bi bi-camera-video"></i></button>
                <button class="btn btn-outline-secondary bounce-btn"><i class="bi bi-info-circle"></i></button>
            </div>
        </div>
        <!-- content chatbox -->
        <div ref="messageListRef" class="message-list flex-grow-1 overflow-auto p-3">
            <component v-for="message in messages" :key="message.key" :is="getMessageComponent(message.type)"
                v-bind="message" :isCurrentUser="message.sender == mCurrentUser.uid"></component>

            <!-- <TextMessage :isCurrentUser="false" :avatarUrl="require('@/assets/logo.png')" content="hello cu" /> -->
            <!-- <TextMessage :isCurrentUser="true"  :avatarUrl="require('@/assets/logo.png')" content="lo cc"/> -->
        </div>

        <!-- footer chatbox (chat input) -->
        <div class="message-input bg-light">
            <div class="card">
                <div class="card-header">
                    <div class="feature-buttons">
                        <button @click="sendImage" class="btn btn-outline-primary btn-sm me-2 bounce-btn">
                            <i class="bi bi-image"></i>
                        </button>
                        <!-- <button @click="sendFile" class="btn btn-outline-primary btn-sm me-2 bounce-btn">
                            <i class="bi bi-paperclip"></i>
                        </button> -->

                        <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none"
                            accept="image/*,video/*,.pdf,.doc,.docx,.txt">
                        <button @click="triggerFileUpload" class="btn btn-outline-secondary btn-sm me-2">
                            <i class="bi bi-file-earmark"></i>
                        </button>
                        <button @click="sendAudio" class="btn btn-outline-primary btn-sm me-2 bounce-btn">
                            <i class="bi bi-mic"></i>
                        </button>
                        <button @click="sendEmoji" class="btn btn-outline-primary btn-sm bounce-btn">
                            <i class="bi bi-emoji-smile"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="input-group">
                        <input v-model="newMessage" @keyup.enter="sendMessage" type="text" class="form-control"
                            placeholder="Type a message..." />
                        <button @click="sendMessage" class="btn btn-primary bounce-btn">
                            <i class="bi bi-send"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import TextMessage from './TextMessage.vue'
import ImageMessage from './ImageMessage.vue'
import VideoMessage from './VideoMessage.vue'
import FileMessage from './FileMessage.vue'
// import SoundMessage from './SoundMessage.vue'
import { ref, computed, defineProps, onMounted, onUnmounted, watch } from "vue";
import { useStore } from "vuex";
import { getDatabase, push, get, child, ref as dbRef, set, onValue, serverTimestamp, query, orderByChild, limitToLast, onChildAdded, off } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import { nextTick } from 'vue';

const props = defineProps({
    selectedUserId: {
        type: String,
        // default: '08EWqzrSzwgSfZlSexzaclW8Yoa2'
        default: '4pH0Oi9TUvhRIZzy4pH7kq20pYG2'
    }
})
const storeVuex = useStore();
const db = getDatabase();
var mCurrentUser = ref(null);
var mAnotherUser = ref(null);
const messages = ref([]);
const newMessage = ref("");
var mChatMessageListener = null;
const fileInput = ref(null);
const messageListRef = ref(null);

onMounted(async () => {
    // Wait for the store to be initialized
    // await store.dispatch('initializeAuth');
    mCurrentUser.value = storeVuex.getters.getUser;

    if (mCurrentUser.value && props.selectedUserId) {
        mAnotherUser.value = await loadAnotherUser(props.selectedUserId);

        getChatMessages(mCurrentUser.value.uid, mAnotherUser.value?.uid);

    }
});

onUnmounted(() => {
    if (mChatMessageListener) {
        const chatId = [mCurrentUser.value?.uid, mAnotherUser.value?.uid].sort().join('_');
        const messagesRef = dbRef(db, `chatMessages/${chatId}`);
        off(messagesRef, 'child_added', mChatMessageListener);
        off()
    }
});

watch(() => props.selectedUserId, async (newUserId) => {
    if (newUserId && mCurrentUser.value) {
        mAnotherUser.value = await loadAnotherUser(props.selectedUserId);

        getChatMessages(mCurrentUser.value.uid, mAnotherUser.value?.uid);
    }
});

const triggerFileUpload = () => {
    fileInput.value.click();
};

const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const storage = getStorage();
    const fileRef = storageRef(storage, `chat_files/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    console.log("downloadurl: " + downloadURL)
    let messageData = {
        sender: mCurrentUser.value.uid,
        type: 'file',
        fileUrl: downloadURL,
        fileName: file.name,
        timestamp: serverTimestamp(),
    };

    if (file.type.startsWith('image/')) {
        messageData.type = 'image';
    } else if (file.type.startsWith('video/')) {
        messageData.type = 'video';
    }
    else {
        messageData.type = 'file';
        messageData.fileType = file.type;
        messageData.fileSize = file.size;


        sendMediaMessage(messageData);
    };
}

const sendMediaMessage = async (messageData) => {

    const chatId = [mCurrentUser.value.uid, mAnotherUser.value.uid].sort().join('_');
    const chatMessagesRef = dbRef(db, `chatMessages/${chatId}`);
    const newMessageRef = push(chatMessagesRef);

    if (!messageData) {
        console.error("messageData is null");
        return;
    }

    try {
        await set(newMessageRef, messageData);
    } catch (error) {
        console.error("Error sending media message:", error);
    }


};

function getMessageComponent(type) {
    const components = {
        text: TextMessage,
        image: ImageMessage,
        video: VideoMessage,
        file: FileMessage,
        // sound: SoundMessage,
    };
    return components[type] || TextMessage;
}

const loadAnotherUser = async (uid) => {
    const userRef = dbRef(db, 'users/' + uid)
    let anotherUser = null;

    try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            anotherUser = { uid: snapshot.key, ...snapshot.val() };
        } else {
            console.error("No user found with UID:", uid);
            anotherUser = null;
        }
    } catch (error) {
        console.error("Error loading user:", error);
        anotherUser = null;
    }

    return anotherUser
}

const getChatMessages = async (currentUserId, otherUserId, limit = 50) => {
    const chatId = [currentUserId, otherUserId].sort().join('_');
    const messagesRef = dbRef(db, `chatMessages/${chatId}`);
    const messagesQuery = query(messagesRef, limitToLast(limit));

    // Hủy bỏ listener cũ nếu có
    if (mChatMessageListener) {
        off(messagesRef, 'child_added', mChatMessageListener);
    }

    // Lấy dữ liệu ban đầu
    try {
        const snapshot = await get(messagesQuery);
        const initialMessages = [];
        snapshot.forEach((childSnapshot) => {
            initialMessages.push({
                key: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        messages.value = initialMessages;
        scrollToBottom();

        // Lắng nghe tin nhắn mới
        mChatMessageListener = onChildAdded(messagesRef, (childSnapshot) => {
            const newMessage = {
                key: childSnapshot.key,
                ...childSnapshot.val()
            };
            // Chỉ thêm tin nhắn mới nếu nó chưa có trong danh sách
            if (!messages.value.some(msg => msg.key === newMessage.key)) {
                messages.value.push(newMessage);

                if (newMessage.sender == mCurrentUser.value.uid) {
                    scrollToBottom();
                }

            }
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
};

const scrollToBottom = () => {
    nextTick(() => {
        if (messageListRef.value) {
            messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
        }
    });
};

const sendMessage = async () => {
    if (newMessage.value.trim() && mCurrentUser.value?.uid && mAnotherUser.value?.uid) {
        const chatId = [mCurrentUser.value.uid, mAnotherUser.value.uid].sort().join('_');
        const chatMessagesRef = dbRef(db, `chatMessages/${chatId}`);
        const newMessageRef = push(chatMessagesRef);

        const messageData = {
            type: "text",
            content: newMessage.value,
            timestamp: serverTimestamp(),
            sender: mCurrentUser.value.uid
        }

        try {
            await set(newMessageRef, messageData);

            newMessage.value = "";

        } catch (error) {
            console.error("Error sending message:", error);
        }
    }
}

function sendFile() {
    // Implement file sending logic
}

function sendImage() {
    // Implement image sending logic
}

function sendAudio() {
    // Implement audio sending logic
}
function sendEmoji() {
    // Implement emoji sending logic
}
</script>
