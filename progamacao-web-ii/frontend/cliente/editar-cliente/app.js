const form = document.querySelector('#client-form');
const status = document.querySelector('#save-status');
const proof = document.querySelector('#proof');
const fileName = document.querySelector('#file-name');
const fileError = document.querySelector('#file-error');
const initialClient = {
  name: 'Pedro Lucas Dos Santos Xavier', document: '918.883.405-80',
  birthDate: '2005-06-27', phone: '77 98848-8072', email: 'Pedrin007@gmail.com',
  postalCode: '45000', street: 'Avenida Brasil', number: '2288',
  neighborhood: 'Recreio', city: 'Vitória da Conquista', state: 'BA',
  maritalStatus: 'Solteiro',
};
let selectedFile = null;
let dirty = false;
let database;
const states = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
for (const state of states) form.elements.state.add(new Option(state, state));
const today = new Date();
form.elements.birthDate.max = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
function populate(client) {
  for (const key of Object.keys(initialClient)) form.elements[key].value = client[key] ?? initialClient[key];
}
populate(initialClient);
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('scaci', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('clients');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function restore() {
  // Disable editing while restoring so that saved data cannot overwrite user input.
  const controls = [...form.elements];
  controls.forEach(control => control.disabled = true);
  try {
    database = await openDatabase();
    const saved = await new Promise((resolve, reject) => {
      const request = database.transaction('clients').objectStore('clients').get('demo-client');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (saved) {
      populate(saved.client);
      selectedFile = saved.file;
      if (selectedFile) fileName.textContent = selectedFile.name;
    }
  } catch {
    status.textContent = 'O armazenamento local está indisponível. Não será possível salvar neste navegador.';
  } finally {
    controls.forEach(control => control.disabled = false);
  }
}
restore();
const digits = value => value.replace(/\D/g, '');
form.elements.document.addEventListener('input', event => {
  const value = digits(event.target.value).slice(0, 14);
  event.target.value = value.length <= 11
    ? value.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\.\d{3})(\d)/, '$1-$2')
    : value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})$/, '$1.$2.$3/$4-$5');
});
form.elements.postalCode.addEventListener('input', event => {
  event.target.value = digits(event.target.value).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
});
form.elements.phone.addEventListener('input', event => {
  const value = digits(event.target.value).slice(0, 11);
  event.target.value = value.replace(/^(\d{2})(\d)/, '$1 $2').replace(/(\d{4,5})(\d{4})$/, '$1-$2');
});
form.addEventListener('input', event => {
  dirty = true;
  status.textContent = '';
  event.target.setCustomValidity?.('');
  document.querySelector('#document-error').textContent = '';
  document.querySelector('#postal-error').textContent = '';
});
function chooseFile(file) {
  if (!file) return;
  const validType = ['application/pdf', 'image/png', 'image/jpeg'].includes(file.type);
  if (!validType || file.size > 5 * 1024 * 1024 || file.size === 0) {
    fileError.textContent = 'Selecione um PDF, PNG ou JPG não vazio, com até 5 MB.';
    proof.value = '';
    return;
  }
  selectedFile = file;
  fileName.textContent = file.name;
  fileError.textContent = '';
  status.textContent = '';
  dirty = true;
}
proof.addEventListener('change', () => chooseFile(proof.files[0]));
const dropZone = document.querySelector('#drop-zone');
for (const type of ['dragenter', 'dragover']) dropZone.addEventListener(type, event => {
  event.preventDefault();
  dropZone.classList.add('dragging');
});
for (const type of ['dragleave', 'drop']) dropZone.addEventListener(type, event => {
  event.preventDefault();
  dropZone.classList.remove('dragging');
});
dropZone.addEventListener('drop', event => chooseFile(event.dataTransfer.files[0]));
form.addEventListener('submit', async event => {
  event.preventDefault();
  const checks = [
    ['name', form.elements.name.value.trim().length >= 3, 'Informe o nome completo.'],
    ['document', [11, 14].includes(digits(form.elements.document.value).length), 'Informe 11 dígitos para CPF ou 14 para CNPJ.', '#document-error'],
    ['phone', [10, 11].includes(digits(form.elements.phone.value).length), 'Informe o telefone com DDD.'],
    ['postalCode', digits(form.elements.postalCode.value).length === 8, 'Informe os 8 dígitos do CEP.', '#postal-error'],
    ...['street', 'number', 'neighborhood', 'city'].map(key => [key, Boolean(form.elements[key].value.trim()), 'Preencha este campo.']),
  ];
  for (const [key, valid, message, errorSelector] of checks) {
    form.elements[key].setCustomValidity(valid ? '' : message);
    if (errorSelector) document.querySelector(errorSelector).textContent = valid ? '' : message;
  }
  if (!form.reportValidity()) return;
  if (fileError.textContent) { proof.focus(); return; }
  const client = Object.fromEntries(Object.keys(initialClient).map(key => [key, form.elements[key].value.trim()]));
  const button = form.querySelector('[type=submit]');
  button.disabled = true;
  try {
    if (!database) throw new Error('Storage unavailable');
    await new Promise((resolve, reject) => {
      const transaction = database.transaction('clients', 'readwrite');
      transaction.objectStore('clients').put({ client, file: selectedFile }, 'demo-client');
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    dirty = false;
    status.textContent = 'Edição salva neste navegador.';
  } catch {
    status.textContent = 'Não foi possível salvar. Verifique o espaço e as permissões de armazenamento do navegador e tente novamente.';
  } finally {
    button.disabled = false;
  }
});
window.addEventListener('beforeunload', event => {
  if (dirty) { event.preventDefault(); event.returnValue = ''; }
});
document.querySelectorAll('[data-section]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.section === 'Clientes') {
    document.querySelector('#name').focus();
    return;
  }
  document.querySelector('#navigation-message').textContent = `A seção “${button.dataset.section}” ainda não está disponível. Esta versão apresenta a edição de cliente.`;
  document.querySelector('#navigation-dialog').showModal();
}));
