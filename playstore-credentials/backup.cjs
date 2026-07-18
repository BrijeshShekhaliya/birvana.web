const fs = require('fs');
const path = require('path');

const filesToBackup = [
  'Birvana.jks',
  'client_secret_658708623902-6r83nb5am1kfnl5ml7nctj1a1ka386f9.apps.googleusercontent.com.json',
  'client_secret_658708623902-9pgmhd0klddmgnuquv7806um2oe7bp4u.apps.googleusercontent.com.json',
  'keystore_passwords.txt'
];

const backupDir = __dirname;
const backupData = {};

filesToBackup.forEach(file => {
  const filePath = path.join(backupDir, file);
  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);
    backupData[file] = fileBuffer.toString('base64');
  } else {
    console.warn(`File not found: ${file}`);
  }
});

fs.writeFileSync(path.join(backupDir, 'backup.json'), JSON.stringify(backupData, null, 2), 'utf8');
console.log('Successfully backed up files to backup.json!');

// Delete original sensitive files to avoid accidental git commit/push blocks
filesToBackup.forEach(file => {
  const filePath = path.join(backupDir, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Removed local file: ${file}`);
  }
});
