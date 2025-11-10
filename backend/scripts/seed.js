/**
 * Database Seeding Script
 * 
 * Populates MongoDB with sample data for development and testing.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { generateRecipientPreferences, sampleObligations, sampleParties } from '../mock/sample_data.js';
import { createSettlement, newSettlementId } from '../src/database/queries.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/netshift';

async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Generate recipient preferences from sample parties
    const recipientPreferences = generateRecipientPreferences(sampleParties);

    console.log('📊 Sample Data:');
    console.log(`   - Parties: ${sampleParties.length}`);
    console.log(`   - Obligations: ${sampleObligations.length}`);
    console.log(`   - Recipient Preferences: ${recipientPreferences.length}\n`);

    // Create a draft settlement
    const settlementId = newSettlementId();
    console.log('💾 Creating settlement:', settlementId);

    const settlement = await createSettlement({
      settlementId,
      status: 'draft',
      simulationMode: true,
      obligations: sampleObligations,
      recipientPreferences
    });

    console.log('✅ Settlement created successfully!\n');
    console.log('📋 Settlement Details:');
    console.log(`   - ID: ${settlement.settlementId}`);
    console.log(`   - Status: ${settlement.status}`);
    console.log(`   - Simulation Mode: ${settlement.simulationMode}`);
    console.log(`   - Obligations: ${settlement.obligations.length}`);
    console.log(`   - Preferences: ${settlement.recipientPreferences.length}\n`);

    // Log sample obligation details
    console.log('📝 Sample Obligations:');
    sampleObligations.slice(0, 5).forEach((obl, idx) => {
      console.log(`   ${idx + 1}. ${obl.from} → ${obl.to}: ${obl.amount} ${obl.token.toUpperCase()} (${obl.reference})`);
    });
    if (sampleObligations.length > 5) {
      console.log(`   ... and ${sampleObligations.length - 5} more\n`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`\nNext steps:`);
    console.log(`   1. Start server: npm run dev`);
    console.log(`   2. Compute netting: POST /api/settlements/${settlementId}/compute`);
    console.log(`   3. Or run: npm run dev-test\n`);

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

// Run seed function
seed();
