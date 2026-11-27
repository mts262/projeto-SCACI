const API = 'http://localhost:3000';

const form = document.getElementById('buyer-form');
const saveStatus = document.getElementById('save-status');
const saveButton = form.querySelector('[type="submit"]');

// O comprador é identificado pelo id_cliente; a listagem envia ?id= e a pesquisa ?id_comprador=
const parametros = new URLSearchParams(window.location.search);
const idComprador = parametros.get('id') || parametros.get('id_comprador') || parametros.get('id_cliente');

// Helper para manter apenas dígitos
const digits = (str) => (str || '').replace(/\D/g, '');

// =====================================================
// CLIENTE (somente leitura: o cliente do comprador não muda)
// =====================================================
const clientInput = document.getElementById('client');
const clientError = document.getElementById('client-error');

function formatarCpfCnpj(valor = '') {
  const d = digits(valor);
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return valor;
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

deadlineInput.addEventListener('focus', () => {
  deadlineInput.min = hojeISO();
});
deadlineInput.addEventListener('input', () => validarPrazo(false));
deadlineInput.addEventListener('change', () => validarPrazo(false));
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
    mensagem = '';
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
// UPLOAD DO COMPROVANTE DE RENDA (opcional na edição)
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

proof.addEventListener('change', () => escolherArquivo(proof.files[0]));

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', (event) => {
  if (!dropZone.contains(event.relatedTarget)) {
    dropZone.classList.remove('dragover');
  }
});

dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragover');

  const file = event.dataTransfer.files[0];
  if (!file) return;

  const mensagem = validarArquivo(file);

  if (mensagem) {
    limparArquivo();
    fileError.textContent = mensagem;
    return;
  }

  const transferencia = new DataTransfer();
  transferencia.items.add(file);
  proof.files = transferencia.files;

  escolherArquivo(file);
});

['dragover', 'drop'].forEach((tipo) => {
  window.addEventListener(tipo, (event) => event.preventDefault());
});

// =====================================================
// CARREGAMENTO DOS DADOS DO COMPRADOR
// =====================================================
function definirValor(id, valor) {
  document.getElementById(id).value = valor ?? '';
}

function decimalParaDinheiro(valor) {
  return valor === null || valor === undefined || valor === '' ? '' : formatarDinheiro(Number(valor));
}

function decimalParaArea(valor) {
  return valor === null || valor === undefined || valor === '' ? '' : String(Number(valor)).replace('.', ',');
}

function bloquearFormulario(mensagem) {
  clientError.textContent = mensagem;
  saveButton.disabled = true;
  form.querySelectorAll('input, select').forEach((campo) => { campo.disabled = true; });
}

async function carregarComprador() {
  if (!idComprador || !/^\d+$/.test(idComprador)) {
    bloquearFormulario('Comprador não informado. Volte à listagem e escolha um comprador.');
    return;
  }

  try {
    const resposta = await fetch(`${API}/comprador/${idComprador}`);
    const comprador = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(comprador.erro || comprador.mensagem || 'Erro ao carregar comprador.');
    }

    const cliente = comprador.cliente ?? {};
    clientInput.value = cliente.cpf_cnpj
      ? `${cliente.nome} (${formatarCpfCnpj(cliente.cpf_cnpj)})`
      : (cliente.nome ?? '');

    definirValor('income', decimalParaDinheiro(comprador.renda_mensal));
    definirValor('occupation', comprador.profissao);
    definirValor('desiredPropertyType', comprador.tipo_imovel_desejado);
    definirValor('minValue', decimalParaDinheiro(comprador.faixa_valor_min));
    definirValor('maxValue', decimalParaDinheiro(comprador.faixa_valor_max));
    definirValor('desiredDescription', comprador.descricao_desejada);
    definirValor('minArea', decimalParaArea(comprador.area_minima_desejada));
    definirValor('desiredLocation', comprador.localizacao_desejada);
    definirValor('paymentType', comprador.forma_pagamento);

    if (comprador.prazo_compra) {
      deadlineInput.type = 'date';
      deadlineInput.value = String(comprador.prazo_compra).slice(0, 10);
    }

    if (comprador.url_comprovante_renda) {
      fileName.textContent =
        'Comprovante de renda já enviado. Para substituir, clique ou arraste um novo arquivo (PDF, PNG, JPG)';
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    bloquearFormulario(error.message === 'Failed to fetch'
      ? 'Não foi possível conectar com o servidor.'
      : error.message);
  }
}

carregarComprador();

// =====================================================
// ENVIO DO FORMULÁRIO
// =====================================================
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  Object.keys(CAMPOS_DINHEIRO).forEach(validarDinheiro);
  validarArea();
  validarPrazo();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  saveButton.disabled = true;
  saveStatus.textContent = 'Salvando alterações...';

  try {
    const dadosComprador = {
      renda_mensal: dinheiroParaNumero(form.elements.income.value),
      profissao: form.elements.occupation.value.trim() || null,
      forma_pagamento: form.elements.paymentType.value,
      tipo_imovel_desejado: form.elements.desiredPropertyType.value.trim() || null,
      faixa_valor_min: dinheiroParaNumero(form.elements.minValue.value) || null,
      faixa_valor_max: dinheiroParaNumero(form.elements.maxValue.value) || null,
      prazo_compra: deadlineInput.type === 'date' ? deadlineInput.value : null,
      descricao_desejada: form.elements.desiredDescription.value.trim() || null,
      area_minima_desejada: areaParaNumero(form.elements.minArea.value) || null,
      localizacao_desejada: form.elements.desiredLocation.value.trim() || null
    };

    const formData = new FormData();

    for (const [campo, valor] of Object.entries(dadosComprador)) {
      formData.append(campo, valor ?? '');
    }

    // O comprovante só é enviado se a pessoa escolheu um novo arquivo
    if (proof.files[0]) {
      formData.append('comprovante_renda', proof.files[0]);
    }

    const resposta = await fetch(`${API}/comprador/${idComprador}`, {
      method: 'PUT',
      body: formData
    });

    const resultado = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(
        resultado.erro ||
        resultado.mensagem ||
        'Erro ao salvar as alterações do comprador.'
      );
    }

    saveStatus.textContent = 'Alterações salvas com sucesso!';

    if (proof.files[0]) {
      limparArquivo();
      fileName.textContent =
        'Comprovante de renda atualizado. Para substituir, clique ou arraste um novo arquivo (PDF, PNG, JPG)';
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    saveStatus.textContent = error.message === 'Failed to fetch'
      ? 'Não foi possível conectar com o servidor.'
      : error.message;
  } finally {
    saveButton.disabled = false;
    setTimeout(() => {
      saveStatus.textContent = '';
    }, 4000);
  }
});
