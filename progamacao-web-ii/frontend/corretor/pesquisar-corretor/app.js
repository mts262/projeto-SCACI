const form = document.querySelector('#search-form');
const resultsBody = document.querySelector('#results-body');
const resultsSummary = document.querySelector('#results-summary');
const searchInput = document.querySelector('#searchInput');
const cityInput = document.querySelector('#city');
const ufSelect = document.querySelector('#uf');
const clearButton = document.querySelector('#clear-filter');
const feedback = document.querySelector('#search-feedback');

// URL base da sua API no back-end (ajuste a porta se necessário)
const API_URL = 'http://localhost:3000/corretores';

let totalAgentsCount = 0;

function setFeedback(message = '') {
  feedback.textContent = message;
}

// Função assíncrona que faz o GET no back-end enviando os parâmetros de busca
async function fetchAgents(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}?${queryString}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar dados no servidor.');
    }

    const data = await response.json();
    return data; // Retorna o array de corretores vindo do back-end
  } catch (error) {
    console.error('Erro na requisição:', error);
    setFeedback('Erro ao conectar com o servidor.');
    return [];
  }
}

async function filterAgents() {
  const query = searchInput.value.trim();
  const city = cityInput.value.trim();
  const uf = ufSelect.value;

  const queryParams = {};
  if (query) queryParams.nome = query;
  if (city) queryParams.cidade = city;
  if (uf) queryParams.uf = uf;

  const corretores = await fetchAgents(queryParams);
  totalAgentsCount = corretores.length;
  renderResults(corretores, totalAgentsCount);
}

function renderResults(filtered, total = totalAgentsCount) {
  resultsSummary.textContent = `Exibindo ${filtered.length} de ${total} corretores`;

  if (!filtered.length) {
    setFeedback('Corretor não encontrado!');
    resultsBody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum corretor encontrado para os filtros informados.</td></tr>';
    return;
  }

  setFeedback('');
  const rows = filtered.map(agent => `
  <tr>
    <td>${agent.nome}</td>
    <td>${agent.cpf_cnpj}</td>
    <td>${agent.creci_corretor}</td>
    <td>${agent.email}</td>

    <td class="row-actions">
      <button
        type="button"
        class="row-actions__button"
        aria-label="Ações de ${agent.nome}"
        aria-expanded="false"
      >
        …
      </button>

      <div class="row-actions__menu" hidden>
        <button type="button" data-acao="editar" data-id="${agent.id_corretor}">
          Editar
        </button>

        <button type="button" data-acao="excluir" data-id="${agent.id_corretor}">
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
    window.location.href = `../editar-corretor/index.html?id_corretor=${id}`;
    return;
  }

  if (acao.dataset.acao === 'excluir') {
    window.location.href = `../excluir-corretor/index.html?id_corretor=${id}`;
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
  
  if (!query && !cityInput.value && !ufSelect.value) {
    setFeedback('Informe um valor para pesquisar!');
    return;
  }

  await filterAgents();
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
  await filterAgents();
});

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    form.requestSubmit();
  }
});

cityInput.addEventListener('input', filterAgents);
ufSelect.addEventListener('change', filterAgents);

// Carregamento inicial ao abrir a página
async function init() {
  const corretores = await fetchAgents();
  totalAgentsCount = corretores.length;
  renderResults(corretores, totalAgentsCount);
}

init();

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