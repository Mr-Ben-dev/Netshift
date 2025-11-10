import { Settlement } from './models.js';

/**
 * Generate a new unique settlement ID
 * @returns {string} Settlement ID in format 'st_XXXXXXXXXXXX'
 */
export function newSettlementId() {
  return Settlement.generateSettlementId();
}

/**
 * Create a new settlement document
 * @param {Object} doc - Settlement data
 * @returns {Promise<Object>} Created settlement document
 */
export async function createSettlement(doc) {
  const settlement = new Settlement(doc);
  await settlement.save();
  return settlement;
}

/**
 * Get settlement by ID
 * @param {string} id - Settlement ID
 * @returns {Promise<Object|null>} Settlement document or null
 */
export async function getSettlementById(id) {
  return await Settlement.findOne({ settlementId: id });
}

/**
 * Update settlement document
 * @param {string} id - Settlement ID
 * @param {Object} patch - Fields to update
 * @returns {Promise<Object|null>} Updated settlement document or null
 */
export async function updateSettlement(id, patch) {
  return await Settlement.findOneAndUpdate(
    { settlementId: id },
    { $set: patch },
    { new: true, runValidators: true }
  );
}
