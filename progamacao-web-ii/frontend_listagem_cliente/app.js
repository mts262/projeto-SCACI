/**
 * @author Ian
 *
 * Tela de listagem de clientes cadastrados (S.C.A.C.I.).
 * Monta a tabela, a paginação e o menu de ações de cada linha.
 */

const PAGINA_TAMANHO = 11;

const ROTA_EDITAR_CLIENTE = "../frontend/cliente/editar-cliente/index.html";

/**
 * Clientes de exemplo usados enquanto a API não expõe a rota de listagem.
 * Documento e telefone ficam apenas com dígitos; a formatação é feita na renderização.
 */
const clientesMock = [
  { id_cliente: 1, nome: "Pedro Lucas dos Santos Xavier", cpf_cnpj: "91888340580", telefone: "77988488072", email: "pedrin007@gmail.com" },
  { id_cliente: 2, nome: "Maria Helena Souza Lima", cpf_cnpj: "32155477802", telefone: "77991234567", email: "mhelena@gmail.com" },
  { id_cliente: 3, nome: "José Almeida Neto", cpf_cnpj: "44388271020", telefone: "77982341188", email: "jose.almeida@gmail.com" },
  { id_cliente: 4, nome: "Ana Paula Ribeiro", cpf_cnpj: "67899154060", telefone: "73988552233", email: "anapaula.ribeiro@hotmail.com" },
  { id_cliente: 5, nome: "Carlos Eduardo Azevedo", cpf_cnpj: "55120944009", telefone: "77991887744", email: "carlos.azevedo@gmail.com" },
  { id_cliente: 6, nome: "Rafael Souza Andrade", cpf_cnpj: "20844319977", telefone: "73991120088", email: "rafael.souza@gmail.com" },
  { id_cliente: 7, nome: "Larissa Mendes Ferreira", cpf_cnpj: "77230989021", telefone: "81984129902", email: "larissa.ferreira@gmail.com" },
  { id_cliente: 8, nome: "Construtora Horizonte LTDA", cpf_cnpj: "12345678000195", telefone: "7732114455", email: "contato@horizonte.com.br" },
  { id_cliente: 9, nome: "Fernanda Oliveira Castro", cpf_cnpj: "30998771145", telefone: "77988012233", email: "fernanda.castro@gmail.com" },
  { id_cliente: 10, nome: "Marcos Vinícius Pereira", cpf_cnpj: "41276550388", telefone: "77997744110", email: "marcos.pereira@outlook.com" },
  { id_cliente: 11, nome: "Juliana Barbosa Rocha", cpf_cnpj: "88011234570", telefone: "73982119900", email: "juliana.rocha@gmail.com" },
  { id_cliente: 12, nome: "Antônio Carlos Nogueira", cpf_cnpj: "19033476621", telefone: "77991003355", email: "antonio.nogueira@gmail.com" },
  { id_cliente: 13, nome: "Beatriz Lima Cardoso", cpf_cnpj: "62419887703", telefone: "71988774411", email: "beatriz.cardoso@gmail.com" },
  { id_cliente: 14, nome: "Gustavo Henrique Martins", cpf_cnpj: "50877123390", telefone: "77982006677", email: "gustavo.martins@hotmail.com" },
  { id_cliente: 15, nome: "Imobiliária Conquista ME", cpf_cnpj: "98765432000188", telefone: "7733229911", email: "atendimento@conquista.com.br" },
  { id_cliente: 16, nome: "Patrícia Gomes Silveira", cpf_cnpj: "73900455182", telefone: "73991887700", email: "patricia.silveira@gmail.com" },
  { id_cliente: 17, nome: "Leonardo Alves Batista", cpf_cnpj: "28744019965", telefone: "77988553322", email: "leonardo.batista@gmail.com" },
  { id_cliente: 18, nome: "Camila Ribeiro Dourado", cpf_cnpj: "91200877436", telefone: "71982441199", email: "camila.dourado@outlook.com" },
  { id_cliente: 19, nome: "Rodrigo Teixeira Moura", cpf_cnpj: "35688201174", telefone: "77991774422", email: "rodrigo.moura@gmail.com" },
  { id_cliente: 20, nome: "Simone Farias Aguiar", cpf_cnpj: "48122990058", telefone: "73988110033", email: "simone.aguiar@gmail.com" },
  { id_cliente: 21, nome: "Diego Santana Coelho", cpf_cnpj: "70455188290", telefone: "77982667788", email: "diego.coelho@hotmail.com" },
  { id_cliente: 22, nome: "Vanessa Cristina Lopes", cpf_cnpj: "15877340021", telefone: "71991002244", email: "vanessa.lopes@gmail.com" },
  { id_cliente: 23, nome: "Eduardo Freitas Macedo", cpf_cnpj: "84019276613", telefone: "77988997755", email: "eduardo.macedo@gmail.com" },
  { id_cliente: 24, nome: "Tatiane Moreira Pinto", cpf_cnpj: "23766401189", telefone: "73982553311", email: "tatiane.pinto@outlook.com" },
  { id_cliente: 25, nome: "Felipe Augusto Queiroz", cpf_cnpj: "59033718802", telefone: "77991446699", email: "felipe.queiroz@gmail.com" },
  { id_cliente: 26, nome: "Agropecuária Vale Verde LTDA", cpf_cnpj: "45678901000122", telefone: "7734410099", email: "financeiro@valeverde.com.br" },
  { id_cliente: 27, nome: "Renata Costa Vasconcelos", cpf_cnpj: "67204915530", telefone: "71988223377", email: "renata.vasconcelos@gmail.com" },
  { id_cliente: 28, nome: "Bruno Cesar Araújo", cpf_cnpj: "31908744065", telefone: "77982118844", email: "bruno.araujo@gmail.com" },
  { id_cliente: 29, nome: "Aline Santos Bezerra", cpf_cnpj: "76301289944", telefone: "73991558822", email: "aline.bezerra@hotmail.com" },
  { id_cliente: 30, nome: "Thiago Nunes Carvalho", cpf_cnpj: "40877216653", telefone: "77988440011", email: "thiago.carvalho@gmail.com" },
  { id_cliente: 31, nome: "Isabela Duarte Monteiro", cpf_cnpj: "22590713387", telefone: "71982007766", email: "isabela.monteiro@gmail.com" },
  { id_cliente: 32, nome: "Wesley Oliveira Ramos", cpf_cnpj: "58144902271", telefone: "77991336688", email: "wesley.ramos@outlook.com" }
];

/**
 * @author Ian
 *
 * Obtém a lista de clientes a ser exibida na tabela.
 *
 * Hoje devolve os dados de exemplo. Quando a rota de listagem for registrada em
 * `backend/src/cliente/clienteRoutes.js`, basta trocar o corpo desta função por:
 *
 *   const resposta = await fetch("http://localhost:3000/clientes");
 *   if (!resposta.ok) throw new Error("Falha ao carregar clientes");
 *   return await resposta.json();
 *
 * O controller já retorna os campos `id_cliente`, `nome`, `cpf_cnpj`, `telefone` e `email`,
 * que são exatamente os usados aqui — nenhuma outra parte do arquivo precisa mudar.
 *
 * @returns {Promise<Array<Object>>} Lista de clientes.
 */
async function carregarClientes() {
    return clientesMock;
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

// Listener delegado: sobrevive ao redesenho das linhas e evita um listener por botão.
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
        window.location.href = ROTA_EDITAR_CLIENTE;
        return;
    }

    if (acao === "excluir") {
        mostrarAviso("A exclusão de cliente será liberada em uma próxima etapa.");
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
        if (botao.dataset.secao === "Clientes") {
            return;
        }

        mostrarAviso(`O módulo ${botao.dataset.secao} ainda não está disponível nesta versão.`);
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
