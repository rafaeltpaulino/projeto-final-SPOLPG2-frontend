<template>
  <div class="master-detail-view mt-4 mb-5">
    
    <div v-if="loading" class="text-center my-5 py-5">
      <BSpinner variant="warning" label="Carregando..." />
    </div>

    <BContainer v-else-if="error">
      <BAlert :model-value="true" variant="danger">{{ error }}</BAlert>
      <BButton to="/masters" variant="outline-dark">Voltar ao Catálogo</BButton>
    </BContainer>

    <BContainer v-else>
      
      <BCard class="border-0 shadow-sm mb-4 overflow-hidden">
        <BRow class="g-0">
          <BCol md="4" lg="3">
            <div class="cover-wrapper">
              <img 
                :src="master.coverImageUrl || '/images/default-cover.png'" 
                class="img-fluid rounded-start h-100 object-fit-cover" 
                alt="Capa"
                @error="$event.target.src='/images/default-cover.png'"
              />
            </div>
          </BCol>

          <BCol md="8" lg="9">
            <div class="card-body h-100 d-flex flex-column">
              <div>
                <h6 class="text-uppercase text-muted ls-1 mb-1">{{ master.releaseYear }} • Álbum</h6>
                <h1 class="display-5 fw-bold mb-0">{{ master.title }}</h1>
                <h3 class="text-warning fw-semibold">{{ formatList(master.artists) }}</h3>
              </div>
              
              <div class="text-center bg-light p-2 rounded border">
                  <div class="fw-bold  fs-5 text-warning">
                    ★ {{ master.averageRating ? master.averageRating.toFixed(1) : '-' }}
                  </div>
                  <small class="text-muted d-block" style="font-size: 0.7rem;">MÉDIA</small>
                </div>
              
              <div class="mt-3 mb-3">
                <span v-for="genre in master.genres" :key="genre" class="badge bg-dark me-1">{{ genre }}</span>
              </div>

              <p class="card-text text-muted flex-grow-1 desc-text">
                {{ master.description || 'Sem descrição disponível.' }}
              </p>

              <div class="mt-auto d-flex gap-2">
                <BButton variant="outline-dark" @click="scrollToReviews">
                  <i class="bi bi-star"></i> Ver Avaliações
                </BButton>
              </div>
            </div>
          </BCol>
        </BRow>
      </BCard>

      <BTabs 
      active-nav-item-class="font-weight-bold text-warning bg-dark"
        active-tab-class="font-weight-bold text-dark"
        content-class="mt-3" fill pills
        > 
        
        <BTab title="Faixas">
           <div class="text-center py-5 text-muted" v-if="!master.tracks || master.tracks.length === 0">Tracklist indisponível.</div>
           <table class="table table-hover" v-else>
               <tbody>
                   <tr v-for="track in master.tracks" :key="track.position">
                       <td class="text-muted fw-bold">{{ track.position }}</td>
                       <td>{{ track.title }}</td>
                       <td class="text-end">{{ formatDuration(track.duration) }}</td>
                   </tr>
               </tbody>
           </table>
        </BTab>

        <BTab title="Edições">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="text-muted" v-if="!master.releases || master.releases.length === 0">
            Nenhuma edição cadastrada.
        </span>
        <span v-else class="fw-bold">Versões conhecidas</span>
        
        <BButton v-if="isLoggedIn" variant="success" size="sm" @click="openReleaseModal">
            <i class="bi bi-plus-circle"></i> Adicionar Edição
        </BButton>
    </div>

    <BRow v-if="master.releases?.length">
        <BCol v-for="rel in master.releases" :key="rel.id" md="6" class="mb-3">
            <div class="border p-2 rounded bg-white shadow-sm h-100 d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start">
                    <h6 class="mb-0 fw-bold text-warning text-truncate pe-2" :title="rel.title">
                        {{ rel.title }}
                    </h6>
                    <span class="badge bg-light text-dark border">{{ rel.format }}</span>
                </div>
                
                <small class="text-muted d-block mt-1 mb-2">
                    {{ rel.country || 'País desc.' }} • {{ formatDate(rel.releaseDate) }}
                </small>
                
                <div class="mt-auto d-flex justify-content-between align-items-end">
                    <small class="text-monospace text-secondary" v-if="rel.barcode">
                        <i class="bi bi-upc"></i> {{ rel.barcode }}
                    </small>
                    <small v-else></small> <router-link :to="`/releases/${rel.id}`" class="btn btn-sm btn-outline-warning">
                        Detalhes
                    </router-link>
                </div>
            </div>
        </BCol>
    </BRow>
</BTab>

        <BTab title="Avaliações">
          <div ref="reviewsSection">
            <BCard class="mb-4 border-0 shadow-sm bg-light" v-if="isLoggedIn && (isEditing || !userReview)">
              <h5 class="fw-bold mb-3">{{ isEditing ? 'Editar sua avaliação' : 'Deixe sua avaliação' }}</h5>
              <form @submit.prevent="submitReview">
                <div class="mb-3">
                  <label class="form-label d-block">Sua Nota:</label>
                  <div class="fs-3 text-warning" style="cursor: pointer;">
                    <span v-for="n in 5" :key="n" @click="reviewForm.rating = n" @mouseenter="hoverRating = n" @mouseleave="hoverRating = 0">
                      <i :class="(hoverRating || reviewForm.rating) >= n ? 'bi bi-star-fill' : 'bi bi-star'"></i>
                    </span>
                    <span class="ms-2 fs-6 text-dark fw-bold" v-if="reviewForm.rating > 0">{{ reviewForm.rating }}/5</span>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Comentário:</label>
                  <textarea v-model="reviewForm.comment" class="form-control" rows="3"></textarea>
                </div>
                <div class="d-flex gap-2">
                  <BButton type="submit" variant="warning" :disabled="submitting">
                    {{ submitting ? 'Enviando...' : (isEditing ? 'Atualizar' : 'Publicar') }}
                  </BButton>
                  <BButton v-if="isEditing" variant="outline-secondary" @click="cancelEdit">Cancelar</BButton>
                </div>
              </form>
            </BCard>

            <BCard v-else-if="isLoggedIn && userReview" class="mb-4 border-warning bg-white shadow-sm">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="fw-bold text-dark mb-1">Sua Avaliação</h6>
                        <div class="text-warning mb-2">
                            <span v-for="n in 5" :key="n"><i :class="n <= userReview.rating ? 'bi bi-star-fill' : 'bi bi-star'"></i></span>
                        </div>
                        <p class="mb-0">{{ userReview.comment }}</p>
                    </div>
                    <div class="d-flex gap-2">
                        <BButton size="sm" variant="outline-primary" @click="startEdit"><i class="bi bi-pencil"></i></BButton>
                        <BButton size="sm" variant="outline-danger" @click="deleteReview"><i class="bi bi-trash"></i></BButton>
                    </div>
                </div>
            </BCard>

            <div v-if="otherReviews.length === 0 && !userReview" class="text-center text-muted py-5">
              <p>Ninguém avaliou este álbum ainda.</p>
            </div>
            <div v-else>
              <div v-for="review in otherReviews" :key="review.id" class="mb-3 border-bottom pb-3">
                <div class="d-flex justify-content-between">
                  <h6 class="fw-bold mb-1">@{{ review.username }}</h6>
                  <small class="text-muted">{{ formatDate(review.createdAt) }}</small>
                </div>
                <div class="text-warning mb-2">
                  <span v-for="n in 5" :key="n">
                    <i :class="n <= review.rating ? 'bi bi-star-fill' : 'bi bi-star'"></i>
                  </span>
                </div>
                <p class="mb-0 text-dark">{{ review.comment }}</p>
              </div>
            </div>
          </div>
        </BTab>

      </BTabs>

    </BContainer>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';
import { isAuthenticated } from '../auth/auth';
import { 
  BContainer, BRow, BCol, BCard, BSpinner, BAlert, BButton, BTabs, BTab
} from 'bootstrap-vue-next';

const route = useRoute();
const masterId = route.params.id;

// Dados
const master = ref({});
const allReviews = ref([]);
const loading = ref(true);
const activeTab = ref(0);
const reviewsSection = ref(null); // Referência para o scroll

// Estado do Usuário
const isLoggedIn = ref(isAuthenticated());
const myUsername = localStorage.getItem('username') || ''; // Precisa salvar isso no login!

// Lógica de Reviews do Usuário
const userReview = computed(() => {
  if (!isLoggedIn.value) return null;
  // Procura na lista se tem um review com meu username
  // NOTA: Se o backend retornar userId no DTO de review, use userId para comparar, é mais seguro!
  return allReviews.value.find(r => r.username === myUsername);
});

const otherReviews = computed(() => {
  if (!userReview.value) return allReviews.value;
  return allReviews.value.filter(r => r.id !== userReview.value.id);
});

// Formulário
const isEditing = ref(false);
const submitting = ref(false);
const hoverRating = ref(0);
const reviewForm = reactive({ rating: 0, comment: '' });

const showReleaseModal = ref(false);
const countries = ref([]);
const labels = ref([]);
const submitting2 = ref(false);

// Formulário reativo
const releaseForm = reactive({
    title: '',
    format: 'LP',
    releaseDate: '',
    countryId: null,
    barcode: '',
    tracks: []
});

// Formulário auxiliar para a label (1:N simplificado para UI)
const releaseLabelForm = reactive({
    labelId: null,
    catalogNumber: '',
    role: 'Main Label'
});

// --- FUNÇÕES AUXILIARES ---

// Carrega listas para os dropdowns
const fetchAuxData = async () => {
    try {
        // Se já carregou antes, não carrega de novo
        if (countries.value.length > 0) return;

        // Chama seus endpoints de lista (GET /countries, GET /labels)
        // Dica: Crie endpoint GET /labels/all no backend se não tiver, ou use paginação grande
        const [resCountries, resLabels] = await Promise.all([
            api.get('/countries'), // Supondo que retorne lista
            api.get('/labels')     // Supondo que retorne lista ou Page
        ]);

        countries.value = resCountries.data; 
        
        // Se labels for paginado, pega o content
        labels.value = Array.isArray(resLabels.data) ? resLabels.data : resLabels.data.content;

    } catch (e) {
        console.error("Erro ao carregar países/labels", e);
    }
};



// --- AÇÕES ---

const fetchData = async () => {
  try {
    loading.value = true;
    const masterRes = await api.get(`/masters/${masterId}`);
    master.value = masterRes.data;
    await fetchReviews();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchReviews = async () => {
  try {
    const res = await api.get(`/reviews/master/${masterId}?size=50`);
    allReviews.value = res.data.content;
  } catch (e) { console.error(e); }
};

// Scroll Corrigido
const scrollToReviews = async () => {
  activeTab.value = 2; // Muda para a aba de reviews
  await nextTick(); // Espera o Vue renderizar a aba
  if (reviewsSection.value) {
    reviewsSection.value.scrollIntoView({ behavior: 'smooth' });
  }
};

// --- CRUD REVIEW ---

const submitReview = async () => {
  if (reviewForm.rating === 0) return alert("Selecione uma nota.");
  
  submitting.value = true;
  try {
    if (isEditing.value && userReview.value) {
      // EDITAR (PUT)
      await api.patch(`/reviews/${userReview.value.id}`, {
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      alert('Avaliação atualizada!');
    } else {
      // CRIAR (POST)
      await api.post('/reviews', {
        masterId: masterId,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      alert('Avaliação enviada!');
    }
    
    // Reset e Recarrega
    isEditing.value = false;
    await fetchReviews();
    
  } catch (e) {
    alert("Erro ao salvar avaliação.");
  } finally {
    submitting.value = false;
  }
};

const startEdit = () => {
  // Preenche o formulário com os dados atuais
  reviewForm.rating = userReview.value.rating;
  reviewForm.comment = userReview.value.comment;
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  reviewForm.rating = 0;
  reviewForm.comment = '';
};

const deleteReview = async () => {
  if (!confirm("Tem certeza que deseja excluir sua avaliação?")) return;
  try {
    await api.delete(`/reviews/${userReview.value.id}`);
    await fetchReviews();
    alert("Avaliação removida.");
  } catch (e) {
    alert("Erro ao excluir.");
  }
};

// --- HELPERS ---
const formatDuration = (s) => s ? `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}` : '--:--';
const formatList = (l) => l?.join(', ') || '';
const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '';

onMounted(fetchData);
</script>