<template>
  <div class="admin-dashboard mb-5">
    <BContainer>
      
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-0">Painel Administrativo</h2>
          <p class="text-muted">Gerencie o conteúdo do catálogo.</p>
        </div>
        <BBadge variant="danger" class="p-2 fs-6">
          <i class="bi bi-shield-lock-fill"></i> Área Restrita
        </BBadge>
      </div>

      <BTabs 
      active-nav-item-class="font-weight-bold text-warning bg-dark"
        active-tab-class="font-weight-bold text-dark"
        content-class="mt-4"
        fill pills
        >
        
        <BTab title="Cadastrar Artista" active>
          <BCard class="border-0 shadow-sm">
            <h5 class="fw-bold mb-3">Novo Artista</h5>
            
            <form @submit.prevent="submitArtist">
              <div class="mb-4 text-center">
                <div class="btn-group" role="group">
                  <input type="radio" class="btn-check" name="artistType" id="typePerson" value="PERSON" v-model="artistType" checked>
                  <label class="btn btn-outline-primary" for="typePerson">
                    <i class="bi bi-person"></i> Pessoa
                  </label>

                  <input type="radio" class="btn-check" name="artistType" id="typeGroup" value="GROUP" v-model="artistType">
                  <label class="btn btn-outline-primary" for="typeGroup">
                    <i class="bi bi-people"></i> Banda / Grupo
                  </label>
                </div>
              </div>

              <BRow>
                <BCol md="8" class="mb-3">
                  <label class="form-label">Nome Artístico</label>
                  <input v-model="artistForm.name" class="form-control" required placeholder="Ex: David Bowie ou Pink Floyd">
                </BCol>
                
                <BCol md="4" class="mb-3">
                  <label class="form-label">País de Origem</label>
                  <select v-model="artistForm.countryId" class="form-select" required>
                    <option :value="null" disabled>Selecione...</option>
                    <option v-for="c in countryList" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                </BCol>

                <template v-if="artistType === 'PERSON'">
                  <BCol md="6" class="mb-3">
                    <label class="form-label">Data de Nascimento</label>
                    <input type="date" v-model="artistForm.birthDate" class="form-control">
                  </BCol>
                  <BCol md="6" class="mb-3">
                    <label class="form-label">Data de Falecimento (opcional)</label>
                    <input type="date" v-model="artistForm.deathDate" class="form-control">
                  </BCol>
                </template>

                <template v-if="artistType === 'GROUP'">
                  <BCol md="6" class="mb-3">
                    <label class="form-label">Data de Formação</label>
                    <input type="date" v-model="artistForm.formationDate" class="form-control">
                  </BCol>
                  <BCol md="6" class="mb-3">
                    <label class="form-label">Data de Encerramento (opcional)</label>
                    <input type="date" v-model="artistForm.endDate" class="form-control">
                  </BCol>
                </template>

                <BCol md="12" class="mb-3">
                  <label class="form-label">URL da Foto</label>
                  <input v-model="artistForm.imageUrl" class="form-control" placeholder="https://...">
                </BCol>

                <BCol md="12" class="mb-3">
                  <label class="form-label">Biografia</label>
                  <textarea v-model="artistForm.description" class="form-control" rows="3"></textarea>
                </BCol>
              </BRow>

              <div class="d-grid mt-2">
                <BButton type="submit" variant="primary" :disabled="submittingArtist">
                  {{ submittingArtist ? 'Salvando...' : 'Cadastrar Artista' }}
                </BButton>
              </div>
            </form>

            <hr class="my-4">
            
            <h6 class="text-muted mb-3">Últimos Artistas Cadastrados</h6>
            <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
              <table class="table table-sm table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>País</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="art in artistList" :key="art.id">
                    <td>{{ art.id }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <img :src="art.imageUrl || '/images/default-user.png'" style="width: 30px; height: 30px; object-fit: cover; border-radius: 50%;">
                        {{ art.name }}
                      </div>
                    </td>
                    <td>
                      <span :class="`badge ${art.type === 'GROUP' ? 'bg-info' : 'bg-success'}`">
                        {{ art.type === 'GROUP' ? 'Banda' : 'Pessoa' }}
                      </span>
                    </td>
                    <td>{{ art.countryName }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BCard>
        </BTab>

        <BTab title="Cadastrar Obra">
          <BCard class="border-0 shadow-sm">
            <h5 class="fw-bold mb-3">Nova Obra Musical</h5>
            <form @submit.prevent="submitMaster">
              <BRow>
                <BCol md="8" class="mb-3">
                  <label class="form-label">Título do Álbum</label>
                  <input v-model="masterForm.title" class="form-control" required placeholder="Ex: The Dark Side of the Moon">
                </BCol>
                <BCol md="4" class="mb-3">
                  <label class="form-label">Ano de Lançamento</label>
                  <input v-model="masterForm.releaseYear" type="number" class="form-control" required placeholder="Ex: 1973">
                </BCol>
                <BCol md="12" class="mb-3">
                  <label class="form-label">URL da Capa</label>
                  <input v-model="masterForm.coverImageUrl" class="form-control" placeholder="https://...">
                </BCol>
                <BCol md="12" class="mb-3">
                  <label class="form-label">Descrição</label>
                  <textarea v-model="masterForm.description" class="form-control" rows="2"></textarea>
                </BCol>

                <hr class="my-4">

                <BCol md="6" class="mb-3">
                  <label class="form-label">Artistas</label>
                  <div class="d-flex gap-2 mb-2">
                    <select v-model="selectedArtistId" class="form-select">
                      <option :value="null" disabled>Selecione...</option>
                      <option v-for="artist in artistList" :key="artist.id" :value="artist.id">
                        {{ artist.name }}
                      </option>
                    </select>
                    <BButton variant="outline-primary" @click="addArtist" :disabled="!selectedArtistId"><i class="bi bi-plus"></i></BButton>
                  </div>
                  <div class="d-flex flex-wrap gap-2">
                    <span v-for="(id, index) in masterForm.artistsId" :key="id" class="badge bg-primary">
                      {{ getArtistName(id) }} <i class="bi bi-x ms-1 cursor-pointer" @click="removeArtist(index)"></i>
                    </span>
                  </div>
                </BCol>

                <BCol md="6" class="mb-3">
                  <label class="form-label">Gêneros</label>
                  <div class="d-flex gap-2 mb-2">
                    <select v-model="selectedGenreId" class="form-select">
                      <option :value="null" disabled>Selecione...</option>
                      <option v-for="genre in genreList" :key="genre.id" :value="genre.id">
                        {{ genre.name }}
                      </option>
                    </select>
                    <BButton variant="outline-primary" @click="addGenre" :disabled="!selectedGenreId"><i class="bi bi-plus"></i></BButton>
                  </div>
                  <div class="d-flex flex-wrap gap-2">
                    <span v-for="(id, index) in masterForm.genresId" :key="id" class="badge bg-secondary">
                      {{ getGenreName(id) }} <i class="bi bi-x ms-1 cursor-pointer" @click="removeGenre(index)"></i>
                    </span>
                  </div>
                </BCol>
              </BRow>

              <div class="d-grid mt-3">
                <BButton type="submit" variant="success" size="lg" :disabled="submittingMaster">
                  {{ submittingMaster ? 'Cadastrando...' : 'Cadastrar Obra' }}
                </BButton>
              </div>
            </form>
          </BCard>
        </BTab>

        <BTab title="Cadastrar Gênero">
          <BCard class="border-0 shadow-sm" style="max-width: 600px; margin: 0 auto;">
            <h5 class="fw-bold mb-3">Novo Gênero</h5>
            <form @submit.prevent="submitGenre">
              <div class="mb-3">
                <label class="form-label">Nome</label>
                <input v-model="genreForm.name" class="form-control" required>
              </div>
              <BButton type="submit" variant="primary" class="w-100" :disabled="submittingGenre">Salvar</BButton>
            </form>
            <hr class="my-4">
            <h6 class="text-muted mb-2">Existentes</h6>
            <div class="d-flex flex-wrap gap-2">
              <span v-for="g in genreList" :key="g.id" class="badge bg-light text-dark border">{{ g.name }}</span>
            </div>
          </BCard>
        </BTab>

        <BTab title="Cadastrar Gravadora">
          <BCard class="border-0 shadow-sm">
            <h5 class="fw-bold mb-3">Nova Gravadora</h5>
            <form @submit.prevent="submitLabel">
              <BRow>
                <BCol md="8" class="mb-3">
                  <label class="form-label">Nome</label>
                  <input v-model="labelForm.name" class="form-control" required>
                </BCol>
                <BCol md="4" class="mb-3">
                  <label class="form-label">Fundação</label>
                  <input type="date" v-model="labelForm.foundationDate" class="form-control" required>
                </BCol>
                <BCol md="12" class="mb-3">
                  <label class="form-label">Bio</label>
                  <textarea v-model="labelForm.bio" class="form-control" rows="2"></textarea>
                </BCol>
              </BRow>
              <BButton type="submit" variant="primary" class="w-100" :disabled="submittingLabel">Salvar</BButton>
            </form>
            <hr class="my-4">
            <h6 class="text-muted">Recentes</h6>
            <table class="table table-sm">
              <tbody>
                <tr v-for="lbl in labelList" :key="lbl.id">
                  <td>{{ lbl.name }}</td>
                  <td class="text-end text-muted">{{ formatDate(lbl.foundationDate) }}</td>
                </tr>
              </tbody>
            </table>
          </BCard>
        </BTab>

      </BTabs>

    </BContainer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../services/api';
import { 
  BContainer, BCard, BTabs, BTab, BRow, BCol, BButton, BBadge
} from 'bootstrap-vue-next';

// --- DADOS AUXILIARES ---
const artistList = ref([]);
const genreList = ref([]);
const labelList = ref([]);
const countryList = ref([]); // Novo!

// --- ESTADOS DE CARREGAMENTO ---
const submittingArtist = ref(false);
const submittingMaster = ref(false);
const submittingGenre = ref(false);
const submittingLabel = ref(false);

// --- ESTADO AUXILIAR UI ---
const selectedArtistId = ref(null);
const selectedGenreId = ref(null);
const artistType = ref('PERSON'); // 'PERSON' ou 'GROUP'

// --- FORMULÁRIOS ---

// Artist Form
const artistForm = reactive({
  name: '',
  description: '',
  imageUrl: '',
  countryId: null,
  // Pessoa
  birthDate: '',
  deathDate: '',
  // Banda
  formationDate: '',
  endDate: ''
});

// Master Form
const masterForm = reactive({
  title: '',
  releaseYear: '',
  coverImageUrl: '',
  description: '',
  artistsId: [], 
  genresId: []   
});

const genreForm = reactive({ name: '' });
const labelForm = reactive({ name: '', foundationDate: '', bio: '' });

// --- FETCH DATA ---
const fetchAuxData = async () => {
  try {
    const [artRes, genRes, lblRes, couRes] = await Promise.all([
        api.get('/artists?size=100&sort=id,desc'), // Ordena por mais recentes
        api.get('/genres'),
        api.get('/labels?size=20&sort=id,desc'),
        api.get('/countries?size=200')
    ]);

    artistList.value = artRes.data.content || [];
    genreList.value = Array.isArray(genRes.data) ? genRes.data : (genRes.data.content || []);
    labelList.value = lblRes.data.content || [];
    countryList.value = Array.isArray(couRes.data) ? couRes.data : (couRes.data.content || []);

  } catch (e) {
    console.error("Erro ao carregar dados", e);
  }
};

// --- SUBMIT ARTISTA (Lógica de Endpoints Separados) ---
const submitArtist = async () => {
  if (!artistForm.countryId) return alert("Selecione um país.");
  
  submittingArtist.value = true;
  try {
    const payload = {
        name: artistForm.name,
        description: artistForm.description,
        imageUrl: artistForm.imageUrl,
        countryId: artistForm.countryId
    };

    // Decide qual endpoint chamar
    if (artistType.value === 'PERSON') {
        payload.birthDate = artistForm.birthDate;
        payload.deathDate = artistForm.deathDate;
        await api.post('/artists/person', payload);
    } else {
        payload.formationDate = artistForm.formationDate;
        payload.endDate = artistForm.endDate;
        await api.post('/artists/group', payload);
    }

    alert(`${artistType.value === 'PERSON' ? 'Pessoa' : 'Banda'} cadastrada com sucesso!`);
    
    // Reset Form
    artistForm.name = '';
    artistForm.description = '';
    artistForm.imageUrl = '';
    artistForm.birthDate = '';
    artistForm.formationDate = '';
    
    fetchAuxData(); // Recarrega lista

  } catch (e) {
    console.error(e);
    alert("Erro ao cadastrar artista.");
  } finally {
    submittingArtist.value = false;
  }
};

// --- OUTROS SUBMITS ---
const submitMaster = async () => {
  if (!masterForm.title || !masterForm.releaseYear) {
      return alert("Preencha Título e Ano.");
  }
  // AQUI ESTÁ O PROBLEMA PROVÁVEL
  if (masterForm.artistsId.length === 0) {
      return alert("Selecione pelo menos um Artista.");
  }
  if (masterForm.genresId.length === 0) {
      return alert("Selecione pelo menos um Gênero.");
  }
  
  submittingMaster.value = true;
  try {
    await api.post('/masters', { ...masterForm, releaseYear: Number(masterForm.releaseYear) });
    alert("Obra criada!");
    masterForm.title = '';
    masterForm.artistsId = [];
    masterForm.genresId = [];
  } catch (e) {
    alert("Erro ao criar obra.");
  } finally {
    submittingMaster.value = false;
  }
};

const submitGenre = async () => {
  if (!genreForm.name) return;
  submittingGenre.value = true;
  try {
    await api.post('/genres', genreForm);
    alert("Gênero criado!");
    genreForm.name = '';
    fetchAuxData();
  } catch (e) { alert("Erro ao criar gênero."); }
  finally { submittingGenre.value = false; }
};

const submitLabel = async () => {
  submittingLabel.value = true;
  try {
    await api.post('/labels', labelForm);
    alert("Gravadora criada!");
    labelForm.name = '';
    fetchAuxData();
  } catch (e) { alert("Erro ao criar label."); }
  finally { submittingLabel.value = false; }
};

// --- HELPERS ---
const addArtist = () => {
  // Debug: Veja o que está a acontecer
  console.log("Selecionado:", selectedArtistId.value);
  
  if (selectedArtistId.value && !masterForm.artistsId.includes(selectedArtistId.value)) {
    masterForm.artistsId.push(selectedArtistId.value);
    selectedArtistId.value = null; // Limpa para permitir nova seleção
  }
  
  // Debug: Veja a lista final
  console.log("Lista Atual:", masterForm.artistsId);
};
const removeArtist = (index) => masterForm.artistsId.splice(index, 1);
const addGenre = () => {
  if (selectedGenreId.value && !masterForm.genresId.includes(selectedGenreId.value)) {
    masterForm.genresId.push(selectedGenreId.value);
    selectedGenreId.value = null;
  }
};
const removeGenre = (index) => masterForm.genresId.splice(index, 1);

const getArtistName = (id) => artistList.value.find(a => a.id === id)?.name || id;
const getGenreName = (id) => genreList.value.find(g => g.id === id)?.name || id;
const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';

onMounted(() => {
  fetchAuxData();
});
</script>

<style scoped>
.admin-dashboard {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-top: 2rem;
}
.cursor-pointer { cursor: pointer; }
</style>