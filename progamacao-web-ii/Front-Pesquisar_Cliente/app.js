const clients = [
  {
    name: 'Pedro Lucas dos Santos Xavier',
    document: '918.883.405-80',
    phone: '77 98848-8072',
    email: 'pedrin007@gmail.com',
    city: 'Vitória da Conquista',
    state: 'BA',
    maritalStatus: 'Casado'
  },
  {
    name: 'Maria Helena Souza Lima',
    document: '321.554.778-02',
    phone: '77 99123-4567',
    email: 'mhelena@gmail.com',
    city: 'Barra do Choça',
    state: 'BA',
    maritalStatus: 'Solteiro'
  },
  {
    name: 'José Almeida Neto',
    document: '443.882.710-20',
    phone: '77 98234-1188',
    email: 'jose.almeida@gmail.com',
    city: 'Jequié',
    state: 'BA',
    maritalStatus: 'Casado'
  },
  {
    name: 'Ana Paula Ribeiro',
    document: '678.991.540-60',
    phone: '73 98855-2233',
    email: 'anapaula.ribeiro@hotmail.com',
    city: 'Itapetinga',
    state: 'BA',
    maritalStatus: 'Divorciado'
  },
  {
    name: 'Carlos Eduardo Azevedo',
    document: '551.209.440-09',
    phone: '71 99211-4401',
    email: 'carlos.eduardo@gmail.com',
    city: 'Salvador',
    state: 'BA',
    maritalStatus: 'Solteiro'
  },
  {
    name: 'Beatriz Maia Santos',
    document: '065.789.230-40',
    phone: '79 99712-3040',
    email: 'beatriz.maia@outlook.com',
    city: 'Aracaju',
    state: 'SE',
    maritalStatus: 'Casado'
  },
  {
    name: 'Rafael Souza Costa',
    document: '837.221.760-12',
    phone: '75 99174-8010',
    email: 'rafael.souza@gmail.com',
    city: 'Ilhéus',
    state: 'BA',
    maritalStatus: 'Viúvo'
  },
  {
    name: 'Larissa Mendes Ferreira',
    document: '772.309.890-21',
    phone: '81 98412-9902',
    email: 'larissa.ferreira@gmail.com',
    city: 'Recife',
    state: 'PE',
    maritalStatus: 'Solteiro'
  }
];

const form = document.querySelector('#search-form');
const resultsBody = document.querySelector('#results-body');
const resultsSummary = document.querySelector('#results-summary');
const searchInput = document.querySelector('#searchInput');
const maritalStatus = document.querySelector('#maritalStatus');
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

function filterClients() {
  const query = normalize(searchInput.value);
  const maritalValue = maritalStatus.value;
  const cityValue = normalize(cityInput.value);
  const ufValue = ufSelect.value;

  const queryDigits = cleanDigits(query);

  const filtered = clients.filter(client => {
    const documentDigits = cleanDigits(client.document);
    const phoneDigits = cleanDigits(client.phone);
    const matchesQuery = !query || [
      client.name,
      documentDigits,
      phoneDigits,
      client.email,
      client.city
    ].some(value => normalize(value).includes(query) || normalize(value).includes(queryDigits));

    const matchesMarital = !maritalValue || client.maritalStatus === maritalValue;
    const matchesCity = !cityValue || normalize(client.city).includes(cityValue);
    const matchesUf = !ufValue || client.state === ufValue;

    return matchesQuery && matchesMarital && matchesCity && matchesUf;
  });

  renderResults(filtered);
}

function renderResults(filtered) {
  resultsSummary.textContent = `Exibindo ${filtered.length} de ${clients.length} clientes`;

  if (!filtered.length) {
    setFeedback('Cliente não encontrado!');
    resultsBody.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhum cliente encontrado para os filtros informados.</td></tr>';
    return;
  }

  setFeedback('');
  const rows = filtered.slice(0, 5).map(client => `
    <tr>
      <td>${client.name}</td>
      <td>${client.document}</td>
      <td>${client.phone}</td>
      <td>${client.email}</td>
    </tr>
  `).join('');

  resultsBody.innerHTML = rows;
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const query = normalize(searchInput.value);
  if (!query) {
    setFeedback('Informe um valor para pesquisar!');
    resultsSummary.textContent = `Exibindo 0 de ${clients.length} clientes`;
    resultsBody.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhum cliente encontrado para os filtros informados.</td></tr>';
    return;
  }

  filterClients();
});

clearButton.addEventListener('click', () => {
  form.reset();
  setFeedback('');
  renderResults(clients);
});

searchInput.addEventListener('input', () => {
  setFeedback('');
  if (!normalize(searchInput.value)) {
    return;
  }
  filterClients();
});

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    form.requestSubmit();
  }
});

maritalStatus.addEventListener('change', filterClients);
cityInput.addEventListener('input', filterClients);
ufSelect.addEventListener('change', filterClients);

renderResults(clients);
