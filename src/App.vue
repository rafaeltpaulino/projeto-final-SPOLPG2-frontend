<template>
  <div class="app-container">
  <BNavbar
  v-b-color-mode="'Secondary'"
  toggleable="lg"
  variant="light"
>
  <BNavbarBrand to="/discos">Vinyl</BNavbarBrand>
  <BNavbarToggle target="nav-collapse" />
  <BCollapse
    id="nav-collapse"
    is-nav
  >
    <BNavbarNav>
      <BNavItem to="/discos" v-if="isLoggedIn">Discos</BNavItem>
    </BNavbarNav>

    <BNavbarNav class="ms-auto mb-2 mb-lg-0">
      <BNavItemDropdown right>
        <template #button-content>
          <em>Usuário</em>
        </template>
        <BDropdownItem to="/login" v-if="!isLoggedIn">Login</BDropdownItem>
        <BDropdownItem to="/register" v-if="!isLoggedIn">Registrar-se</BDropdownItem>
        <BDropdownItem to="/profile" v-if="isLoggedIn">Perfil</BDropdownItem>
        <BDropdownItem @click="handleLogout" variant="danger" to="/discos" v-if="isLoggedIn">Sair</BDropdownItem>
      </BNavItemDropdown>
    </BNavbarNav>
  </BCollapse>
</BNavbar>


<!-- CORPO DA PÁGINA -->
    <BContainer class="mt-0">
      <router-view></router-view>
    </BContainer> 



  </div>
</template>


<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { removeToken, isAuthenticated } from './auth/auth'; 


// --- IMPORTAÇÃO EXPLÍCITA DOS COMPONENTES (SOLUÇÃO DO ERRO) ---
import { 
  BNavbar, 
  BNavbarBrand, 
  BNavbarToggle, 
  BCollapse, 
  BNavbarNav, 
  BNavItem, 
  BNavForm, 
  BFormInput, 
  BButton, 
  BNavItemDropdown, 
  BDropdownItem, 
  BContainer
} from 'bootstrap-vue-next';


const router = useRouter();
const route = useRoute();
// Verifica autenticação (se o módulo existir)
const isLoggedIn = ref(false);

const checkLoginStatus = () => {
  isLoggedIn.value = isAuthenticated();
};

onMounted(() => {
  checkLoginStatus();
});

watch(route, () => {
  checkLoginStatus();
});


const handleLogout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
  background-color: #9e6333;
  color: #fffbf2;
}

</style>