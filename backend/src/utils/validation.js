/**
 * Joi Validation Schemas
 * 
 * Request validation schemas for NetShift API endpoints.
 */

import Joi from 'joi';

/**
 * Schema for a single obligation
 */
export const obligationSchema = Joi.object({
  from: Joi.string().min(1).required(),
  to: Joi.string().min(1).invalid(Joi.ref('from')).required(),
  amount: Joi.number().positive().precision(8).required(),
  token: Joi.string().lowercase().required(),
  chain: Joi.string().lowercase().required(),
  reference: Joi.string().allow('', null)
});

/**
 * Schema for recipient preferences
 */
export const recipientPreferenceSchema = Joi.object({
  party: Joi.string().min(1).required(),
  receiveToken: Joi.string().lowercase().required(),
  receiveChain: Joi.string().lowercase().required(),
  receiveAddress: Joi.string().min(6).required(),
  memo: Joi.string().allow('', null),
  refundAddress: Joi.string().allow('', null) // optional
});

/**
 * Schema for settlement creation request
 * Note: min(1) allows single-obligation settlements (simple 1:1 swaps)
 * The netting algorithm will handle any number of obligations
 */
export const settlementCreateSchema = Joi.object({
  obligations: Joi.array().min(1).items(obligationSchema).required(),
  recipientPreferences: Joi.array().items(recipientPreferenceSchema).default([]),
  // Optional metadata for organization
  name: Joi.string().max(100).allow('', null),
  tags: Joi.array().items(Joi.string().max(50)).max(10).default([]),
  groupId: Joi.string().max(50).allow('', null)
});

/**
 * Extract user IP address from request
 * Supports FORCE_USER_IP override for development
 * @param {Object} req - Express request object
 * @returns {string} User IP address
 */
export function extractUserIp(req) {
  // FORCE_USER_IP overrides for dev. Else take explicit x-user-ip header if supplied, else trust proxy.
  if (process.env.FORCE_USER_IP && process.env.FORCE_USER_IP.trim()) {
    return process.env.FORCE_USER_IP.trim();
  }
  
  if (req.headers['x-user-ip']) {
    return String(req.headers['x-user-ip']).split(',')[0].trim();
  }
  
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) {
    return String(fwd).split(',')[0].trim();
  }
  
  // Express req.ip can be "::1" locally; SideShift requires a real public IP.
  return (req.ip || '').replace('::ffff:', '');
}
