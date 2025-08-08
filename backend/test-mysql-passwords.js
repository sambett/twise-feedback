// MySQL Password Tester - Try different common passwords
import mysql from 'mysql2/promise';

const testPasswords = [
  { password: '', description: 'No password (XAMPP default)' },
  { password: 'simsim', description: 'User specified password' },
  { password: 'root', description: 'Common password' },
  { password: 'password', description: 'Common password' },
  { password: '123456', description: 'Common password' },
  { password: 'mysql', description: 'Common password' },
  { password: 'admin', description: 'Common password' }
];

const testConnection = async () => {
  console.log('🔍 Testing MySQL connection with different passwords...');
  console.log('');

  for (const test of testPasswords) {
    try {
      console.log(`⏳ Testing: ${test.description}...`);
      
      const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: test.password,
        connectTimeout: 5000,
      });

      // Test basic query
      const [rows] = await connection.execute('SELECT 1 as test');
      await connection.end();

      console.log(`✅ SUCCESS! Password works: "${test.password || '(empty)'}"`)
      console.log('');
      console.log('🔧 Update your backend/.env.local file:');
      console.log(`   DB_PASSWORD=${test.password}`);
      console.log('');
      console.log('🚀 Then run: npm run setup-db');
      return test.password;

    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }

  console.log('');
  console.log('❌ None of the common passwords worked.');
  console.log('');
  console.log('🔧 Manual password reset options:');
  console.log('');
  console.log('📊 Option 1: XAMPP Control Panel');
  console.log('   1. Open XAMPP Control Panel');
  console.log('   2. Click "Admin" next to MySQL');
  console.log('   3. Go to phpMyAdmin');
  console.log('   4. Go to "User Accounts" tab');
  console.log('   5. Edit root@localhost user');
  console.log('   6. Set a password');
  console.log('');
  console.log('💻 Option 2: Command Line');
  console.log('   1. Open Command Prompt as Administrator');
  console.log('   2. Run: mysql -u root');
  console.log('   3. If that works, run: ALTER USER "root"@"localhost" IDENTIFIED BY "simsim";');
  console.log('   4. Run: FLUSH PRIVILEGES;');
  console.log('');
  console.log('🔐 Option 3: Reset via XAMPP');
  console.log('   1. Stop MySQL in XAMPP');
  console.log('   2. Start MySQL again');
  console.log('   3. Try with no password first');

  return null;
};

// Run the test
testConnection().then(workingPassword => {
  if (workingPassword !== null) {
    console.log(`✅ Found working password: "${workingPassword || '(empty)'}"`);
  }
  process.exit(workingPassword !== null ? 0 : 1);
});
