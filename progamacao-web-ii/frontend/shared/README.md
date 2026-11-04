# Recursos compartilhados

Esta pasta reúne o que é comum a todas as telas: o tema visual (`styles.css`) e a navegação do menu lateral (`nav.js`).

## Estilos (`styles.css`)

Todas as telas carregam seu `styles.css` local e, em seguida, `shared/styles.css`.
O CSS local fica em `@layer screen`, para que os componentes e tokens compartilhados
tenham prioridade sem depender da especificidade dos seletores de cada tela.

Para novas telas, use os dois links com caminhos relativos corretos e mantenha
as regras específicas dentro de `@layer screen`. Altere fontes, cores, navegação,
campos, botões, tabelas e pontos de quebra no arquivo compartilhado.

O padrão mantém o tema escuro, azul para ações principais e dourado para títulos
de seção. Em até 760px, a navegação rola horizontalmente e formulários e cartões
usam uma coluna; tabelas rolam dentro de seu próprio contêiner.

## Navegação (`nav.js`)

O `nav.js` controla os botões do menu lateral (elementos com `data-section`) em todas as telas,
evitando repetir o mesmo bloco de navegação em cada `app.js`.

As rotas ficam no objeto `ROTAS`, com caminhos a partir da raiz do frontend. A raiz é
descoberta pela localização do próprio `nav.js`, então a mesma lista vale para qualquer
tela, independentemente da profundidade da pasta. Seções que ainda não têm rota exibem o
aviso "ainda não disponível" no `#navigation-dialog`.

Para usar em uma nova tela:

1. Inclua o script antes do `app.js` da tela, ajustando o caminho relativo:
   `<script src="../../shared/nav.js"></script>`
2. Mantenha no HTML os botões com `data-section` e o `<dialog id="navigation-dialog">`
   com o `<p id="navigation-message">`.
3. Não repita o bloco de navegação no `app.js` da tela, para evitar navegação dupla.

Para liberar uma seção nova, basta adicionar uma linha no `ROTAS` do `nav.js`.