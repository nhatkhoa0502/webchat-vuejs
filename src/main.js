import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAsaOYwKC5ikvuCZd4sKr428dVln3JwhmI",
  authDomain: "webchat-24af1.firebaseapp.com",
  projectId: "webchat-24af1",
  storageBucket: "webchat-24af1.appspot.com",
  messagingSenderId: "510253615526",
  appId: "1:510253615526:web:28d1fba686351388726767",
  measurementId: "G-EKN9R2MWM1",
  databaseURL:
    "https://webchat-24af1-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Khởi tạo Firebase
initializeApp(firebaseConfig);

const app = createApp(App);
app.use(vuetify);
app.use(store);
app.use(router);
app.mount("#app");

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, you can save user data if needed
    store.dispatch("login", user);
    router.push("/profile");
    console.log("User login");
  } else {
    // User is signed out
    store.dispatch("logout");
    router.push("/login");
    console.log("User logout");
  }
});

// vuex khi reload lại trang sẽ bị reset, đăng xuất khỏi firebase để đồng bộ với vuex
// window.addEventListener("beforeunload", () => {
//   signOut(auth).catch((error) => {
//     console.error("Error signing out: ", error);
//   });
// });
