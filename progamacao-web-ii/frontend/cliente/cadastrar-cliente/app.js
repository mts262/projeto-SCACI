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

<<<<<<< HEAD:progamacao-web-ii/frontend/cliente/cadastrar-cliente/app.js
const dropZone = document.querySelector('#drop-zone');
['dragenter', 'dragover'].forEach(type => dropZone.addEventListener(type, e => e.preventDefault()));
['dragleave', 'drop'].forEach(type => dropZone.addEventListener(type, e => e.preventDefault()));
dropZone.addEventListener('drop', e => chooseFile(e.dataTransfer.files[0]));

form.addEventListener('submit', async event => {
  event.preventDefault();
 
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
    const dadosCliente = {
      nome: form.elements.name.value,
      cpf_cnpj: digits(form.elements.document.value),
      data_nascimento: form.elements.birthDate.value,
      telefone: form.elements.phone.value,
      email: form.elements.email.value.trim() || null,
      logradouro: form.elements.street.value,
      numero: form.elements.number.value,
      bairro: form.elements.neighborhood.value,
      complemento: form.elements.complement.value.trim() || null,
      cidade: form.elements.city.value,
      uf: form.elements.state.value,
      cep: digits(form.elements.postalCode.value),
      estado_civil: form.elements.maritalStatus.value
     
    };

    let casado = false;
    if (dadosCliente.estado_civil === "casado") {
      // Dados do cônjuge — preencher quando os campos forem adicionados ao formulário
      /*
      casado = true;
     
      dadosCliente.conjuge_cpf = ...;
      dadosCliente.conjuge_nome = ...;
      dadosCliente.regime_bens = ...;
      dadosCliente.conjuge_data_nascimento =  ...;
      dadosCliente.url_comprovante_uniao = ...;
      dadosCliente.data_casamento = ...;
      dadosCliente.casamento_ativo = ...;
      dadosCliente.data_fim_casamento = null
      */
    }

    const formData = new FormData();

    for (const [campo, valor] of Object.entries(dadosCliente)) {
      formData.append(campo, valor ?? '');
    }

    formData.append('comprovante_residencia', form.elements.proof.files[0]);

    // para qaundo tiver os dados de cônjuge
    /*
    if (casado) {
      formData.append('comprovante_uniao', form.elements.conjugeProof.files[0]);
    }
    */
   
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
=======
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
>>>>>>> 02b2258 (Atualiza arquivos do formulario Cadastrar_Cliente com secao de conjugue):progamacao-web-ii/FrontEnd/Cadastrar_Cliente/app.js
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