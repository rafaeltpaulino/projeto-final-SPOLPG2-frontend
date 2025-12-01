import { createRouter, createWebHistory } from 'vue-router';

import Login from '../components/Login.vue';
import Dashboard from '../components/Discos.vue';
import Register from '../components/Register.vue';
import ProfileView from '../components/ProfileView.vue';
import MasterDetail from '../components/MasterDetail.vue';
import ReleaseCreate from '../components/ReleaseCreate.vue';
import ReleaseDetail from '../components/ReleaseDetail.vue';
import AdminDashboard from '../components/AdminDashboard.vue';
import { isAuthenticated } from '../auth/auth';


const routes = [
    { path: '/', redirect: '/Discos' },
    { path: '/login', name: 'Login', component: Login, meta: { requiresAuth: false } },
    { path: '/register', name: 'Register', component: Register, meta: { requiresAuth: false } },
    { path: '/Discos', name: 'Discos', component: Dashboard, meta: { requiresAuth: false } },
    { path: '/profile/:id', component: ProfileView, meta: { requiresAuth: true }},
    {
      path: '/profile',
      name: 'profile-redirect',
      redirect: () => {
          const myId = localStorage.getItem('userId');
          
          // Se myId for null, undefined ou string "undefined", manda pro login
          if (myId && myId !== 'undefined') {
            return `/profile/${myId}`;
          } else {
            return '/login'; 
          }
      }
    },
    {path: '/masters/:id', name: 'master-detail', component: MasterDetail},
    {path: '/releases/new', name: 'release-create', component: ReleaseCreate, meta: { requiresAuth: true }}, // Protegido!},
    {path: '/releases/:id', name: 'release-detail', component: ReleaseDetail},
    {
    path: '/admin',
    component: AdminDashboard,
    meta: { 
      requiresAuth: true,
      adminOnly: true // Flag nova para verificar se é admin
    }
  },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
  // Se a rota exige autenticação E o usuário não está logado
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login');
  } 
  next();
});

export default router;