/**
 * @author Ian / Pedro
 * Módulo de Pesquisa e Filtragem de Clientes (S.C.A.C.I.)
 */

const ROTA_EDITAR_CLIENTE = "../editar-cliente/index.html";
const ROTA_EXCLUIR_CLIENTE = "../excluir-cliente/index.html";

const form = document.querySelector("#search-form");
const resultsBody = document.querySelector("#results-body");
const resultsSummary = document.querySelector("#results-summary");
const searchInput = document.querySelector("#searchInput");
const maritalStatus = document.querySelector("#maritalStatus");
const cityInput = document.querySelector("#city");
const ufSelect = document.querySelector("#uf");
const clearButton = document.querySelector("#clear-filter");
const feedback = document.querySelector("#search-feedback");

let clients = []; // Agora começa vazio e é preenchido via backend

function normalize(value = "") {
  return String(value).trim().toLowerCase();
}

function cleanDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

function setFeedback(message = "") {
  if (feedback) feedback.textContent = message;
}

function escaparHtml(valor = "") {
  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Busca os clientes cadastrados na API enviando filtros opcionais via Query String.
 */
async function carregarClientesBackend(params = {}) {
  const url = new URL("http://localhost:3000/clientes");

  // Adiciona apenas os parâmetros preenchidos na requisição
  Object.keys(params).forEach((key) => {
    if (params[key]) url.searchParams.append(key, params[key]);
  });

  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new Error("Falha ao buscar os clientes do servidor.");
  }

  return await resposta.json();
}
/**
 * Filtra a lista de clientes carregados da API.
 */
/**
 * Filtra a lista localmente (fallback/filtragem dinâmica instantânea)
 */
function filterClients() {
  const query = normalize(searchInput.value);
  const maritalValue = maritalStatus.value;
  const cityValue = normalize(cityInput.value);
  const ufValue = ufSelect.value;

  const queryDigits = cleanDigits(query);

  const filtered = clients.filter((client) => {
    // Tratamento unificado de propriedades (API vs Mock)
    const doc = client.cpf_cnpj || client.document || "";
    const tel = client.telefone || client.phone || "";
    const nome = client.nome || client.name || "";
    const email = client.email || "";
    
    // Garantindo suporte se o endereço vier de um objeto aninhado ou campos diretos
    const cidade = client.cidade || client.city || client.endereco?.cidade || "";
    const estado = client.estado || client.state || client.endereco?.estado || "";
    const estadoCivil = client.estado_civil || client.maritalStatus || "";

    const documentDigits = cleanDigits(doc);
    const phoneDigits = cleanDigits(tel);

    const matchesQuery =
      !query ||
      [nome, documentDigits, phoneDigits, email, cidade].some(
        (value) => normalize(value).includes(query) || (queryDigits && normalize(value).includes(queryDigits))
      );

    const matchesMarital = !maritalValue || estadoCivil.toLowerCase() === maritalValue.toLowerCase();
    const matchesCity = !cityValue || normalize(cidade).includes(cityValue);
    const matchesUf = !ufValue || estado.toUpperCase() === ufValue.toUpperCase();

    return matchesQuery && matchesMarital && matchesCity && matchesUf;
  });

  renderResults(filtered);
}

function renderResults(filtered) {
  resultsSummary.textContent = `Exibindo ${filtered.length} de ${clients.length} clientes`;

  if (!filtered.length) {
    setFeedback("Cliente não encontrado!");
    resultsBody.innerHTML =
      '<tr><td colspan="5" class="empty-state">Nenhum cliente encontrado para os filtros informados.</td></tr>';
    return;
  }

  setFeedback("");

  const rows = filtered
    .slice(0, 10)
    .map((client) => {
      const idCliente = client.id_cliente || client.id;
      const nome = client.nome || client.name || "Sem Nome";
      const doc = client.cpf_cnpj || client.document || "—";
      const tel = client.telefone || client.phone || "—";
      const email = client.email || "—";

      return `
      <tr>
        <td>${escaparHtml(nome)}</td>
        <td>${escaparHtml(doc)}</td>
        <td>${escaparHtml(tel)}</td>
        <td>${escaparHtml(email)}</td>

        <td class="row-actions">
          <button
            type="button"
            class="row-actions__button"
            aria-label="Ações de ${escaparHtml(nome)}"
            aria-expanded="false"
          >
            …
          </button>

          <div class="row-actions__menu" hidden>
            <button type="button" data-acao="editar" data-id="${idCliente}">
              Editar
            </button>

            <button type="button" data-acao="excluir" data-id="${idCliente}">
              Excluir
            </button>
          </div>
        </td>
      </tr>
    `;
    })
    .join("");

  resultsBody.innerHTML = rows;
}

// ==========================================
// EVENT LISTENERS E INICIALIZAÇÃO
// ==========================================

resultsBody.addEventListener("click", (event) => {
  const botao = event.target.closest(".row-actions__button");

  if (botao) {
    document.querySelectorAll(".row-actions__menu").forEach((menu) => (menu.hidden = true));
    document.querySelectorAll(".row-actions__button").forEach((button) => button.setAttribute("aria-expanded", "false"));

    const menu = botao.nextElementSibling;
    const rect = botao.getBoundingClientRect();

    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${rect.right - 150}px`;

    menu.hidden = false;
    botao.setAttribute("aria-expanded", "true");
    return;
  }

  const acao = event.target.closest("[data-acao]");
  if (!acao) return;

  const id = acao.dataset.id;

  if (acao.dataset.acao === "editar") {
    window.location.href = `${ROTA_EDITAR_CLIENTE}?id=${id}`;
    return;
  }

  if (acao.dataset.acao === "excluir") {
    window.location.href = `${ROTA_EXCLUIR_CLIENTE}?id=${id}`;
  }
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".row-actions")) return;

  document.querySelectorAll(".row-actions__menu").forEach((menu) => (menu.hidden = true));
  document.querySelectorAll(".row-actions__button").forEach((button) => button.setAttribute("aria-expanded", "false"));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const query = normalize(searchInput.value);
  if (!query && !maritalStatus.value && !cityInput.value && !ufSelect.value) {
    setFeedback("Informe pelo menos um filtro para pesquisar!");
    resultsSummary.textContent = `Exibindo 0 de ${clients.length} clientes`;
    resultsBody.innerHTML =
      '<tr><td colspan="5" class="empty-state">Nenhum cliente encontrado para os filtros informados.</td></tr>';
    return;
  }

  filterClients();
});

clearButton.addEventListener("click", () => {
  form.reset();
  setFeedback("");
  renderResults(clients);
});

searchInput.addEventListener("input", () => {
  setFeedback("");
  filterClients();
});

maritalStatus.addEventListener("change", filterClients);
cityInput.addEventListener("input", filterClients);
ufSelect.addEventListener("change", filterClients);

// Carregamento Inicial do Backend
carregarClientesBackend()
  .then((dados) => {
    clients = dados;
    renderResults(clients);
  })
  .catch((erro) => {
    console.error(erro);
    clients = [];
    setFeedback("Não foi possível carregar os dados do servidor.");
    resultsBody.innerHTML =
      '<tr><td colspan="5" class="empty-state">Erro de conexão com o banco de dados/API.</td></tr>';
    resultsSummary.textContent = "Exibindo 0 de 0 clientes";
  });

document.querySelectorAll("[data-section]").forEach((button) => {
  button.addEventListener("click", () => {
    const secao = button.dataset.section;

    if (secao === "Início") {
      window.location.href = "../../tela-inicial/index.html";
      return;
    }

    if (secao === "Clientes") {
      window.location.href = "../acoes-cliente/index.html";
      return;
    }

    if (secao === 'Corretores') {
            window.location.href = "../../corretor/acoes-corretor/index.html";
            return;
        }

    const navMsg = document.querySelector("#navigation-message");
    const navDlg = document.querySelector("#navigation-dialog");

    if (navMsg && navDlg) {
      navMsg.textContent = `A seção “${secao}” ainda não está disponível.`;
      navDlg.showModal();
    }
  });
});