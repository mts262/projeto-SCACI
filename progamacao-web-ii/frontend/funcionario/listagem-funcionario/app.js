const PAGINA_TAMANHO = 11;

const ROTA_EDITAR_FUNCIONARIO = "../editar-funcionario/index.html";
const ROTA_EXCLUIR_FUNCIONARIO = "../excluir-funcionario/index.html";

async function carregarFuncionarios() {
    const resposta = await fetch("http://localhost:3000/funcionarios");

    if (!resposta.ok) {
        throw new Error("Falha ao carregar funcionários");
    }

    return await resposta.json();
}

const corpoTabela = document.querySelector("#corpo-tabela");
const resumoTabela = document.querySelector("#resumo-tabela");
const paginacao = document.querySelector("#paginacao");
const dialogoAviso = document.querySelector("#dialogo-aviso");
const mensagemAviso = document.querySelector("#mensagem-aviso");

let funcionarios = [];
let paginaAtual = 1;

function apenasDigitos(valor = "") {
    return String(valor).replace(/\D/g, "");
}

function escaparHtml(valor = "") {
    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatarDocumento(valor = "") {
    const digitos = apenasDigitos(valor);

    if (digitos.length === 11) {
        return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    if (digitos.length === 14) {
        return digitos.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }

    return valor;
}

function formatarTelefone(valor = "") {
    const digitos = apenasDigitos(valor);

    if (digitos.length === 11) {
        return digitos.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }

    if (digitos.length === 10) {
        return digitos.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    return valor;
}

function totalPaginas() {
    return Math.max(1, Math.ceil(funcionarios.length / PAGINA_TAMANHO));
}

function fecharMenuAcoes() {
    const menuAberto = corpoTabela.querySelector(".row-actions__menu:not([hidden])");

    if (!menuAberto) {
        return;
    }

    menuAberto.hidden = true;
    const botao = menuAberto.parentElement.querySelector(".row-actions__button");
    botao.setAttribute("aria-expanded", "false");
}

function posicionarMenuAcoes(botao, menu) {
    const area = botao.getBoundingClientRect();
    const margem = 8;

    const esquerda = Math.max(margem, area.right - menu.offsetWidth);
    const acimaDoBotao = area.bottom + menu.offsetHeight + margem > window.innerHeight;

    menu.style.left = `${esquerda}px`;
    menu.style.top = acimaDoBotao
        ? `${area.top - menu.offsetHeight - 4}px`
        : `${area.bottom + 4}px`;
}

function mostrarAviso(mensagem) {
    if (mensagemAviso && dialogoAviso) {
        mensagemAviso.textContent = mensagem;
        dialogoAviso.showModal();
    }
}

function renderizarTabela() {
    if (!funcionarios.length) {
        corpoTabela.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum funcionário cadastrado.</td></tr>';
        resumoTabela.textContent = "Exibindo 0 de 0 funcionários";
        return;
    }

    const inicio = (paginaAtual - 1) * PAGINA_TAMANHO;
    const pagina = funcionarios.slice(inicio, inicio + PAGINA_TAMANHO);

    corpoTabela.innerHTML = pagina.map((funcionario) => `
      <tr>
        <td>${escaparHtml(funcionario.nome)}</td>
        <td>${escaparHtml(formatarDocumento(funcionario.cpf))}</td>
        <td>${escaparHtml(funcionario.funcao || "—")}</td>
        <td>${escaparHtml(funcionario.email || "—")}</td>
        <td class="row-actions">
          <button
            type="button"
            class="row-actions__button"
            data-acao="abrir-menu"
            aria-haspopup="true"
            aria-expanded="false"
            aria-label="Ações para ${escaparHtml(funcionario.nome)}"
          >⋯</button>
          <div class="row-actions__menu" hidden>
            <button type="button" data-acao="editar" data-id-funcionario="${funcionario.id_funcionario}">
                Editar
            </button>

            <button type="button" data-acao="excluir" data-id-funcionario="${funcionario.id_funcionario}">
                Excluir
            </button>
          </div>
        </td>
      </tr>
    `).join("");

    resumoTabela.textContent = `Exibindo ${pagina.length} de ${funcionarios.length} funcionários`;
}

function renderizarPaginacao() {
    const total = totalPaginas();

    if (funcionarios.length <= PAGINA_TAMANHO) {
        paginacao.innerHTML = "";
        return;
    }

    const anteriorDesabilitado = paginaAtual === 1;
    const proximoDesabilitado = paginaAtual === total;

    let botoes = `
      <button
        type="button"
        class="page-button${anteriorDesabilitado ? " is-disabled" : ""}"
        data-pagina="${paginaAtual - 1}"
        aria-label="Página anterior"
        ${anteriorDesabilitado ? "disabled" : ""}
      >‹</button>
    `;

    for (let pagina = 1; pagina <= total; pagina += 1) {
        const ativa = pagina === paginaAtual;

        botoes += `
          <button
            type="button"
            class="page-button${ativa ? " is-active" : ""}"
            data-pagina="${pagina}"
            aria-label="Página ${pagina}"
            ${ativa ? 'aria-current="page"' : ""}
          >${pagina}</button>
        `;
    }

    botoes += `
      <button
        type="button"
        class="page-button${proximoDesabilitado ? " is-disabled" : ""}"
        data-pagina="${paginaAtual + 1}"
        aria-label="Próxima página"
        ${proximoDesabilitado ? "disabled" : ""}
      >›</button>
    `;

    paginacao.innerHTML = botoes;
}

function irParaPagina(pagina) {
    const destino = Math.min(Math.max(pagina, 1), totalPaginas());

    if (destino === paginaAtual) {
        return;
    }

    paginaAtual = destino;
    renderizarTabela();
    renderizarPaginacao();
}

corpoTabela.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-acao]");

    if (!botao) {
        return;
    }

    const acao = botao.dataset.acao;

    if (acao === "abrir-menu") {
        const menu = botao.parentElement.querySelector(".row-actions__menu");
        const estavaAberto = !menu.hidden;

        fecharMenuAcoes();

        if (!estavaAberto) {
            menu.hidden = false;
            botao.setAttribute("aria-expanded", "true");
            posicionarMenuAcoes(botao, menu);
        }

        return;
    }

    fecharMenuAcoes();

    if (acao === "editar") {
        const idFuncionario = botao.dataset.idFuncionario;
        window.location.href = `${ROTA_EDITAR_FUNCIONARIO}?id=${idFuncionario}`;
        return;
    }

    if (acao === "excluir") {
        const idFuncionario = botao.dataset.idFuncionario;
        window.location.href = `${ROTA_EXCLUIR_FUNCIONARIO}?id=${idFuncionario}`;
    }
});

paginacao.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-pagina]");

    if (!botao || botao.disabled) {
        return;
    }

    fecharMenuAcoes();
    irParaPagina(Number(botao.dataset.pagina));
});

document.addEventListener("click", (evento) => {
    if (!evento.target.closest(".row-actions")) {
        fecharMenuAcoes();
    }
});

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        fecharMenuAcoes();
    }
});

window.addEventListener("scroll", fecharMenuAcoes, true);
window.addEventListener("resize", fecharMenuAcoes);

carregarFuncionarios()
    .then((lista) => {
        funcionarios = lista;
        renderizarTabela();
        renderizarPaginacao();
    })
    .catch(() => {
        funcionarios = [];
        corpoTabela.innerHTML = '<tr><td colspan="5" class="empty-state">Não foi possível carregar os funcionários.</td></tr>';
        resumoTabela.textContent = "Exibindo 0 de 0 funcionários";
        paginacao.innerHTML = "";
    });