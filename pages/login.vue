<template>
  <div class="container">
    <div class="form-container">
      <div v-if="!showSignup">
        <h2>Welcome Back</h2>
        <form @submit.prevent="handleSignIn">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="password" required />
          </div>
          <button type="submit" class="btn">Sign In</button>
        </form>
        <p>
          Don't have an account? <a href="#" @click="toggleForm">Sign Up</a>
        </p>
      </div>

      <div v-if="showSignup" class="signup-container">
        <h2>Create Account</h2>
        <form @submit.prevent="handleSignUp">
          <div class="form-group">
            <label for="signup-email">Email</label>
            <input
              type="email"
              id="signup-email"
              v-model="signupEmail"
              required
            />
          </div>
          <div class="form-group">
            <label for="signup-password">Password</label>
            <input
              type="password"
              id="signup-password"
              v-model="signupPassword"
              required
            />
          </div>
          <button type="submit" class="btn">Sign Up</button>
        </form>
        <p>Have an account? <a href="#" @click="toggleForm">Sign In</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
const email = shallowRef("");
const password = shallowRef("");
const signupEmail = shallowRef("");
const signupPassword = shallowRef("");
const showSignup = shallowRef(false);
const router = useRouter();

const handleSignIn = () => {
  // Handle sign-in logic here
  console.log("Signing in with", {
    email: email.value,
    password: password.value,
  });
  router.push("/dashboard");
};

const handleSignUp = () => {
  // Handle sign-up logic here
  console.log("Signing up with", {
    email: signupEmail.value,
    password: signupPassword.value,
  });
  router.push("/dashboard");
};

const toggleForm = () => {
  showSignup.value = !showSignup.value;
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f0f0;
}

.form-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input:focus {
  border-color: #007bff;
  outline: none;
}

.btn {
  width: 100%;
  padding: 0.7rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  font-size: 1rem;
  cursor: pointer;
}

.btn:hover {
  background-color: #0056b3;
}

p {
  margin-top: 1rem;
  color: #777;
}
</style>
