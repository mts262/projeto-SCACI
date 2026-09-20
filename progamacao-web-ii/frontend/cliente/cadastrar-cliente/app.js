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

// Submissão do Formulário
form.addEventListener('submit', async event => {
  event.preventDefault();
  
  const checks = [
    ['name', form.elements.name.value.trim().length >= 3, 'Informe o nome completo.'],
    ['document', [11, 14].includes(digits(form.elements.document.value).length), 'CPF ou CNPJ inválido.', '#document-error'],
    ['postalCode', digits(form.elements.postalCode.value).length === 8, 'CEP inválido.', '#postal-error'],
  ];

  for (const [key, valid, message, errorSelector] of checks) {
    if (errorSelector) document.querySelector(errorSelector).textContent = valid ? '' : message;
  }

  if (!form.checkValidity()) return;

  const button = form.querySelector('[type=submit]');
  button.disabled = true;

  try {
    if (!database) throw new Error('Storage unavailable');
    const formData = new FormData(form);
    const clientData = Object.fromEntries(formData.entries());

    await new Promise((resolve, reject) => {
      const transaction = database.transaction('clients', 'readwrite');
      transaction.objectStore('clients').add({ client: clientData, fileName: selectedFile?.name });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });

    dirty = false;
    status.textContent = 'Cadastro salvo com sucesso!';
    form.reset();
    fileName.textContent = 'Comprovante de Residência, clique para fazer upload ou arraste o arquivo aqui (PDF, PNG, JPG)';
  } catch {
    status.textContent = 'Erro ao salvar. Tente novamente.';
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