<template>
  <div class="release-detail-view mb-5">
    
    <div v-if="loading" class="text-center my-5 py-5">
      <BSpinner variant="warning" label="Carregando..." />
    </div>

    <BContainer v-else-if="error">
      <BAlert :model-value="true" variant="danger">{{ error }}</BAlert>
      <BButton @click="$router.go(-1)" variant="outline-dark">Voltar</BButton>
    </BContainer>

    <BContainer v-else>
      
      <BCard class="border-0 shadow-sm mb-4">
        <BRow class="align-items-center">
          <BCol md="3" class="text-center mb-3 mb-md-0">
            <img 
              :src="release.master?.coverImageUrl || '/images/default-cover.png'" 
              class="img-fluid rounded shadow-sm" 
              style="max-height: 250px;"
              @error="$event.target.src='/images/default-cover.png'"
            />
          </BCol>
          
          <BCol md="9">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-uppercase text-muted ls-1 mb-1">
                  {{ release.master?.releaseYear }} • {{ release.format }}
                </h6>
                <h2 class="fw-bold mb-0">{{ release.title }}</h2>
                <h4 class="text-warning fw-normal">
                  <router-link :to="`/masters/${release.master?.id}`" class="text-decoration-none">
                    {{ release.master?.title }}
                  </router-link>
                </h4>
              </div>
              
              <div v-if="isLoggedIn">
                <BButton 
                  v-if="!isInCollection" 
                  variant="warning" 
                  size="lg" 
                  @click="openCollectionModal"
                >
                  <i class="bi bi-folder-plus"></i> Eu tenho!
                </BButton>
                <BButton v-else variant="outline-warning" disabled>
                  <i class="bi bi-check-circle-fill"></i> Na Coleção
                </BButton>
              </div>
            </div>

            <hr class="my-3">

            <BRow class="text-muted small">
              <BCol cols="6" md="3" class="mb-2">
                <strong>País:</strong><br> {{ release.countryName || 'Desconhecido' }}
              </BCol>
              <BCol cols="6" md="3" class="mb-2">
                <strong>Data:</strong><br> {{ formatDate(release.releaseDate) }}
              </BCol>
              <BCol cols="6" md="3" class="mb-2">
                <strong>Gravadora:</strong><br> 
                <span v-for="label in release.labels" :key="label.id" class="d-block">
                  {{ label.labelName }} ({{ label.catalogNumber }})
                </span>
              </BCol>
              <BCol cols="6" md="3" class="mb-2">
                <strong>Código de Barras:</strong><br> {{ release.barcode || 'N/A' }}
              </BCol>
            </BRow>
          </BCol>
        </BRow>
      </BCard>

      <BCard class="border-0 shadow-sm">
        <h5 class="fw-bold mb-3">Tracklist</h5>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th width="10%">Pos</th>
                <th>Título</th>
                <th width="10%" class="text-end">Duração</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="track in release.tracks" :key="track.id">
                <td class="fw-bold text-muted">{{ track.position }}</td>
                <td>{{ track.title }}</td>
                <td class="text-end text-monospace">{{ formatDuration(track.durationSeconds) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </BCard>

    </BContainer>

    <BModal v-model="showCollectionModal" title="Adicionar à Coleção" hide-footer>
      <form @submit.prevent="addToCollection">
        
        <p class="text-muted mb-3">
          Você está adicionando: <strong>{{ release.title }}</strong>
        </p>

        <div class="mb-3">
          <label class="form-label">Data de Aquisição</label>
          <input type="date" v-model="collectionForm.acquiredDate" class="form-control" required>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Estado da Mídia</label>
            <select v-model="collectionForm.mediaCondition" class="form-select" required>
              <option value="MINT">Mint (M) - Perfeito</option>
              <option value="NEAR_MINT">Near Mint (NM)</option>
              <option value="VERY_GOOD_PLUS">Very Good Plus (VG+)</option>
              <option value="VERY_GOOD">Very Good (VG)</option>
              <option value="GOOD">Good (G)</option>
              <option value="POOR">Poor (P)</option>
            </select>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Estado da Capa</label>
            <select v-model="collectionForm.sleeveCondition" class="form-select" required>
              <option value="MINT">Mint (M)</option>
              <option value="NEAR_MINT">Near Mint (NM)</option>
              <option value="VERY_GOOD_PLUS">Very Good Plus (VG+)</option>
              <option value="VERY_GOOD">Very Good (VG)</option>
              <option value="GOOD">Good (G)</option>
              <option value="POOR">Poor (P)</option>
            </select>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Notas Privadas</label>
          <textarea v-model="collectionForm.privateNotes" class="form-control" rows="2" placeholder="Ex: Comprei no sebo, paguei R$50"></textarea>
        </div>

        <BButton type="submit" variant="success" class="w-100" :disabled="submitting">
          {{ submitting ? 'Salvando...' : 'Confirmar' }}
        </BButton>
      </form>
    </BModal>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import { isAuthenticated } from '../auth/auth';
import { 
  BContainer, BRow, BCol, BCard, BSpinner, BAlert, BButton, BModal 
} from 'bootstrap-vue-next';

const route = useRoute();
const router = useRouter();
const releaseId = route.params.id;

// Estado
const release = ref({});
const loading = ref(true);
const error = ref(null);
const isLoggedIn = ref(isAuthenticated());
const isInCollection = ref(false); // TODO: Verificar se já tem (opcional)

// Modal
const showCollectionModal = ref(false);
const submitting = ref(false);
const collectionForm = reactive({
  acquiredDate: new Date().toISOString().split('T')[0], // Hoje
  mediaCondition: 'VERY_GOOD_PLUS',
  sleeveCondition: 'VERY_GOOD_PLUS',
  privateNotes: ''
});

// Ações
const fetchRelease = async () => {
  try {
    loading.value = true;
    const res = await api.get(`/releases/${releaseId}`);
    release.value = res.data;
    
    // (Opcional) Poderíamos checar se já está na coleção buscando a lista do usuário
    // Mas para simplificar, deixamos o botão sempre ativo
  } catch (err) {
    console.error(err);
    error.value = "Edição não encontrada.";
  } finally {
    loading.value = false;
  }
};

const openCollectionModal = () => {
  showCollectionModal.value = true;
};

const addToCollection = async () => {
  submitting.value = true;
  try {
    // Payload conforme InsertIntoCollectionRequestDTO
    const payload = {
      releaseId: releaseId,
      acquiredDate: collectionForm.acquiredDate,
      mediaCondition: collectionForm.mediaCondition,
      sleeveCondition: collectionForm.sleeveCondition,
      privateNotes: collectionForm.privateNotes
    };

    await api.put('/collection', payload);
    
    alert("Adicionado à sua coleção!");
    showCollectionModal.value = false;
    isInCollection.value = true; // Muda estado do botão visualmente
    
    // Opcional: Redirecionar para a coleção
    // router.push('/collection');

  } catch (err) {
    console.error(err);
    alert("Erro ao adicionar. Verifique se você já tem este item.");
  } finally {
    submitting.value = false;
  }
};

// Helpers
const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';
const formatDuration = (s) => s ? `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}` : '--:--';

onMounted(() => {
  fetchRelease();
});
</script>

<style scoped>
.release-detail-view {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-top: 2rem;
}
.ls-1 { letter-spacing: 1px; font-size: 0.8rem; }
</style>