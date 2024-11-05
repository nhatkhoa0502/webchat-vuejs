<template>
  <div class="user-content">
    <div class="user-list">
      <div class="title-1">
        <h5><b>Tất cả bạn bè</b></h5>
      </div>
      <div class="text-center">
        <input
          class="input-field"
          v-model="query"
          @input="searchUsers"
          type="text"
          placeholder=" Nhập nội dung tìm kiếm"
        />
      </div>
      <table
        class="table table-hover table-borderless"
        v-if="users.length > 0 && query == ''"
      >
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
            </td>
            <td class="text-center">
              <!-- Sử dụng biểu tượng ba chấm từ Bootstrap Icons -->
              <i class="bi bi-three-dots-vertical"></i>
            </td>
          </tr>
        </tbody>
      </table>
      <table class="table table-hover table-borderless" v-if="query != ''">
        <tbody>
          <tr
            v-for="user in filteredUsers"
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
            </td>
            <td class="text-center">
              <!-- Sử dụng biểu tượng ba chấm từ Bootstrap Icons -->
              <i class="bi bi-three-dots-vertical"></i>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="user-profile">
      <div
        class="container d-flex flex-column align-items-center vh-100"
        v-if="selectedUser"
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
          UID: {{ selectedUser.uid }}
          <div class="container mt-5">
            <!-- Chia làm 2 cột -->
            <div class="row">
              <!-- Cột bên trái -->
              <div class="col-md-6">
                <!-- Khung Email -->
                <div class="card mb-3 border #ccc">
                  <div class="card-body d-flex">
                    <strong class="me-2">Email:</strong>
                    <span>{{ selectedUser.email }}</span>
                  </div>
                </div>

                <!-- Khung Gender -->
                <div class="card mb-3 border #ccc">
                  <div class="card-body d-flex">
                    <strong class="me-2">Gender:</strong>
                    <span>{{ selectedUser.gender }}</span>
                  </div>
                </div>

                <!-- Khung Phone -->
                <div class="card mb-3 border #ccc">
                  <div class="card-body d-flex">
                    <strong class="me-2">Phone Number:</strong>
                    <span>{{ selectedUser.phone }}</span>
                  </div>
                </div>
              </div>

              <!-- Cột bên phải -->
              <div class="col-md-6">
                <!-- Khung Name -->
                <div class="card mb-3 border #ccc">
                  <div class="card-body d-flex">
                    <strong class="me-2">DisplayName:</strong>
                    <span>{{ selectedUser.displayName }}</span>
                  </div>
                </div>

                <!-- Khung Age -->
                <div class="card mb-3 border #ccc">
                  <div class="card-body d-flex">
                    <strong class="me-2">Date of birth:</strong>
                    <span>{{ selectedUser.dob }}</span>
                  </div>
                </div>

                <!-- Khung Address -->
                <div class="card mb-3 border #ccc">
                  <div class="card-body d-flex">
                    <strong class="me-2">Address:</strong>
                    <span>{{ selectedUser.address }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="container-fluid d-flex flex-column justify-content-center align-items-center vh-100"
        v-if="!selectedUser"
      >
        <img
          class="avatar"
          src="https://firebasestorage.googleapis.com/v0/b/webchat-24af1.appspot.com/o/avatar-user%2Fuser-profile-icon-free-vector.jpg?alt=media&token=d75dc0a3-8183-4d22-a4a8-07b9f4599487"
        />
        <br />
        <div>
          <h5>
            <b>Chọn tên của người bạn muốn xem trước trang cá nhân</b>
          </h5>
        </div>
      </div>
    </div>
  </div>
  <link
    href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.2/font/bootstrap-icons.min.css"
    rel="stylesheet"
  />
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import {
  getDatabase,
  ref as dbRef,
  get,
  child,
  remove,
} from "firebase/database";
import { showErrorAlert } from "../utils/notification"; // Nếu có hàm thông báo lỗi
import { getAuth } from "firebase/auth";

const users = reactive([]);
const loading = ref(false);
const auth = getAuth();
const currentUser = auth.currentUser;
const query = ref("");
const selectedUser = ref(null);
const myRequestList = reactive([]);
const matchedUsers = reactive([]);

const filteredUsers = computed(() => {
  if (query.value.trim() === "") {
    return matchedUsers;
  }
  const searchRegex = new RegExp(query.value.split("").join(".*"), "i");
  return matchedUsers.filter((user) => searchRegex.test(user.displayName));
});

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

const selectUser = (user) => {
  selectedUser.value = user;
};

// Hàm lấy danh sách lời mời kết bạn đã nhận
const getMyFriendsList = async () => {
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
        if (request.from === currentUser.uid && request.status === "accepted") {
          myRequestList.push({
            id: id,
            uid: request.to,
            sentAt: request.sentAt,
          });
        }
        if (request.to === currentUser.uid && request.status === "accepted") {
          myRequestList.push({
            id: id,
            uid: request.from,
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

const filterPendingUsers = () => {
  // Xóa toàn bộ phần tử của mảng bằng splice để Vue phản ứng đúng
  matchedUsers.splice(0, matchedUsers.length);

  myRequestList.forEach((i) => {
    // Tìm user có uid trùng với from của pending
    const foundUser = users.find((user) => user.uid === i.uid);

    if (foundUser) {
      matchedUsers.push(foundUser); // Nếu tìm thấy, đẩy user vào mảng matchedUsers
    }
  });
};

const loadFriends = async () => {
  await getMyFriendsList();
  filterPendingUsers(); // Gọi filterPendingUsers sau khi cả hai hàm trên đã hoàn thành
};

async function deleteFriend(id) {
  let friendId;

  myRequestList.forEach((i) => {
    if (i.uid === id) {
      friendId = i.id;
    }
  });

  const db = getDatabase();

  try {
    // Tạo tham chiếu tới bản ghi của người bạn dựa trên friendId
    const friendRef = dbRef(db, `friend/${friendId}`);

    // Xóa bản ghi đó
    await remove(friendRef);

    console.log("Bạn bè đã được xóa thành công.");
    loadFriends();
    selectedUser.value = null;
  } catch (error) {
    console.error("Lỗi khi xóa bạn bè:", error);
    showErrorAlert("Lỗi khi xóa bạn bè: " + error.message);
  }
}

getAllUsers();
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
  flex: 3;
}
.user-profile {
  flex: 7;
  border-left: 0.5px solid #ccc;
}
.custom-btn {
  font-size: 15px;
  font-weight: bold;
  width: 170px;
  height: 40px;
}
.custom-btn2 {
  font-size: 15px;
  font-weight: bold;
  width: 150px;
  height: 40px;
}
.submit-dialog {
  align-items: center;
  text-align: center;
  background-color: #f9f9f9;
  width: 98%;
  padding: 30px;
  border-radius: 10px;
}
.input-field {
  margin: 10px;
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
