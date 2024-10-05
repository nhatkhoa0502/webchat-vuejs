<template>
  <div class="container-fluid vh-100">
    <div class="row h-100">
      <!-- Danh sách chat -->
      <div class="col-md-4 border-end p-0 h-100 d-flex flex-column">
        <div class="p-3 bg-light border-bottom">
          <input type="text" class="form-control" placeholder="Tìm kiếm">
        </div>
        <div class="overflow-auto flex-grow-1">
          <div class="list-group list-group-flush">
            <a href="#" class="list-group-item list-group-item-action active py-3" aria-current="true">
              <div class="d-flex w-100 justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <img src="path_to_avatar" class="rounded-circle me-2" width="40" height="40" alt="Avatar">
                  <div>
                    <h6 class="mb-0">Nguyen Hoang Khang</h6>
                    <small></small>
                  </div>
                </div>
                <span class="badge bg-primary rounded-pill">2</span>
              </div>
            </a>
            <!-- Thêm các mục chat khác tương tự -->
          </div>
        </div>
      </div>

      <!-- Khu vực chat chính -->
      <!-- <div class="col-md-8 p-0 h-100 d-flex flex-column">
       
        <div class="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <img src="path_to_avatar" class="rounded-circle me-2" width="40" height="40" alt="Avatar">
            <h5 class="mb-0">Nguyen Hoang Khang</h5>
          </div>
          <div>
            <button class="btn btn-outline-secondary me-2"><i class="bi bi-telephone"></i></button>
            <button class="btn btn-outline-secondary me-2"><i class="bi bi-camera-video"></i></button>
            <button class="btn btn-outline-secondary"><i class="bi bi-info-circle"></i></button>
          </div>
        </div>
        
        <div class="flex-grow-1 overflow-auto p-3">
          <div class="d-flex justify-content-start mb-3">
            <div class="bg-light rounded p-2 max-width-70">
              <p class="mb-0">Oke</p>
              <small class="text-muted">15:07</small>
            </div>
          </div>
          <div class="d-flex justify-content-end mb-3">
            <div class="bg-primary text-white rounded p-2 max-width-70">
              <p class="mb-0">ko ln</p>
              <small class="text-white-50">15:07</small>
            </div>
          </div>
          
        </div>
        
        <div class="p-3 border-top">
          <div class="input-group">
            <input type="text" class="form-control" placeholder="Nhập @, tin nhắn tới Nguyen Hoang Khang">
            <button class="btn btn-outline-secondary" type="button"><i class="bi bi-emoji-smile"></i></button>
            <button class="btn btn-outline-secondary" type="button"><i class="bi bi-paperclip"></i></button>
            <button class="btn btn-primary" type="button"><i class="bi bi-send text-white"></i></button>
          </div>
        </div>
      </div> -->
        <ChatBox  class="col-md-8 p-0 h-100"/>
    </div>
  </div>
</template>

<script setup>
import ChatBox from '../components/chats/ChatBox.vue'
</script>

<style scoped>
.max-width-70 {
  max-width: 70%;
}
</style>
