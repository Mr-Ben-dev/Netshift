import crypto from 'crypto';
import mongoose from 'mongoose';

const { Schema } = mongoose;

// Subdocument: Obligation
const ObligationSchema = new Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  token: { type: String, required: true },
  chain: { type: String, required: true },
  reference: { type: String, default: '' }
}, { _id: false });

// Subdocument: Recipient Preference
const RecipientPreferenceSchema = new Schema({
  party: { type: String, required: true },
  receiveToken: { type: String, required: true },
  receiveChain: { type: String, required: true },
  receiveAddress: { type: String, required: true },
  memo: { type: String, default: '' },
  refundAddress: { type: String, default: '' }
}, { _id: false });

// Subdocument: Net Payment
const NetPaymentSchema = new Schema({
  payer: { type: String, required: true },
  payAmount: { type: Number, required: true },
  payToken: { type: String, required: true },
  payChain: { type: String, default: 'base' },
  recipient: { type: String, required: true },
  receiveAmount: { type: Number, required: true },
  receiveToken: { type: String, required: true },
  receiveChain: { type: String, required: true },
  receiveAddress: { type: String, default: '' },
  route: { type: String, default: '' },
  estimatedFee: { type: Number, default: 0 }
}, { _id: false });

// Subdocument: Netting Result
const NettingResultSchema = new Schema({
  originalCount: { type: Number, required: true },
  optimizedCount: { type: Number, required: true },
  savings: {
    paymentReduction: { type: Number, default: 0 },
    estimatedFees: { type: Number, default: 0 },
    timeSaved: { type: String, default: '' }
  },
  netPayments: [NetPaymentSchema],
  rates: { type: Map, of: Schema.Types.Mixed, default: null }, // SideShift rates keyed by pair
  ratesTimestamp: { type: String, default: null }
}, { _id: false });

// Subdocument: SideShift Order
const SideshiftOrderSchema = new Schema({
  recipient: { type: String, required: true },
  orderId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['waiting', 'confirming', 'exchanging', 'completed', 'failed'],
    default: 'waiting'
  },
  depositAddress: { type: String, default: '' },
  depositMemo: { type: String, default: '' },
  depositAmount: { type: Number, required: true },
  depositToken: { type: String, required: true },
  depositNetwork: { type: String, default: '' },
  settleAmount: { type: Number, required: true },
  settleToken: { type: String, required: true },
  settleNetwork: { type: String, default: '' },
  settleAddress: { type: String, required: true },
  txHash: { type: String, default: '' },
  quoteId: { type: String, default: '' },
  quoteExpiresAt: { type: Date },
  failureReason: { type: String, default: '' },
  retryCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  error: { type: String, default: '' }
}, { _id: false });

// Subdocument: Deposit Instructions
const DepositInstructionsSchema = new Schema({
  address: { type: String, required: true },
  amount: { type: Number, required: true },
  token: { type: String, required: true },
  qrCode: { type: String, default: '' }
}, { _id: false });

// Main: Settlement Schema
const SettlementSchema = new Schema({
  settlementId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  status: { 
    type: String, 
    enum: ['draft', 'computing', 'ready', 'executing', 'completed', 'failed'],
    default: 'draft'
  },
  // User-provided metadata for organization
  name: { type: String, default: '' },
  tags: [{ type: String }],
  groupId: { type: String, default: '' }, // For grouping related settlements
  obligations: [ObligationSchema],
  recipientPreferences: [RecipientPreferenceSchema],
  nettingResult: { 
    type: NettingResultSchema,
    default: null
  },
  sideshiftOrders: [SideshiftOrderSchema],
  depositInstructions: {
    type: DepositInstructionsSchema,
    default: null
  },
  logs: [{ 
    message: String, 
    timestamp: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true 
});

// Static method: Generate unique settlement ID
SettlementSchema.statics.generateSettlementId = function() {
  return 'st_' + crypto.randomBytes(6).toString('hex');
};

// Instance method: Add log entry
SettlementSchema.methods.addLog = function(message) {
  this.logs.push({ 
    message, 
    timestamp: new Date() 
  });
};

// Create and export model
const Settlement = mongoose.model('Settlement', SettlementSchema);

export { Settlement };

