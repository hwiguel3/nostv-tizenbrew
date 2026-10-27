# NOS TV — Comando v1 (TizenBrew)

**Protótipo experimental e não oficial. Não tem ligação à NOS.**

Módulo para Samsung Tizen/TizenBrew, desenvolvido para tentar navegar no `https://nostv.pt/` com as setas e o botão OK do comando da televisão, sem depender do `:focus` nativo.

## Instalar na TV

1. Abre **TizenBrew**.
2. Escolhe **Add GitHub Module**.
3. Introduz `hwiguel3/nostv-tizenbrew` e confirma.
4. Abre o módulo **NOS TV (Comando v1)**. Não é necessário desinstalar TizenPortal.

## Controlos

- **Setas**: escolhem o elemento mais próximo na direção pretendida.
- **Contorno amarelo**: mostra a seleção, independentemente do foco HTML.
- **OK**: tenta clicar no elemento selecionado.
- **Verde (toque)**: alterna entre navegação por elementos e **rato virtual**.
- **Azul (toque)**: mostra o número de elementos clicáveis identificados.

O contorno desaparece após 14 segundos sem atividade.

## Limitações

O `nostv.pt` tem elementos dinâmicos e partes que podem exigir regras específicas de navegação. Este é um primeiro teste e não foi validado numa sessão real nesta televisão. Alguns cliques poderão não responder ou algum cartão poderá não ser identificado. A reprodução de vídeo também depende da compatibilidade do motor web/DRM da televisão.

Se não aparecer o contorno amarelo ao premir uma seta, confirma se aparece a mensagem inicial `NOS Comando v1 | Pronto`. Se não aparecer, poderá haver um problema de injeção/carga do módulo.

Para atualizações, o TizenBrew/jsDelivr pode manter uma versão em cache; volta a abrir/reatualizar o módulo depois de publicadas as alterações.

## Código

- `package.json`: manifesto TizenBrew.
- `main.js`: seleção por setas, contorno amarelo e modo de rato virtual.

Baseado no mecanismo de módulos `mods` documentado pelo projeto TizenBrew.
