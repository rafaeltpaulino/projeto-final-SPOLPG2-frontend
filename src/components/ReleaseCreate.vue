<template>
  <div class="release-create-view mt-4 mb-5">
    <BContainer>
      
      <h2 class="mb-4 fw-bold">Cadastrar Nova Edição (Release)</h2>

      <BCard v-if="!selectedMaster" class="shadow-sm border-0 mb-4">
        <h5 class="mb-3">Passo 1: Qual é a Obra (Master)?</h5>
        
        <div class="d-flex gap-2 mb-3">
          <BFormInput 
            v-model="searchQuery" 
            placeholder="Digite o nome do álbum para buscar..." 
            @keyup.enter="searchMasters"
          />
          <BButton variant="warning" @click="searchMasters" :disabled="searching">
            <BSpinner small v-if="searching" />
            <span v-else><i class="bi bi-search"></i> Buscar</span>
          </BButton>
        </div>

        <div v-if="searchResults.length > 0" class="list-group">
          <button 
            v-for="master in searchResults" 
            :key="master.id"
            class="list-group-item list-group-item-action d-flex align-items-center gap-3"
            @click="selectMaster(master)"
          >
            <img 
              :src="master.coverImageUrl || '/images/default-cover.png'" 
              style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
            />
            <div>
              <div class="fw-bold">{{ master.title }}</div>
              <small class="text-muted">{{ master.releaseYear }} • {{ formatArtists(master.artists) }}</small>
            </div>
            <i class="bi bi-chevron-right ms-auto"></i>
          </button>
        </div>
        
        <div v-else-if="searched && searchResults.length === 0" class="text-muted text-center py-3">
          Nenhuma obra encontrada. Tente outro nome.
        </div>
      </BCard>


      <BCard v-else class="shadow-sm border-0">
        
        <div class="d-flex justify-content-between align-items-center bg-light p-3 rounded mb-4">
          <div class="d-flex align-items-center gap-3">
            <img :src="selectedMaster.coverImageUrl" style="width: 60px; height: 60px; object-fit: cover;" />
            <div>
              <h6 class="mb-0 fw-bold">Vinculado a: {{ selectedMaster.title }}</h6>
              <small>{{ selectedMaster.releaseYear }}</small>
            </div>
          </div>
          <BButton size="sm" variant="outline-danger" @click="selectedMaster = null">Trocar Obra</BButton>
        </div>

        <form @submit.prevent="submitRelease">
          <BRow>
            <BCol md="12" class="mb-3">
              <label class="form-label">Título desta Edição</label>
              <input v-model="form.title" class="form-control" required />
              <small class="text-muted">Ex: "Edição Brasileira de Luxo" ou mantenha o original.</small>
            </BCol>

            <BCol md="6" class="mb-3">
              <label class="form-label">Formato</label>
              <select v-model="form.format" class="form-select" required>
                <option value="LP">Vinil (LP)</option>
                <option value="CD">CD</option>
                <option value="Cassette">Fita K7</option>
                <option value="Digital">Digital</option>
              </select>
            </BCol>
            <BCol md="6" class="mb-3">
              <label class="form-label">Data de Lançamento</label>
              <input type="date" v-model="form.releaseDate" class="form-control" />
            </BCol>

            <BCol md="6" class="mb-3">
              <label class="form-label">País de Fabricação</label>
              <select v-model="form.countryId" class="form-select" required>
                <option :value="null" disabled>Selecione...</option>
                <option v-for="c in countries" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </BCol>

            <BCol md="6" class="mb-3">
              <label class="form-label">Código de Barras</label>
              <input v-model="form.barcode" class="form-control" />
            </BCol>

            <div class="col-12"><hr /></div>
            
            <h6 class="fw-bold text-warning">Gravadora / Selo</h6>
            <BCol md="6" class="mb-3">
              <label class="form-label">Label</label>
              <select v-model="labelForm.labelId" class="form-select" required>
                <option :value="null" disabled>Selecione...</option>
                <option v-for="l in labels" :key="l.id" :value="l.id">{{ l.name }}</option>
              </select>
            </BCol>
            <BCol md="6" class="mb-3">
              <label class="form-label">Catálogo Nº</label>
              <input v-model="labelForm.catalogNumber" class="form-control" placeholder="Ex: SHVL 804" />
            </BCol>
          </BRow>

          <hr />

          <h6 class="fw-bold mb-3 d-flex justify-content-between">
            <span>Faixas</span>
            <BButton size="sm" variant="outline-warning" @click="addTrack">+ Faixa</BButton>
          </h6>
          
          <div class="table-responsive mb-4 border rounded">
            <table class="table table-sm table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th width="10%">Pos.</th>
                  <th>Título</th>
                  <th width="15%">Seg.</th>
                  <th width="5%"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(track, index) in form.tracks" :key="index">
                  <td><input v-model="track.position" class="form-control form-control-sm border-0 bg-transparent" /></td>
                  <td><input v-model="track.title" class="form-control form-control-sm border-0 bg-transparent" /></td>
                  <td><input v-model.number="track.durationSeconds" type="number" class="form-control form-control-sm border-0 bg-transparent" /></td>
                  <td class="text-center">
                    <i class="bi bi-x-circle text-danger" style="cursor: pointer;" @click="removeTrack(index)"></i>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="d-grid">
            <BButton type="submit" variant="warning" size="lg" :disabled="submitting">
              {{ submitting ? 'Salvando...' : 'Confirmar Cadastro' }}
            </BButton>
          </div>

        </form>
      </BCard>

    </BContainer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // Para redirecionar após salvar
import api from '../services/api';
import { 
  BContainer, BCard, BFormInput, BButton, BRow, BCol, BSpinner 
} from 'bootstrap-vue-next';

const router = useRouter();

// --- ESTADOS ---
const searchQuery = ref('');
const searchResults = ref([]);
const searching = ref(false);
const searched = ref(false);
const selectedMaster = ref(null); // Quando preenchido, avança para etapa 2

const countries = ref([]);
const labels = ref([]);
const submitting = ref(false);

// Formulário Principal
const form = reactive({
  title: '',
  format: 'LP',
  releaseDate: '',
  countryId: null,
  barcode: '',
  tracks: []
});

const labelForm = reactive({
  labelId: null,
  catalogNumber: '',
  role: 'Main Label'
});

// --- PASSO 1: BUSCAR MASTER ---
const searchMasters = async () => {
  if (!searchQuery.value) return;
  searching.value = true;
  searched.value = true;
  try {
    const res = await api.get('/masters', { 
        params: { title: searchQuery.value, size: 5 } 
    });
    searchResults.value = res.data.content;
  } catch (e) {
    console.error(e);
  } finally {
    searching.value = false;
  }
};

const selectMaster = async (master) => {
  // Busca detalhes completos da master para pegar as faixas
  try {
    const res = await api.get(`/masters/${master.id}`);
    const fullMaster = res.data;
    
    selectedMaster.value = fullMaster;
    
    // Preenche defaults do formulário
    form.title = fullMaster.title;
    form.tracks = fullMaster.tracks.map(t => ({
        position: t.position,
        title: t.title,
        durationSeconds: t.duration
    }));

    // Carrega combos se ainda não tiver carregado
    if (countries.value.length === 0) loadAuxData();

  } catch (e) {
    alert("Erro ao selecionar master.");
  }
};

// --- PASSO 2: DADOS AUXILIARES ---
const loadAuxData = async () => {
  try {
    const [cRes, lRes] = await Promise.all([
      api.get('/countries?size=200'),
      api.get('/labels?size=100') // Pega um monte de labels
    ]);
    countries.value = cRes.data.content || cRes.data
    labels.value = lRes.data.content || lRes.data; // Suporta paginado ou lista
  } catch (e) {
    console.error("Erro ao carregar combos", e);
  }
};

// --- PASSO 3: MANIPULAR FAIXAS ---
const addTrack = () => {
  form.tracks.push({ position: '', title: '', durationSeconds: 0 });
};
const removeTrack = (index) => {
  form.tracks.splice(index, 1);
};

// --- PASSO 4: SALVAR ---
const submitRelease = async () => {
  submitting.value = true;
  try {
    const payload = {
        masterId: selectedMaster.value.id,
        countryId: form.countryId,
        title: form.title,
        format: form.format,
        releaseDate: form.releaseDate,
        barcode: form.barcode,
        isMain: false,
        labels: [{
            labelId: labelForm.labelId,
            catalogNumber: labelForm.catalogNumber,
            role: 'Main Label'
        }],
        tracks: form.tracks
    };

    await api.post('/releases', payload);
    alert('Edição cadastrada com sucesso!');
    router.push(`/masters/${selectedMaster.value.id}`); // Volta para a página do álbum

  } catch (e) {
    console.error(e);
    alert('Erro ao salvar. Verifique os dados.');
  } finally {
    submitting.value = false;
  }
};

// Helper
const formatArtists = (list) => list?.join(', ') || '';

// Se quiser carregar combos logo ao entrar na tela (opcional)
onMounted(() => {
    // loadAuxData(); // Pode deixar pra carregar só quando selecionar master pra economizar
});
</script>

<style scoped>
.release-create-view {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-top: 2rem;
}
.list-group-item {
  cursor: pointer;
}
.list-group-item:hover {
  background-color: #f1f3f5;
}
</style>