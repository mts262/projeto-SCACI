const form = document.querySelector('#client-form');
const status = document.querySelector('#save-status');
const proof = document.querySelector('#proof');
const fileName = document.querySelector('#file-name');
const fileError = document.querySelector('#file-error');

let selectedFile = null;
let dirty = false;


const digits = value => value.replace(/\D/g, '');

// Preenche opções de UF
const states = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
const stateSelect = form.elements.state;
for (const state of states) stateSelect.add(new Option(state, state));

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

// ALTERAÇÕES NO FORMULÁRIO
form.addEventListener('input', () => {
  dirty = true;
  status.textContent = '';

  const documentError = document.querySelector('#document-error');
  const postalError = document.querySelector('#postal-error');

  if (documentError) {
    documentError.textContent = '';
  }

  if (postalError) {
    postalError.textContent = '';
  }
});

// SEÇÃO DO CÔNJUGE
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

maritalStatusSelect.addEventListener('change', event => {
  const isCasado = event.target.value === 'casado';

  if (isCasado) {
    spouseSection.classList.remove('hidden');

    requiredSpouseFields.forEach(field => {
      field.setAttribute('required', 'true');
    });

  } else {
    spouseSection.classList.add('hidden');

    requiredSpouseFields.forEach(field => {
      field.removeAttribute('required');
      field.value = '';
    });

    document.getElementById('spouseBirthDate').value = '';

    document.getElementById('spouse-file-name').textContent =
      'Comprovante de União, clique para fazer upload ou arraste o arquivo aqui (PDF, PNG, JPG)';
  }
});

// UPLOAD DE ARQUIVOS
function chooseFile(file) {
  if (!file) return;

  const validType = [
    'application/pdf',
    'image/png',
    'image/jpeg'
  ].includes(file.type);

  if (!validType || file.size > 5 * 1024 * 1024) {
    fileError.textContent =
      'Selecione um PDF, PNG ou JPG de até 5 MB.';
    return;
  }

  selectedFile = file;
  fileName.textContent = file.name;
  fileError.textContent = '';
  dirty = true;
}

proof.addEventListener('change', () => {
  chooseFile(proof.files[0]);
});

// DRAG AND DROP
const dropZone = document.querySelector('#drop-zone');

['dragenter', 'dragover'].forEach(type => {
  dropZone.addEventListener(type, event => {
    event.preventDefault();
  });
});

['dragleave', 'drop'].forEach(type => {
  dropZone.addEventListener(type, event => {
    event.preventDefault();
  });
});

dropZone.addEventListener('drop', event => {
  chooseFile(event.dataTransfer.files[0]);
});

// Upload do comprovante do cônjuge
function setupUpload(dropZoneId, inputId, fileNameId) {
  const dropZone = document.getElementById(dropZoneId);
  const input = document.getElementById(inputId);
  const fileNameElement = document.getElementById(fileNameId);

  input.addEventListener('change', () => {
    if (input.files.length > 0) {
      fileNameElement.textContent =
        `Arquivo selecionado: ${input.files[0].name}`;
    }
  });

  dropZone.addEventListener('dragover', event => {
    event.preventDefault();
    dropZone.style.borderColor = 'var(--blue)';
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#3d3d3d';
  });

  dropZone.addEventListener('drop', event => {
    event.preventDefault();

    dropZone.style.borderColor = '#3d3d3d';

    if (event.dataTransfer.files.length > 0) {
      input.files = event.dataTransfer.files;

      fileNameElement.textContent =
        `Arquivo selecionado: ${event.dataTransfer.files[0].name}`;
    }
  });
}

setupUpload('spouse-drop-zone', 'unionProof', 'spouse-file-name');

document.getElementById('postalCode').addEventListener('blur', async event => {
  const cep = event.target.value.replace(/\D/g, '');

  if (cep.length !== 8) {
    return;
  }

  try {
    const res = await fetch(
      `https://viacep.com.br/ws/${cep}/json/`
    );

    const data = await res.json();

    if (!data.erro) {
      document.getElementById('street').value = data.logradouro;
      document.getElementById('neighborhood').value = data.bairro;
      document.getElementById('city').value = data.localidade;
      document.getElementById('state').value = data.uf;
    }

  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
  }
});

// ENVIO DO FORMULÁRIO
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
      // Dados do cônjuge 
      casado = true;
     
      dadosCliente.conjuge_cpf = digits(form.elements.spouseDocument.value);
      dadosCliente.conjuge_nome = form.elements.spouseName.value;
      dadosCliente.regime_bens = form.elements.propertyRegime.value;
      dadosCliente.conjuge_data_nascimento = form.elements.spouseBirthDate.value.trim() || null;
      dadosCliente.data_casamento = form.elements.weddingDate.value;
      dadosCliente.casamento_ativo = form.elements.activeMarriage.value;
      dadosCliente.data_fim_casamento = null
    };

    const formData = new FormData();

    for (const [campo, valor] of Object.entries(dadosCliente)) {
      formData.append(campo, valor ?? '');
    }

    formData.append('comprovante_residencia', selectedFile);

    if (casado) {
      formData.append('comprovante_uniao', form.elements.unionProof.files[0]);
    }
    
   
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