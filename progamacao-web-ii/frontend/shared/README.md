# Estilos compartilhados

Todas as telas carregam seu `styles.css` local e, em seguida, `shared/styles.css`.
O CSS local fica em `@layer screen`, para que os componentes e tokens compartilhados
tenham prioridade sem depender da especificidade dos seletores de cada tela.

Para novas telas, use os dois links com caminhos relativos corretos e mantenha
as regras específicas dentro de `@layer screen`. Altere fontes, cores, navegação,
campos, botões, tabelas e pontos de quebra no arquivo compartilhado.

O padrão mantém o tema escuro, azul para ações principais e dourado para títulos
de seção. Em até 760px, a navegação rola horizontalmente e formulários e cartões
usam uma coluna; tabelas rolam dentro de seu próprio contêiner.
