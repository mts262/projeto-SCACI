const modal = document.querySelector('#modal-exclusao');
const modalSucesso = document.querySelector('#modal-sucesso');
const deleteButton = document.querySelector('#btn-excluir');
const confirmButton = document.querySelector('#btn-confirmar');
const statusMsg = document.querySelector('#save-status');

const parametros = new URLSearchParams(window.location.search);
const id_imovel = parametros.get('id') || parametros.get('id_imovel');

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

function formatarCep(valor) {
    const d = String(valor ?? '').replace(/\D/g, '');
    return d.length === 8 ? d.replace(/^(\d{5})(\d{3})$/, '$1-$2') : (valor ?? '');
}

const TIPOS_IMOVEL = {
    casa_ape: 'Casa / Apartamento',
    terreno: 'Terreno'
};

// "loteamento" -> "Loteamento"
function capitalizar(texto) {
    const t = String(texto ?? '');
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
}

function urlDoArquivo(url) {
    if (!url) return '';
    return /^https?:\/\//.test(url) ? url : `${API}/${String(url).replace(/^\/+/, '')}`;
}

function preencher(id, valor) {
    document.querySelector(id).value = valor ?? '';
}

// Mostra o link se houver arquivo, senão o campo "Nenhum ..."
function mostrarArquivo(linkId, vazioId, url) {
    const link = document.querySelector(linkId);
    const vazio = document.querySelector(vazioId);
    const destino = urlDoArquivo(url);

    if (destino) {
        link.href = destino;
        link.hidden = false;
        vazio.hidden = true;
    } else {
        link.hidden = true;
        vazio.hidden = false;
    }
}

// ---------- Carregar os dados ----------

async function carregarImovel() {
    try {
        const resposta = await fetch(`${API}/imovel/${id_imovel}`);
        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(dados.erro || dados.mensagem || 'Erro ao carregar imóvel.');
        }

        // Se o back embrulhar o imóvel ({ imovel: {...} }), desembrulha
        const imovel = dados.imovel ?? dados;
        const proprietario = imovel.proprietario ?? {};

        // Proprietário (ajuste os nomes conforme o que o back devolver)
        preencher('#owner',
            proprietario.cliente?.nome ?? imovel.nome_proprietario ?? proprietario.nome);
        preencher('#saleDeadline',
            formatarData(proprietario.prazo_venda ?? imovel.prazo_venda));
        preencher('#ownerNotes',
            proprietario.observacao_proprietario ?? proprietario.observacao ?? imovel.observacao_proprietario);

        // Tipo e grupos específicos
        const tipo = imovel.tipo_imovel;
        preencher('#propertyType', TIPOS_IMOVEL[tipo] ?? tipo);

        document.querySelector('#terreno-fields').hidden = tipo !== 'terreno';
        document.querySelector('#casa-ape-fields').hidden = tipo !== 'casa_ape';

        if (tipo === 'terreno') {
            const terreno = imovel.terreno ?? imovel;
            preencher('#zona', capitalizar(terreno.zona));
            preencher('#tipoTerreno', capitalizar(terreno.tipo_terreno));
        }

        if (tipo === 'casa_ape') {
            const casaApe = imovel.casa_ape ?? imovel;
            preencher('#valorIptuAnual', formatarDinheiro(casaApe.valor_iptu_anual));
            preencher('#dataUltimoIptu', formatarData(casaApe.data_ultimo_iptu));
            preencher('#valorCondominio', formatarDinheiro(casaApe.valor_condominio));
        }

        // Dados do imóvel
        preencher('#registrationNumber', imovel.matricula_imovel);
        preencher('#iptuNumber', imovel.inscricao_iptu);
        preencher('#legalStatus', imovel.situacao_legal);
        preencher('#propertyDescription', imovel.descricao_imovel);
        preencher('#totalArea', formatarArea(imovel.area_total));
        preencher('#availabilityDate', formatarData(imovel.data_disponibilidade));
        preencher('#saleValue', formatarDinheiro(imovel.valor_venda));
        preencher('#minSaleValue', formatarDinheiro(imovel.valor_minimo_venda));
        preencher('#appraisalValue', formatarDinheiro(imovel.cotacao_imovel));
        preencher('#notes', imovel.observacao);

        // Endereço
        preencher('#postalCode', formatarCep(imovel.cep));
        preencher('#complement', imovel.complemento);
        preencher('#street', imovel.logradouro);
        preencher('#number', imovel.numero);
        preencher('#neighborhood', imovel.bairro);
        preencher('#city', imovel.cidade);
        preencher('#state', imovel.uf);

        // Documentos
        mostrarArquivo('#possessionLink', '#possessionEmpty', imovel.url_comprovante_posse);
        mostrarArquivo('#registryLink', '#registryEmpty', imovel.url_certidao_matricula);

    } catch (error) {
        console.error(error);
        statusMsg.textContent = error.message;
    }
}

carregarImovel();

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
        const resposta = await fetch(`${API}/imovel/${id_imovel}`, {
            method: 'DELETE'
        });

        const resultado = await resposta.json().catch(() => ({}));
        console.log('Resposta do Backend:', JSON.stringify(resultado, null, 2));

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Erro ao excluir imóvel!');
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
    window.location.href = '../listagem-imovel/index.html';
});