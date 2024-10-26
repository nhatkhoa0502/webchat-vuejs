<template>
  <div>
    <div class="user-content">
      <div class="user-list">
        <div class="title-1">
          <h5><b>Lời mời kết bạn</b></h5>
        </div>
        <table class="table table-hover table-borderless">
          <tbody>
            <tr
              v-for="user in matchedUsers"
              :key="user.uid"
              @click="selectUser(user)"
              class="cursor-pointer"
            >
              <td style="width: 60px">
                <img
                  :src="user.avatar"
                  alt="Avatar"
                  class="avatar"
                  style="object-fit: cover"
                />
              </td>
              <td>
                <b>{{ user.displayName }}</b> <br />{{ user.email }} <br />
                <button
                  class="btn btn-primary custom-btn2"
                  @click="acceptFriendRequest(user.uid)"
                >
                  Xác nhận
                </button>
                &ensp;
                <button
                  class="btn btn-secondary custom-btn2"
                  @click="deleteFriendRequest(user.uid)"
                >
                  Xóa lời mời
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="user-profile">
        <form @submit.prevent="search" class="text-center">
          <input
            class="input-field"
            v-model="searchquery"
            type="text"
            placeholder=" Nhập nội dung tìm kiếm"
          />
          <button type="submit" hidden>Tìm kiếm</button>
        </form>
        <div
          class="container d-flex flex-column align-items-center vh-100"
          v-if="selectedUser && searchquery == ''"
        >
          <div class="text-center mb-4">
            <img
              class="avatar-pf"
              :src="selectedUser.avatar"
              alt="Avatar"
              style="object-fit: cover"
            />
            <br /><br />
            <h2>
              <b>{{ selectedUser.displayName }}</b>
            </h2>
            UID: {{ selectedUser.email }} <br />

            <br />
            <div class="submit-dialog">
              <h6>
                <b
                  >{{ selectedUser.displayName }} đã gửi cho bạn lời mời kết bạn
                  !</b
                >
              </h6>
              <br />
              <button
                class="btn btn-primary custom-btn"
                @click="acceptFriendRequest(selectedUser.uid)"
              >
                Chấp nhận lời mời
              </button>
              &ensp;
              <button
                class="btn btn-secondary custom-btn"
                @click="deleteFriendRequest(selectedUser.uid)"
              >
                Xóa lời mời
              </button>
            </div>
          </div>
        </div>
        <div
          class="container d-flex flex-column align-items-center vh-100"
          style="background-color: #f2f3f5"
          v-if="searchquery != ''"
        >
          <div class="ketqua">
            <h5><b>Kết quả</b></h5>
            <table
              class="table table-borderless"
              v-if="filteredUsers.length > 0"
            >
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.uid">
                  <td style="width: 60px">
                    <img
                      :src="user.avatar"
                      alt="Avatar"
                      class="avatar"
                      style="object-fit: cover"
                    />
                  </td>
                  <td>
                    <b>{{ user.displayName }}</b> <br />{{ user.email }} <br />
                  </td>
                  <td style="float: right">
                    <!-- Kiểm tra nếu user.uid có trong danh sách pendingList -->
                    <button
                      class="btn"
                      :class="
                        pendingList.find((pending) => pending.to === user.uid)
                          ? 'btn-outline-secondary'
                          : 'btn-outline-primary'
                      "
                      @click="
                        pendingList.find((pending) => pending.to === user.uid)
                          ? cancelFriendRequest(user.uid)
                          : sendFriendRequest(user.uid)
                      "
                      v-if="!matchedFriends.find((i) => i.uid === user.uid)"
                    >
                      <!-- Hiển thị text theo điều kiện -->
                      {{
                        pendingList.find((pending) => pending.to === user.uid)
                          ? "→ Hủy lời mời"
                          : "Thêm bạn bè"
                      }}
                    </button>
                    <button
                      class="btn btn-primary"
                      v-if="matchedFriends.find((i) => i.uid === user.uid)"
                    >
                      Nhắn tin
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <p
              v-else
              class="text-center d-flex justify-content-center align-items-center m-5"
            >
              Không tìm thấy kết quả nào
            </p>
          </div>
        </div>
        <div
          class="container-fluid d-flex flex-column justify-content-center align-items-center vh-100"
          v-if="!selectedUser && searchquery == ''"
        >
          <img
            class="avatar"
            src="https://firebasestorage.googleapis.com/v0/b/webchat-24af1.appspot.com/o/avatar-user%2Fuser-profile-icon-free-vector.jpg?alt=media&token=d75dc0a3-8183-4d22-a4a8-07b9f4599487"
          />
          <br />
          <div>
            <h5><b>Chọn tên của người bạn muốn xem trước trang cá nhân</b></h5>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed } from "vue";
import {
  getDatabase,
  ref as dbRef,
  get,
  child,
  push,
  serverTimestamp,
  remove,
  update,
} from "firebase/database";
import { getAuth } from "firebase/auth";
import { showErrorAlert } from "../utils/notification"; // Nếu có hàm thông báo lỗi

// Mảng lưu danh sách tất cả người dùng
const users = reactive([]);

// Cờ để kiểm tra trạng thái loading
const loading = ref(false);

const auth = getAuth();
const currentUser = auth.currentUser;

// Hàm lấy danh sách tất cả người dùng từ Firebase
const getAllUsers = async () => {
  loading.value = true; // Hiển thị loading trong lúc lấy dữ liệu
  const db = getDatabase(); // Lấy instance của Firebase Realtime Database
  const dbReference = dbRef(db); // Tham chiếu tới gốc của database

  try {
    // Lấy tất cả dữ liệu từ đường dẫn 'users/'
    const snapshot = await get(child(dbReference, `users`));

    if (snapshot.exists()) {
      // Nếu có dữ liệu
      const data = snapshot.val(); // Lấy dữ liệu

      // Lặp qua từng user và đẩy vào mảng users[]
      Object.keys(data).forEach((uid) => {
        if (uid != currentUser.uid) {
          users.push({
            uid: uid,
            email: data[uid].email,
            displayName: data[uid].displayName,
            avatar: data[uid].avatar,
            gender: data[uid].gender,
            phone: data[uid].phone,
            address: data[uid].address,
            dob: data[uid].dob,
          });
        }
      });

      console.log("Users list:", users); // Kiểm tra dữ liệu được lấy
    } else {
      console.log("No users available.");
    }
  } catch (error) {
    console.error("Error getting users data:", error);
    showErrorAlert("Error getting users data: " + error); // Hiển thị thông báo lỗi nếu cần
  } finally {
    loading.value = false; // Kết thúc trạng thái loading
  }
};

// Gọi hàm khi component được mount
getAllUsers();

const searchquery = ref("");
const selectedUser = ref(null);

// Hàm để chọn người dùng
const selectUser = (user) => {
  selectedUser.value = user;
  console.log(selectedUser.value);
};

// Tạo một computed để tự động cập nhật filteredUsers khi query thay đổi
const filteredUsers = computed(() => {
  if (searchquery.value.trim() === "") {
    return users;
  }
  const searchRegex = new RegExp(searchquery.value.split("").join(".*"), "i");
  return users.filter((user) => searchRegex.test(user.displayName));
});

// Hàm thêm lời mời kết bạn
async function addFriendRequest(fromUid, toUid) {
  const db = getDatabase();
  const friendsRef = dbRef(db, "friend");

  try {
    const newFriendRequest = {
      from: fromUid,
      to: toUid,
      status: "pending",
      sentAt: serverTimestamp(),
    };

    await push(friendsRef, newFriendRequest);
    console.log("Lời mời kết bạn đã được gửi thành công!");
    // Có thể thêm thông báo thành công ở đây
  } catch (error) {
    console.error("Lỗi khi gửi lời mời kết bạn:", error);
    showErrorAlert("Lỗi khi gửi lời mời kết bạn: " + error.message);
  }
}

// Hàm xử lý khi nút "Thêm bạn bè" được nhấn
const sendFriendRequest = async (toUid) => {
  if (currentUser) {
    await addFriendRequest(currentUser.uid, toUid);
    getMyPendingFriendRequests();
  } else {
    showErrorAlert("Bạn cần đăng nhập để thực hiện chức năng này.");
  }
};
async function cancelFriendRequest(toUid) {
  const db = getDatabase();
  const friendsRef = dbRef(db, "friend");

  try {
    // Tìm requestId của lời mời kết bạn để xóa
    const requestSnapshot = await get(friendsRef);
    if (requestSnapshot.exists()) {
      const requests = requestSnapshot.val();
      let requestIdToRemove = null;

      Object.keys(requests).forEach((requestId) => {
        const request = requests[requestId];
        if (
          request.to === toUid &&
          request.from === currentUser.uid &&
          request.status === "pending"
        ) {
          requestIdToRemove = requestId;
        }
      });

      if (requestIdToRemove) {
        // Thay thế requestToRemoveRef bằng ref từ Firebase và gọi remove() đúng cách
        const requestToRemoveRef = dbRef(db, `friend/${requestIdToRemove}`);
        await remove(requestToRemoveRef); // Gọi phương thức remove để xóa dữ liệu
        console.log("Đã hủy lời mời kết bạn.");
        loadRequests();
      } else {
        console.log("Không tìm thấy lời mời kết bạn để hủy.");
      }
    }
  } catch (error) {
    console.error("Lỗi khi hủy lời mời kết bạn:", error);
    showErrorAlert("Lỗi khi hủy lời mời kết bạn: " + error.message);
  }
}

async function deleteFriendRequest(fromUid) {
  const db = getDatabase();
  const friendsRef = dbRef(db, "friend");

  try {
    // Tìm requestId của lời mời kết bạn để xóa
    const requestSnapshot = await get(friendsRef);
    if (requestSnapshot.exists()) {
      const requests = requestSnapshot.val();
      let requestIdToRemove = null;

      Object.keys(requests).forEach((requestId) => {
        const request = requests[requestId];
        if (
          request.from === fromUid &&
          request.to === currentUser.uid &&
          request.status === "pending"
        ) {
          requestIdToRemove = requestId;
        }
      });

      if (requestIdToRemove) {
        // Thay thế requestToRemoveRef bằng ref từ Firebase và gọi remove() đúng cách
        const requestToRemoveRef = dbRef(db, `friend/${requestIdToRemove}`);
        await remove(requestToRemoveRef); // Gọi phương thức remove để xóa dữ liệu
        console.log("Đã hủy lời mời kết bạn.");
        selectedUser.value = null;
        loadRequests();
      } else {
        console.log("Không tìm thấy lời mời kết bạn để hủy.");
      }
    }
  } catch (error) {
    console.error("Lỗi khi hủy lời mời kết bạn:", error);
    showErrorAlert("Lỗi khi hủy lời mời kết bạn: " + error.message);
  }
}

async function acceptFriendRequest(fromUid) {
  const db = getDatabase();
  const friendsRef = dbRef(db, "friend");

  try {
    // Tìm requestId của lời mời kết bạn để chấp nhận
    const requestSnapshot = await get(friendsRef);
    if (requestSnapshot.exists()) {
      const requests = requestSnapshot.val();
      let requestIdToAccept = null;

      Object.keys(requests).forEach((requestId) => {
        const request = requests[requestId];
        if (
          request.from === fromUid &&
          request.to === currentUser.uid &&
          request.status === "pending"
        ) {
          requestIdToAccept = requestId;
        }
      });

      if (requestIdToAccept) {
        // Cập nhật trạng thái của lời mời kết bạn thành 'accepted'
        const requestToAcceptRef = dbRef(db, `friend/${requestIdToAccept}`);
        await update(requestToAcceptRef, { status: "accepted" });
        console.log("Đã chấp nhận lời mời kết bạn.");
        selectedUser.value = null;
        loadRequests(); // Gọi hàm để load lại danh sách yêu cầu
      } else {
        console.log("Không tìm thấy lời mời kết bạn để chấp nhận.");
      }
    }
  } catch (error) {
    console.error("Lỗi khi chấp nhận lời mời kết bạn:", error);
    showErrorAlert("Lỗi khi chấp nhận lời mời kết bạn: " + error.message);
  }
}

// Mảng lưu trữ các lời mời kết bạn đã gửi
const pendingList = reactive([]);

// Hàm lấy danh sách lời mời kết bạn mà người dùng đã gửi
const getMyPendingFriendRequests = async () => {
  if (!currentUser) {
    showErrorAlert("Bạn cần đăng nhập để thực hiện chức năng này.");
    return;
  }

  const db = getDatabase(); // Lấy instance của Firebase Realtime Database
  const friendsRef = dbRef(db, "friend"); // Tham chiếu đến đường dẫn 'friend' trong database

  try {
    // Lấy tất cả dữ liệu liên quan đến bạn bè mà người dùng đã gửi yêu cầu
    const snapshot = await get(friendsRef);

    if (snapshot.exists()) {
      // Lấy tất cả các yêu cầu kết bạn
      const data = snapshot.val();
      pendingList.length = 0; // Reset danh sách pendingList để tránh trùng lặp dữ liệu

      // Lặp qua tất cả các yêu cầu kết bạn
      Object.keys(data).forEach((id) => {
        const request = data[id];

        // Nếu yêu cầu được gửi từ currentUser.uid và có trạng thái 'pending'
        if (request.from === currentUser.uid && request.status === "pending") {
          pendingList.push({
            id: id,
            to: request.to,
            sentAt: request.sentAt,
          });
        }
      });
      console.log("Danh sách lời mời kết bạn đã gửi:", pendingList);
    } else {
      console.log("No pending friend requests found.");
    }
  } catch (error) {
    console.error("Error fetching pending friend requests:", error);
    showErrorAlert("Error fetching pending friend requests: " + error.message);
  }
};

const myRequestList = reactive([]);

// Hàm lấy danh sách lời mời kết bạn đã nhận
const getMyRequestsList = async () => {
  if (!currentUser) {
    showErrorAlert("Bạn cần đăng nhập để thực hiện chức năng này.");
    return;
  }

  const db = getDatabase(); // Lấy instance của Firebase Realtime Database
  const friendsRef = dbRef(db, "friend"); // Tham chiếu đến đường dẫn 'friend' trong database

  try {
    // Lấy tất cả dữ liệu liên quan đến bạn bè mà người dùng đã gửi yêu cầu
    const snapshot = await get(friendsRef);

    if (snapshot.exists()) {
      // Lấy tất cả các yêu cầu kết bạn
      const data = snapshot.val();
      myRequestList.length = 0; // Reset danh sách pendingList để tránh trùng lặp dữ liệu

      // Lặp qua tất cả các yêu cầu kết bạn
      Object.keys(data).forEach((id) => {
        const request = data[id];

        // Nếu yêu cầu được gửi từ currentUser.uid và có trạng thái 'pending'
        if (request.to === currentUser.uid && request.status === "pending") {
          myRequestList.push({
            id: id,
            from: request.from,
            sentAt: request.sentAt,
          });
        }
      });

      // await getUsersFromPendingRequests();
      console.log("Danh sách lời mời kết bạn:", myRequestList);
    } else {
      console.log("No pending friend requests found.");
    }
  } catch (error) {
    console.error("Error fetching pending friend requests:", error);
    showErrorAlert("Error fetching pending friend requests: " + error.message);
  }
};

const matchedUsers = reactive([]); // Mảng để lưu danh sách các user tìm được

const filterPendingUsers = () => {
  // Xóa toàn bộ phần tử của mảng bằng splice để Vue phản ứng đúng
  matchedUsers.splice(0, matchedUsers.length);

  myRequestList.forEach((i) => {
    // Tìm user có uid trùng với from của pending
    const foundUser = users.find((user) => user.uid === i.from);

    if (foundUser) {
      matchedUsers.push(foundUser); // Nếu tìm thấy, đẩy user vào mảng matchedUsers
    }
  });
};

const loadRequests = async () => {
  await getMyPendingFriendRequests();
  await getMyRequestsList();
  filterPendingUsers(); // Gọi filterPendingUsers sau khi cả hai hàm trên đã hoàn thành
};

loadRequests();

//Danh sách bạn bè
const myFriendsList = reactive([]);

const getMyFriendsList = async () => {
  if (!currentUser) {
    showErrorAlert("Bạn cần đăng nhập để thực hiện chức năng này.");
    return;
  }

  const db = getDatabase();
  const friendsRef = dbRef(db, "friend");

  try {
    const snapshot = await get(friendsRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      myFriendsList.length = 0;

      Object.keys(data).forEach((id) => {
        const request = data[id];

        if (request.from === currentUser.uid && request.status === "accepted") {
          myFriendsList.push({
            id: id,
            uid: request.to,
            sentAt: request.sentAt,
          });
        }
        if (request.to === currentUser.uid && request.status === "accepted") {
          myFriendsList.push({
            id: id,
            uid: request.from,
            sentAt: request.sentAt,
          });
        }
      });
    } else {
      console.log("No pending friend requests found.");
    }
  } catch (error) {
    console.error("Error fetching pending friend requests:", error);
    showErrorAlert("Error fetching pending friend requests: " + error.message);
  }
};

const matchedFriends = reactive([]);

const filterFriends = () => {
  matchedFriends.splice(0, matchedFriends.length);

  myFriendsList.forEach((i) => {
    const foundUser = users.find((user) => user.uid === i.uid);

    if (foundUser) {
      matchedFriends.push(foundUser);
    }
  });
};

const loadFriends = async () => {
  await getMyFriendsList();
  filterFriends();
};

loadFriends();
</script>

<style scoped>
.title-1 {
  color: #000;
  margin-top: 10px;
  padding: 20px;
  padding-top: 10px;
  border-bottom: 0.5px solid #ccc;
}
.avatar {
  width: 60px; /* Điều chỉnh kích thước theo nhu cầu */
  height: 60px; /* Điều chỉnh kích thước theo nhu cầu */
  border-radius: 50%; /* Làm cho hình ảnh tròn */
}
.avatar-pf {
  margin-top: 20px;
  border: 2px solid #ccc;
  padding: 4px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
}
.table td,
.table th {
  vertical-align: middle; /* Căn giữa chiều dọc */
  padding: 15px;
}
.user-content {
  margin-top: 0px;
  display: flex;
}
.user-list {
  flex: 3.5;
}
.user-profile {
  flex: 7;
  border-left: 0.5px solid #ccc;
}
.custom-btn {
  font-size: 14px;
  font-weight: bold;
  width: 170px;
  height: 40px;
}
.custom-btn2 {
  font-size: 14px;
  font-weight: bold;
  width: 120px;
  height: 40px;
}
.submit-dialog {
  align-items: center;
  text-align: center;
  background-color: #f9f9f9;
  width: 100%;
  padding: 30px;
  border-radius: 10px;
}
.input-field {
  margin: 15px 10px 10px;
  width: 90%;
  padding: 12px;
  border-radius: 50px;
  border: 0;
  background-color: #f2f3f5;
  outline: none;
}
.ketqua {
  width: 80%;
  margin: 30px;
  padding: 20px;
  border-radius: 10px;
  background-color: white;
}
.cursor-pointer {
  cursor: pointer;
}
.mb-4 {
  width: 100%;
}
</style>
