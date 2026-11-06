const form = document.querySelector('#search-form');
const resultsBody = document.querySelector('#results-body');
const resultsSummary = document.querySelector('#results-summary');
const searchInput = document.querySelector('#searchInput');
const tipoSelect = document.querySelector('#tipo');
const clearButton = document.querySelector('#clear-filter');
const feedback = document.querySelector('#search-feedback');

const API_URL = 'http://localhost:3000/funcionarios';

let totalEmployeesCount = 0;

function setFeedback(message = '') {
  feedback.textContent = message;
}

// Função assíncrona que faz o GET no back-end enviando os parâmetros de busca
async function fetchEmployees(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}?${queryString}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar dados no servidor.');
    }

    const data = await response.json();
    return data; // Retorna o array de funcionários vindo do back-end
  } catch (error) {
    console.error('Erro na requisição:', error);
    setFeedback('Erro ao conectar com o servidor.');
    return [];
  }
}

async function filterEmployees() {
  const query = searchInput.value.trim();
  const tipo = tipoSelect.value;

  const queryParams = {};
  if (query) queryParams.q = query;
  if (tipo) queryParams.tipo = tipo;

  const funcionarios = await fetchEmployees(queryParams);
  totalEmployeesCount = funcionarios.length;
  renderResults(funcionarios, totalEmployeesCount);
}

function renderResults(filtered, total = totalEmployeesCount) {
  resultsSummary.textContent = `Exibindo ${filtered.length} de ${total} funcionários`;

  if (!filtered.length) {
    setFeedback('Funcionário não encontrado!');
    resultsBody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum funcionário encontrado para os filtros informados.</td></tr>';
    return;
  }

  setFeedback('');
  const rows = filtered.map(employee => `
  <tr>
    <td>${employee.nome}</td>
    <td>${employee.cpf_cnpj}</td>
    <td>${employee.cargo}</td>
    <td>${employee.email}</td>

    <td class="row-actions">
      <button
        type="button"
        class="row-actions__button"
        aria-label="Ações de ${employee.nome}"
        aria-expanded="false"
      >
        …
      </button>

      <div class="row-actions__menu" hidden>
        <button type="button" data-acao="editar" data-id="${employee.id_funcionario}">
          Editar
        </button>

        <button type="button" data-acao="excluir" data-id="${employee.id_funcionario}">
          Excluir
        </button>
      </div>
    </td>
  </tr>
`).join('');

  resultsBody.innerHTML = rows;
}

// Eventos de clique na tabela (ações de editar/excluir)
resultsBody.addEventListener('click', event => {
  const botao = event.target.closest('.row-actions__button');

  if (botao) {
    document.querySelectorAll('.row-actions__menu').forEach(menu => {
      menu.hidden = true;
    });
    document.querySelectorAll('.row-actions__button').forEach(button => {
      button.setAttribute('aria-expanded', 'false');
    });

    const menu = botao.nextElementSibling;
    const rect = botao.getBoundingClientRect();

    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${rect.right - 150}px`;

    menu.hidden = false;
    botao.setAttribute('aria-expanded', 'true');
    return;
  }

  const acao = event.target.closest('[data-acao]');
  if (!acao) return;

  const id = acao.dataset.id;

  if (acao.dataset.acao === 'editar') {
    window.location.href = `../editar-funcionario/index.html?id_funcionario=${id}`;
    return;
  }

  if (acao.dataset.acao === 'excluir') {
    window.location.href = `../excluir-funcionario/index.html?id_funcionario=${id}`;
  }
});

// Fechar menus flutuantes ao clicar fora
document.addEventListener('click', event => {
  if (event.target.closest('.row-actions')) return;

  document.querySelectorAll('.row-actions__menu').forEach(menu => {
    menu.hidden = true;
  });
  document.querySelectorAll('.row-actions__button').forEach(button => {
    button.setAttribute('aria-expanded', 'false');
  });
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const query = searchInput.value.trim();
  const tipo = tipoSelect.value;

  if (!query && !tipo) {
    setFeedback('Informe um valor para pesquisar!');
    return;
  }

  await filterEmployees();
});

clearButton.addEventListener('click', async () => {
  form.reset();
  setFeedback('');
  await init();
});

searchInput.addEventListener('input', async () => {
  setFeedback('');
  if (!searchInput.value.trim()) {
    await init();
    return;
  }
  await filterEmployees();
});

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    form.requestSubmit();
  }
});
tipoSelect.addEventListener('change', filterEmployees);

// Carregamento inicial ao abrir a página
async function init() {
  const funcionarios = await fetchEmployees();
  totalEmployeesCount = funcionarios.length;
  renderResults(funcionarios, totalEmployeesCount);
}

init();