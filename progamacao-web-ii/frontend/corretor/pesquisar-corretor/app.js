const agents = [
  {
    name: 'Pedro Lucas dos Santos Xavier',
    document: '918.883.405-80',
    CRECI: 'CRECI-BA 12345',
    email: 'pedrin007@gmail.com',
    city: 'Vitória da Conquista',
    state: 'BA',
  },
  {
    name: 'Maria Helena Souza Lima',
    document: '321.554.778-02',
    CRECI: 'CRECI-BA 67890',
    email: 'mhelena@gmail.com',
    city: 'Barra do Choça',
    state: 'BA',
  },
  {
    name: 'José Almeida Neto',
    document: '443.882.710-20',
    CRECI: 'CRECI-BA 25590',
    email: 'jose.almeida@gmail.com',
    city: 'Jequié',
    state: 'BA',
  },
  {
    name: 'Ana Paula Ribeiro',
    document: '678.991.540-60',
    CRECI: 'CRECI-BA 88364',
    email: 'anapaula.ribeiro@hotmail.com',
    city: 'Itapetinga',
    state: 'BA',
  },
  {
    name: 'Carlos Eduardo Azevedo',
    document: '551.209.440-09',
    CRECI: 'CRECI-BA 11765',
    email: 'carlos.eduardo@gmail.com',
    city: 'Salvador',
    state: 'BA',
  },
  {
    name: 'Beatriz Maia Santos',
    document: '065.789.230-40',
    CRECI: 'CRECI-SE 03887',
    email: 'beatriz.maia@outlook.com',
    city: 'Aracaju',
    state: 'SE',
  },
  {
    name: 'Rafael Souza Costa',
    document: '837.221.760-12',
    CRECI: 'CRECI-BA 73649',
    email: 'rafael.souza@gmail.com',
    city: 'Ilhéus',
    state: 'BA',
  },
  {
    name: 'Larissa Mendes Ferreira',
    document: '772.309.890-21',
    CRECI: 'CRECI-PE 34839',
    email: 'larissa.ferreira@gmail.com',
    city: 'Recife',
    state: 'PE',
  }
];

const form = document.querySelector('#search-form');
const resultsBody = document.querySelector('#results-body');
const resultsSummary = document.querySelector('#results-summary');
const searchInput = document.querySelector('#searchInput');
const cityInput = document.querySelector('#city');
const ufSelect = document.querySelector('#uf');
const clearButton = document.querySelector('#clear-filter');
const feedback = document.querySelector('#search-feedback');

function normalize(value = '') {
  return String(value).trim().toLowerCase();
}

function cleanDigits(value = '') {
  return String(value).replace(/\D/g, '');
}

function setFeedback(message = '') {
  feedback.textContent = message;
}

function filteragents() {
  const query = normalize(searchInput.value);
  const cityValue = normalize(cityInput.value);
  const ufValue = ufSelect.value;

  const queryDigits = cleanDigits(query);

  const filtered = agents.filter(agent => {
    const documentDigits = cleanDigits(agent.document);
    const CRECIDigits = cleanDigits(agent.CRECI);
    const matchesQuery = !query || [
      agent.name,
      documentDigits,
      CRECIDigits,
      agent.email,
      agent.city
    ].some(value => normalize(value).includes(query) || normalize(value).includes(queryDigits));

    const matchesCity = !cityValue || normalize(agent.city).includes(cityValue);
    const matchesUf = !ufValue || agent.state === ufValue;

    return matchesQuery && matchesCity && matchesUf;
  });

  renderResults(filtered);
}

function renderResults(filtered) {
  resultsSummary.textContent = `Exibindo ${filtered.length} de ${agents.length} agentes`;

  if (!filtered.length) {
    setFeedback('agente não encontrado!');
    resultsBody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum agente encontrado para os filtros informados.</td></tr>';
    return;
  }

  setFeedback('');
  const rows = filtered.slice(0, 5).map(agent => `
  <tr>
    <td>${agent.name}</td>
    <td>${agent.document}</td>
    <td>${agent.CRECI}</td>
    <td>${agent.email}</td>

    <td class="row-actions">
      <button
        type="button"
        class="row-actions__button"
        aria-label="Ações de ${agent.name}"
        aria-expanded="false"
      >
        …
      </button>

      <div class="row-actions__menu" hidden>
        <button type="button" data-acao="editar" data-id="${agent.id_agente}">
          Editar
        </button>

        <button type="button" data-acao="excluir" data-id="${agent.id_agente}">
          Excluir
        </button>
      </div>
    </td>
  </tr>
`).join('');

  resultsBody.innerHTML = rows;
}

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
    const rect = botao.getBoundingagentRect();

    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${rect.right - 150}px`;

    menu.hidden = false;
    botao.setAttribute('aria-expanded', 'true');

    return;
  }

  const acao = event.target.closest('[data-acao]');

  if (!acao) {
    return;
  }

  const id = acao.dataset.id;

  if (acao.dataset.acao === 'editar') {
    window.location.href = `../editar-agente/index.html?id=${id}`;
    return;
  }

  if (acao.dataset.acao === 'excluir') {
    window.location.href = `../excluir-agente/index.html?id=${id}`;
  }
});

document.addEventListener('click', event => {

  if (event.target.closest('.row-actions')) {
    return;
  }

  document.querySelectorAll('.row-actions__menu').forEach(menu => {
    menu.hidden = true;
  });

  document.querySelectorAll('.row-actions__button').forEach(button => {
    button.setAttribute('aria-expanded', 'false');
  });
});

form.addEventListener('submit', event => {
  event.preventDefault();

  const query = normalize(searchInput.value);
  if (!query) {
    setFeedback('Informe um valor para pesquisar!');
    resultsSummary.textContent = `Exibindo 0 de ${agents.length} agentes`;
    resultsBody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum agente encontrado para os filtros informados.</td></tr>';
    return;
  }

  filteragents();
});

clearButton.addEventListener('click', () => {
  form.reset();
  setFeedback('');
  renderResults(agents);
});

searchInput.addEventListener('input', () => {
  setFeedback('');
  if (!normalize(searchInput.value)) {
    return;
  }
  filteragents();
});

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    form.requestSubmit();
  }
});

maritalStatus.addEventListener('change', filteragents);
cityInput.addEventListener('input', filteragents);
ufSelect.addEventListener('change', filteragents);

renderResults(agents);

document.querySelectorAll('[data-section]').forEach(button => {
    button.addEventListener('click', () => {

        const secao = button.dataset.section;

        if (secao === 'Início') {
            window.location.href = '../../tela-inicial/index.html';
            return;
        }

        if (secao === 'agentes') {
            window.location.href = '../acoes-agente/index.html';
            return;
        }

        document.querySelector('#navigation-message').textContent =
            `A seção “${secao}” ainda não está disponível.`;

        document.querySelector('#navigation-dialog').showModal();
    });
});
