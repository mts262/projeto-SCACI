const form = document.querySelector('#search-form');
const resultsBody = document.querySelector('#results-body');
const resultsSummary = document.querySelector('#results-summary');
const searchInput = document.querySelector('#searchInput');
const clearButton = document.querySelector('#clear-filter');
const feedback = document.querySelector('#search-feedback');

// URL base da API no back-end 
const API_URL = 'http://localhost:3000/imoveis';

let totalPropertiesCount = 0;

function setFeedback(message = '') {
  feedback.textContent = message;
}

// Função assíncrona que faz o GET no back-end enviando os parâmetros de busca
async function fetchProperties(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}?${queryString}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar dados no servidor.');
    }

    const data = await response.json();
    return data; // Retorna o array de imóveis vindo do back-end
  } catch (error) {
    console.error('Erro na requisição:', error);
    setFeedback('Erro ao conectar com o servidor.');
    return [];
  }
}

async function filterProperties() {
  const query = searchInput.value.trim();

  const queryParams = {};
  if (query) queryParams.q = query;

  const imoveis = await fetchProperties(queryParams);
  totalPropertiesCount = imoveis.length;
  renderResults(imoveis, totalPropertiesCount);
}

function renderResults(filtered, total = totalPropertiesCount) {
  resultsSummary.textContent = `Exibindo ${filtered.length} de ${total} imóveis`;

  if (!filtered.length) {
    setFeedback('Imóvel não encontrado!');
    resultsBody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum imóvel encontrado para os filtros informados.</td></tr>';
    return;
  }

  setFeedback('');
  const rows = filtered.map(property => `
  <tr>
    <td>${property.matricula}</td>
    <td>${property.proprietario}</td>
    <td>${property.bairro}</td>
    <td>${property.cidade || ''}</td>

    <td class="row-actions">
      <button
        type="button"
        class="row-actions__button"
        aria-label="Ações do imóvel ${property.matricula}"
        aria-expanded="false"
      >
        …
      </button>

      <div class="row-actions__menu" hidden>
        <button type="button" data-acao="editar" data-id="${property.id_imovel}">
          Editar
        </button>

        <button type="button" data-acao="excluir" data-id="${property.id_imovel}">
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
    window.location.href = `../editar-imovel/index.html?id_imovel=${id}`;
    return;
  }

  if (acao.dataset.acao === 'excluir') {
    window.location.href = `../excluir-imovel/index.html?id_imovel=${id}`;
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

  if (!query) {
    setFeedback('Informe um valor para pesquisar!');
    return;
  }

  await filterProperties();
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
  await filterProperties();
});

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    form.requestSubmit();
  }
});

// Carregamento inicial ao abrir a página
async function init() {
  const imoveis = await fetchProperties();
  totalPropertiesCount = imoveis.length;
  renderResults(imoveis, totalPropertiesCount);
}

init();