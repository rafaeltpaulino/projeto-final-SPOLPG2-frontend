<template>
  <div class="app-container">
  <BNavbar
  v-b-color-mode="'Secondary'"
  toggleable="lg"
  variant="light"
>
  <BNavbarBrand to="/discos">Vinyl</BNavbarBrand>
    <BNavbarNav>
      <BNavItem to="/discos">Discos</BNavItem>
    </BNavbarNav>

  <BNavbarToggle target="nav-collapse" />
  <BCollapse
    id="nav-collapse"
    is-nav
  >
    <BNavbarNav class="ms-auto mb-2 mb-lg-0">
      <BNavItemDropdown right>
        <template #button-content>
          <em>Usuário</em>
        </template>
        <BDropdownItem to="/register" v-if="!isLoggedIn">Registrar-se</BDropdownItem>
        <BDropdownItem to="/login" v-if="!isLoggedIn">Perfil</BDropdownItem>
        <BDropdownItem to="/discos">Sair</BDropdownItem>
      </BNavItemDropdown>
    </BNavbarNav>

    <BNavForm class="d-flex">
      <BFormInput
        class="me-2"
        placeholder="Procurar"
      />
      <BButton
        type="submit"
        variant="warning"
        >Buscar</BButton
      >
    </BNavForm>
  </BCollapse>
</BNavbar>


    <BContainer class="mt-0">
      <router-view></router-view>
    </BContainer> 



  </div>
</template>


<script setup>
import { ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import { removeToken, isAuthenticated } from './auth/auth'; 


// --- IMPORTAÇÃO EXPLÍCITA DOS COMPONENTES ---
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
// Verifica autenticação (se o módulo existir)
const isLoggedIn = ref(isAuthenticated ? isAuthenticated() : false);

watchEffect(() => {
    if (isAuthenticated) {
        isLoggedIn.value = isAuthenticated();
    }
});

const handleLogout = () => {
    if (removeToken) removeToken();
    isLoggedIn.value = false;
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