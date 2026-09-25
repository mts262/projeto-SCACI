/**
 * @author Ian
 *
 * Tela de listagem de clientes cadastrados (S.C.A.C.I.).
 * Monta a tabela, a paginação e o menu de ações de cada linha.
 */

const PAGINA_TAMANHO = 11;

const ROTA_EDITAR_CLIENTE = "../editar-cliente/index.html";
const ROTA_EXCLUIR_CLIENTE = "../excluir-cliente/index.html";



/**
 * @author Ian
 *
 * Obtém a lista de clientes a ser exibida na tabela.
 *
 * O controller já retorna os campos `id_cliente`, `nome`, `cpf_cnpj`, `telefone` e `email`,
 * que são exatamente os usados aqui — nenhuma outra parte do arquivo precisa mudar.
 *
 * @returns {Promise<Array<Object>>} Lista de clientes.
 */
async function carregarClientes() {
    const resposta = await fetch("http://localhost:3000/clientes");

    if (!resposta.ok) {
        throw new Error("Falha ao carregar clientes");
    }

    return await resposta.json();
}

const corpoTabela = document.querySelector("#corpo-tabela");
const resumoTabela = document.querySelector("#resumo-tabela");
const paginacao = document.querySelector("#paginacao");
const dialogoAviso = document.querySelector("#dialogo-aviso");
const mensagemAviso = document.querySelector("#mensagem-aviso");
const botoesMenu = document.querySelectorAll("[data-secao]");

let clientes = [];
let paginaAtual = 1;

/**
 * @author Ian
 *
 * Remove tudo que não for dígito de um valor.
 *
 * @param {string} valor - Texto de origem.
 * @returns {string} Somente os dígitos do valor informado.
 */
function apenasDigitos(valor = "") {
    return String(valor).replace(/\D/g, "");
}

/**
 * @author Ian
 *
 * Escapa os caracteres especiais de HTML, evitando que dados vindos da API
 * sejam interpretados como marcação ao serem interpolados na tabela.
 *
 * @param {string} valor - Texto a ser escapado.
 * @returns {string} Texto seguro para interpolação.
 */
function escaparHtml(valor = "") {
    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/**
 * @author Ian
 *
 * Formata um CPF (11 dígitos) ou CNPJ (14 dígitos) para exibição.
 * Valores com outra quantidade de dígitos são devolvidos sem alteração.
 *
 * @param {string} valor - Documento com ou sem máscara.
 * @returns {string} Documento formatado.
 */
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

/**
 * @author Ian
 *
 * Formata um telefone celular (11 dígitos) ou fixo (10 dígitos) para exibição.
 *
 * @param {string} valor - Telefone com ou sem máscara.
 * @returns {string} Telefone formatado.
 */
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

/**
 * @author Ian
 *
 * Calcula a quantidade total de páginas da listagem (mínimo de uma).
 *
 * @returns {number} Total de páginas.
 */
function totalPaginas() {
    return Math.max(1, Math.ceil(clientes.length / PAGINA_TAMANHO));
}

/**
 * @author Ian
 *
 * Fecha o menu de ações que estiver aberto na tabela.
 */
function fecharMenuAcoes() {
    const menuAberto = corpoTabela.querySelector(".row-actions__menu:not([hidden])");

    if (!menuAberto) {
        return;
    }

    menuAberto.hidden = true;
    const botao = menuAberto.parentElement.querySelector(".row-actions__button");
    botao.setAttribute("aria-expanded", "false");
}

/**
 * @author Ian
 *
 * Alinha o menu de ações abaixo e à direita do botão que o abriu.
 * O menu usa `position: fixed` para não ser recortado pelo overflow da tabela,
 * por isso as coordenadas precisam ser calculadas aqui.
 *
 * @param {HTMLElement} botao - Botão de três pontos da linha.
 * @param {HTMLElement} menu - Menu já visível a ser posicionado.
 */
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

/**
 * @author Ian
 *
 * Exibe o diálogo de funcionalidade indisponível com a mensagem informada.
 *
 * @param {string} mensagem - Texto explicativo apresentado ao usuário.
 */
function mostrarAviso(mensagem) {
    mensagemAviso.textContent = mensagem;
    dialogoAviso.showModal();
}

/**
 * @author Ian
 *
 * Renderiza as linhas da página atual da tabela e atualiza o contador de registros.
 */
function renderizarTabela() {
    if (!clientes.length) {
        corpoTabela.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum cliente cadastrado.</td></tr>';
        resumoTabela.textContent = "Exibindo 0 de 0 clientes";
        return;
    }

    const inicio = (paginaAtual - 1) * PAGINA_TAMANHO;
    const pagina = clientes.slice(inicio, inicio + PAGINA_TAMANHO);

    corpoTabela.innerHTML = pagina.map((cliente) => `
      <tr>
        <td>${escaparHtml(cliente.nome)}</td>
        <td>${escaparHtml(formatarDocumento(cliente.cpf_cnpj))}</td>
        <td>${escaparHtml(formatarTelefone(cliente.telefone))}</td>
        <td>${escaparHtml(cliente.email || "—")}</td>
        <td class="row-actions">
          <button
            type="button"
            class="row-actions__button"
            data-acao="abrir-menu"
            aria-haspopup="true"
            aria-expanded="false"
            aria-label="Ações para ${escaparHtml(cliente.nome)}"
          >⋯</button>
          <div class="row-actions__menu" hidden>
            <button type="button" data-acao="editar" data-id-cliente="${cliente.id_cliente}">Editar</button>
            <button type="button" data-acao="excluir" data-id-cliente="${cliente.id_cliente}">Excluir</button>
          </div>
        </td>
      </tr>
    `).join("");

    resumoTabela.textContent = `Exibindo ${pagina.length} de ${clientes.length} clientes`;
}

/**
 * @author Ian
 *
 * Renderiza os controles de paginação, destacando a página atual e
 * desabilitando as setas quando não há página anterior ou seguinte.
 */
function renderizarPaginacao() {
    const total = totalPaginas();

    if (clientes.length <= PAGINA_TAMANHO) {
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

/**
 * @author Ian
 *
 * Troca a página exibida e redesenha tabela e paginação.
 *
 * @param {number} pagina - Número da página desejada.
 */
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
        const idCliente = botao.dataset.idCliente;
        window.location.href = `${ROTA_EDITAR_CLIENTE}?id=${idCliente}`;
        return;
    }



if (acao === "excluir") {
        const id_cliente = botao.dataset.idCliente;
        window.location.href = `${ROTA_EXCLUIR_CLIENTE}?id=${id_cliente}`;
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


// O menu é `position: fixed`: rolar ou redimensionar o deixaria desalinhado.

window.addEventListener("scroll", fecharMenuAcoes, true);

window.addEventListener("resize", fecharMenuAcoes);


botoesMenu.forEach((botao) => {
    botao.addEventListener("click", () => {

        const secao = botao.dataset.secao;

        if (secao === "Início") {
            window.location.href = "../../tela-inicial/index.html";
            return;
        }

        if (secao === "Clientes") {
            window.location.href = "../acoes-cliente/index.html";
            return;
        }

        mostrarAviso(
            `O módulo ${secao} ainda não está disponível nesta versão.`
        );
    });
});


carregarClientes()

.then((lista) => {

clientes = lista;

renderizarTabela();

renderizarPaginacao();

})

.catch(() => {

clientes = [];

corpoTabela.innerHTML = '<tr><td colspan="5" class="empty-state">Não foi possível carregar os clientes.</td></tr>';

resumoTabela.textContent = "Exibindo 0 de 0 clientes";

paginacao.innerHTML = "";

}); 