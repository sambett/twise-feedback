// Test MySQL Connection
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const testConnection = async () => {
  console.log('🔍 Testing MySQL connection...');
  console.log('📊 Configuration:');
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Port: ${process.env.DB_PORT || 3306}`);
  console.log(`   User: ${process.env.DB_USER || 'root'}`);
  console.log(`   Database: ${process.env.DB_NAME || 'twise_feedback'}`);
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'simsim',
    connectTimeout: 10000,
    acquireTimeout: 10000,
    timeout: 10000,
  };

  try {
    console.log('\n⏳ Attempting to connect...');
    
    // First test: Connect to MySQL server (without database)
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      connectTimeout: config.connectTimeout,
    });
    
    console.log('✅ Successfully connected to MySQL server!');
    
    // Test: Check MySQL version
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log(`📊 MySQL Version: ${rows[0].version}`);
    
    // Test: Check if database exists
    const dbName = process.env.DB_NAME || 'twise_feedback';
    const [databases] = await connection.execute('SHOW DATABASES LIKE ?', [dbName]);
    
    if (databases.length > 0) {
      console.log(`✅ Database '${dbName}' exists`);
      
      // Switch to the database
      await connection.execute(`USE \`${dbName}\``);
      console.log(`✅ Successfully connected to database '${dbName}'`);
      
      // Check tables
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`📋 Tables found: ${tables.length}`);
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
      
    } else {
      console.log(`⚠️ Database '${dbName}' does not exist`);
      console.log(`🔧 Creating database '${dbName}'...`);
      
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      console.log(`✅ Database '${dbName}' created successfully`);
    }
    
    await connection.end();
    console.log('\n🎉 MySQL connection test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('\n❌ MySQL connection failed!');
    console.error('📝 Error details:');
    console.error(`   Code: ${error.code}`);
    console.error(`   Message: ${error.message}`);
    console.error(`   SQL State: ${error.sqlState || 'N/A'}`);
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Ensure MySQL is installed and running');
    console.log('   2. Check MySQL service status:');
    console.log('      - Windows: net start mysql OR sc query mysql');
    console.log('      - macOS/Linux: sudo systemctl status mysql');
    console.log('   3. Verify credentials:');
    console.log(`      - User: ${config.user}`);
    console.log(`      - Password: ${config.password ? '[SET]' : '[NOT SET]'}`);
    console.log('   4. Test connection manually:');
    console.log(`      mysql -h ${config.host} -P ${config.port} -u ${config.user} -p`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused - MySQL server is not running');
      console.log('   Start MySQL server:');
      console.log('   - Windows: net start mysql');
      console.log('   - macOS: brew services start mysql');
      console.log('   - Linux: sudo systemctl start mysql');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Access denied - Check username/password');
      console.log('   Reset MySQL root password if needed');
    }
    
    return false;
  }
};

// Run the test
testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
