const form = document.getElementById('property-form');
const saveStatus = document.getElementById('save-status');

// Helper para manter apenas dígitos
const digits = (str) => (str || '').replace(/\D/g, '');

const API = 'http://localhost:3000';

// =====================================================
// UF (preenche o select)
// =====================================================
const states = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
const stateSelect = form.elements.state;
for (const state of states) stateSelect.add(new Option(state, state));

// =====================================================
// COMBOBOX DE PROPRIETÁRIO
// =====================================================
const ownerInput = document.getElementById('owner');
const ownerIdInput = document.getElementById('ownerId');
const ownerList = document.getElementById('owner-list');
const ownerError = document.getElementById('owner-error');

// Se existir uma rota só de proprietários, troque aqui (ex.: `${API}/proprietarios`)
const ROTA_PROPRIETARIOS = `${API}/clientes`;

let todosProprietarios = [];

function escaparHtml(valor = '') {
  return String(valor)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatarCpf(valor = '') {
  const d = digits(valor);
  return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : valor;
}

// Tira acentos e maiúsculas: "José" encontra "jose"
const normalizar = (s = '') =>
  String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function filtrarProprietarios(termo) {
  const texto = normalizar(termo);
  const numeros = digits(termo);

  return todosProprietarios
    .filter((c) => {
      const nome = normalizar(c.nome);
      const doc = digits(c.cpf_cnpj);
      return nome.includes(texto) || (numeros !== '' && doc.includes(numeros));
    })
    .slice(0, 8); // no máximo 8 sugestões
}

// Carrega a lista uma vez, igual à tela de pesquisar cliente
async function carregarProprietarios() {
  try {
    const resposta = await fetch(ROTA_PROPRIETARIOS);
    if (!resposta.ok) throw new Error('Falha ao buscar proprietários');
    todosProprietarios = await resposta.json();
  } catch (error) {
    console.error(error);
    ownerError.textContent = 'Não foi possível carregar os proprietários.';
  }
}

carregarProprietarios();

function fecharLista() {
  ownerList.hidden = true;
  ownerInput.setAttribute('aria-expanded', 'false');
}

function mostrarLista(pessoas) {
  ownerList.innerHTML = pessoas.length
    ? pessoas.map(c => `
        <li role="option" data-id="${c.id_cliente}" data-nome="${escaparHtml(c.nome)}">
          ${escaparHtml(c.nome)} <small>${escaparHtml(formatarCpf(c.cpf_cnpj))}</small>
        </li>`).join('')
    : '<li class="empty">Nenhum proprietário encontrado</li>';

  ownerList.hidden = false;
  ownerInput.setAttribute('aria-expanded', 'true');
}

ownerInput.addEventListener('input', () => {
  // Digitou de novo: o proprietário escolhido antes deixa de valer
  ownerIdInput.value = '';
  ownerError.textContent = '';
  ownerInput.setCustomValidity(
    ownerInput.value ? 'Selecione um proprietário da lista' : ''
  );

  const termo = ownerInput.value.trim();
  if (termo.length < 2) {
    fecharLista();
    return;
  }

  mostrarLista(filtrarProprietarios(termo));
});

// Escolher um item da lista
ownerList.addEventListener('click', (event) => {
  const item = event.target.closest('li[data-id]');
  if (!item) return;

  ownerInput.value = item.dataset.nome;
  ownerIdInput.value = item.dataset.id;
  ownerInput.setCustomValidity('');
  ownerError.textContent = '';
  fecharLista();
});

// Fechar ao clicar fora ou apertar Esc
document.addEventListener('click', (event) => {
  if (!event.target.closest('.combobox')) fecharLista();
});
ownerInput.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') fecharLista();
});

function validarProprietario() {
  if (!ownerIdInput.value) {
    ownerInput.setCustomValidity('Selecione um proprietário da lista');
    // Só mostra a mensagem embaixo se a pessoa digitou algo
    ownerError.textContent = ownerInput.value
      ? 'Selecione um proprietário da lista.'
      : '';
  } else {
    ownerInput.setCustomValidity('');
    ownerError.textContent = '';
  }
}

// =====================================================
// MÁSCARA E VALIDAÇÃO DE DINHEIRO (venda, mínimo de venda, cotação)
// =====================================================
const formatarDinheiro = (n) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function dinheiroParaNumero(texto) {
  const centavos = digits(texto);
  return centavos ? Number(centavos) / 100 : 0;
}

// As três colunas são DECIMAL(10,2): até 99.999.999,99
const CAMPOS_DINHEIRO = {
  saleValue:      { max: 99999999.99, rotulo: 'Valor de venda' },
  minSaleValue:   { max: 99999999.99, rotulo: 'Valor mínimo de venda' },
  appraisalValue: { max: 99999999.99, rotulo: 'Cotação' }
};

const saleValueInput = document.getElementById('saleValue');
const minSaleValueInput = document.getElementById('minSaleValue');

function validarDinheiro(id) {
  const input = document.getElementById(id);
  const erro = document.getElementById(`${id}-error`);
  const { max, rotulo } = CAMPOS_DINHEIRO[id];
  const numero = dinheiroParaNumero(input.value);
  let mensagem = '';

  if (digits(input.value) === '') {
    mensagem = ''; // vazio: o "required" cuida do valor de venda; os outros são opcionais
  } else if (numero <= 0) {
    mensagem = 'Informe um valor maior que zero.';
  } else if (numero > max) {
    mensagem = `${rotulo} máximo: R$ ${formatarDinheiro(max)}`;
  } else if (id === 'minSaleValue') {
    const venda = dinheiroParaNumero(saleValueInput.value);
    if (venda > 0 && numero > venda) {
      mensagem = 'O valor mínimo não pode ser maior que o valor de venda.';
    }
  }

  erro.textContent = mensagem;
  input.setCustomValidity(mensagem);
}

Object.keys(CAMPOS_DINHEIRO).forEach((id) => {
  const input = document.getElementById(id);

  input.addEventListener('input', () => {
    // limita a 12 dígitos para o número não crescer sem fim
    const centavos = digits(input.value).slice(0, 12);

    input.value = centavos ? formatarDinheiro(Number(centavos) / 100) : '';
    validarDinheiro(id);

    // mudou o valor de venda: o mínimo precisa ser revalidado
    if (id === 'saleValue' && minSaleValueInput.value) validarDinheiro('minSaleValue');
  });
});

// =====================================================
// ÁREA TOTAL (m²): números com até 2 casas decimais
// =====================================================
const totalAreaInput = document.getElementById('totalArea');
const totalAreaError = document.getElementById('totalArea-error');
const AREA_MAX = 9999999.99;

function areaParaNumero(texto) {
  return Number(String(texto).replace(/\./g, '').replace(',', '.')) || 0;
}

function validarArea() {
  const texto = totalAreaInput.value.trim();
  const numero = areaParaNumero(texto);
  let mensagem = '';

  if (texto === '') {
    mensagem = ''; // campo opcional
  } else if (numero <= 0) {
    mensagem = 'Informe uma área maior que zero.';
  } else if (numero > AREA_MAX) {
    mensagem = 'Área máxima: 9.999.999,99 m²';
  }

  totalAreaError.textContent = mensagem;
  totalAreaInput.setCustomValidity(mensagem);
}

totalAreaInput.addEventListener('input', () => {
  let valor = totalAreaInput.value.replace(/[^\d,]/g, ''); // só dígitos e vírgula

  // Mantém apenas a primeira vírgula
  const [inteiro, ...resto] = valor.split(',');
  valor = resto.length
    ? `${inteiro.slice(0, 7)},${resto.join('').slice(0, 2)}`
    : inteiro.slice(0, 7);

  totalAreaInput.value = valor;
  validarArea();
});

totalAreaInput.addEventListener('blur', validarArea);

// =====================================================
// DATA DE DISPONIBILIDADE (opcional; pode ser passada ou futura)
// =====================================================
const availabilityInput = document.getElementById('availabilityDate');
const availabilityError = document.getElementById('availabilityDate-error');

function calcularErroDisponibilidade() {
  const valor = availabilityInput.value; // AAAA-MM-DD, ou '' se incompleto

  if (!valor || availabilityInput.type !== 'date') return '';

  const ano = Number(valor.split('-')[0]);
  if (ano < 1000) return 'Informe o ano com 4 dígitos.';
  return '';
}

// mostrar = false: só marca o campo como inválido, sem exibir a mensagem
function validarDisponibilidade(mostrar = true) {
  const mensagem = calcularErroDisponibilidade();

  availabilityInput.setCustomValidity(mensagem);
  availabilityError.textContent = mostrar ? mensagem : '';
  return mensagem;
}

// Durante a digitação: valida em silêncio, sem mensagem nem balão
availabilityInput.addEventListener('input', () => validarDisponibilidade(false));
availabilityInput.addEventListener('change', () => validarDisponibilidade(false));

// Ao sair do campo: agora sim mostra a mensagem
availabilityInput.addEventListener('blur', () => validarDisponibilidade(true));

// =====================================================
// CEP (máscara, validação e preenchimento automático)
// =====================================================
const postalInput = document.getElementById('postalCode');
const postalError = document.getElementById('postal-error');

postalInput.addEventListener('input', () => {
  postalInput.value = digits(postalInput.value).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');

  if (postalError.textContent) validarCep();
});

function validarCep() {
  const qtd = digits(postalInput.value).length;
  let mensagem = '';

  if (qtd > 0 && qtd < 8) mensagem = 'CEP incompleto: informe os 8 dígitos.';

  postalError.textContent = mensagem;
  postalInput.setCustomValidity(mensagem);
}

postalInput.addEventListener('blur', async () => {
  validarCep();

  const cep = digits(postalInput.value);
  if (cep.length !== 8) return;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();

    if (!data.erro) {
      document.getElementById('street').value = data.logradouro || '';
      document.getElementById('neighborhood').value = data.bairro || '';
      document.getElementById('city').value = data.localidade || '';
      document.getElementById('state').value = data.uf || '';
    }
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
  }
});

// =====================================================
// UPLOAD DE ARQUIVOS (clique ou arrastar e soltar)
// Uma função só, usada pelos dois documentos
// =====================================================
const TIPOS_ACEITOS = ['application/pdf', 'image/png', 'image/jpeg'];
const TAMANHO_MAX = 5 * 1024 * 1024; // 5 MB

// Devolve a mensagem de erro, ou '' se o arquivo for válido
function validarArquivo(file) {
  if (!TIPOS_ACEITOS.includes(file.type)) return 'Selecione um PDF, PNG ou JPG.';
  if (file.size > TAMANHO_MAX) return 'O arquivo deve ter no máximo 5 MB.';
  return '';
}

function configurarUpload({ inputId, zoneId, nameId, errorId }) {
  const input = document.getElementById(inputId);
  const zone = document.getElementById(zoneId);
  const nome = document.getElementById(nameId);
  const erro = document.getElementById(errorId);
  const textoPadrao = nome.textContent;

  function limpar() {
    input.value = '';
    nome.textContent = textoPadrao;
  }

  function escolher(file) {
    // Cancelou a janela de seleção: volta ao estado inicial
    if (!file) {
      limpar();
      return;
    }

    const mensagem = validarArquivo(file);

    if (mensagem) {
      limpar();
      erro.textContent = mensagem;
      return;
    }

    nome.textContent = file.name;
    erro.textContent = '';
  }

  // Clique: o input cobre a área inteira, então o clique abre a janela de seleção
  input.addEventListener('change', () => escolher(input.files[0]));

  // Arrastar e soltar
  zone.addEventListener('dragover', (event) => {
    event.preventDefault();
    zone.classList.add('dragover');
  });

  zone.addEventListener('dragleave', (event) => {
    // Só remove o destaque se saiu mesmo da área (e não foi para um filho)
    if (!zone.contains(event.relatedTarget)) zone.classList.remove('dragover');
  });

  zone.addEventListener('drop', (event) => {
    event.preventDefault();
    zone.classList.remove('dragover');

    const file = event.dataTransfer.files[0]; // só o primeiro, se soltar vários
    if (!file) return;

    const mensagem = validarArquivo(file);

    if (mensagem) {
      limpar();
      erro.textContent = mensagem;
      return;
    }

    // Coloca o arquivo dentro do input, para o "required" e o envio enxergarem
    const transferencia = new DataTransfer();
    transferencia.items.add(file);
    input.files = transferencia.files;

    escolher(file);
  });

  return { input, erro, limpar };
}

const uploadPosse = configurarUpload({
  inputId: 'possessionProof',
  zoneId: 'possession-drop-zone',
  nameId: 'possession-file-name',
  errorId: 'possession-file-error'
});

const uploadMatricula = configurarUpload({
  inputId: 'registryCertificate',
  zoneId: 'registry-drop-zone',
  nameId: 'registry-file-name',
  errorId: 'registry-file-error'
});

// Evita que o navegador abra o arquivo se for solto fora das áreas
['dragover', 'drop'].forEach((tipo) => {
  window.addEventListener(tipo, (event) => event.preventDefault());
});

// =====================================================
// Campos específicos conforme o tipo de imóvel
// =====================================================
const propertyType = document.getElementById('propertyType');
const terrenoFields = document.getElementById('terreno-fields');
const casaApeFields = document.getElementById('casa-ape-fields');

function atualizarCamposTipoImovel() {
  const tipo = propertyType.value;

  terrenoFields.hidden = tipo !== 'terreno';
  casaApeFields.hidden = tipo !== 'casa_ape';

  terrenoFields.querySelectorAll('input, select').forEach(campo => {
    campo.required = tipo === 'terreno';
  });

  casaApeFields.querySelectorAll('input, select').forEach(campo => {
    campo.required = tipo === 'casa_ape' &&
      campo.id !== 'valorCondominio';
  });
}

propertyType.addEventListener('change', atualizarCamposTipoImovel);
atualizarCamposTipoImovel();

// =====================================================
// ENVIO DO FORMULÁRIO
// =====================================================
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Roda todas as validações, para os erros aparecerem mesmo
  // se a pessoa não passou por algum campo
  validarProprietario();
  Object.keys(CAMPOS_DINHEIRO).forEach(validarDinheiro);
  validarArea();
  validarDisponibilidade();
  validarCep();

  if (!uploadPosse.input.files[0]) {
    uploadPosse.erro.textContent = 'Anexe o comprovante de posse.';
  }
  if (!uploadMatricula.input.files[0]) {
    uploadMatricula.erro.textContent = 'Anexe a certidão de matrícula.';
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  saveStatus.textContent = 'Salvando cadastro...';

  try {
    const dadosImovel = {
      tipo_imovel: form.elements.propertyType.value,
      matricula_imovel: form.elements.registrationNumber.value.trim(),
      inscricao_iptu: form.elements.iptuNumber.value.trim(),
      situacao_legal: form.elements.legalStatus.value.trim(),
      descricao_imovel: form.elements.propertyDescription.value.trim() || null,
      area_total: areaParaNumero(form.elements.totalArea.value) || null,
      data_disponibilidade: form.elements.availabilityDate.value.trim() || null,
      valor_venda: dinheiroParaNumero(form.elements.saleValue.value),
      valor_minimo_venda: dinheiroParaNumero(form.elements.minSaleValue.value) || null,
      cotacao_imovel: dinheiroParaNumero(form.elements.appraisalValue.value) || null,
      observacao: form.elements.notes.value.trim() || null,
      cep: digits(form.elements.postalCode.value),
      logradouro: form.elements.street.value.trim(),
      numero: form.elements.number.value.trim(),
      complemento: form.elements.complement.value.trim() || null,
      bairro: form.elements.neighborhood.value.trim(),
      cidade: form.elements.city.value.trim(),
      uf: form.elements.state.value
    };

    const formData = new FormData();

    for (const [campo, valor] of Object.entries(dadosImovel)) {
      formData.append(campo, valor ?? '');
    }

    formData.append('id_proprietario', ownerIdInput.value);
    formData.append('prazo_venda', form.elements.saleDeadline.value || '');
    formData.append('observacao_proprietario', form.elements.ownerNotes.value.trim());

    // Campos específicos conforme o tipo de imóvel
    if (propertyType.value === 'terreno') {
      formData.append('zona', form.elements.zona.value);
      formData.append('tipo_terreno', form.elements.tipoTerreno.value);

    } else if (propertyType.value === 'casa_ape') {
      formData.append(
        'valor_iptu_anual',
        areaParaNumero(form.elements.valorIptuAnual.value)
      );

      formData.append(
        'data_ultimo_iptu',
        form.elements.dataUltimoIptu.value
      );

      formData.append(
        'valor_condominio',
        form.elements.valorCondominio.value.trim()
          ? areaParaNumero(form.elements.valorCondominio.value)
          : ''
      );
    }

    formData.append('comprovante_posse', uploadPosse.input.files[0]);
    formData.append('certidao_matricula', uploadMatricula.input.files[0]);

    const resposta = await fetch(`${API}/imovel`, {
      method: 'POST',
      body: formData
    });

    // Se o back responder sem corpo, não quebra
    const resultado = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(
        resultado.erro ||
        resultado.detalhes ||
        'Erro ao cadastrar imóvel.'
      );
    }

    saveStatus.textContent = 'Imóvel cadastrado com sucesso!';

    // Limpeza completa depois do cadastro
    form.reset();
    atualizarCamposTipoImovel();
    form.querySelectorAll('input, select').forEach((el) => el.setCustomValidity(''));
    document.querySelectorAll('.error').forEach((span) => { span.textContent = ''; });
    ownerIdInput.value = '';
    fecharLista();
    uploadPosse.limpar();
    uploadMatricula.limpar();
    availabilityInput.type = 'text';

  } catch (error) {
    console.error('Erro na requisição:', error);
    saveStatus.textContent = error.message;

  } finally {
    button.disabled = false;

    setTimeout(() => {
      saveStatus.textContent = '';
    }, 4000);
  }
});