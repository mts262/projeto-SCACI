const modal = document.querySelector('#modal-exclusao');
const modalSucesso = document.querySelector('#modal-sucesso');
const deleteButton = document.querySelector('#btn-excluir');
const confirmButton = document.querySelector('#btn-confirmar');
const statusMsg = document.querySelector('#save-status');

// O id do comprador é o id do cliente (chave primária da tabela Comprador)
const parametros = new URLSearchParams(window.location.search);
const id_cliente = parametros.get('id') || parametros.get('id_cliente');

const API = 'http://localhost:3000';

// ---------- Formatação ----------

function formatarDinheiro(valor) {
    if (valor === null || valor === undefined || valor === '') return '';
    // O Prisma devolve Decimal como texto, então converte antes de formatar
    return 'R$ ' + Number(valor).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatarArea(valor) {
    if (valor === null || valor === undefined || valor === '') return '';
    return Number(valor).toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }) + ' m²';
}

// "2027-01-15T00:00:00.000Z" ou "2027-01-15" -> "15/01/2027"
// Usa o texto direto (sem new Date) para não mudar o dia por causa do fuso
function formatarData(valor) {
    if (!valor) return '';
    const [ano, mes, dia] = String(valor).slice(0, 10).split('-');
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : '';
}

const FORMAS_PAGAMENTO = {
    a_vista: 'À Vista',
    prazo: 'Prazo'
};

function formatarPagamento(valor) {
    return FORMAS_PAGAMENTO[valor] || valor || '';
}

function urlDoComprovante(url) {
    if (!url) return '';
    return /^https?:\/\//.test(url) ? url : `${API}/${String(url).replace(/^\/+/, '')}`;
}

function preencher(id, valor) {
    document.querySelector(id).value = valor ?? '';
}

// ---------- Carregar os dados ----------

async function carregarComprador() {
    try {
        const resposta = await fetch(`${API}/comprador/${id_cliente}`);
        const comprador = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(comprador.erro || comprador.mensagem || 'Erro ao carregar comprador.');
        }

        // Nome do cliente: ajuste conforme o que o back devolver
        preencher('#client', comprador.cliente?.nome ?? comprador.nome_cliente ?? comprador.nome);

        preencher('#income', formatarDinheiro(comprador.renda_mensal));
        preencher('#occupation', comprador.profissao);
        preencher('#desiredPropertyType', comprador.tipo_imovel_desejado);
        preencher('#minValue', formatarDinheiro(comprador.faixa_valor_min));
        preencher('#maxValue', formatarDinheiro(comprador.faixa_valor_max));
        preencher('#purchaseDeadline', formatarData(comprador.prazo_compra));
        preencher('#desiredDescription', comprador.descricao_desejada);
        preencher('#minArea', formatarArea(comprador.area_minima_desejada));
        preencher('#desiredLocation', comprador.localizacao_desejada);
        preencher('#paymentType', formatarPagamento(comprador.forma_pagamento));

        // Comprovante: mostra o link se houver arquivo, senão "Nenhum comprovante"
        const link = document.querySelector('#proofLink');
        const vazio = document.querySelector('#proofEmpty');
        const urlComprovante = urlDoComprovante(comprador.url_comprovante_renda);

        if (urlComprovante) {
            link.href = urlComprovante;
            link.hidden = false;
            vazio.hidden = true;
        } else {
            link.hidden = true;
            vazio.hidden = false;
        }

    } catch (error) {
        console.error(error);
        statusMsg.textContent = error.message;
    }
}

carregarComprador();

// ---------- Modais ----------

// Abre o modal de confirmação
deleteButton.addEventListener('click', () => modal.showModal());

// Fecha ao clicar em "Não" (Esc já é tratado pelo <dialog>)
document.querySelector('#btn-nao').addEventListener('click', () => modal.close());

// Fecha os modais ao clicar no fundo escuro, fora da caixa
[modal, modalSucesso].forEach(dialogo => {
    dialogo.addEventListener('click', event => {
        if (event.target === dialogo) dialogo.close();
    });
});

// ---------- Exclusão ----------

confirmButton.addEventListener('click', async () => {
    confirmButton.disabled = true;

    try {
        const resposta = await fetch(`${API}/comprador/${id_cliente}`, {
            method: 'DELETE'
        });

        const resultado = await resposta.json().catch(() => ({}));
        console.log('Resposta do Backend:', JSON.stringify(resultado, null, 2));

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Erro ao excluir comprador!');
        }

        modal.close();
        modalSucesso.showModal();
    } catch (error) {
        console.error(error);

        modal.close();
        statusMsg.textContent = error.message;
    } finally {
        confirmButton.disabled = false;
    }
});

// Fecha o modal de sucesso e volta para a listagem
document.querySelector('#btn-ok').addEventListener('click', () => {
    modalSucesso.close();
    window.location.href = '../listagem-comprador/index.html';
});