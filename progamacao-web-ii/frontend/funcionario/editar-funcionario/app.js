document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#funcionario-form');
  const status = document.querySelector('#save-status');
  const API_BASE_URL = 'http://localhost:3000';

  const urlParams = new URLSearchParams(window.location.search);
  const funcionarioId = urlParams.get('id'); // Lê o ?id=X enviado pela listagem

  let dirty = false;

  const digits = value => (value ? String(value).replace(/\D/g, '') : '');

  // 1. Função de preenchimento mapeando os dados do banco para os inputs do HTML
  function preencherFormulario(func) {
    if (!func) return;

    if (form.elements.name) form.elements.name.value = func.nome || '';
    if (form.elements.cpf) form.elements.cpf.value = func.cpf || '';
    // Substitui ponto por vírgula para exibição amigável no padrão brasileiro, se necessário
    if (form.elements.salario) form.elements.salario.value = func.salario !== undefined ? String(func.salario).replace('.', ',') : '';
    if (form.elements.funcao) form.elements.funcao.value = func.funcao || '';
    if (form.elements.email) form.elements.email.value = func.email || '';
    if (form.elements.phone) form.elements.phone.value = func.telefone || '';

    // Aplica as máscaras visuais após preencher via código
    if (form.elements.cpf.value) {
      form.elements.cpf.value = formatCPF(form.elements.cpf.value);
    }
    if (form.elements.phone.value) {
      form.elements.phone.value = formatPhone(form.elements.phone.value);
    }
  }

  // 2. Função de carregamento via GET por ID
  async function restore() {
    if (!funcionarioId) {
      if (status) status.textContent = 'Modo de cadastro (Nenhum ID informado).';
      return;
    }

    const controls = [...form.elements];
    controls.forEach(control => control.disabled = true);
    if (status) status.textContent = 'Carregando dados do funcionário...';

    try {
      const response = await fetch(`${API_BASE_URL}/funcionario/${funcionarioId}`);
      
      if (!response.ok) {
        throw new Error('Funcionário não encontrado no banco de dados.');
      }

      const funcionario = await response.json();
      
      preencherFormulario(funcionario);
      if (status) status.textContent = '';
    } catch (err) {
      console.error(err);
      if (status) status.textContent = 'Erro ao carregar dados do funcionário do servidor.';
    } finally {
      controls.forEach(control => control.disabled = false);
    }
  }

  restore();

  // Funções de formatação e máscaras
 function formatCPF(value) {
    const digitsOnly = digits(value).slice(0, 11);
    
    if (digitsOnly.length <= 3) {
      return digitsOnly;
    } else if (digitsOnly.length <= 6) {
      return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3)}`;
    } else if (digitsOnly.length <= 9) {
      return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3, 6)}.${digitsOnly.slice(6)}`;
    } else {
      return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3, 6)}.${digitsOnly.slice(6, 9)}-${digitsOnly.slice(9, 11)}`;
    }
  }

  function formatPhone(value) {
    const valueDigits = digits(value).slice(0, 11);
    return valueDigits
      .replace(/^(\d{2})(\d)/, '$1 $2')
      .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
  }

  // Eventos de máscara em tempo real
 if (form.elements.cpf) {
    form.elements.cpf.addEventListener('input', event => {
      event.target.value = formatCPF(event.target.value);
    });
  }

  if (form.elements.phone) {
    form.elements.phone.addEventListener('input', event => {
      event.target.value = formatPhone(event.target.value);
    });
  }

  form.addEventListener('input', () => {
    dirty = true;
    if (status) status.textContent = '';
    const cpfError = document.querySelector('#cpf-error');
    if (cpfError) cpfError.textContent = '';
  });

  // 3. Submissão do formulário (POST para cadastro ou PUT para edição)
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
        const errEl = document.querySelector(errorSelector);
        if (errEl) errEl.textContent = valid ? '' : message;
      }
    }

    if (!form.reportValidity()) {
      return;
    }

    const button = form.querySelector('[type=submit]');
    if (button) button.disabled = true;
    if (status) status.textContent = funcionarioId ? 'Salvando alterações...' : 'Cadastrando funcionário...';

    // Tratamento robusto do salário: substitui vírgula por ponto e converte para número/string decimal aceita pelo backend
    const salarioBruto = form.elements.salario.value.trim().replace(',', '.');

    // Payload estruturado para atender rigorosamente à validação do backend
    const payload = {
      nome: form.elements.name.value.trim(),
      cpf: digits(form.elements.cpf.value),
      salario: parseFloat(salarioBruto),
      funcao: form.elements.funcao.value.trim() || null,
      email: form.elements.email.value.trim(),
      telefone: digits(form.elements.phone.value)
    };

    try {
      let response;

      if (funcionarioId) {
        // --- EDIÇÃO (PUT) ---
        response = await fetch(`${API_BASE_URL}/funcionario/${funcionarioId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // --- CADASTRO (POST) ---
        response = await fetch(`${API_BASE_URL}/funcionario`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.erro || responseData.mensagem || 'Erro na operação.');
      }

      dirty = false;
      if (status) status.textContent = funcionarioId ? 'Funcionário atualizado com sucesso!' : 'Funcionário cadastrado com sucesso!';
    } catch (err) {
      console.error(err);
      if (status) status.textContent = `Erro ao salvar: ${err.message}`;
    } finally {
      if (button) button.disabled = false;
    }
  });
});