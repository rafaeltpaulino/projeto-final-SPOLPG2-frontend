<template>
  <div class="discos-view">
    <div class="full-width-carousel mb-4">
      <BCarousel controls indicators :interval="3000" fade>
          <BCarouselSlide img-src="/images/passante1.png" />
          <BCarouselSlide img-src="/images/passante2.png" />
          <BCarouselSlide img-src="/images/passante3.png" />
      </BCarousel>
    </div>
    <h2 class="mb-4">Minha Coleção</h2>

    <!-- Estado de Carregamento -->
    <div v-if="loading" class="text-center my-5">
      <BSpinner variant="warning" label="Carregando..."></BSpinner>
    </div>

    <!-- Mensagem de Erro (se houver) -->
    <BAlert v-if="error" :model-value="!!error" variant="warning" dismissible>
      {{ error }}
    </BAlert>

    <!-- GRID DE DISCOS -->
    <BRow v-if="!loading">
      <BCol 
        v-for="disco in discos" 
        :key="disco.id" 
        cols="12" md="6" lg="4" xl="3"
        class="mb-4"
      >
        <!-- BCard é o "container" visual do disco -->
        <BCard 
          :title="disco.titulo" 
          :sub-title="disco.artista"
          img-src="https://placehold.co/600x400/2c3e50/ffffff?text=Capa"
          img-alt="Capa do Disco"
          img-top
          class="h-100 shadow-sm"
        >
          <BCardText>
            <strong>Ano:</strong> {{ disco.ano }}
            <br>
            <strong>Gênero:</strong> {{ disco.genero || 'Rock' }}
          </BCardText>

          <template #footer>
            <BButton variant="outline-warning" size="sm" class="w-100">Ver Detalhes</BButton>
          </template>
        </BCard>
      </BCol>

    </BRow>

    <!-- Estado Vazio -->
    <div v-if="!loading && discos.length === 0" class="text-center text-muted">
      <p>Nenhum disco encontrado.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api'; // Seu serviço de API
import { 
  BRow, BCol, BCard, BCardText, BButton, BSpinner, BAlert, BCarousel, BCarouselSlide
} from 'bootstrap-vue-next';

const discos = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchDiscos = async () => {
  try {
    // Tenta buscar do seu backend Spring
    const response = await api.get('/discos'); 
    discos.value = response.data;
  } catch (err) {
    console.error("Erro na API:", err);
    error.value = "Não foi possível conectar ao banco. Exibindo dados de exemplo.";
    
    // DADOS DE EXEMPLO (MOCK) PARA VISUALIZAR O LAYOUT
    discos.value = [
      { id: 1, titulo: 'The Dark Side of the Moon', artista: 'Pink Floyd', ano: 1973, genero: 'Progressive Rock' },
      { id: 2, titulo: 'Thriller', artista: 'Michael Jackson', ano: 1982, genero: 'Pop' },
      { id: 3, titulo: 'Abbey Road', artista: 'The Beatles', ano: 1969, genero: 'Rock' },
      { id: 4, titulo: 'Back in Black', artista: 'AC/DC', ano: 1980, genero: 'Hard Rock' },
      { id: 5, titulo: 'Rumours', artista: 'Fleetwood Mac', ano: 1977, genero: 'Soft Rock' },
    ];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDiscos();
});
</script>


<style scoped>
.discos-view {
  padding-bottom: 50px;
}

.full-width-carousel {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  max-width: 100vw;
}

/* Efeito de hover suave nos cards */
.card {
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-5px);
}
</style>