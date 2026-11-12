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

As animações rodam por padrão e **não dependem** da configuração de animações do sistema (em máquinas virtuais, no modo de economia de energia e em vários notebooks corporativos ela vem desligada, e o site não ficaria animado para quem o visse ali). Em troca, há um botão "Pausar animações" (no índice, ou no rodapé em telas pequenas) que deixa a página completa e parada; a escolha fica salva no navegador. Sem JavaScript, com a pausa ligada ou ao imprimir, a página aparece completa e parada.

O fundo do resumo é um canvas de "fluxo de logs" (bytes em hexadecimal e termos como SYSMON, DNS e T1059 caindo em colunas). Ele usa a cor de destaque do tema claro ou escuro, pausa quando o resumo sai da tela ou a aba fica em segundo plano, fica oculto na impressão e, com as animações pausadas, mostra apenas um quadro estático.
