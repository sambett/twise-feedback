// Direct MySQL test with empty password
import mysql from 'mysql2/promise';

const testDirectConnection = async () => {
  console.log('🧪 Testing direct MySQL connection with empty password...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',  // Empty password
      database: 'twise_feedback',
      connectTimeout: 10000,
    });

    console.log('✅ Connected successfully with empty password!');
    
    // Test basic query
    const [result] = await connection.execute('SELECT 1 + 1 as test');
    console.log(`✅ Basic query works: ${result[0].test}`);
    
    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Tables found: ${tables.length}`);
    
    await connection.end();
    console.log('✅ Direct connection test successful!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Direct connection failed:', error.message);
    console.error('Code:', error.code);
    return false;
  }
};

// Run test
testDirectConnection().then(success => {
  process.exit(success ? 0 : 1);
});
