const form=document.querySelector('#funcionario-form');
const status=querySelector('#salve-status');
const initialFuncionario = {
  nome: 'Ex:Carlos Eduardo Almeida',
  cpf: 'Ex:09345634560',
  salario: 'Ex:1950,30',
  funcao: 'Ex: Serviçosgerais',
  email: 'Ex: carlos@imobiliaria.com.br',
  telefone: '71 98888-1234'
};
const digits = value => value.replace(/\D/g, '');

function populateFuncionario(data) {
  const source = { ...initialFuncionario, ...data };

  form.elements.name.value = source.name ?? source.nome ?? '';
  form.elements.cpf.value = source.cpf ?? '';
  form.elements.salario.value = source.salario ?? '';
  form.elements.funcao.value = source.funcao ?? '';
  form.elements.email.value = source.email ?? '';
  form.elements.phone.value = source.phone ?? source.telefone ?? '';
}

function formatCPF(value) {
  const digitsOnly = digits(value).slice(0, 11);
  return digitsOnly
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\.\d{3})(\d)/, '$1-$2');
}

function formatPhone(value) {
  const valueDigits = digits(value).slice(0, 11);
  return valueDigits
    .replace(/^(\d{2})(\d)/, '$1 $2')
    .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
}

// Aplicação de máscaras em tempo real
form.elements.cpf.addEventListener('input', event => {
  event.target.value = formatCPF(event.target.value);
});

form.elements.phone.addEventListener('input', event => {
  event.target.value = formatPhone(event.target.value);
});

// Limpa mensagens de erro e status ao digitar
form.addEventListener('input', () => {
  status.textContent = '';
  document.querySelector('#cpf-error').textContent = '';
});

async function carregarFuncionario() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    populateFuncionario(initialFuncionario);
    return;
  }

  try {
    const resposta = await fetch(`http://localhost:3000/funcionario/${id}`);

    if (!resposta.ok) {
      throw new Error('Funcionário não encontrado');
    }

    const funcionario = await resposta.json();
    populateFuncionario(funcionario);
  } catch {
    populateFuncionario(initialFuncionario);
    status.textContent = 'Não foi possível carregar os dados do servidor. Usando dados locais.';
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();

  const checks = [
    ['name', form.elements.name.value.trim().length >= 3, 'Informe o nome completo.'],
    ['cpf', digits(form.elements.cpf.value).length === 11, 'Informe um CPF válido com 11 dígitos.', '#cpf-error'],
    ['salario', form.elements.salario.value !== '', 'Informe o salário base.'],
    ['email', form.elements.email.value.trim() !== '', 'Informe o e-mail.'],
    ['phone', [10, 11].includes(digits(form.elements.phone.value).length), 'Informe o telefone com DDD.'],
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

  const button = document.querySelector('[type="submit"][form="funcionario-form"]');
  if (button) button.disabled = true;

  const payload = {
    name: form.elements.name.value.trim(),
    cpf: digits(form.elements.cpf.value),
    salario: parseFloat(form.elements.salario.value),
    funcao: form.elements.funcao.value.trim() || null,
    email: form.elements.email.value.trim(),
    phone: form.elements.phone.value.trim()
  };

  try {
    const id = new URLSearchParams(window.location.search).get('id');
    const url = id ? `http://localhost:3000/funcionario/${id}` : 'http://localhost:3000/funcionario';

    const resposta = await fetch(url, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const resultado = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(resultado.erro || resultado.mensagem || 'Não foi possível salvar o funcionário.');
    }

    status.textContent = 'Funcionário salvo com sucesso!';
  } catch (error) {
    status.textContent = error.message;
  } finally {
    if (button) button.disabled = false;
  }
});
carregarFuncionario();