const form = document.querySelector('#client-form');
const status = document.querySelector('#save-status');
const proof = document.querySelector('#proof');
const fileName = document.querySelector('#file-name');
const fileError = document.querySelector('#file-error');

let selectedFile = null;
let dirty = false;
let database;

// Preenche opções de UF
const states = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
const stateSelect = form.elements.state;
for (const state of states) stateSelect.add(new Option(state, state));

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('scaci', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('clients', { autoIncrement: true });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

openDatabase().then(db => database = db).catch(() => {
  status.textContent = 'O armazenamento local está indisponível.';
});

const digits = value => value.replace(/\D/g, '');

// Máscara CPF/CNPJ
form.elements.document.addEventListener('input', event => {
  const value = digits(event.target.value).slice(0, 14);
  event.target.value = value.length <= 11
    ? value.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\.\d{3})(\d)/, '$1-$2')     : value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})$/, '$1.$2.$3/$4-$5');
});

// Máscara CEP
form.elements.postalCode.addEventListener('input', event => {
  event.target.value = digits(event.target.value).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
});

// Máscara Telefone
form.elements.phone.addEventListener('input', event => {
  const value = digits(event.target.value).slice(0, 11);
  event.target.value = value.replace(/^(\d{2})(\d)/, '$1 $2').replace(/(\d{4,5})(\d{4})$/, '$1-$2');
});

form.addEventListener('input', () => {
  dirty = true;
  status.textContent = '';
  document.querySelector('#document-error').textContent = '';
  document.querySelector('#postal-error').textContent = '';
});

// Upload de Arquivo
function chooseFile(file) {
  if (!file) return;
  const validType = ['application/pdf', 'image/png', 'image/jpeg'].includes(file.type);
  if (!validType || file.size > 5 * 1024 * 1024) {
    fileError.textContent = 'Selecione um PDF, PNG ou JPG de até 5 MB.';
    return;
  }
  selectedFile = file;
  fileName.textContent = file.name;
  fileError.textContent = '';
  dirty = true;
}

proof.addEventListener('change', () => chooseFile(proof.files[0]));

const dropZone = document.querySelector('#drop-zone');
['dragenter', 'dragover'].forEach(type => dropZone.addEventListener(type, e => e.preventDefault()));
['dragleave', 'drop'].forEach(type => dropZone.addEventListener(type, e => e.preventDefault()));
dropZone.addEventListener('drop', e => chooseFile(e.dataTransfer.files[0]));

form.addEventListener('submit', async event => {
  event.preventDefault();
  
  if (!selectedFile) {
    fileError.textContent = 'Por favor, selecione um comprovante de residência.';
    return;
  }

  // 1. Validações do formulário
  const checks = [
    ['name', form.elements.name.value.trim().length >= 3, 'Informe o nome completo.', '#name-error'],
    ['document', [11, 14].includes(digits(form.elements.document.value).length), 'CPF ou CNPJ inválido.', '#document-error'],
    ['postalCode', digits(form.elements.postalCode.value).length === 8, 'CEP inválido.', '#postal-error'],
  ];

  let temErro = false;

  for (const [key, valid, message, errorSelector] of checks) {
    const el = document.querySelector(errorSelector);
    if (el) {
      el.textContent = valid ? '' : message;
    }
    if (!valid) temErro = true;
  }

  // Se alguma validação personalizada falhou ou o formulário nativo é inválido, interrompe
  if (temErro || !form.checkValidity()) {
    form.reportValidity(); // Mostra o balão do erro nativo se houver algum campo obrigatório não preenchido
    return;
  }

  const button = form.querySelector('[type=submit]');
  button.disabled = true;
  status.textContent = 'Salvando cadastro...';

  try {
    const formData = new FormData();

    formData.append('nome', form.elements.name.value.trim());
    formData.append('cpf_cnpj', digits(form.elements.document.value));
    formData.append('data_nascimento', form.elements.birthDate.value);
    formData.append('telefone', form.elements.phone.value);
    
    if (form.elements.email.value.trim()) {
      formData.append('email', form.elements.email.value.trim());
    }

    formData.append('logradouro', form.elements.street.value);
    formData.append('numero', form.elements.number.value);
    formData.append('bairro', form.elements.neighborhood.value);
    
    if (form.elements.complement.value.trim()) {
      formData.append('complemento', form.elements.complement.value.trim());
    }

    formData.append('cidade', form.elements.city.value);
    formData.append('uf', form.elements.state.value);
    formData.append('cep', digits(form.elements.postalCode.value));
    formData.append('estado_civil', form.elements.maritalStatus.value);

    // Chave exata configurada no Multer upload.fields no backend
    formData.append('url_comprovante_residencia', selectedFile);

    const resposta = await fetch('http://localhost:3000/cliente', {
      method: 'POST',
      body: formData
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.erro || resultado.detalhes || 'Erro ao cadastrar cliente.');
    }

    dirty = false;
    selectedFile = null;
    status.textContent = 'Cadastro salvo com sucesso!';
    form.reset();
    fileName.textContent = 'Comprovante de Residência, clique para fazer upload ou arraste o arquivo aqui (PDF, PNG, JPG)';
  } catch (error) {
    console.error('Erro na requisição:', error);
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

// Navegação do menu
document.querySelectorAll('[data-section]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.section !== 'Clientes') {
    document.querySelector('#navigation-message').textContent = `A seção “${button.dataset.section}” ainda não está disponível.`;
    document.querySelector('#navigation-dialog').showModal();
  }
}));