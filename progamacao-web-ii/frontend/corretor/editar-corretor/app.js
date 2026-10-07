const form = document.querySelector('#corretor-form');
const status = document.querySelector('#save-status');
const initialCorretor = {
  tipo: 'interno',
  creci: '12345',
  nome: 'Carlos Eduardo Almeida',
  cpf_cnpj: '123.456.789-09',
  data_nascimento: '1985-04-12',
  telefone: '71 98888-1234',
  email: 'carlos@imobiliaria.com.br',
  cep: '45000',
  logradouro: 'Rua das Flores',
  numero: '128',
  complemento: 'Bloco A',
  bairro: 'Centro',
  cidade: 'Salvador',
  uf: 'BA'
};

const stateSelect = form.elements.state;
const states = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');

for (const state of states) {
  stateSelect.add(new Option(state, state));
}

const digits = value => value.replace(/\D/g, '');
const today = new Date();
form.elements.birthDate.max = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

function populateCorretor(data) {
  const source = { ...initialCorretor, ...data };

  form.elements.type.value = source.tipo ?? ''; 
  form.elements.creci.value = source.creci_corretor ?? source.creci ?? '';
  form.elements.name.value = source.nome ?? '';
  form.elements.document.value = source.cpf_cnpj ?? '';
  form.elements.birthDate.value = source.data_nascimento ?? '';
  form.elements.phone.value = source.telefone ?? '';
  form.elements.email.value = source.email ?? '';
  form.elements.postalCode.value = source.cep ?? '';
  form.elements.street.value = source.logradouro ?? '';
  form.elements.number.value = source.numero ?? '';
  form.elements.complement.value = source.complemento ?? '';
  form.elements.neighborhood.value = source.bairro ?? '';
  form.elements.city.value = source.cidade ?? '';
  form.elements.state.value = source.uf ?? '';
}

function formatDocument(value) {
  const digitsOnly = digits(value).slice(0, 14);
  if (digitsOnly.length <= 11) {
    return digitsOnly
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\.\d{3})(\d)/, '$1-$2');
  }

  return digitsOnly
    .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})$/, '$1.$2.$3/$4-$5');
}

form.elements.document.addEventListener('input', event => {
  event.target.value = formatDocument(event.target.value);
});

form.elements.postalCode.addEventListener('input', event => {
  event.target.value = digits(event.target.value).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
});

form.elements.phone.addEventListener('input', event => {
  const value = digits(event.target.value).slice(0, 11);
  event.target.value = value.replace(/^(\d{2})(\d)/, '$1 $2').replace(/(\d{4,5})(\d{4})$/, '$1-$2');
});

form.addEventListener('input', () => {
  status.textContent = '';
  document.querySelector('#document-error').textContent = '';
  document.querySelector('#postal-error').textContent = '';
});

async function carregarCorretor() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    populateCorretor(initialCorretor);
    return;
  }

  try {
    const resposta = await fetch(`http://localhost:3000/corretor/${id}`);

    if (!resposta.ok) {
      throw new Error('Corretor não encontrado');
    }

    const corretor = await resposta.json();
    populateCorretor(corretor);
  } catch {
    populateCorretor(initialCorretor);
    status.textContent = 'Não foi possível carregar os dados do servidor. Usando dados locais.';
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();

  const checks = [
    ['type', form.elements.type.value !== '', 'Selecione o tipo do corretor.'],
    ['creci', form.elements.creci.value.trim().length >= 3, 'Informe o CRECI.'],
    ['name', form.elements.name.value.trim().length >= 3, 'Informe o nome completo.'],
    ['document', [11, 14].includes(digits(form.elements.document.value).length), 'Informe 11 dígitos para CPF ou 14 para CNPJ.', '#document-error'],
    ['phone', [10, 11].includes(digits(form.elements.phone.value).length), 'Informe o telefone com DDD.'],
    ['email', form.elements.email.value.trim() !== '', 'Informe o e-mail.'],
  ];

  for (const [key, valid, message, errorSelector] of checks) {
    if (!form.elements[key]) continue;
    form.elements[key].setCustomValidity(valid ? '' : message);
    if (errorSelector) {
      document.querySelector(errorSelector).textContent = valid ? '' : message;
    }
  }

  if (!form.reportValidity()) {
    return;
  }

  const button = form.querySelector('[type="submit"]');
  button.disabled = true;

  const payload = {
    tipo: form.elements.type.value,
    creci_corretor: form.elements.creci.value.trim(),
    nome: form.elements.name.value.trim(),
    cpf_cnpj: digits(form.elements.document.value),
    data_nascimento: form.elements.birthDate.value,
    telefone: form.elements.phone.value.trim(),
    email: form.elements.email.value.trim(),
    cep: digits(form.elements.postalCode.value),
    logradouro: form.elements.street.value.trim(),
    numero: form.elements.number.value.trim(),
    complemento: form.elements.complement.value.trim() || null,
    bairro: form.elements.neighborhood.value.trim(),
    cidade: form.elements.city.value.trim(),
    uf: form.elements.state.value
  };

  try {
    const id = new URLSearchParams(window.location.search).get('id');
    const url = id ? `http://localhost:3000/corretor/${id}` : 'http://localhost:3000/corretor';

    const resposta = await fetch(url, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const resultado = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(resultado.erro || resultado.mensagem || 'Não foi possível salvar o corretor.');
    }

    status.textContent = 'Corretor salvo com sucesso!';
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

// Navegação do menu
document.querySelectorAll('[data-section]').forEach(button => {
    button.addEventListener('click', () => {
        const secao = button.dataset.section;

        if (secao === 'Início') {
            window.location.href = "../../tela-inicial/index.html";
            return;
        }

        if (secao === 'Clientes') {
            window.location.href = "../../cliente/acoes-cliente/index.html";
            return;
        }

        if (secao === 'Corretores') {
            window.location.href = "../acoes-corretor/index.html";
            return;
        }

        document.querySelector('#navigation-message').textContent =
            `A seção “${secao}” ainda não está disponível.`;

        document.querySelector('#navigation-dialog').showModal();
    });
});


carregarCorretor();
