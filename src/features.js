// A UNICA definicao de cada feature.
// A mesma funcao roda no batch (treino/materializacao) e no online (update),
// o que elimina o training-serving skew por construcao.

// Cada feature declara: nome, janela em dias e como computar a partir dos eventos.
export const featureDefs = {
  ticket_medio_90d: {
    window_days: 90,
    compute: (events) => {
      const compras = events.filter((e) => e.type === 'order' && e.value > 0);
      if (compras.length === 0) return 0;
      const soma = compras.reduce((acc, e) => acc + e.value, 0);
      return Number((soma / compras.length).toFixed(2));
    },
  },
  num_compras_90d: {
    window_days: 90,
    compute: (events) => events.filter((e) => e.type === 'order').length,
  },
  canal_preferido: {
    window_days: 180,
    compute: (events) => {
      const msgs = events.filter((e) => e.type === 'message');
      const contagem = {};
      for (const m of msgs) contagem[m.channel] = (contagem[m.channel] || 0) + 1;
      const [canal] = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0] || ['whatsapp'];
      return canal;
    },
  },
};

// Aplica TODAS as features a um cliente, respeitando a janela e o instante 'asOf'.
//   asOf = agora                              -> valor online (inferencia).
//   asOf = timestamp de um evento historico   -> valor point-in-time (treino).
// O mesmo codigo, dois usos, zero skew.
export function computeFeatures(events, asOf = Date.now()) {
  const out = { computed_at: asOf };
  for (const [name, def] of Object.entries(featureDefs)) {
    const inicio = asOf - def.window_days * 24 * 60 * 60 * 1000;
    const janela = events.filter((e) => e.ts <= asOf && e.ts >= inicio);
    out[name] = def.compute(janela);
  }
  return out;
}
