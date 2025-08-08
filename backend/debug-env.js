// Check environment variables
import dotenv from 'dotenv';

console.log('🔍 Environment Variable Debug Test');
console.log('');

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('📋 Environment Variables:');
console.log(`   DB_HOST: "${process.env.DB_HOST}"`);
console.log(`   DB_PORT: "${process.env.DB_PORT}"`);
console.log(`   DB_USER: "${process.env.DB_USER}"`);
console.log(`   DB_PASSWORD: "${process.env.DB_PASSWORD}"`);
console.log(`   DB_NAME: "${process.env.DB_NAME}"`);
console.log('');

console.log('📊 Password checks:');
console.log(`   Password length: ${(process.env.DB_PASSWORD || '').length}`);
console.log(`   Password is empty: ${process.env.DB_PASSWORD === ''}`);
console.log(`   Password is undefined: ${process.env.DB_PASSWORD === undefined}`);
console.log('');

// Check what the actual config object looks like
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'simsim',
  database: process.env.DB_NAME || 'twise_feedback',
};

console.log('🔧 Final Config Object:');
console.log(JSON.stringify(config, null, 2));
