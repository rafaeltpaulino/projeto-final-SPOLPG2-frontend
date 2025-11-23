<script setup>
import { ref } from 'vue';
import api from './services/api';

// Estados da aplicação
const isLoggedIn = ref(!!localStorage.getItem('token'));
const currentView = ref('login'); // 'login' | 'register' | 'dashboard'
const message = ref(''); // Para mostrar respostas da API ou erros
const messageType = ref(''); // 'success' | 'error'

// Dados dos formulários
const loginForm = ref({ email: '', password: '' });
const registerForm = ref({ 
  username: '', 
  email: '', 
  password: '',  // Certifique-se que o país ID 1 existe no banco
});

// --- AÇÕES ---

// 1. Registrar Usuário
const handleRegister = async () => {
  try {
    // Ajuste a rota conforme seu AuthController
    await api.post('/auth/register', registerForm.value);
    setMessage('Usuário criado! Faça login.', 'success');
    currentView.value = 'login';
  } catch (error) {
    setMessage(error.response?.data?.message || 'Erro ao registrar', 'error');
  }
};

// 2. Fazer Login
const handleLogin = async () => {
  try {
    const response = await api.post('/auth/login', loginForm.value);
    const token = response.data.token;
    
    // Salva o token e atualiza estado
    localStorage.setItem('token', token);
    isLoggedIn.value = true;
    currentView.value = 'dashboard';
    setMessage('Login realizado com sucesso!', 'success');
  } catch (error) {
    setMessage('Credenciais inválidas', 'error');
  }
};

// 3. Logout
const handleLogout = () => {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  currentView.value = 'login';
  message.value = '';
};

// 4. Testar Rota de Usuário
const testUserRoute = async () => {
  try {
    // Supondo que sua rota no Spring seja /test/user (ajuste se necessário)
    const response = await api.get('user/teste'); 
    setMessage(`Sucesso: ${response.data}`, 'success');
  } catch (error) {
    setMessage(`Erro (${error.response.status}): Acesso negado`, 'error');
  }
};

// 5. Testar Rota de Admin
const testAdminRoute = async () => {
  try {
    // Supondo que sua rota no Spring seja /test/admin
    const response = await api.get('admin/teste'); 
    setMessage(`Sucesso Admin: ${response.data}`, 'success');
  } catch (error) {
    setMessage(`Erro (${error.response.status}): Você não é admin!`, 'error');
  }
};

// Helper para mensagens
const setMessage = (msg, type) => {
  message.value = msg;
  messageType.value = type;
};
</script>

<template>
  <div class="container">
    <h1>🎵 Vinyl Manager Auth Test</h1>

    <div v-if="message" :class="['alert', messageType]">
      {{ message }}
    </div>

    <div v-if="!isLoggedIn && currentView === 'login'" class="card">
      <h2>Login</h2>
      <input v-model="loginForm.email" placeholder="E-mail" type="email" />
      <input v-model="loginForm.password" placeholder="Senha" type="password" />
      <button @click="handleLogin">Entrar</button>
      <p>Não tem conta? <a @click="currentView = 'register'">Registre-se</a></p>
    </div>

    <div v-if="!isLoggedIn && currentView === 'register'" class="card">
      <h2>Criar Conta</h2>
      <input v-model="registerForm.username" placeholder="Username" />
      <input v-model="registerForm.email" placeholder="E-mail" />
      <input v-model="registerForm.password" placeholder="Senha" type="password" />
      <div class="row">
        <input v-model="registerForm.firstName" placeholder="Nome" />
        <input v-model="registerForm.lastName" placeholder="Sobrenome" />
      </div>
      <button @click="handleRegister">Cadastrar</button>
      <p>Já tem conta? <a @click="currentView = 'login'">Fazer Login</a></p>
    </div>

    <div v-if="isLoggedIn" class="card dashboard">
      <h2>Painel de Teste</h2>
      <p>Você está autenticado com JWT.</p>
      
      <div class="actions">
        <button class="btn-test" @click="testUserRoute">Testar Rota USER</button>
        <button class="btn-test admin" @click="testAdminRoute">Testar Rota ADMIN</button>
      </div>

      <button class="btn-logout" @click="handleLogout">Sair</button>
    </div>
  </div>
</template>

<style scoped>
/* CSS Básico para não ficar feio */
.container { max-width: 400px; margin: 50px auto; font-family: sans-serif; text-align: center; }
.card { border: 1px solid #ccc; padding: 20px; border-radius: 8px; display: flex; flex-direction: column; gap: 10px; }
input { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
button { padding: 10px; cursor: pointer; background-color: #42b883; color: white; border: none; border-radius: 4px; font-weight: bold; }
button:hover { background-color: #33a06f; }
.btn-logout { background-color: #e74c3c; margin-top: 20px; }
.btn-test { background-color: #3498db; width: 100%; margin-bottom: 5px;}
.btn-test.admin { background-color: #8e44ad; }
.alert { padding: 10px; margin-bottom: 15px; border-radius: 4px; }
.alert.success { background-color: #d4edda; color: #155724; }
.alert.error { background-color: #f8d7da; color: #721c24; }
a { color: #3498db; cursor: pointer; text-decoration: underline; font-size: 0.9em; }
.row { display: flex; gap: 5px; }
</style>