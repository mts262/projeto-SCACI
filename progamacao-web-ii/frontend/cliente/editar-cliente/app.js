const form = document.querySelector('#client-form');
const status = document.querySelector('#save-status');
const proof = document.querySelector('#proof');
const fileName = document.querySelector('#file-name');
const fileError = document.querySelector('#file-error');

// URL do backend no Express
const API_BASE_URL = 'http://localhost:3000';

// Captura o ID do cliente da URL (Ex: cadastrar-cliente.html?id=2)
const urlParams = new URLSearchParams(window.location.search);
const clientId = urlParams.get('id'); // ID passado na URL

let selectedFile = null;
let dirty = false;

// Preenche opções do Select de Estado (UF)
const states = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
if (form.elements.state) {
  for (const state of states) form.elements.state.add(new Option(state, state));
}

// Extrai apenas os números
const digits = value => value ? String(value).replace(/\D/g, '') : '';

// 1. CARREGAR DADOS DO CLIENTE PARA EDIÇÃO (GET)
async function carregarCliente() {
  if (!clientId) return; // Se não houver ID na URL, mantém o formulário em modo de cadastro

  const controls = [...form.elements];
  controls.forEach(control => control.disabled = true);
  status.textContent = 'Carregando dados do cliente...';

  try {
    const response = await fetch(`${API_BASE_URL}/cliente/${clientId}`);
    
    if (!response.ok) {
      throw new Error('Cliente não encontrado no banco de dados.');
    }

    const cliente = await response.json();
    preencherFormulario(cliente);
    status.textContent = '';
  } catch (err) {
    console.error(err);
    status.textContent = 'Erro ao carregar dados do cliente do servidor.';
  } finally {
    controls.forEach(control => control.disabled = false);
  }
}

// Mapeia do formato do Prisma para os inputs do formulário HTML
function preencherFormulario(cliente) {
  if (form.elements.name) form.elements.name.value = cliente.nome || '';
  if (form.elements.document) form.elements.document.value = cliente.cpf_cnpj || '';
  
  if (cliente.data_nascimento && form.elements.birthDate) {
    form.elements.birthDate.value = cliente.data_nascimento.split('T')[0];
  }

  if (form.elements.phone) form.elements.phone.value = cliente.telefone || '';
  if (form.elements.email) form.elements.email.value = cliente.email || '';
  if (form.elements.postalCode) form.elements.postalCode.value = cliente.cep || '';
  if (form.elements.street) form.elements.street.value = cliente.logradouro || '';
  if (form.elements.number) form.elements.number.value = cliente.numero || '';
  if (form.elements.neighborhood) form.elements.neighborhood.value = cliente.bairro || '';
  if (form.elements.city) form.elements.city.value = cliente.cidade || '';
  if (form.elements.state) form.elements.state.value = cliente.uf || '';
  
  // Normaliza o Estado Civil (Enum em minúsculo do Prisma)
  const estadoCivilMap = {
    solteiro: 'Solteiro',
    casado: 'Casado',
    divorciado: 'Divorciado',
    viuvo: 'Viúvo'
  };
  if (form.elements.maritalStatus) {
    form.elements.maritalStatus.value = estadoCivilMap[cliente.estado_civil] || cliente.estado_civil || 'Solteiro';
  }

  if (cliente.url_comprovante_residencia && fileName) {
    fileName.textContent = `Comprovante atual: ${cliente.url_comprovante_residencia.split('/').pop()}`;
  }
}

// Executa a busca se houver ID na URL
carregarCliente();

// Captura de arquivo do comprovante
if (proof) {
  proof.addEventListener('change', () => {
    const file = proof.files[0];
    if (!file) return;
    selectedFile = file;
    if (fileName) fileName.textContent = file.name;
    dirty = true;
  });
}

// 2. SALVAR/EDITAR CLIENTE (PUT OU POST)
form.addEventListener('submit', async event => {
  event.preventDefault();

  const button = form.querySelector('[type=submit]');
  button.disabled = true;
  status.textContent = clientId ? 'Salvando alterações...' : 'Cadastrando cliente...';

  // Mapeamento inverso do Estado Civil para os enums minúsculos do Prisma
  const estadoCivilMapReverse = {
    'Solteiro': 'solteiro',
    'Casado': 'casado',
    'Divorciado': 'divorciado',
    'Viúvo': 'viuvo'
  };

  // Cria um objeto FormData compatível com o middleware multer
  const formData = new FormData();
  formData.append('nome', form.elements.name.value.trim());
  formData.append('cpf_cnpj', digits(form.elements.document.value));
  formData.append('data_nascimento', `${form.elements.birthDate.value}T00:00:00.000Z`);
  formData.append('telefone', form.elements.phone.value.trim());
  formData.append('logradouro', form.elements.street.value.trim());
  formData.append('numero', form.elements.number.value.trim());
  formData.append('bairro', form.elements.neighborhood.value.trim());
  formData.append('cidade', form.elements.city.value.trim());
  formData.append('uf', form.elements.state.value);
  formData.append('cep', digits(form.elements.postalCode.value));
  formData.append('estado_civil', estadoCivilMapReverse[form.elements.maritalStatus.value] || 'solteiro');

  const emailValue = form.elements.email ? form.elements.email.value.trim() : '';
  if (emailValue !== "") {
    formData.append('email', emailValue);
  }

  // Anexa o novo arquivo de comprovante caso o usuário tenha selecionado um
  if (selectedFile) {
    formData.append('url_comprovante_residencia', selectedFile);
  }

  try {
    // Se houver clientId faz PUT, se não houver faz POST (Cadastro)
    const url = clientId ? `${API_BASE_URL}/cliente/${clientId}` : `${API_BASE_URL}/cliente`;
    const method = clientId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      body: formData // Não define Content-Type manual, o browser gerencia o boundary multipart
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.mensagem || responseData.erro || 'Erro na operação no banco de dados.');
    }

    dirty = false;
    status.textContent = clientId ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!';
  } catch (err) {
    console.error(err);
    status.textContent = `Erro ao salvar: ${err.message}`;
  } finally {
    button.disabled = false;
  }
});