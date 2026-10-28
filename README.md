# NOS TV — Comando v4 (TizenBrew Samsung)
Modulo experimental nao oficial para https://nostv.pt/.

## Atualizar
1. Abrir TizenBrew e remover a versao antiga NOS TV.
2. Add GitHub Module: `hwiguel3/nostv-tizenbrew`
3. Confirmar que o cartao diz **NOS TV (Comando v4 - Azul) (0.4.0)**.
4. Ao abrir, procurar o aviso **NOS Comando v4** no canto.
Se continuar a mostrar v3, a cache do jsDelivr/TizenBrew ainda nao foi renovada;
nao e defeito do script da v4.

## Comando
- Setas: escolher itens e deslocar listas/carrosseis.
- Contorno azul: selecao visivel.
- OK: clicar no item.
- Verde: rato virtual; novo toque volta a navegacao por setas.
- Azul: diagnostico tecnico sem mostrar PIN nem credenciais.
- **Na lista lateral de canais:** Esquerda ou Voltar para abandonar o scroll lateral
  e regressar a outro elemento ou ao menu superior, quando encontrado.

## PIN
Tentativa de focar o verdadeiro campo da NOS antes de apresentar o teclado
numerico alternativo. A v4 envia eventos input/change aos inputs que conseguir
identificar. Isto NAO equivale a uma entrada fisica autenticada e pode ser
ignorado pela NOS, sobretudo em widgets especiais ou iframes. Se nao resultar:
no ecrã de PIN, carregar no botao azul e enviar uma imagem dos contadores
«PIN detetado», «Caixas PIN», «Campos PIN» e «Tipos de campo» (sem revelar o PIN).

## Erro NTV135
A NOS classifica NTV135 como problema de conectividade ao servico.
Pode tambem acontecer por falha da sessao ou incompatibilidade do ambiente
de reproducao; apenas estas imagens nao permitem determinar a causa.
A v4 inclui informacao sobre MSE, EME e numero de videos no diagnostico.
Nao contorna DRM nem garante reproducao.

## Limites
A sintaxe JavaScript foi verificada, mas ainda nao testada fisicamente na Q60A
do utilizador. A URL de navegação permanece a original, https://nostv.pt/.
Este modulo nao recolhe, armazena nem envia PINs para fora do website da NOS.
