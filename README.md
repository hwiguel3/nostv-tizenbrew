# NOS TV — Comando v5 (TizenBrew / Samsung Q60A)

Modulo experimental nao oficial para `https://nostv.pt/`, sem ligacao a NOS.

## O que ja funciona na TV
- Scroll da pagina / listas e carrosseis (confirmado pelo utilizador).
- Contorno azul sobre os elementos selecionados (confirmado).
- Acesso ao website da NOS e sessoes; o utilizador confirmou reproducao no **browser nativo Samsung**, mas nao no modulo.

## Objetivos desta v5
1. **Sair da lista lateral dos canais**: seta esquerda ou botao Voltar tentam transferir o foco para fora da lista e para o menu superior Canais, mesmo com rotas de pagina unica (SPA).
2. **PIN**: primeiro tenta focar um campo NOS nativo, para permitir o teclado real da TV. A procura inclui inputs normais, Shadow DOM aberto e iframes de mesma origem; o teclado azul interno e apenas alternativa. A escrita envia eventos `input` e `change` quando encontra um campo real, mas isto nao equivale a uma tecla fisica confiavel.
3. **NTV135**: o botao azul mostra diagnostico nao sensivel (user-agent, API de media, quantidade de videos, codigo de erro HTMLVideoElement, campos PIN e iframes).

## Instalacao / atualizacao
1. No TizenBrew, eliminar a versao anterior de `hwiguel3/nostv-tizenbrew`.
2. Em **Add GitHub Module**, escrever `hwiguel3/nostv-tizenbrew`, sem `@`.
3. Abrir **NOS TV (Comando v5 - Azul) (0.5.0)**.
4. Confirmar a mensagem inicial `NOS Comando v5`.

O modulo usa um ficheiro novo `main_v5.js`. Se o cartao continuar a mostrar v4, pode haver cache do jsDelivr: fechar e reabrir TizenBrew ou aguardar a atualizacao; nao instalar nomes de modulo com refs @ que possam originar **Unknown Module**.

## Teclas
- Setas: selecionar e deslocar.
- OK: ativar elemento.
- Verde: alternar rato virtual.
- **Esquerda/Voltar** na lista de canais: sair para o menu ou outra coluna.
- Azul: diagnostico local sem codigo PIN.

## Como diagnosticar o PIN sem expor credenciais
No ecra do PIN, premir **azul** e fotografar os valores **PIN detetado**, **Caixas PIN**, **Campos PIN**, **Tipos de campo** e **Iframes**. Nunca fotografar os numeros introduzidos.

## Limites
- Um teclado desenhado pelo modulo pode mostrar os numeros sem que a NOS os aceite. Nao considerar o PIN corrigido enquanto as quatro casas originais nao reagirem.
- O erro NTV135 aparece dentro do modulo mesmo quando o browser nativo Samsung reproduz. A NOS associa NTV135 a problemas de conectividade, mas essa classificacao nao identifica a causa especifica neste ambiente. User-agent, cookies/sessao e suporte EME/MSE sao hipoteses a investigar.
- Nao contornar DRM nem guardar PIN. Sintaxe verificada; funcionalidades ainda por testar fisicamente nesta TV.
