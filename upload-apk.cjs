const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configure Supabase credentials
const supabaseUrl = 'https://ngashsoxymyzqqqisvij.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nYXNoc294eW15enFxcWlzdmlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg1OTc3NiwiZXhwIjoyMDkwNDM1Nzc2fQ.ZIJ03JOqPotFoWcVNsn30AZqBLNC1GaDdeHb4CoifDY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadApk() {
  try {
    const apkPath = path.resolve(__dirname, '../mobile-app/Birvana.apk');
    if (!fs.existsSync(apkPath)) {
      console.error(`Error: Cannot find Birvana.apk at ${apkPath}`);
      process.exit(1);
    }

    console.log('Reading Birvana.apk file...');
    const fileBuffer = fs.readFileSync(apkPath);
    console.log(`File read successfully. Size: ${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB`);

    // 1. Ensure the 'downloads' bucket exists and is public
    console.log('Checking/creating public bucket "downloads"...');
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('downloads', {
      public: true,
      allowedMimeTypes: ['application/vnd.android.package-archive'],
      fileSizeLimit: 150000000 // 150MB limit
    });

    if (bucketError && !bucketError.message.includes('already exists')) {
      throw bucketError;
    }
    console.log('Bucket "downloads" is ready.');

    // 2. Upload APK to Supabase Storage
    console.log('Uploading Birvana.apk to Supabase Storage (this may take a moment)...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('downloads')
      .upload('Birvana.apk', fileBuffer, {
        contentType: 'application/vnd.android.package-archive',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }
    console.log('Upload complete!');

    // 3. Get Public URL
    const { data: urlData } = supabase.storage
      .from('downloads')
      .getPublicUrl('Birvana.apk');

    const publicUrl = urlData.publicUrl;
    console.log(`Public APK URL: ${publicUrl}`);

    // 4. Update releases.json
    const releasesPath = path.resolve(__dirname, './public/releases.json');
    if (!fs.existsSync(releasesPath)) {
      console.error(`Error: Cannot find releases.json at ${releasesPath}`);
      process.exit(1);
    }

    const releases = JSON.parse(fs.readFileSync(releasesPath, 'utf8'));
    releases.latest.url = publicUrl;
    
    // Save updated JSON
    fs.writeFileSync(releasesPath, JSON.stringify(releases, null, 2) + '\n');
    console.log('Updated public/releases.json with new Supabase URL!');

  } catch (err) {
    console.error('Error during upload operation:', err.message || err);
    process.exit(1);
  }
}

uploadApk();
