# feature-store-personalizacao

Feature store minimo, em JavaScript puro, para **personalizacao de atendimento**. Mostra na pratica as tres disciplinas que definem um feature store, sem depender de nenhum framework pesado:

1. **Registro unico de features** ([`src/features.js`](src/features.js)): cada feature tem UMA definicao, versionada e revisada em pull request.
2. **Serving online de baixa latencia** ([`src/store.js`](src/store.js)): materializa o ultimo valor por cliente e serve com uma unica leitura por chave (interface identica a de um Redis).
3. **Point-in-time correctness no treino** ([`src/training.js`](src/training.js)): monta o dataset anexando as features como elas eram no instante do rotulo, sem vazar informacao do futuro.

A ideia central: a **mesma** funcao `computeFeatures` gera o dado de treino e o de inferencia, mudando apenas o parametro `asOf`. Isso elimina o *training-serving skew* por construcao.

## Rodando a demo

```bash
npm run demo
```

A demo materializa features online para um cliente, decide uma acao de atendimento, trata o cold start e monta um dataset de treino com point-in-time, provando que o mesmo cliente teria features diferentes num instante passado.

## Estrutura

| Arquivo | Papel |
| --- | --- |
| `src/features.js` | Registro unico + `computeFeatures(events, asOf)` |
| `src/store.js` | Online store (materializar / servir) |
| `src/training.js` | Dataset de treino com point-in-time |
| `src/demo.js` | Exemplo ponta a ponta |

## Contexto

Este repositorio acompanha o artigo [Feature store para personalizacao de atendimento](https://joaovictorsouza.dev/blog/feature-store-personalizacao-atendimento), que explica os quatro problemas que um feature store resolve, a diferenca entre features batch e online e como levar isso para producao sem overengineering.

## Licenca

MIT. Veja [LICENSE](LICENSE).
