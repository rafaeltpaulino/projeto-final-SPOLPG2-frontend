<template>
  <div class="register-view">
    <BContainer>
        <BRow class="justify-content-center">
            <BCol cols="12" md="8" lg="6">
        
                <BCard class="shadow-sm border-0">
                    <div class="text-center mb-4">
                        <h3 class="text-dark fw-bold">Criar Conta</h3>
            <p class="text-muted">Preencha os dados abaixo para se juntar ao Vinyl Manager</p>
        </div>
        
        <!-- Mensagens de Sucesso/Erro -->
        <BAlert v-if="message" :model-value="!!message" :variant="messageType" dismissible>
            {{ message }}
        </BAlert>
        
          <BForm @submit.prevent="handleRegister">
            
            <!-- Campo: Username -->
            <div class="mb-3">
                <label class="form-label fw-bold">Nome de Usuário (Username)</label>
              <BFormInput 
                v-model="registerForm.username" 
                placeholder="Ex: joaosilva" 
                required 
                />
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">E-mail</label>
              <BFormInput 
              v-model="registerForm.email" 
              type="email" 
              placeholder="nome@exemplo.com" 
              required 
              />
            </div>

            <div class="mb-3">
                <label class="form-label fw-bold">Palavra-passe</label>
                <BFormInput 
                v-model="registerForm.password" 
                type="password" 
                placeholder="********" 
                required 
              />
            </div>
            
            <BRow>
                <BCol md="6" class="mb-3">
                    <label class="form-label fw-bold">Nome</label>
                <BFormInput 
                v-model="registerForm.firstName" 
                placeholder="Primeiro Nome" 
                required
                />
            </BCol>
            <BCol md="6" class="mb-3">
                <label class="form-label fw-bold">Sobrenome</label>
                <BFormInput 
                v-model="registerForm.lastName" 
                placeholder="Último Nome" 
                required
                />
            </BCol>
        </BRow>
        
            <div class="d-grid gap-2 mt-4">
                <BButton type="submit" variant="warning" size="lg" :disabled="isLoading">
                    <span v-if="isLoading">A Registar...</span>
                    <span v-else>Criar Conta</span>
              </BButton>
            </div>

          </BForm>
          
          <hr class="my-4">

          <div class="text-center">
            <p class="mb-0">Já tem uma conta?</p>
            <!-- Link para voltar ao Login -->
            <router-link to="/login" class="text-decoration-none fw-bold text-warning ">
              Fazer Login
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
// Importação explícita dos componentes visuais
import { 
    BRow, BCol, BCard, BForm, BFormInput, BButton, BAlert 
} from 'bootstrap-vue-next';
import api from '../services/api'; 

const router = useRouter();

// Dados do formulário
const registerForm = ref({
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  countryId: null
});

const isLoading = ref(false);
const message = ref('');
const messageType = ref('danger');

const handleRegister = async () => {
  isLoading.value = true;
  message.value = '';

  try {
    // --- LÓGICA DE REGISTO ---
    // Envia os dados para o backend (quando estiver a funcionar na porta 8080)
    await api.post('/auth/register', registerForm.value);
    
    // Sucesso
    messageType.value = 'success';
    message.value = 'Utilizador criado com sucesso! A redirecionar para login...';
    
    // Redireciona para o login após 2 segundos
    setTimeout(() => {
        router.push('/login');
    }, 2000);

  } catch (error) {
    messageType.value = 'danger';
    
    // Tratamento de erro robusto
    if (error.response) {
       // Erro vindo do backend (ex: 400 Bad Request, email já existe)
       message.value = error.response.data?.message || 'Erro ao registar utilizador.';
    } else {
       // Erro de conexão (backend desligado)
       message.value = 'Não foi possível conectar ao servidor. Verifique se o Backend está a correr.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.register-view {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;

  background-image: url('/images/discos.png');
  background-size: cover; 
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;

  min-height: 100vh;
  padding-top: 50px;
  padding-bottom: 50px;
}
.card {
  transition: transform 0.3s ease-in-out;
}
</style>