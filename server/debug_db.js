const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

function log(msg) {
  fs.appendFileSync('debug_log.txt', msg + '\n');
  console.log(msg);
}

fs.writeFileSync('debug_log.txt', '--- Starting test ---\n');

async function main() {
  log('Initializing Prisma Client...');
  try {
    const prisma = new PrismaClient();
    log('Prisma Client initialized.');
    
    log('Attempting to fetch products...');
    const products = await prisma.product.findMany();
    log(`Success! Found ${products.length} products.`);
    
  } catch (e) {
    log('FAILED: ' + e.message);
    log(e.stack);
  }
}

main().then(() => log('--- Test Script Ended ---'));
