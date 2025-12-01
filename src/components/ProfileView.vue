<template>
  <div class="profile-view mb-5">
    
    <div v-if="loadingUser" class="text-center my-5">
      <BSpinner variant="warning" />
    </div>

    <div v-else>
      <BCard class="border-0 shadow-sm mt-4 mb-4 profile-header">
        <div class="d-flex align-items-center flex-column flex-md-row gap-4">
          
          <div class="avatar-circle">
            {{ user.firstName?.charAt(0) || 'U' }}
          </div>

          <div class="flex-grow-1 text-center text-md-start">
            <h2 class="fw-bold mb-1">{{ user.firstName }} {{ user.lastName }}</h2>
            <p class="text-muted mb-2">@{{ user.username }}</p>
            
            <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-3">
              <span class="badge bg-light text-dark border">
                <i class="bi bi-geo-alt-fill text-danger"></i> {{ user.countryName || 'País não informado' }}
              </span>
              <span class="badge bg-light text-dark border">
                <i class="bi bi-calendar"></i> Membro desde {{ formatDate(user.createdAt) }}
              </span>
            </div>

            <p class="user-bio">{{ user.bio || 'Nenhuma biografia informada.' }}</p>
          </div>

          <div v-if="isMyProfile">
            <BButton variant="outline-dark" @click="openEditModal">
              <i class="bi bi-pencil"></i> Editar Perfil
            </BButton>
          </div>
        </div>
      </BCard>

      <BTabs
        active-nav-item-class="font-weight-bold text-warning bg-dark"
        active-tab-class="font-weight-bold text-dark"
        content-class="mt-4"
        fill pills
        >
        
        <BTab title="Minha Coleção" active>
          <div v-if="loadingCollection" class="text-center py-4">Carregando discos...</div>
          <div v-else-if="!collection || collection.length === 0" class="text-center text-muted py-5">
            <i class="bi bi-disc fs-1"></i>
            <p>A coleção está vazia.</p>
          </div>
          <BRow v-else>
            <BCol v-for="item in collection" :key="item.id" cols="6" md="4" lg="3" class="mb-4">
              <BCard no-body class="h-100 shadow-sm border-0">
                <div class="position-relative">
                  <img :src="item.coverImageUrl || '/images/default-cover.png'" class="card-img-top" style="height: 150px; object-fit: cover;">
                  <span class="badge bg-warning text-dark position-absolute top-0 end-0 m-1">{{ item.mediaCondition }}</span>
                </div>
                <div class="card-body p-2 text-center">
                  <small class="fw-bold d-block text-truncate">{{ item.title }}</small>
                  <small class="text-muted d-block text-truncate">{{ item.artistName }}</small>
                </div>
              </BCard>
            </BCol>
          </BRow>
        </BTab>

        <BTab title="Minhas Avaliações">
          <div v-if="loadingReviews" class="text-center py-4">Carregando reviews...</div>
          <div v-else-if="!reviews || reviews.length === 0" class="text-center text-muted py-5">
            <p>Nenhuma avaliação feita ainda.</p>
          </div>
          <div v-else class="reviews-list">
            <BCard v-for="review in reviews" :key="review.id" class="mb-3 border-0 shadow-sm">
              <div class="d-flex gap-3">
                <img :src="review.masterCoverUrl || '/images/default-cover.png'" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                <div>
                  <h6 class="fw-bold mb-1">{{ review.masterTitle }}</h6>
                  <div class="text-warning mb-1">
                    <span v-for="n in 5" :key="n">
                      <i :class="n <= review.rating ? 'bi bi-star-fill' : 'bi bi-star'"></i>
                    </span>
                  </div>
                  <p class="mb-0 small text-muted">"{{ review.comment }}"</p>
                </div>
              </div>
            </BCard>
          </div>
        </BTab>

      </BTabs>
    </div>

    <BModal v-model="showEditModal" title="Editar Perfil" hide-footer>
      <form @submit.prevent="updateProfile">
        <div class="mb-3">
          <label class="form-label">Primeiro Nome</label>
          <input v-model="editForm.firstName" class="form-control" required minlength="2">
        </div>
        <div class="mb-3">
          <label class="form-label">Sobrenome</label>
          <input v-model="editForm.lastName" class="form-control" required minlength="2">
        </div>
        <div class="mb-3">
          <label class="form-label">Biografia</label>
          <textarea v-model="editForm.bio" class="form-control" rows="3"></textarea>
        </div>
        
        <div v-if="errorMessage" class="alert alert-danger p-2 text-center small">
            {{ errorMessage }}
        </div>

        <BButton type="submit" variant="warning" class="w-100" :disabled="saving">
          {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
        </BButton>
      </form>
    </BModal>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';
import { 
  BCard, BButton, BTabs, BTab, BRow, BCol, BSpinner, BModal 
} from 'bootstrap-vue-next';

const route = useRoute();
const userId = route.params.id; 

const user = ref({});
const collection = ref([]);
const reviews = ref([]);
const isMyProfile = ref(false);

const showEditModal = ref(false);
const saving = ref(false);
const errorMessage = ref('');

// CORREÇÃO: Usando 'bio' em vez de 'about'
const editForm = reactive({ 
    firstName: '', 
    lastName: '', 
    bio: '' 
});

const loadingUser = ref(true);
const loadingCollection = ref(true);
const loadingReviews = ref(true);

const fetchData = async () => {
  try {
    const userRes = await api.get(`/users/${userId}`);
    user.value = userRes.data;
    
    // Verifica se é o dono do perfil comparando com o ID salvo no login
    const myId = localStorage.getItem('userId');
    // Converte ambos para string para evitar erros de tipo (number vs string)
    isMyProfile.value = String(myId) === String(userId); 

  } catch (e) {
    console.error("Erro ao carregar usuário", e);
  } finally {
    loadingUser.value = false;
  }

  // Carrega Coleção
  try {
    const colRes = await api.get(`/collection/user/${userId}?size=8`);
    collection.value = colRes.data.content || [];
  } catch (e) {
    console.error("Erro coleção", e);
  } finally {
    loadingCollection.value = false;
  }

  // Carrega Reviews
  try {
    const revRes = await api.get(`/reviews/user/${userId}?size=10`);
    reviews.value = revRes.data.content || [];
  } catch (e) {
    console.error("Erro reviews", e);
  } finally {
    loadingReviews.value = false;
  }
};

const openEditModal = () => {
    // Preenche o formulário com os dados atuais ANTES de abrir
    editForm.firstName = user.value.firstName;
    editForm.lastName = user.value.lastName;
    editForm.bio = user.value.bio; // CORREÇÃO: bio
    errorMessage.value = '';
    showEditModal.value = true;
};

const updateProfile = async () => {
  saving.value = true;
  errorMessage.value = '';
  
  try {
    // Envia os dados corrigidos para o backend
    await api.patch(`/users/${userId}`, editForm); // Usar PATCH ou PUT conforme seu controller
    
    // Atualiza a tela sem precisar recarregar
    user.value.firstName = editForm.firstName;
    user.value.lastName = editForm.lastName;
    user.value.bio = editForm.bio;
    
    showEditModal.value = false;
    alert('Perfil atualizado com sucesso!');
    
  } catch (e) {
    console.error(e);
    // Tratamento de erro detalhado para você ver o que está acontecendo
    if (e.response && e.response.data) {
        // Se o backend mandou um erro de validação (ex: nome curto)
        if (e.response.data.errors) {
             errorMessage.value = Object.values(e.response.data.errors).join(', ');
        } else {
             // Outro erro (ex: 403 Forbidden)
             errorMessage.value = e.response.data.message || 'Erro ao atualizar dados.';
        }
    } else {
        errorMessage.value = 'Erro de conexão com o servidor.';
    }
  } finally {
    saving.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.avatar-circle {
  width: 100px;
  height: 100px;
  background-color: #2c3e50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
}
.profile-header {
  background: linear-gradient(to right, #ffffff, #f8f9fa);
}
.user-bio {
  max-width: 600px;
  font-style: italic;
}
</style>