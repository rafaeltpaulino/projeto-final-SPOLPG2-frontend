<template>
  <div class="login-view">
    <BContainer>
      <BRow class="justify-content-center">
        <BCol cols="12" md="8" lg="6">
          
          <BCard class="shadow-sm border-0 p-3">
            <div class="text-center mb-4">
              <h3 class="text-dark fw-bold">Entrar na Conta</h3>
              <p class="text-muted">Bem-vindo de volta! Insira suas credenciais.</p>
            </div>

            <BAlert v-if="message" :model-value="!!message" :variant="messageType" dismissible>
              {{ message }}
            </BAlert>

            <BForm @submit.prevent="handleLogin">          
              <div class="mb-3">
                <label class="form-label fw-bold">E-mail</label>
                <BFormInput 
                  v-model="loginForm.email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  required 
                />
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Senha</label>
                <BFormInput 
                  v-model="loginForm.password" 
                  type="password" 
                  placeholder="********" 
                  required 
                />
              </div>
              
              <div class="d-grid gap-2 mt-4">
                <BButton type="submit" variant="dark" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <span v-if="isLoading">Entrando...</span>
                  <span v-else>Acessar Sistema</span>
                </BButton>
              </div>
            </BForm>

            <hr class="my-4">

            <div class="text-center">
              <p class="mb-0">Não tem uma conta?</p>
              <router-link to="/register" class="text-decoration-none fw-bold text-primary">
                Criar Nova Conta
              </router-link>
            </div>
            
          </BCard>
        
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  BRow, BCol, BCard, BForm, BFormInput, BButton, BAlert, BContainer
} from 'bootstrap-vue-next';
import api from '../services/api'; 

const router = useRouter();

// DTO para Login (apenas email e senha)
const loginForm = ref({
  email: '',
  password: ''
});

const isLoading = ref(false);
const message = ref('');
const messageType = ref('danger');

const handleLogin = async () => {
  isLoading.value = true;
  message.value = '';

  try {
    // 1. Chama o endpoint correto de Login
    const response = await api.post('/auth/login', {
      email: loginForm.value.email,
      password: loginForm.value.password
      
    });
    
    // 2. O backend retorna { token: "eyJhb..." }
    const token = response.data.token;
    const userId = response.data.userId;
    const username = response.data.username;
    // 3. SALVA O TOKEN (Essencial para manter a sessão)
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);

    if (roles && (roles.includes('ADMIN') || roles.includes('ROLE_ADMIN'))) {
        localStorage.setItem('role', 'ADMIN');
    } else {
        localStorage.setItem('role', 'USER');
    }

    // 4. Feedback visual e redirecionamento
    messageType.value = 'success';
    message.value = 'Login realizado! Redirecionando...';
    
    // Pequeno delay para o usuário ver a mensagem verde
    setTimeout(() => {
        router.push(`/profile/${userId}`); // Vai para a página principal
    }, 1000);

  } catch (error) {
    messageType.value = 'danger';
    
    if (error.response) {
       // Erro 401 ou 400 do backend
       // Se o backend enviar mensagem específica, mostra ela, senão msg padrão
       message.value = error.response.data?.message || 'E-mail ou senha incorretos.';
    } else if (error.request) {
       message.value = 'Sem resposta do servidor. Verifique se o Backend está rodando.';
    } else {
       message.value = 'Erro ao tentar fazer login.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-view {
  width: 100vw;
  min-height: 100vh;
  
  /* Centralização vertical e horizontal */
  display: flex;
  align-items: center; 
  justify-content: center;

  /* Fundo com imagem e fallback de cor */
  background-color: #f8f9fa; 
  background-image: url('/images/discos.png');
  background-size: cover; 
  background-position: center;
  background-repeat: no-repeat;
}

/* Ajuste para o Card ficar bonito sobre a imagem */
.card {
  background-color: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(5px);
}
</style>