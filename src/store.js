// Online store minimo em memoria, com a MESMA interface de um Redis
// (set/get por chave + TTL). Em producao, troque por um cliente Redis real;
// o codigo do bot que consome getOnlineFeatures nao muda.

import { computeFeatures } from './features.js';

const mem = new Map();
const key = (customerId) => `features:${customerId}`;

// MATERIALIZACAO (batch / near-real-time): recalcula e grava o ultimo valor.
export function materialize(customerId, events, ttlMs = 24 * 60 * 60 * 1000) {
  const features = computeFeatures(events); // asOf = agora
  mem.set(key(customerId), { features, expiresAt: Date.now() + ttlMs });
  return features;
}

// SERVING (inferencia na conversa): uma leitura por chave, latencia minima.
// Retorna null no cold start (cliente sem historico materializado).
export function getOnlineFeatures(customerId) {
  const entry = mem.get(key(customerId));
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    mem.delete(key(customerId));
    return null;
  }
  return entry.features;
}
