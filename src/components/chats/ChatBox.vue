<template>
    <div class="chatbox d-flex flex-column vh-100">
        <!-- header chatbox -->
        <div class="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <img :src="mAnotherUser?.avatar" class="rounded-circle me-2" width="40" height="40" alt="Avatar">
                <div class="d-flex flex-column mx-2">
                    <h5 class="mb-0">{{ mAnotherUser?.displayName }}</h5>
                    <small class="text-muted">Last Online: {{ mAnotherUser?.lastOnline }} </small>
                </div>

            </div>
            <div>
                <button class="btn btn-outline-primary me-2 bounce-btn"><i class="bi bi-search"></i></button>
                <button class="btn btn-outline-primary me-2 bounce-btn"><i class="bi bi-telephone"></i></button>
                <button class="btn btn-outline-secondary bounce-btn"><i class="bi bi-info-circle"></i></button>
            </div>
        </div>
        <!-- content chatbox -->
        <div ref="messageListRef" class="message-list flex-grow-1 overflow-auto p-3">
            <component v-for="message in messages" :key="message.key" :is="getMessageComponent(message.type)"
                v-bind="message" :isCurrentUser="message.sender == mCurrentUser.uid"
                :isLastMessageFromCurrentUser="message.key === lastMessageFromCurrentUser.key" ></component>
        </div>

        <!-- footer chatbox (chat input) -->
        <div class="message-input bg-light">
            <div class="card">
                <div class="card-header">
                    <div class="feature-buttons d-flex align-items-center">
                        <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none"
                            accept="image/*,video/*,.pdf,.doc,.docx,.txt">
                        <button @click="triggerFileUpload" class="btn btn-outline-primary btn-sm me-2">
                            <i class="bi bi-paperclip"></i>
                        </button>
                        <button @click="isRecording ? stopRecording() : startRecording()"
                            class="btn btn-outline-primary btn-sm me-2 bounce-btn">
                            <i class="bi" :class="isRecording ? 'bi-stop-circle' : 'bi-mic'"></i>
                        </button>
                        <!-- Recording indicator -->
                        <div v-if="isRecording" class="recording-indicator d-flex align-items-center ms-2">
                            <span class="badge bg-danger me-2">Recording</span>
                            <div class="spinner-grow spinner-grow-sm text-danger" role="status">
                                <span class="visually-hidden">Recording...</span>
                            </div>
                        </div>
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
import AudioMessage from './AudioMessage.vue'
// import SoundMessage from './SoundMessage.vue'
import { ref, computed, defineProps, onMounted, onUnmounted, watch } from "vue";
import { useStore } from "vuex";
import { getDatabase, push, get, child, ref as dbRef, set, onValue, serverTimestamp, query, orderByChild, limitToLast, onChildAdded,onChildChanged, off, update, increment } from "firebase/database";
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
let mCurrentUser = ref(null);
let mAnotherUser = ref(null);
const messages = ref([]);
const newMessage = ref("");
let mAddedChatMessageListener = null;
let mChangedChatMessageListener = null;
const fileInput = ref(null);
const messageListRef = ref(null);
const chatId = computed(() => {
    return [mCurrentUser.value?.uid, mAnotherUser.value?.uid].sort().join('_');
});
const chatMessagesRef = computed(() => dbRef(db, `chat_messages/${chatId.value}`));
const lastMessageFromCurrentUser = computed(() => {
  const reversedMessages = [...messages.value].reverse();
  return reversedMessages.find(msg => msg.sender === mCurrentUser.value?.uid);
});
// audio recording properties
const isRecording = ref(false);
const audioURL = ref('');
let mediaRecorder = null;
let audioChunks = [];

onMounted(async () => {
    // Wait for the store to be initialized
    // await store.dispatch('initializeAuth');
    mCurrentUser.value = await getCurrentUser();
    await loadAnotherUserAndChatMessages(props.selectedUserId);
});

onUnmounted(() => {
    if (mAddedChatMessageListener ) {
        mAddedChatMessageListener();
    }

    if (mChangedChatMessageListener ) {
        mChangedChatMessageListener();
    }

    if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
});

watch(() => props.selectedUserId, async (newUserId) => {
    loadAnotherUserAndChatMessages(newUserId);
});

const getCurrentUser = async () => {
    return storeVuex.getters.getUser;
}

const loadAnotherUserAndChatMessages = async (selectedUserId) => {
    if (mCurrentUser.value && selectedUserId) {
        mAnotherUser.value = await loadAnotherUser(selectedUserId);
        getChatMessages();
    }
    else {
        console.error("loadAnotherUserAndChatMessages: mCurrentUser or selectedUserId is null");
    }
}

function getMessageComponent(type) {
    const components = {
        text: TextMessage,
        image: ImageMessage,
        video: VideoMessage,
        file: FileMessage,
        audio: AudioMessage,
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

const getChatMessages = async (limit = 50) => {
    if (!mCurrentUser.value || !mAnotherUser.value) {
        console.error("getChatMessages: mCurrentUser or mAnotherUser is null");
        return;
    }

    const messagesQuery = query(chatMessagesRef.value, limitToLast(limit));

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
        markAllMessagesAsSeen();
        scrollToBottom();

        // Lắng nghe tin nhắn mới
        mAddedChatMessageListener = onChildAdded(chatMessagesRef.value, (childSnapshot) => {
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

                if (newMessage.sender == mAnotherUser.value.uid) {
                    markMessageAsSeen(newMessage.key);
                }

            }
        });

        mChangedChatMessageListener = onChildChanged(chatMessagesRef.value, (childSnapshot) => {
            const changedMessage = {
                key: childSnapshot.key,
                ...childSnapshot.val()
            };
            console.log("changedMessage in child change: " + changedMessage);
            const index = messages.value.findIndex(msg => msg.key === changedMessage.key);
            if (index !== -1) {
                messages.value[index] = changedMessage;
            }
        });

    } catch (error) {
        console.error("Error fetching messages:", error);
    }
};

const markMessageAsSeen = async (messageKey) => {
    const messageRef = dbRef(db, `chat_messages/${chatId.value}/${messageKey}`);
    await update(messageRef, { isSeen: true });
    await update(dbRef(db,
        `user_chats/${mCurrentUser.value.uid}/${mAnotherUser.value.uid}`),
        { unreadCount: increment(-1) });
}

const markAllMessagesAsSeen = async () => {
    if (!mCurrentUser.value || !mAnotherUser.value) {
        console.error("markMessageAsSeen: mCurrentUser or mAnotherUser is null");
        return;
    }

    const unseenMessages = messages.value.filter(msg => msg.sender === mAnotherUser.value.uid && !msg.isSeen);

    for (const msg of unseenMessages) {
        const messageRef = dbRef(db, `chat_messages/${chatId.value}/${msg.key}`);
        await update(messageRef, { isSeen: true });
        
    }
    await update(dbRef(db,
        `user_chats/${mCurrentUser.value.uid}/${mAnotherUser.value.uid}`),
        { unreadCount: increment(-unseenMessages.length) });

}

const scrollToBottom = () => {
    nextTick(() => {
        if (messageListRef.value) {
            messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
        }
    });
};

const sendMessage = async () => {
    if (newMessage.value.trim() && mCurrentUser.value && mAnotherUser.value) {
        const newMessageRef = push(chatMessagesRef.value);

        const messageData = {
            type: "text",
            content: newMessage.value,
            timestamp: Date.now(),
            sender: mCurrentUser.value.uid,
            isSeen: false,
        }

        try {
            await set(newMessageRef, messageData);

            newMessage.value = "";

            // Update last message in userChats for both users
            const updateData = {
                timestamp: messageData.timestamp,
                lastMessageKey: newMessageRef.key,
            };

            await updateUserChatsData(updateData);


        } catch (error) {
            console.error("Error sending message:", error);
        }
    }
}

const updateUserChatsData = async (updateData) => {
    await update(dbRef(db,
        `user_chats/${mCurrentUser.value.uid}/${mAnotherUser.value.uid}`),
        updateData);

    await update(dbRef(db,
        `user_chats/${mAnotherUser.value.uid}/${mCurrentUser.value.uid}`),
        { ...updateData, unreadCount: increment(1) });
}

const triggerFileUpload = () => {
    fileInput.value.click();
};

const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const storage = getStorage();
    const fileRef = storageRef(storage, `chat_files/${Date.now()}_${chatId.value}_${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);

    let messageData = {
        sender: mCurrentUser.value.uid,
        type: '',
        fileUrl: downloadURL,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        isSeen: false,
        timestamp: Date.now(),
    };

    if (file.type.startsWith('image/')) {
        messageData.type = 'image';
    } else if (file.type.startsWith('video/')) {
        messageData.type = 'video';
    }
    else {
        messageData.type = 'file';
    }

    sendMediaMessage(messageData);
}

const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("getUserMedia not supported on your browser!");
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioURL.value = URL.createObjectURL(audioBlob);
            console.log("audioURL: " + audioURL.value);
            handleAudioUpload(audioBlob, audioURL.value);
            audioChunks = [];
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        isRecording.value = true;
    } catch (error) {
        console.error(`The following getUserMedia error occurred: ${error}`);
    }

};

const stopRecording = () => {
    if (mediaRecorder) {
        mediaRecorder.stop();
        isRecording.value = false;
    }
}

const handleAudioUpload = async (audioBlob, fileName) => {
    const storage = getStorage();

    const audioRef = storageRef(storage, `chat_audios/${Date.now()}_${chatId.value}_${fileName}`);
    await uploadBytes(audioRef, audioBlob);
    const downloadURL = await getDownloadURL(audioRef);

    let messageData = {
        sender: mCurrentUser.value.uid,
        type: 'audio',
        fileUrl: downloadURL,
        fileName: fileName,
        fileType: audioBlob.type,
        fileSize: audioBlob.size,
        isSeen: false,
        timestamp: Date.now(),
    };
    sendMediaMessage(messageData);
}

const sendMediaMessage = async (messageData) => {
    if (!mCurrentUser.value || !mAnotherUser.value) {
        console.error("sendMediaMessage: mCurrentUser or mAnotherUser is null");
        return;
    }

    const newMessageRef = push(chatMessagesRef.value);

    if (!messageData) {
        console.error("messageData is null");
        return;
    }

    try {
        await set(newMessageRef, messageData);
        const updateData = {
            timestamp: messageData.timestamp,
            lastMessageKey: newMessageRef.key,
        };

        await updateUserChatsData(updateData);
    } catch (error) {
        console.error("Error sending media message:", error);
    }
};

</script>
