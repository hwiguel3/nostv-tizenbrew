# NOS TV — Comando v4 (Samsung TizenBrew)

Modulo experimental, nao oficial, para `https://nostv.pt/`. Nao esta associado a NOS.

## Atualizar

No TizenBrew, remove o modulo antigo `hwiguel3/nostv-tizenbrew`, volta a adiciona-lo em **Add GitHub Module** e abre **NOS TV (Comando v4 - Azul)**. O script principal usa o novo nome `main_v4.js` para evitar reutilizar o ficheiro anterior em cache.

## Comando

- Setas: mover selecao; scroll vertical e horizontal quando aplicavel.
- Contorno **azul**: evidencia o elemento selecionado.
- Na lista vertical lateral de canais: **Esquerda** ou **Voltar** tenta sair da lista para o restante conteudo.
- OK: selecionar, utilizando um clique normal.
- Verde: alternar para o rato virtual.
- Azul: mostrar informacoes de diagnostico, incluindo campos PIN, iframes, MSE e EME.

## PIN: estado experimental

Na janela de PIN, OK tenta primeiro focar o campo de texto real da NOS. Se nao encontrar um campo focavel, abre o teclado numerico alternativo. A compatibilidade do PIN **nao esta confirmada**: formularios com elementos de desenho personalizados, iframes isoladas ou rejeicao de eventos de JavaScript podem impedir a escrita. O modulo nao guarda nem transmite o PIN. A informacao em azul **nunca inclui os digitos**.

## Erro NTV135

Este erro pode ser causado pela propria NOS TV (ligacao/reproducao), nao apenas pela navegacao do modulo. O painel azul indica se o motor web disponibiliza as APIs MSE e EME, mas nao confirma suporte para um DRM especifico. Se o navegador Samsung original reproduzir o mesmo canal e o TizenBrew nao, esse contraste indica um problema de compatibilidade ou ambiente de reproducao que requer investigacao separada.

Nao alterar nem contornar protecoes DRM.
