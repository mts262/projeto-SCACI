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
    const dadosCliente = {
      nome: form.elements.name.value,
      cpf_cnpj: digits(form.elements.document.value),
      data_nascimento: form.elements.birthDate.value,
      telefone: form.elements.phone.value,
      email: form.elements.email.value.trim() || null,

      // URL temporária até definir com a equipe o serviço de armazenamento dos arquivos
      url_comprovante_residencia: "http://doc/res211.pdf", 
      
      logradouro: form.elements.street.value,
      numero: form.elements.number.value,
      bairro: form.elements.neighborhood.value,
      complemento: form.elements.complement.value.trim() || null,
      cidade: form.elements.city.value,
      uf: form.elements.state.value,
      cep: digits(form.elements.postalCode.value),
      estado_civil: form.elements.maritalStatus.value
      
    };

    if (dadosCliente.estado_civil === "casado") {
      // Dados do cônjuge — preencher quando os campos forem adicionados ao formulário
      /*
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

    const resposta = await fetch('http://localhost:3000/cliente', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosCliente)
    });

    const resultado = await resposta.json();
    console.log('Resposta do backend:', resultado);

    if (!resposta.ok) {
      throw new Error(resultado.erro || 'Erro ao cadastrar cliente.');
    }

    dirty = false;
    status.textContent = 'Cadastro salvo com sucesso!';
    form.reset();
    fileName.textContent = 'Comprovante de Residência, clique para fazer upload ou arraste o arquivo aqui (PDF, PNG, JPG)';
  } catch (error) {
    console.log(error);
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