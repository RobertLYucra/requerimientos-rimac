const bcrypt = require('bcrypt');

async function generateHash() {
    const password = 'Isma.2025';
    const hash = await bcrypt.hash(password, 10);
    console.log('\n=================================');
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('=================================\n');
}

generateHash();
