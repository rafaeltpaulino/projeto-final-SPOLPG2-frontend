import { createRouter, createWebHistory } from 'vue-router';

import Login from '../components/Login.vue';
import Discos from '../components/Discos.vue';
import Register from '../components/Register.vue';
import Colection from '../components/Colection.vue';

const routes = [
    { path: '/', redirect: '/discos' },
    { path: '/login', name: 'Login', component: Login, meta: { requiresAuth: false } },
    { path: '/register', name: 'Register', component: Register, meta: { requiresAuth: false } },
    { path: '/discos', name: 'Discos', component: Discos, meta: { requiresAuth: false} },
    { path: '/colection', name: 'Colection', component: Colection, meta: { requiresAuth: true } },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Nota: O guarda de rotas (beforeEach) está ausente para simplificar, 
// mas é necessário para a segurança!

export default router;