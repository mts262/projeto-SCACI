# Front-end — Editar Cliente

Implementação em HTML, CSS e JavaScript da página 6 de `analise-modelagem/prototipos/prototipos-scaci.pdf`, sem dependências ou etapa de build.

Na raiz do repositório, execute:

```sh
python3 -m http.server 8000 --directory progamacao-web-ii/Front
```

Acesse `http://localhost:8000`.

- Layout responsivo, menu lateral e campos preenchidos conforme o protótipo.
- Validação de campos obrigatórios, e-mail, data, quantidade de dígitos de CPF/CNPJ, telefone e CEP. A validação de CPF/CNPJ é de formato, sem conferir dígitos verificadores.
- O CEP `45000` foi mantido conforme o PDF; complete os oito dígitos antes de salvar.
- Seleção ou arraste de comprovante PDF, PNG ou JPG de até 5 MB.
- Dados e arquivo selecionado são salvos no IndexedDB do navegador e restaurados ao recarregar. Não há integração com servidor; use dados fictícios nesta demonstração.
- O nome de comprovante inicial reproduz o PDF; não existe um arquivo inicial associado. Selecione um arquivo para armazená-lo.
- Os demais módulos do menu exibem um aviso de indisponibilidade.

Os arquivos são `index.html` (estrutura), `styles.css` (layout) e `app.js` (interação e persistência).
