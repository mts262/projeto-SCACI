const form = document.getElementById('employee-form');
const saveStatus = document.getElementById('save-status');
const cpfInput = document.getElementById('document');
const emailInput = document.getElementById('email');
const salaryInput = document.getElementById('salary');

// Helper para manter apenas dígitos
const digits = (str) => (str || '').replace(/\D/g, '');

// Máscara CPF 
form.elements.document.addEventListener('input', event => {
  const value = digits(event.target.value).slice(0, 11);
  event.target.value = value
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
});

// Validação de CPF (11 dígitos)
const cpfError = document.getElementById('document-error');

function validarCpf() {
  const qtd = digits(cpfInput.value).length;

  if (qtd > 0 && qtd < 11) {
    cpfError.textContent = 'CPF incompleto: informe os 11 dígitos.';
    cpfInput.setCustomValidity('CPF incompleto');
    return false;
  }

  cpfError.textContent = '';
  cpfInput.setCustomValidity('');
  return true;
}

// Ao sair do campo e ao digitar (para o erro sumir quando completar)
cpfInput.addEventListener('blur', validarCpf);
cpfInput.addEventListener('input', () => {
  if (cpfError.textContent) validarCpf();
});

// Máscara Telefone
form.elements.phone.addEventListener('input', event => {
  const value = digits(event.target.value).slice(0, 11);
  event.target.value = value.replace(/^(\d{2})(\d)/, '$1 $2').replace(/(\d{4,5})(\d{4})$/, '$1-$2');
});

// Validação de email
const emailError = document.getElementById('email-error');

function validarEmail() {
  const valor = emailInput.value.trim();

  // vazio fica por conta do "required"
  if (valor === '') {
    emailError.textContent = '';
    emailInput.setCustomValidity('');
    return true;
  }

  // algo@dominio.ext 
  const valido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor);

  if (!valido) {
    emailError.textContent = 'Email inválido. Exemplo: nome@dominio.com';
    emailInput.setCustomValidity('Email inválido');
    return false;
  }

  emailError.textContent = '';
  emailInput.setCustomValidity('');
  return true;
}

emailInput.addEventListener('blur', validarEmail);
emailInput.addEventListener('input', () => {
  if (emailError.textContent) validarEmail();
});

// Validação de salário
// Máscara de salário (centavos)
const salaryError = document.getElementById('salary-error');
const SALARIO_MAX = 99999.99;

function salarioParaNumero(texto) {
  const centavos = digits(texto);
  return centavos ? Number(centavos) / 100 : 0;
}

salaryInput.addEventListener('input', () => {
  const numero = salarioParaNumero(salaryInput.value);

  if (digits(salaryInput.value) === '') {
    salaryInput.value = '';
    salaryError.textContent = '';
    salaryInput.setCustomValidity('');
    return;
  }

  salaryInput.value = numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  if (numero > SALARIO_MAX) {
    salaryError.textContent = 'Salário máximo: R$ 99.999,99';
    salaryInput.setCustomValidity('Salário acima do máximo');
  } else if (numero <= 0) {
    salaryInput.setCustomValidity('Salário inválido');
  } else {
    salaryError.textContent = '';
    salaryInput.setCustomValidity('');
  }
});

form.addEventListener('submit', async (e) => {

    e.preventDefault();

    validarCpf();
    validarEmail();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    try {

        const dadosFuncionario = {
            nome: form.elements.name.value,
            cpf: digits(form.elements.document.value),
            salario: salarioParaNumero(form.elements.salary.value),
            funcao: form.elements.jobTitle.value.trim() || null,
            telefone: digits(form.elements.phone.value),
            email: form.elements.email.value.trim().toLowerCase(),
        };

        const resposta = await fetch('http://localhost:3000/funcionario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosFuncionario)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro ||
                resultado.detalhes ||
                'Erro ao cadastrar funcionário.'
            );
        }

        saveStatus.textContent = 'Funcionário cadastrado com sucesso!';
        form.reset();

    } catch (error) {

        console.error('Erro na requisição:', error);

        saveStatus.textContent = error.message;

    } finally {

        setTimeout(() => {
            saveStatus.textContent = '';
        }, 4000);
    }
});


