// Database Connection Test for TWISE Platform
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const testDatabase = async () => {
  console.log('🧪 Testing MySQL database connection...');
  console.log('');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME || 'twise_feedback',
    connectTimeout: 10000,
  };

  console.log('📊 Configuration:');
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  console.log('');

  let connection = null;

  try {
    // Test connection
    console.log('⏳ Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected successfully!');

    // Test basic query
    console.log('⏳ Testing basic query...');
    const [result] = await connection.execute('SELECT 1 + 1 as test');
    console.log(`✅ Basic query works: ${result[0].test}`);

    // Check database structure
    console.log('⏳ Checking database structure...');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('⚠️ No tables found. Run: npm run setup-db');
      return false;
    }

    console.log(`✅ Tables found: ${tables.length}`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });

    // Check events table
    console.log('⏳ Checking events table...');
    const [eventCount] = await connection.execute('SELECT COUNT(*) as count FROM events');
    console.log(`✅ Events in database: ${eventCount[0].count}`);

    if (eventCount[0].count > 0) {
      const [events] = await connection.execute('SELECT id, title FROM events LIMIT 5');
      console.log('📋 Sample events:');
      events.forEach((event) => {
        console.log(`   - ${event.id}: ${event.title}`);
      });
    }

    // Check feedback table
    console.log('⏳ Checking feedback table...');
    const [feedbackCount] = await connection.execute('SELECT COUNT(*) as count FROM feedback');
    console.log(`✅ Feedback entries: ${feedbackCount[0].count}`);

    // Test complex query
    console.log('⏳ Testing complex query (analytics)...');
    const [analyticsResult] = await connection.execute(`
      SELECT 
        e.id, 
        e.title, 
        COUNT(f.id) as feedback_count,
        AVG(f.star_rating) as avg_rating
      FROM events e 
      LEFT JOIN feedback f ON e.id = f.event_id 
      GROUP BY e.id, e.title
      LIMIT 3
    `);
    
    console.log('✅ Analytics query successful:');
    analyticsResult.forEach((row) => {
      console.log(`   - ${row.title}: ${row.feedback_count} feedback, ${row.avg_rating ? parseFloat(row.avg_rating).toFixed(1) : '0.0'} avg rating`);
    });

    console.log('');
    console.log('🎉 Database test completed successfully!');
    console.log('💡 Your database is ready for the TWISE platform.');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Start backend: npm run dev (in backend folder)');
    console.log('   2. Start frontend: npm run dev (in main folder)');
    console.log('   3. Add demo data: node generate-demo-data.js');
    console.log('   4. Visit: http://localhost:3000/admin');

    return true;

  } catch (error) {
    console.error('');
    console.error('❌ Database test failed!');
    console.error(`📝 Error: ${error.message}`);
    console.error(`📝 Code: ${error.code}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('🔧 MySQL server is not running. Start it with:');
      console.log('   Windows: net start MySQL91 (as Administrator)');
      console.log('   Or use XAMPP/WAMP to start MySQL');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('');
      console.log('🔧 Access denied. Fix MySQL password:');
      console.log('   1. Reset root password in MySQL Workbench');
      console.log('   2. Or run: mysql -u root -p');
      console.log('   3. Update .env.local with correct password');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('');
      console.log('🔧 Database does not exist. Create it:');
      console.log('   1. Run: npm run setup-db');
      console.log('   2. Or manually: CREATE DATABASE twise_feedback;');
    }
    
    return false;

  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run test
testDatabase().then(success => {
  process.exit(success ? 0 : 1);
});
