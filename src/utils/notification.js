// Nếu sử dụng SweetAlert2
import Swal from "sweetalert2";

// Hàm hiển thị thông báo thông tin
export function showInfoAlert(message) {
  Swal.fire({
    title: "Info",
    text: message,
    icon: "info",
    confirmButtonText: "Thanks!",
  });
  Swal.getConfirmButton().style.color = "white"; // Màu chữ trắng
}

// Hàm hiển thị thông báo thành công
export function showSuccessAlert(message) {
  Swal.fire({
    title: "Success",
    text: message,
    icon: "success",
    confirmButtonText: "OK",
  });
  Swal.getConfirmButton().style.color = "white"; // Màu chữ trắng
}

// Hàm hiển thị thông báo lỗi
export function showErrorAlert(message) {
  Swal.fire({
    title: "Error",
    text: message,
    icon: "error",
    confirmButtonText: "OK",
  });
  Swal.getConfirmButton().style.color = "white"; // Màu chữ trắng
}

// Hàm hiển thị thông báo cảnh báo
export function showWarningAlert(message) {
  Swal.fire({
    title: "Warning",
    text: message,
    icon: "warning",
    confirmButtonText: "OK",
  });
  Swal.getConfirmButton().style.color = "white"; // Màu chữ trắng
}
