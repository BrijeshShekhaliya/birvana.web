const { S3Client, DeleteObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://ab559a3d21a039914d09891deac77845.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: '0881b89a72c9acdb7dbaab683f08caff',
    secretAccessKey: 'e442909f6ed9c63cf2f551e374b945522ce11ff8c46e8c87e5abdfa0cf7a2db8',
  },
});

async function uploadToR2() {
  const sourceApkPath = path.resolve(__dirname, '../final playstore/playstore aab & keystore/Birvana.apk');
  const bucketName = 'music-app';
  const objectKey = 'Birvana aaplication/Birvana.apk';

  try {
    console.log('1. Deleting old APK from Cloudflare R2...');
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: objectKey }));
    console.log('Old APK deleted successfully.');

    console.log('2. Reading new Birvana.apk...');
    const fileStream = fs.createReadStream(sourceApkPath);
    const uploadParams = {
      Bucket: bucketName,
      Key: objectKey,
      Body: fileStream,
      ContentLength: fs.statSync(sourceApkPath).size,
      ContentType: 'application/vnd.android.package-archive',
      ContentDisposition: 'attachment; filename="Birvana.apk"'
    };

    console.log('3. Uploading new Birvana.apk to Cloudflare R2...');
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log('Upload successful! ETag:', data.ETag);
  } catch (err) {
    console.error('Error during R2 operations:', err);
  }
}

uploadToR2();
