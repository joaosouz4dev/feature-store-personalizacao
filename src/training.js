// Montagem do dataset de treino com point-in-time correctness.
// Para cada rotulo, anexa as features como elas eram no timestamp daquele
// evento, nunca como sao hoje, evitando vazamento de informacao do futuro.

import { computeFeatures } from './features.js';

// labels: [{ customer_id, ts, label }]  (ts = instante da conversa a prever)
// eventsByCustomer: { [customer_id]: [{ type, value?, channel?, ts }] }
export function buildTrainingDataset(labels, eventsByCustomer) {
  return labels.map((row) => {
    const events = eventsByCustomer[row.customer_id] || [];
    // asOf = ts do rotulo -> so eventos anteriores entram na janela.
    const features = computeFeatures(events, row.ts);
    return { ...features, customer_id: row.customer_id, label: row.label };
  });
}
