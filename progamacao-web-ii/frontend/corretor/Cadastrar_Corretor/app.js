const DB_NAME = 'SCACIDB';
const DB_VERSION = 1;
const STORE_NAME = 'brokers';

let db = null;

// Helper para manter apenas dígitos
const digits = (str) => (str || '').replace(/\D/g, '');

// Inicialização do IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };

    request.onerror = (e) => reject(e.target.error);
  });
}

// Preenchimento de UFs
const ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const stateSelect = document.getElementById('state');
ufs.forEach(uf => {
  const opt = document.createElement('option');
  opt.value = uf;
  opt.textContent = uf;
  stateSelect.appendChild(opt);
});

// Busca CEP Automática (ViaCEP API)
document.getElementById('postalCode').addEventListener('blur', async (e) => {
  const cep = digits(e.target.value);
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
const form = document.getElementById('broker-form');
const saveStatus = document.getElementById('save-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);

  try {
    // 1. Tenta enviar para a API REST
    const resposta = await fetch('http://localhost:3000/corretor', {
      method: 'POST',
      body: formData
    });

    if (!resposta.ok) {
      throw new Error('Servidor indisponível, salvando localmente...');
    }

    saveStatus.textContent = 'Corretor cadastrado com sucesso!';
    form.reset();
  } catch (err) {
    console.warn(err.message);

    // 2. Fallback local via IndexedDB caso o servidor não responda
    try {
      if (!db) await initDB();

      const brokerData = Object.fromEntries(formData.entries());
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.add(brokerData);

      tx.oncomplete = () => {
        saveStatus.textContent = 'Corretor cadastrado com sucesso (Local)!';
        form.reset();
      };

      tx.onerror = () => {
        saveStatus.textContent = 'Erro ao salvar no banco de dados.';
      };
    } catch (dbErr) {
      console.error(dbErr);
      saveStatus.textContent = 'Erro inesperado ao salvar.';
    }
  } finally {
    setTimeout(() => { saveStatus.textContent = ''; }, 4000);
  }
});

// Inicialização da base de dados
initDB();