# Portfólio de Pedro Henrique Ferrante Prado

Portfólio técnico com foco em blue team, publicado em https://ferranteabc.github.io/meu-portfolio/

É um site estático em HTML, CSS e JavaScript, sem dependências externas, sem cookies nem rastreadores e com política de segurança de conteúdo (CSP) restritiva.

## Arquivos

- `index.html`, `style.css` e `script.js`: o site.
- `Curriculo-Pedro-Henrique-Ferrante-Prado.pdf`: currículo, versão pública sem telefone.
- `og-image.png`: imagem de preview quando o link é compartilhado.
- `site.webmanifest` e os ícones: metadados do site.

## Animações ao rolar

As animações usam só CSS e um `IntersectionObserver`, sem bibliotecas: abertura do resumo (nome sai de trás de uma tarja de omissão e o painel imprime os comandos linha a linha), contadores, régua CVSS que percorre a nota, caminho do tráfego, táticas MITRE ATT&CK que acendem em sequência e uma linha de progresso de leitura no índice.

Elas só rodam com `prefers-reduced-motion: no-preference` e fora da impressão. Sem JavaScript, com movimento reduzido ou ao imprimir, a página aparece completa e parada.

O fundo do resumo é um canvas de "fluxo de logs" (bytes em hexadecimal e termos como SYSMON, DNS e T1059 caindo em colunas). Ele usa a cor de destaque do tema claro ou escuro, pausa quando o resumo sai da tela ou a aba fica em segundo plano, fica oculto na impressão e, com movimento reduzido, mostra apenas um quadro estático.
