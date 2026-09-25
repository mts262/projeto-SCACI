const DB_NAME = 'SCACIDB';
const DB_VERSION = 1;
const STORE_NAME = 'clients';

let db = null;

// Inicialização do IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };

    request.onerror = (e) => reject(e.target.error);
  });
}

// Inicializar lista de UFs
const ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const stateSelect = document.getElementById('state');
ufs.forEach(uf => {
  const opt = document.createElement('option');
  opt.value = uf;
  opt.textContent = uf;
  stateSelect.appendChild(opt);
});

// Manipulação Dinâmica da Seção do Cônjuge
const maritalStatusSelect = document.getElementById('maritalStatus');
const spouseSection = document.getElementById('spouse-section');

const requiredSpouseFields = [
  document.getElementById('spouseName'),
  document.getElementById('spouseDocument'),
  document.getElementById('weddingDate'),
  document.getElementById('propertyRegime'),
  document.getElementById('activeMarriage'),
  document.getElementById('unionProof')
];

maritalStatusSelect.addEventListener('change', (e) => {
  const isCasado = e.target.value === 'Casado';

  if (isCasado) {
    spouseSection.classList.remove('hidden');
    requiredSpouseFields.forEach(field => field.setAttribute('required', 'true'));
  } else {
    spouseSection.classList.add('hidden');
    requiredSpouseFields.forEach(field => {
      field.removeAttribute('required');
      field.value = '';
    });
    document.getElementById('spouseBirthDate').value = '';
    document.getElementById('spouse-file-name').textContent = 'Comprovante de União, clique para fazer upload ou arraste o arquivo aqui (PDF, PNG, JPG)';
  }
});

// Drag and Drop e Upload
function setupUpload(dropZoneId, inputId, fileNameId) {
  const dropZone = document.getElementById(dropZoneId);
  const input = document.getElementById(inputId);
  const fileName = document.getElementById(fileNameId);

  input.addEventListener('change', () => {
    if (input.files.length > 0) {
      fileName.textContent = `Arquivo selecionado: ${input.files[0].name}`;
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--blue)';
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#3d3d3d';
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#3d3d3d';
    if (e.dataTransfer.files.length > 0) {
      input.files = e.dataTransfer.files;
      fileName.textContent = `Arquivo selecionado: ${e.dataTransfer.files[0].name}`;
    }
  });
}

setupUpload('drop-zone', 'proof', 'file-name');
setupUpload('spouse-drop-zone', 'unionProof', 'spouse-file-name');

// Busca CEP Automática (ViaCEP API)
document.getElementById('postalCode').addEventListener('blur', async (e) => {
  const cep = e.target.value.replace(/\D/g, '');
  if (cep.length === 8) {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        document.getElementById('street').value = data.logradouro;
        document.getElementById('neighborhood').value = data.bairro;
        document.getElementById('city').value = data.localidade;
        document.getElementById('state').value = data.uf;
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
    }
  }
});

// Envio do Formulário e Persistência
const form = document.getElementById('client-form');
const saveStatus = document.getElementById('save-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const clientData = Object.fromEntries(formData.entries());

  try {
    if (!db) await initDB();
    
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.add(clientData);

    tx.oncomplete = () => {
      saveStatus.textContent = 'Cliente cadastrado com sucesso!';
      form.reset();
      spouseSection.classList.add('hidden');
      document.getElementById('file-name').textContent = 'Comprovante de Residência, clique para fazer upload ou arraste o arquivo aqui (PDF, PNG, JPG)';
      setTimeout(() => saveStatus.textContent = '', 4000);
    };

    tx.onerror = () => {
      saveStatus.textContent = 'Erro ao salvar no banco de dados.';
    };
  } catch (err) {
    console.error(err);
    saveStatus.textContent = 'Erro inesperado ao salvar.';
  }
});

// Inicialização da Base
initDB();