const form = document.querySelector('#client-form');
const status = document.querySelector('#save-status');
const proof = document.querySelector('#proof');
const fileName = document.querySelector('#file-name');
const fileError = document.querySelector('#file-error');
const unionProof = document.querySelector('#unionProof');
const unionFileName = document.querySelector('#union-file-name');
const unionFileError = document.querySelector('#union-file-error');
const spouseField = document.querySelector('#spouse-field');
const marriageEndDateField = document.querySelector('#marriage-end-date-field');
const API_BASE_URL = 'http://localhost:3000';
const urlParams = new URLSearchParams(window.location.search);
const clientId = urlParams.get('id'); // Lê o ?id=X enviado pela listagem
const initialClient = {
  name: 'Pedro Lucas Dos Santos Xavier', document: '918.883.405-80',
  birthDate: '2005-06-27', phone: '77 98848-8072', email: 'Pedrin007@gmail.com',
  postalCode: '45000', street: 'Avenida Brasil', number: '2288',
  complement: 'Bloco B, Apto 102', neighborhood: 'Recreio', city: 'Vitória da Conquista', state: 'BA',
  maritalStatus: 'Casado', spouseName: 'Maria Eduarda Costa', spouseDocument: '321.654.987-00',
  spouseBirthDate: '1988-10-20', spousePropertyRegime: 'Comunhão parcial de bens', marriageDate: '2012-05-16',
  marriageActive: 'Sim', marriageEndDate: '',
};
let selectedFile = null;
let selectedUnionProof = null;
let dirty = false;

// Preenche opções do Select de Estado (UF)
const states = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
for (const state of states) form.elements.state.add(new Option(state, state));
const today = new Date();
form.elements.birthDate.max = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
function populate(client) {
  for (const key of Object.keys(initialClient)) form.elements[key].value = client[key] ?? initialClient[key];
  updateSpouseVisibility();
}
function updateMarriageEndDateState() {
  const isMarried = form.elements.maritalStatus.value === 'Casado';
  const isInactive = form.elements.marriageActive.value === 'Não';
  const endDate = form.elements.marriageEndDate;

  if (!isMarried || !isInactive) {
    endDate.value = '';
    endDate.disabled = true;
    endDate.required = false;
    if (marriageEndDateField) marriageEndDateField.hidden = true;
    return;
  }

  endDate.disabled = false;
  endDate.required = true;
  if (marriageEndDateField) marriageEndDateField.hidden = false;
}
function updateSpouseVisibility() {
  const isMarried = form.elements.maritalStatus.value === 'Casado';
  spouseField.hidden = !isMarried;
  ['spouseName', 'spouseDocument', 'spouseBirthDate', 'spousePropertyRegime', 'marriageDate', 'marriageActive', 'marriageEndDate', 'unionProof'].forEach(key => {
    const control = form.elements[key];
    if (control) control.disabled = !isMarried;
  });
  if (!isMarried) {
    ['spouseName', 'spouseDocument', 'spouseBirthDate', 'spousePropertyRegime', 'marriageDate', 'marriageActive', 'marriageEndDate'].forEach(key => {
      const control = form.elements[key];
      if (control) control.value = '';
    });
    if (unionProof) unionProof.value = '';
    unionFileName.textContent = 'comprovante_uniao.PDF';
    unionFileError.textContent = '';
  }
  ['spouseName', 'spouseDocument', 'spouseBirthDate', 'spousePropertyRegime', 'marriageDate', 'marriageActive'].forEach(key => {
    const control = form.elements[key];
    if (control) control.required = isMarried;
  });
  updateMarriageEndDateState();
}
form.elements.maritalStatus.addEventListener('change', updateSpouseVisibility);
form.elements.marriageActive.addEventListener('change', updateMarriageEndDateState);
populate(initialClient);
updateMarriageEndDateState();
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('scaci', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('clients');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function preencherFormulario(cliente) {
  if (!cliente) return;

  const estadoCivilMap = {
    'solteiro': 'Solteiro',
    'casado': 'Casado',
    'divorciado': 'Divorciado',
    'viuvo': 'Viúvo'
  };

  // Preenchimento dos dados do cliente
  if (form.elements.name) form.elements.name.value = cliente.nome || '';
  if (form.elements.document) form.elements.document.value = cliente.cpf_cnpj || '';
  
  if (form.elements.birthDate && cliente.data_nascimento) {
    form.elements.birthDate.value = cliente.data_nascimento.split('T')[0];
  }

  if (form.elements.phone) form.elements.phone.value = cliente.telefone || '';
  if (form.elements.email) form.elements.email.value = cliente.email || '';
  if (form.elements.street) form.elements.street.value = cliente.logradouro || '';
  if (form.elements.number) form.elements.number.value = cliente.numero || '';
  if (form.elements.neighborhood) form.elements.neighborhood.value = cliente.bairro || '';
  if (form.elements.city) form.elements.city.value = cliente.cidade || '';
  if (form.elements.state) form.elements.state.value = cliente.uf || '';
  if (form.elements.postalCode) form.elements.postalCode.value = cliente.cep || '';

  if (form.elements.maritalStatus) {
    form.elements.maritalStatus.value = estadoCivilMap[cliente.estado_civil] || cliente.estado_civil || 'Solteiro';
  }

  // Preenchimento dos dados do cônjuge (obtém o mais recente do array conjuge)
  const conjugeAtivo = Array.isArray(cliente.conjuge) && cliente.conjuge.length > 0 ? cliente.conjuge[0] : null;

  if (conjugeAtivo) {
    if (form.elements.spouseName) form.elements.spouseName.value = conjugeAtivo.nome || '';
    if (form.elements.spouseDocument) form.elements.spouseDocument.value = conjugeAtivo.cpf || '';
    if (form.elements.spouseBirthDate && conjugeAtivo.data_nascimento) {
      form.elements.spouseBirthDate.value = conjugeAtivo.data_nascimento.split('T')[0];
    }
    if (form.elements.spousePropertyRegime) form.elements.spousePropertyRegime.value = conjugeAtivo.regime_bens || '';
    if (form.elements.marriageDate && conjugeAtivo.data_casamento) {
      form.elements.marriageDate.value = conjugeAtivo.data_casamento.split('T')[0];
    }
    if (form.elements.marriageActive) {
      form.elements.marriageActive.value = conjugeAtivo.casamento_ativo === 'sim' ? 'Sim' : 'Não';
    }
    if (form.elements.marriageEndDate && conjugeAtivo.data_fim_casamento) {
      form.elements.marriageEndDate.value = conjugeAtivo.data_fim_casamento.split('T')[0];
    }
  }

  updateSpouseVisibility();
}
async function restore() {
  // Disable editing while restoring so that saved data cannot overwrite user input.
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
restore();
const digits = value => value.replace(/\D/g, '');
form.elements.document.addEventListener('input', event => {
  const value = digits(event.target.value).slice(0, 14);
  event.target.value = value.length <= 11
    ? value.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\.\d{3})(\d)/, '$1-$2')
    : value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})$/, '$1.$2.$3/$4-$5');
});
form.elements.spouseDocument.addEventListener('input', event => {
  const value = digits(event.target.value).slice(0, 11);
  event.target.value = value.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\.\d{3})(\d)/, '$1-$2');
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
  unionFileError.textContent = '';
});
function chooseFile(file, errorElement, fileField, fileLabel) {
  if (!file) return;
  const validType = ['application/pdf', 'image/png', 'image/jpeg'].includes(file.type);
  if (!validType || file.size > 5 * 1024 * 1024 || file.size === 0) {
    errorElement.textContent = 'Selecione um PDF, PNG ou JPG não vazio, com até 5 MB.';
    fileField.value = '';
    return;
  }
  if (fileLabel) fileLabel.textContent = file.name;
  errorElement.textContent = '';
  status.textContent = '';
  dirty = true;
  return file;
}
proof.addEventListener('change', () => {
  selectedFile = chooseFile(proof.files[0], fileError, proof, fileName) ?? selectedFile;
});
unionProof.addEventListener('change', () => {
  selectedUnionProof = chooseFile(unionProof.files[0], unionFileError, unionProof, unionFileName) ?? selectedUnionProof;
});
const dropZone = document.querySelector('#drop-zone');
for (const type of ['dragenter', 'dragover']) dropZone.addEventListener(type, event => {
  event.preventDefault();
  dropZone.classList.add('dragging');
});
for (const type of ['dragleave', 'drop']) dropZone.addEventListener(type, event => {
  event.preventDefault();
  dropZone.classList.remove('dragging');
});
dropZone.addEventListener('drop', event => chooseFile(event.dataTransfer.files[0], fileError, proof, fileName));
const unionDropZone = document.querySelector('#union-drop-zone');
for (const type of ['dragenter', 'dragover']) unionDropZone.addEventListener(type, event => {
  event.preventDefault();
  unionDropZone.classList.add('dragging');
});
for (const type of ['dragleave', 'drop']) unionDropZone.addEventListener(type, event => {
  event.preventDefault();
  unionDropZone.classList.remove('dragging');
});
unionDropZone.addEventListener('drop', event => {
  const file = event.dataTransfer.files[0];
  selectedUnionProof = chooseFile(file, unionFileError, unionProof, unionFileName) ?? selectedUnionProof;
  if (file) unionProof.files = event.dataTransfer.files;
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  const isMarried = form.elements.maritalStatus.value === 'Casado';

  // --- VALIDAÇÃO DOS CAMPOS DO FORMULÁRIO ---
  const checks = [
    ['maritalStatus', form.elements.maritalStatus.value !== '', 'Selecione o estado civil.'],
    ['name', form.elements.name.value.trim().length >= 3, 'Informe o nome completo.'],
    ['document', [11, 14].includes(digits(form.elements.document.value).length), 'Informe 11 dígitos para CPF ou 14 para CNPJ.', '#document-error'],
    ['birthDate', Boolean(form.elements.birthDate.value), 'Informe a data de nascimento.'],
    ['phone', [10, 11].includes(digits(form.elements.phone.value).length), 'Informe o telefone com DDD.'],
    ['email', form.elements.email.value.trim() === '' || form.elements.email.checkValidity(), 'Informe um e-mail válido.'],
    ['postalCode', digits(form.elements.postalCode.value).length === 8, 'Informe os 8 dígitos do CEP.', '#postal-error'],
    ...['street', 'number', 'neighborhood', 'city', 'state'].map(key => [key, Boolean(form.elements[key].value.trim()), 'Preencha este campo.']),
  ];

  if (isMarried) {
    checks.push(['spouseName', form.elements.spouseName.value.trim().length >= 3, 'Informe o nome do cônjuge.']);
    checks.push(['spouseDocument', [11].includes(digits(form.elements.spouseDocument.value).length), 'Informe o CPF do cônjuge.']);
    checks.push(['spouseBirthDate', Boolean(form.elements.spouseBirthDate.value), 'Informe a data de nascimento do cônjuge.']);
    checks.push(['spousePropertyRegime', form.elements.spousePropertyRegime.value !== '', 'Informe o regime de bens.']);
    checks.push(['marriageDate', Boolean(form.elements.marriageDate.value), 'Informe a data do casamento.']);
    checks.push(['marriageActive', form.elements.marriageActive.value !== '', 'Informe se o casamento está ativo.']);
    if (form.elements.marriageActive.value === 'Não') {
      checks.push(['marriageEndDate', Boolean(form.elements.marriageEndDate.value), 'Informe a data fim do casamento.']);
    }
  }

  for (const [key, valid, message, errorSelector] of checks) {
    if (!form.elements[key]) continue;
    form.elements[key].setCustomValidity(valid ? '' : message);
    if (errorSelector) document.querySelector(errorSelector).textContent = valid ? '' : message;
  }

  if (!clientId && !proof.files[0]) {
    fileError.textContent = 'Faça o upload do comprovante de residência.';
    proof.setCustomValidity('Faça o upload do comprovante de residência.');
  } else {
    proof.setCustomValidity('');
  }

  if (!clientId && isMarried && !unionProof.files[0]) {
    unionFileError.textContent = 'Faça o upload do comprovante de união.';
    unionProof.setCustomValidity('Faça o upload do comprovante de união.');
  } else {
    unionFileError.textContent = '';
    if (unionProof) unionProof.setCustomValidity('');
  }

  if (!form.reportValidity()) return;
  if (fileError.textContent) { proof.focus(); return; }
  if (isMarried && unionFileError.textContent) { unionProof.focus(); return; }

  const button = form.querySelector('[type=submit]');
  button.disabled = true;
  status.textContent = clientId ? 'Salvando alterações...' : 'Cadastrando cliente...';

  const estadoCivilMapReverse = {
    'Solteiro': 'solteiro',
    'Casado': 'casado',
    'Divorciado': 'divorciado',
    'Viúvo': 'viuvo'
  };

  try {
    let response;

    if (clientId) {
      // --- EDIÇÃO (PUT) com suporte a arquivos ---
      const formData = new FormData();

      // Campos do cliente
      formData.append('nome', form.elements.name.value.trim());
      formData.append('cpf_cnpj', digits(form.elements.document.value));
      formData.append('data_nascimento', form.elements.birthDate.value);
      formData.append('telefone', form.elements.phone.value.trim());
      formData.append('logradouro', form.elements.street.value.trim());
      formData.append('numero', form.elements.number.value.trim());
      formData.append('bairro', form.elements.neighborhood.value.trim());
      formData.append('cidade', form.elements.city.value.trim());
      formData.append('uf', form.elements.state.value);
      formData.append('cep', digits(form.elements.postalCode.value));
      formData.append('estado_civil', estadoCivilMapReverse[form.elements.maritalStatus.value] || 'solteiro');

      if (form.elements.email.value.trim()) {
        formData.append('email', form.elements.email.value.trim());
      }

      // Se houver um NOVO comprovante de residência selecionado
      if (selectedFile) {
        formData.append('comprovante_residencia', selectedFile);
      }

      // Dados do Cônjuge para o PUT
      if (isMarried) {
        const conjugeData = {
          cpf: digits(form.elements.spouseDocument.value),
          conjuge_cpf: digits(form.elements.spouseDocument.value),
          nome: form.elements.spouseName.value.trim(),
          conjuge_nome: form.elements.spouseName.value.trim(),
          regime_bens: form.elements.spousePropertyRegime.value,
          data_nascimento: form.elements.spouseBirthDate.value || undefined,
          data_casamento: form.elements.marriageDate.value || undefined,
          casamento_ativo: form.elements.marriageActive.value === 'Sim' ? 'sim' : 'nao',
          data_fim_casamento: form.elements.marriageActive.value === 'Não' ? (form.elements.marriageEndDate.value || null) : null
        };

        // Se houver um NOVO comprovante de união selecionado
        if (selectedUnionProof) {
          formData.append('comprovante_uniao', selectedUnionProof);
        }

        // Envia os campos do cônjuge serializados ou individuais
        formData.append('conjuge', JSON.stringify(conjugeData));
      } else if (form.elements.maritalStatus.value === 'Divorciado') {
        formData.append('conjuge', JSON.stringify({
          data_fim_casamento: form.elements.marriageEndDate.value || new Date().toISOString()
        }));
      }

      // ATENÇÃO: Ao enviar FormData, NÃO passe a header 'Content-Type'. O navegador gera o boundary automaticamente.
      response = await fetch(`${API_BASE_URL}/cliente/${clientId}`, {
        method: 'PUT',
        body: formData
      });

    } else {
      // ... (mantém o bloco POST como já está) ...
      // --- CADASTRO (POST) ---
      const formData = new FormData();
      formData.append('nome', form.elements.name.value.trim());
      formData.append('cpf_cnpj', digits(form.elements.document.value));
      formData.append('data_nascimento', form.elements.birthDate.value);
      formData.append('telefone', form.elements.phone.value.trim());
      formData.append('logradouro', form.elements.street.value.trim());
      formData.append('numero', form.elements.number.value.trim());
      formData.append('bairro', form.elements.neighborhood.value.trim());
      formData.append('cidade', form.elements.city.value.trim());
      formData.append('uf', form.elements.state.value);
      formData.append('cep', digits(form.elements.postalCode.value));
      formData.append('estado_civil', estadoCivilMapReverse[form.elements.maritalStatus.value] || 'solteiro');

      if (form.elements.email.value.trim()) {
        formData.append('email', form.elements.email.value.trim());
      }

      if (selectedFile) {
        formData.append('comprovante_residencia', selectedFile);
      }

      if (isMarried) {
        formData.append('conjuge_nome', form.elements.spouseName.value.trim());
        formData.append('conjuge_cpf', digits(form.elements.spouseDocument.value));
        formData.append('conjuge_data_nascimento', form.elements.spouseBirthDate.value);
        formData.append('regime_bens', form.elements.spousePropertyRegime.value);
        formData.append('data_casamento', form.elements.marriageDate.value);
        formData.append('casamento_ativo', form.elements.marriageActive.value === 'Sim' ? 'sim' : 'nao');

        if (selectedUnionProof) {
          formData.append('comprovante_uniao', selectedUnionProof);
        }
      }

      response = await fetch(`${API_BASE_URL}/cliente`, {
        method: 'POST',
        body: formData
      });
    }

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.erro || responseData.mensagem || 'Erro na operação.');
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