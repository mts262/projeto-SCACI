const form = document.getElementById('buyer-form');
const saveStatus = document.getElementById('save-status');

// Helper para manter apenas dígitos
const digits = (str) => (str || '').replace(/\D/g, '');

// =====================================================
// COMBOBOX DE CLIENTE
// =====================================================
const clientInput = document.getElementById('client');
const clientIdInput = document.getElementById('clientId');
const clientList = document.getElementById('client-list');
const clientError = document.getElementById('client-error');

let todosClientes = [];

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

function filtrarClientes(termo) {
  const texto = normalizar(termo);
  const numeros = digits(termo);

  return todosClientes
    .filter((c) => {
      const nome = normalizar(c.nome);
      const doc = digits(c.cpf_cnpj);
      return nome.includes(texto) || (numeros !== '' && doc.includes(numeros));
    })
    .slice(0, 8); // no máximo 8 sugestões
}

// Carrega todos os clientes uma vez, igual à tela de pesquisar cliente
async function carregarClientes() {
  try {
    const resposta = await fetch('http://localhost:3000/clientes');
    if (!resposta.ok) throw new Error('Falha ao buscar clientes');
    todosClientes = await resposta.json();
  } catch (error) {
    console.error(error);
    clientError.textContent = 'Não foi possível carregar os clientes.';
  }
}

carregarClientes();

function fecharLista() {
  clientList.hidden = true;
  clientInput.setAttribute('aria-expanded', 'false');
}

function mostrarLista(clientes) {
  clientList.innerHTML = clientes.length
    ? clientes.map(c => `
        <li role="option" data-id="${c.id_cliente}" data-nome="${escaparHtml(c.nome)}">
          ${escaparHtml(c.nome)} <small>${escaparHtml(formatarCpf(c.cpf_cnpj))}</small>
        </li>`).join('')
    : '<li class="empty">Nenhum cliente encontrado</li>';

  clientList.hidden = false;
  clientInput.setAttribute('aria-expanded', 'true');
}

clientInput.addEventListener('input', () => {
  // Digitou de novo: o cliente escolhido antes deixa de valer
  clientIdInput.value = '';
  clientError.textContent = '';
  clientInput.setCustomValidity(
    clientInput.value ? 'Selecione um cliente da lista' : ''
  );

  const termo = clientInput.value.trim();
  if (termo.length < 2) {
    fecharLista();
    return;
  }

  mostrarLista(filtrarClientes(termo));
});

// Escolher um item da lista
clientList.addEventListener('click', (event) => {
  const item = event.target.closest('li[data-id]');
  if (!item) return;

  clientInput.value = item.dataset.nome;
  clientIdInput.value = item.dataset.id;
  clientInput.setCustomValidity('');
  clientError.textContent = '';
  fecharLista();
});

// Fechar ao clicar fora ou apertar Esc
document.addEventListener('click', (event) => {
  if (!event.target.closest('.combobox')) fecharLista();
});
clientInput.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') fecharLista();
});

function validarCliente() {
  if (!clientIdInput.value) {
    clientInput.setCustomValidity('Selecione um cliente da lista');
    // Só mostra a mensagem embaixo se a pessoa digitou algo
    clientError.textContent = clientInput.value
      ? 'Selecione um cliente da lista.'
      : '';
  } else {
    clientInput.setCustomValidity('');
    clientError.textContent = '';
  }
}

// =====================================================
// MÁSCARA E VALIDAÇÃO DE DINHEIRO (renda, valor mínimo, valor máximo)
// =====================================================
const formatarDinheiro = (n) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function dinheiroParaNumero(texto) {
  const centavos = digits(texto);
  return centavos ? Number(centavos) / 100 : 0;
}

// Limites realistas (a coluna aceita mais, mas isso evita valores absurdos)
const CAMPOS_DINHEIRO = {
  income:   { max: 9999999.99,  rotulo: 'Renda mensal' },
  minValue: { max: 99999999.99, rotulo: 'Valor mínimo' },
  maxValue: { max: 99999999.99, rotulo: 'Valor máximo' }
};

const minValueInput = document.getElementById('minValue');
const maxValueInput = document.getElementById('maxValue');

function validarDinheiro(id) {
  const input = document.getElementById(id);
  const erro = document.getElementById(`${id}-error`);
  const { max, rotulo } = CAMPOS_DINHEIRO[id];
  const numero = dinheiroParaNumero(input.value);
  let mensagem = '';

  if (digits(input.value) === '') {
    mensagem = ''; // vazio fica por conta do "required"
  } else if (numero <= 0) {
    mensagem = 'Informe um valor maior que zero.';
  } else if (numero > max) {
    mensagem = `${rotulo} máximo: R$ ${formatarDinheiro(max)}`;
  } else if (id === 'maxValue') {
    const minimo = dinheiroParaNumero(minValueInput.value);
    if (minimo > 0 && minimo > numero) {
      mensagem = 'O valor máximo deve ser maior ou igual ao mínimo.';
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

    // mudou o mínimo: o máximo precisa ser revalidado
    if (id === 'minValue' && maxValueInput.value) validarDinheiro('maxValue');
  });
});

// =====================================================
// PRAZO DA COMPRA: não aceita data no passado
// =====================================================
const deadlineInput = document.getElementById('purchaseDeadline');
const deadlineError = document.getElementById('purchaseDeadline-error');

function hojeISO() {
  const agora = new Date();
  // Usa a data local (toISOString usaria UTC e poderia dar o dia errado à noite)
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function calcularErroPrazo() {
  const valor = deadlineInput.value; // AAAA-MM-DD, ou '' se incompleto

  if (!valor || deadlineInput.type !== 'date') return '';

  const ano = Number(valor.split('-')[0]);

  if (ano < 1000) return 'Informe o ano com 4 dígitos.';
  if (valor < hojeISO()) return 'O prazo não pode ser uma data passada.';
  return '';
}

// mostrar = false: só marca o campo como inválido, sem exibir a mensagem
function validarPrazo(mostrar = true) {
  const mensagem = calcularErroPrazo();

  deadlineInput.setCustomValidity(mensagem);
  deadlineError.textContent = mostrar ? mensagem : '';
  return mensagem;
}

// Define o mínimo quando o campo vira "date" (no foco)
deadlineInput.addEventListener('focus', () => {
  deadlineInput.min = hojeISO();
});

// Durante a digitação: valida em silêncio, sem mensagem nem balão
deadlineInput.addEventListener('input', () => validarPrazo(false));
deadlineInput.addEventListener('change', () => validarPrazo(false));

// Ao sair do campo: agora sim mostra a mensagem
deadlineInput.addEventListener('blur', () => validarPrazo(true));

// =====================================================
// ÁREA MÍNIMA (m²): números com até 2 casas decimais
// =====================================================
const minAreaInput = document.getElementById('minArea');
const minAreaError = document.getElementById('minArea-error');
const AREA_MAX = 9999999.99;

function areaParaNumero(texto) {
  return Number(String(texto).replace(/\./g, '').replace(',', '.')) || 0;
}

function validarArea() {
  const texto = minAreaInput.value.trim();
  const numero = areaParaNumero(texto);
  let mensagem = '';

  if (texto === '') {
    mensagem = ''; // vazio fica por conta do "required"
  } else if (numero <= 0) {
    mensagem = 'Informe uma área maior que zero.';
  } else if (numero > AREA_MAX) {
    mensagem = 'Área máxima: 9.999.999,99 m²';
  }

  minAreaError.textContent = mensagem;
  minAreaInput.setCustomValidity(mensagem);
}

minAreaInput.addEventListener('input', () => {
  let valor = minAreaInput.value.replace(/[^\d,]/g, ''); // só dígitos e vírgula

  // Mantém apenas a primeira vírgula
  const [inteiro, ...resto] = valor.split(',');
  valor = resto.length
    ? `${inteiro.slice(0, 7)},${resto.join('').slice(0, 2)}`
    : inteiro.slice(0, 7);

  minAreaInput.value = valor;
  validarArea();
});

minAreaInput.addEventListener('blur', validarArea);

// =====================================================
// UPLOAD DO COMPROVANTE DE RENDA (clique ou arrastar e soltar)
// =====================================================
const proof = document.getElementById('proof');
const dropZone = document.getElementById('drop-zone');
const fileName = document.getElementById('file-name');
const fileError = document.getElementById('file-error');

const TEXTO_PADRAO_UPLOAD = fileName.textContent;
const TIPOS_ACEITOS = ['application/pdf', 'image/png', 'image/jpeg'];
const TAMANHO_MAX = 5 * 1024 * 1024; // 5 MB

function limparArquivo() {
  proof.value = '';
  fileName.textContent = TEXTO_PADRAO_UPLOAD;
}

// Devolve a mensagem de erro, ou '' se o arquivo for válido
function validarArquivo(file) {
  if (!TIPOS_ACEITOS.includes(file.type)) {
    return 'Selecione um PDF, PNG ou JPG.';
  }
  if (file.size > TAMANHO_MAX) {
    return 'O arquivo deve ter no máximo 5 MB.';
  }
  return '';
}

function escolherArquivo(file) {
  // Cancelou a janela de seleção: volta ao estado inicial
  if (!file) {
    limparArquivo();
    return;
  }

  const mensagem = validarArquivo(file);

  if (mensagem) {
    limparArquivo();
    fileError.textContent = mensagem;
    return;
  }

  fileName.textContent = file.name;
  fileError.textContent = '';
}

// Clique: o input cobre a área inteira, então o clique abre a janela de seleção
proof.addEventListener('change', () => escolherArquivo(proof.files[0]));

// Arrastar e soltar
dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', (event) => {
  // Só remove o destaque se saiu mesmo da área (e não foi para um filho)
  if (!dropZone.contains(event.relatedTarget)) {
    dropZone.classList.remove('dragover');
  }
});

dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragover');

  const file = event.dataTransfer.files[0]; // só o primeiro, se soltar vários
  if (!file) return;

  const mensagem = validarArquivo(file);

  if (mensagem) {
    limparArquivo();
    fileError.textContent = mensagem;
    return;
  }

  // Coloca o arquivo dentro do input, para o "required" e o submit enxergarem
  const transferencia = new DataTransfer();
  transferencia.items.add(file);
  proof.files = transferencia.files;

  escolherArquivo(file);
});

// Evita que o navegador abra o arquivo se for solto fora da área
['dragover', 'drop'].forEach((tipo) => {
  window.addEventListener(tipo, (event) => event.preventDefault());
});

// =====================================================
// ENVIO DO FORMULÁRIO
// =====================================================
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Roda todas as validações, para os erros aparecerem mesmo
  // se a pessoa não passou por algum campo
  validarCliente();
  Object.keys(CAMPOS_DINHEIRO).forEach(validarDinheiro);
  validarArea();
  validarPrazo();

  if (!proof.files[0]) {
    fileError.textContent = 'Anexe o comprovante de renda.';
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  try {
    const dadosComprador = {
      renda_mensal: dinheiroParaNumero(form.elements.income.value),
      profissao: form.elements.occupation.value.trim() || null,
      forma_pagamento: form.elements.paymentType.value,
      tipo_imovel_desejado: form.elements.desiredPropertyType.value.trim() || null,
      faixa_valor_min: dinheiroParaNumero(form.elements.minValue.value) || null,
      faixa_valor_max: dinheiroParaNumero(form.elements.maxValue.value) || null,
      prazo_compra: form.elements.purchaseDeadline.value.trim() || null,
      descricao_desejada: form.elements.desiredDescription.value.trim() || null,
      area_minima_desejada: areaParaNumero(form.elements.minArea.value) || null,
      localizacao_desejada: form.elements.desiredLocation.value.trim() || null
    };

    const formData = new FormData();

    for (const [campo, valor] of Object.entries(dadosComprador)) {
      formData.append(campo, valor ?? '');
    }

    formData.append('id_cliente', clientIdInput.value);
    formData.append('comprovante_renda', proof.files[0]);

    const resposta = await fetch('http://localhost:3000/comprador', {
      method: 'POST',
      body: formData
    });

    // Se o back responder sem corpo, não quebra
    const resultado = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(
        resultado.erro ||
        resultado.detalhes ||
        'Erro ao cadastrar comprador.'
      );
    }

    saveStatus.textContent = 'Comprador cadastrado com sucesso!';

    // Limpeza completa depois do cadastro
    form.reset();
    form.querySelectorAll('input, select').forEach((el) => el.setCustomValidity(''));
    document.querySelectorAll('.error').forEach((span) => { span.textContent = ''; });
    clientIdInput.value = '';
    fecharLista();
    limparArquivo();
    deadlineInput.type = 'text';

  } catch (error) {
    console.error('Erro na requisição:', error);
    saveStatus.textContent = error.message;

  } finally {
    setTimeout(() => {
      saveStatus.textContent = '';
    }, 4000);
  }
});