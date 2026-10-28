# NOS TV — Comando v3 (Samsung TizenBrew)

Modulo experimental, nao oficial, para `https://nostv.pt/`.
Nao esta associado a NOS.

## Instalacao / atualizacao

1. Abre TizenBrew na TV.
2. Remove o modulo antigo `hwiguel3/nostv-tizenbrew` caso continue a carregar a v2.
3. Adiciona **Add GitHub Module**: `hwiguel3/nostv-tizenbrew`.
4. Abre **NOS TV (Comando v3 - Azul)**. A mensagem inicial devera dizer `NOS Comando v3`.

O manifesto usa o novo ficheiro `main_v3.js` para contornar a cache do script antigo.

## Comando

- Setas: mover a selecao e tentar percorrer a pagina.
- Contorno azul: indica o elemento selecionado (nao depende de CSS `:focus` da NOS).
- OK: tentar ativar o elemento com um unico clique.
- Verde: alternar rato virtual e navegacao normal.
- Azul: painel de diagnostico, com contagem de elementos, areas com scroll e estado do PIN.
- No pedido de PIN: quatro caixas destacadas a azul; **OK** abre teclado numerico interno, setas escolhem digitos e OK insere. Voltar fecha o teclado.

## Corrigido face a v2

- Um unico controlador de teclas, eliminando a sobreposicao entre o script PIN e o de navegacao.
- Contornos azuis no lugar dos amarelos.
- Tentativas de scroll vertical em contentores interiores e pagina principal.
- Tentativas de scroll horizontal e, se existir, utilizacao das setas de carrossel.
- Um unico clique nativo nos cartoes, evitando sequencias sinteticas de varios eventos.
- Pesquisa de campos HTML de PIN e escrita atraves de eventos `input` / `change` nos campos localizados.

## Limites importantes

Esta versao foi verificada quanto a sintaxe, mas nao esta validada numa sessao real na Samsung Q60A.
O PIN pode continuar a nao funcionar se as caixas ou o formulario estiverem isolados numa iframe inacessivel,
se a NOS exigir eventos fisicos confiaveis ou se os campos tiverem uma implementacao nao padrao.
Neste caso, premir o botao azul apresenta **PIN detetado / Caixas PIN / Campos PIN**,
que ajuda a localizar a falha sem mostrar nem guardar o codigo.

Se abrir um canal continuar a produzir erro, recolhe uma fotografia **da mensagem exata de erro**.
Se o erro surgir apesar do clique corrigido, pode nao ser um problema de navegacao,
mas sim do site / descodificacao / DRM / sessao, e nao deve ser contornado com cliques adicionais.

Nenhum PIN e gravado no repositorio, telemetria ou armazenamento local pelo modulo.
