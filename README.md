# NOS TV para TizenBrew — v7 (v5 corrigida)

Modulo nao oficial e experimental para `https://nostv.pt/`.

## Estado confirmado pelo utilizador

- **V5**: a navegacao pelo comando funciona, o contorno de selecao e azul e o scroll funciona.
- Problema a corrigir: ao abrir **Definições** (painel lateral a direita da pagina, com X no topo esquerdo do painel), o utilizador nao consegue fechar e fica preso.
- Reproducao de canais no modulo da erro **NTV135**.
- Reproducao de canais **funciona no browser Samsung nativo da mesma TV**.
- A anterior v6 partiu da v3 a pedido do utilizador mas foi abandonada apos confirmacao de que a v5 afinal funcionava.

## O que mudou na v7

**Base: ficheiro `main_v5.js`.** A funcao `navigate` e a navegacao/scroll da v5 foram preservados. A v7 nao parte da v6.

1. Deteta o titulo visivel **Definições** na metade direita, procura o controlo X proximo do titulo e tenta clicar ao premir **Voltar** (keyCode 10009) ou **Esquerda**, antes das heuristicas de lista de canais.
2. Se nao encontrar o controlo X, deixa a NOS receber a tecla, em vez de intercetar Voltar por engano.
3. Diagnostico do NTV135 com botao **Azul**: Video DOM, erros de video, MSE, EME, H264, HLS, AVPlay, contexto seguro e user-agent. **Nao altera DRM nem autenticacao, nem garante a reproducao.**

## Instalacao e atualizacao

1. No TizenBrew, remover o modulo anterior.
2. Em **Add GitHub Module**, inserir `hwiguel3/nostv-tizenbrew` (sem arroba).
3. Abrir **NOS TV (v5 corrigida - v7)**, versao **0.7.0**.
4. Confirmar notificacao `NOS Comando v7`. Se abrir a versao anterior, encerrar e reabrir o TizenBrew (eventual cache).

## Testes solicitados

- Na pagina inicial, confirmar que a selecao azul e o scroll funcionam como na v5.
- Abrir o painel **Definições** (como na fotografia) e premir **Voltar** ou **Esquerda**: deve tentar clicar no X do painel.
- Abrir um canal e, com erro NTV135 visivel, premir **Azul**. Enviar foto do diagnostico onde se vejam `EME API`, `MSE`, `AVPlay`, `H264 HTML`, `MSE H264`, `Video DOM`, `Erros video` e `Motor`. Nao enviar PIN ou credenciais.

O NTV135 pode ter causas diversas. A reproducao bem-sucedida no browser nativo Samsung nao prova que o contexto TizenBrew tenha igual DRM/EME, user-agent, cookies ou comportamento de player. As APIs da Samsung confirmam capacidades DRM em Tizen 6.0, mas a causa do erro especifico nesta combinacao ainda nao foi medida.

## Rollback

Os ficheiros `main_v3.js`, `main_v4.js`, `main_v5.js` e `main_v6.js` foram preservados. A v7 usa `main_v7.js`.

Apenas sintaxe e integridade do repositorio foram verificadas remotamente; a v7 ainda nao foi validada em hardware.
