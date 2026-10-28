# NOS TV — Comando v6 (base v3) / TizenBrew Samsung Q60A

Modulo experimental nao oficial para `https://nostv.pt/`, sem qualquer associacao a NOS.

## Porque regressamos a v3

O utilizador confirmou que na v3 o scroll (vertical e horizontal) e o destaque azul funcionavam, mas o PIN nativo continuava com quatro caixas vazias, a reproducao dos canais dava erro e ficava preso no scroll da lista dos canais. A v5 introduziu uma regressao na navegacao.

A v6 foi criada **diretamente a partir de main_v3.js**. A funcao de navegacao `navigate`, os estilos do foco azul e a logica de scroll foram preservados sem alteracoes funcionais.

## Alteracoes pontuais da v6

- **Sair da lista de canais:** ao selecionar um item dentro de uma area realmente scrollavel na vertical, **Esquerda** ou **Voltar** tentam transferir a selecao para um elemento fora da lista. Nao ha a heuristica larga da v5 baseada em coordenadas e na simples existencia da tab Canais.
- **PIN:** tenta primeiro clicar nas caixas originais e focar um campo nativo para permitir o teclado do Tizen. Pesquisa campos HTML, Shadow DOM aberto e iframes de mesma origem. Se houver input real mas nao for possivel focar, fica disponivel o teclado alternativo. Se so houver quatro caixas decorativas sem input editavel, o teclado falso nao aparece a fingir que inseriu o codigo.
- **Reproducao:** adiciona diagnostico de MSE, EME, codecs, videos HTML, codigos de erro de media e user-agent no botao **Azul**. Nao modifica DRM, pedidos ao servidor ou autenticacao.

## Instalacao

1. Retirar do TizenBrew a versao anterior de `hwiguel3/nostv-tizenbrew`.
2. Adicionar **Add GitHub Module** com o texto `hwiguel3/nostv-tizenbrew`, sem `@`.
3. Abrir **NOS TV (Comando v6 - Base v3)**, versao **0.6.0**.
4. Confirmar a mensagem `NOS Comando v6`. Se ainda aparecer v5, fechar completamente TizenBrew e reiniciar, pois pode haver cache dos scripts.

## Testes na TV

1. No ecra inicial, confirmar que as setas selecionam elementos e o contorno azul e scroll continuam funcionais.
2. No PIN: tocar OK sobre as caixas. Caso apareca o teclado nativo, escrever por ele. Se as caixas nao mudarem, premir Azul, fotografar somente `PIN detetado`, `Caixas PIN`, `Campos PIN`, `Tipos PIN`, `Inputs totais` e `Iframes`. **Nao fotografar nem enviar o PIN.**
3. Selecionar um canal e testar seta Esquerda / Voltar quando a selecao esta na lista vertical.
4. Quando surgir NTV135, premir Azul e fotografar `MSE`, `EME`, `Videos DOM`, `Erros videos`, `H264`, `HLS` e `Motor`.

## Observacoes

O utilizador conseguiu efetivamente ver canais em `nostv.pt` no browser Samsung nativo, mas nao atraves do modulo TizenBrew. Essa diferenca demonstra que a TV e a conta conseguem reproduzir no primeiro contexto, **nao** que o WebView da segunda aplicacao tenha as mesmas capacidades. NTV135 e mencionado pela NOS na sua ajuda como erro que pode estar relacionado com conectividade, mas a origem concreta aqui continua por diagnosticar.

Esta versao nao foi ainda validada em hardware real. Nao existe garantia de que um evento sintetico de teclado atualize os inputs da NOS, nem de que a compatibilidade de media seja igual entre Samsung Browser e TizenBrew.

Os ficheiros anteriores `main_v3.js`, `main_v4.js` e `main_v5.js` foram mantidos para rollback.
