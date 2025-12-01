<template>
  <div class="catalogo-view">
    
    <div class="full-width-carousel mb-5">
      <BCarousel controls indicators :interval="5000" fade>
          <BCarouselSlide img-src="/images/passante1.png" />
          <BCarouselSlide img-src="/images/passante2.png" />
      </BCarousel>
    </div>

    <BContainer>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold">Explorar Catálogo</h2>
        
        <div class="d-flex gap-2">
           <BFormInput 
             v-model="searchQuery" 
             placeholder="Buscar artista ou álbum..." 
             size="sm" 
             @keyup.enter="fetchMasters"
           />
           <BButton variant="dark" size="sm" @click="fetchMasters">
             <i class="bi bi-search"></i>
           </BButton>
        </div>
      </div>

      <div v-if="loading" class="text-center my-5 py-5">
        <BSpinner variant="primary" label="Carregando catálogo..."></BSpinner>
      </div>

      <BAlert v-if="error" :model-value="!!error" variant="danger" dismissible>
        {{ error }}
      </BAlert>

      <BRow v-if="!loading && masters.length > 0">
        <BCol 
          v-for="master in masters" 
          :key="master.id" 
          cols="12" md="6" lg="4" xl="3"
          class="mb-4"
        >
          <BCard 
            no-body
            class="h-100 shadow-sm disco-card border-0"
          >
            <div class="card-img-wrapper">
              <img 
                :src="master.coverImageUrl || '/images/default-cover.png'" 
                class="card-img-top" 
                alt="Capa"
                @error="$event.target.src='/images/default-cover.png'"
              />
              <span v-if="master.averageRating > 0" class="badge bg-success position-absolute top-0 end-0 m-2">
                ★ {{ master.averageRating.toFixed(1) }}
              </span>
            </div>

            <div class="card-body d-flex flex-column">
              <h5 class="card-title text-truncate fw-bold" :title="master.title">
                {{ master.title }}
              </h5>
              
              <h6 class="card-subtitle mb-2 text-muted text-truncate">
                {{ formatArtists(master.artists) }}
              </h6>
              
              <div class="mt-auto pt-3">
                <p class="card-text small mb-1 text-muted">
                  Lançado em: {{ master.releaseYear }}
                </p>
                <div class="d-flex gap-2 mt-2">
                  <BButton variant="outline-dark" size="sm" class="flex-grow-1" :to="`/masters/${master.id}`">
                    Ver Detalhes
                  </BButton>
                  </div>
              </div>
            </div>
          </BCard>
        </BCol>
      </BRow>

      <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
        <BPagination
          v-model="currentPage"
          :total-rows="totalElements"
          :per-page="pageSize"
          @update:model-value="fetchMasters"
        />
      </div>

    </BContainer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api'; 
import { 
  BContainer, BRow, BCol, BCard, BButton, BSpinner, BAlert, BCarousel, BCarouselSlide, BFormInput, BPagination
} from 'bootstrap-vue-next';

const masters = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');

// Controle de Paginação
const currentPage = ref(1); // O Bootstrap usa base 1
const pageSize = ref(12);
const totalElements = ref(0);
const totalPages = ref(0);

// Helper para formatar lista de artistas (['Pink Floyd', 'Outro']) -> "Pink Floyd, Outro"
const formatArtists = (artistsList) => {
  if (!artistsList || artistsList.length === 0) return 'Artista Desconhecido';
  return artistsList.join(', ');
};

const fetchMasters = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Endpoint correto: GET /masters (Lista Obras)
    // O Spring Boot usa base 0 para página, então subtraímos 1
    const response = await api.get('/masters', {
      params: {
        page: currentPage.value - 1,
        size: pageSize.value,
        title: searchQuery.value // Se o backend suportar filtro por título
      }
    });

    // O backend retorna Page<MasterResponseDTO>
    masters.value = response.data.content; 
    totalElements.value = response.data.totalElements;
    totalPages.value = response.data.totalPages;

  } catch (err) {
    console.error("Erro:", err);
    error.value = "Erro ao carregar o catálogo.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchMasters();
});
</script>

<style scoped>
.catalogo-view {
  background-color: #fff;
  min-height: 100vh;
  padding-bottom: 50px;
}

.full-width-carousel {
  width: 100%;
  max-height: 350px; /* Banner um pouco maior */
  overflow: hidden;
}

.card-img-wrapper {
  position: relative;
  height: 250px;
  background-color: #eee;
  overflow: hidden;
}

.card-img-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.disco-card:hover .card-img-top {
  transform: scale(1.05); /* Zoom suave na imagem ao passar o mouse */
}
</style>