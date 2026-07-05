// Demonstracao ponta a ponta:
//   1. materializa features online para um cliente e serve na "conversa";
//   2. monta um dataset de treino com point-in-time correctness e mostra
//      que o mesmo cliente teria features DIFERENTES em um instante passado
//      (prova de que asOf respeita o tempo e nao vaza o futuro).

import { computeFeatures } from './features.js';
import { materialize, getOnlineFeatures } from './store.js';
import { buildTrainingDataset } from './training.js';

const DIA = 24 * 60 * 60 * 1000;
const agora = Date.now();

// Historico de eventos de um cliente (compras + mensagens).
const eventos = [
  { type: 'order', value: 120, ts: agora - 100 * DIA }, // fora da janela de 90d
  { type: 'order', value: 800, ts: agora - 40 * DIA },
  { type: 'order', value: 600, ts: agora - 10 * DIA },
  { type: 'message', channel: 'whatsapp', ts: agora - 9 * DIA },
  { type: 'message', channel: 'whatsapp', ts: agora - 5 * DIA },
  { type: 'message', channel: 'email', ts: agora - 3 * DIA },
];

// --- 1. Online serving ---
materialize('c_8123', eventos);
const feats = getOnlineFeatures('c_8123');
console.log('Features online (asOf = agora):', feats);

if (feats && feats.ticket_medio_90d > 500 && feats.num_compras_90d >= 2) {
  console.log('-> Cliente de alto valor e recorrente: prioriza fila e atendimento VIP.');
}

console.log('Cold start (cliente inexistente):', getOnlineFeatures('c_0000'));

// --- 2. Point-in-time: features do MESMO cliente ha 30 dias ---
const labels = [
  { customer_id: 'c_8123', ts: agora - 30 * DIA, label: 1 },
  { customer_id: 'c_8123', ts: agora, label: 0 },
];
const dataset = buildTrainingDataset(labels, { c_8123: eventos });
console.log('\nDataset de treino (point-in-time):');
for (const row of dataset) {
  console.log(
    `  ts=${new Date(row.computed_at).toISOString().slice(0, 10)}`,
    `ticket_medio_90d=${row.ticket_medio_90d}`,
    `num_compras_90d=${row.num_compras_90d}`,
    `label=${row.label}`,
  );
}

// A linha de 30 dias atras nao "ve" a compra de 10 dias atras: prova de
// que a mesma computeFeatures respeita o instante e nao vaza o futuro.
console.log('\nMesma transformacao, asOf diferente => sem training-serving skew.');
