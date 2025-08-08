// Database Setup Script for TWISE Universal Feedback Platform
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

const setupDatabase = async () => {
  console.log('🚀 Setting up MySQL database for TWISE Feedback Platform...');
  console.log('');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',
    multipleStatements: true,
    connectTimeout: 30000,
    acquireTimeout: 30000,
    timeout: 30000,
  };

  let connection = null;

  try {
    console.log('📊 Using configuration:');
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Password: ${config.password ? '[SET]' : '[NOT SET]'}`);
    console.log('');

    // Test connection to MySQL server
    console.log('⏳ Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      connectTimeout: config.connectTimeout,
    });

    console.log('✅ Connected to MySQL server successfully!');

    // Get MySQL version
    const [versionRows] = await connection.execute('SELECT VERSION() as version');
    console.log(`📊 MySQL Version: ${versionRows[0].version}`);
    console.log('');

    // Read and execute SQL file
    console.log('📋 Reading SQL setup file...');
    const sqlPath = join(__dirname, 'init.sql');
    const sqlContent = readFileSync(sqlPath, 'utf8');
    
    console.log('⚙️ Executing database setup...');
    
    // Split SQL content by statements (rough split for demo)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
        } catch (error) {
          // Ignore some non-critical errors
          if (!error.message.includes('already exists') && 
              !error.message.includes('Duplicate entry')) {
            console.warn(`⚠️ Warning executing statement: ${error.message}`);
          }
        }
      }
    }

    // Verify database setup
    console.log('');
    console.log('🔍 Verifying database setup...');
    
    await connection.execute(`USE \`${process.env.DB_NAME || 'twise_feedback'}\``);
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Tables created: ${tables.length}`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });

    const [eventCount] = await connection.execute('SELECT COUNT(*) as count FROM events');
    console.log(`✅ Default events: ${eventCount[0].count}`);

    console.log('');
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Run: npm run dev (to start backend)');
    console.log('   2. Test: http://localhost:3001/health');
    console.log('   3. Check: http://localhost:3001/api');

    return true;

  } catch (error) {
    console.error('');
    console.error('❌ Database setup failed!');
    console.error(`📝 Error: ${error.message}`);
    console.error(`📝 Code: ${error.code}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('🔧 MySQL server is not running. Start it with:');
      console.log('   Windows: net start MySQL91 (as Administrator)');
      console.log('   Or use MySQL Workbench/XAMPP/WAMP to start MySQL');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('');
      console.log('🔧 Access denied. Fix MySQL password:');
      console.log('   1. Reset root password in MySQL Workbench');
      console.log('   2. Or run: mysql -u root -p');
      console.log('   3. Update .env.local with correct password');
    }
    
    return false;

  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run setup
setupDatabase().then(success => {
  process.exit(success ? 0 : 1);
});
