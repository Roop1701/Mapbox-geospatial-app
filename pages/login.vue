<template>
  <div>
    <h2>User Management</h2>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script setup>
const email = shallowRef("");
const password = shallowRef("");
</script>
