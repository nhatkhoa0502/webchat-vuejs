<template>
  <div v-if="user" class="container-fluid">
    <div class="row">
      <div class="col-md-2 border-end">
        <NavigationSidebar />
      </div>
      <div class="col-md-10">
        <router-view />
      </div>
    </div>
  </div>
  <div v-else>
    <router-view name="unAuthenticated" />
  </div>
</template>
<script setup>
import { computed } from "vue";
import NavigationSidebar from "./components/NavigationSidebar.vue";
import { useStore } from "vuex";

const store = useStore();
const user = computed(() => store.getters.getUser);
</script>
<style scoped></style>
