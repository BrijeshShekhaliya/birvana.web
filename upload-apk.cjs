const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configure Supabase credentials
const supabaseUrl = 'https://ngashsoxymyzqqqisvij.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nYXNoc294eW15enFxcWlzdmlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg1OTc3NiwiZXhwIjoyMDkwNDM1Nzc2fQ.ZIJ03JOqPotFoWcVNsn30AZqBLNC1GaDdeHb4CoifDY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadApk() {
  try {
    const sourceApkPath = path.resolve(__dirname, '../final playstore/playstore aab & keystore/Birvana.apk');
    if (!fs.existsSync(sourceApkPath)) {
      console.error(`Error: Cannot find Birvana.apk at ${sourceApkPath}`);
      process.exit(1);
    }

    console.log('Reading Birvana.apk file...');
    const fileBuffer = fs.readFileSync(sourceApkPath);
    const fileSizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(1);
    console.log(`File read successfully. Size: ${fileSizeMB} MB`);

    // Compute SHA-256 hash of the file
    console.log('Computing SHA-256 fingerprint...');
    const sha256Hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    console.log(`SHA-256: ${sha256Hash}`);

    // Create releases folder in public directory if it doesn't exist
    const destDir = path.resolve(__dirname, './public/releases');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Copy APK to web public folder
    const destApkPath = path.join(destDir, 'Birvana.apk');
    console.log(`Copying APK to public web directory at ${destApkPath}...`);
    fs.copyFileSync(sourceApkPath, destApkPath);
    // Cloudflare R2 public URL
    // We uploaded this with Content-Disposition: attachment, so it will download seamlessly!
    const publicUrl = 'https://pub-c356460231d64956950b327b6efadbbf.r2.dev/Birvana%20aaplication/Birvana.apk';
    console.log(`Target Public APK URL: ${publicUrl}`);

    // 4. Update Supabase 'app_releases' table
    console.log('Registering version 1.1.4 in app_releases database table...');
    const dateFormatted = new Date().toISOString().split('T')[0];
    const { error: dbError } = await supabase
      .from('app_releases')
      .upsert({
        version: '1.1.4',
        build_number: 22,
        date: dateFormatted,
        channel: 'preview',
        size: `${fileSizeMB} MB`,
        url: publicUrl,
        sha256: sha256Hash,
        notes: [
          'Added custom email change flow with 6-digit identity OTP.',
          'Configured secure Gmail SMTP mailing to prevent delivery issues.',
          'Under-the-hood optimization for audio streaming stability.',
          'Bumps version code to 22.'
        ]
      }, {
        onConflict: 'version,build_number'
      });

    if (dbError) {
      console.warn('Warning: Failed to insert into app_releases table:', dbError.message);
    } else {
      console.log('Successfully updated app_releases database table!');
    }

    // 5. Try updating 'releases' table as well (for profile screen downloads)
    try {
      console.log('Registering in legacy releases table...');
      const { error: legacyDbError } = await supabase
        .from('releases')
        .insert({
          url: publicUrl,
          version: '1.1.4'
        });
      if (legacyDbError) {
        console.warn('Warning: Legacy releases table insert skipped/failed:', legacyDbError.message);
      } else {
        console.log('Successfully updated legacy releases table!');
      }
    } catch (e) {
      console.warn('Legacy releases table skipped:', e.message || e);
    }

    // 6. Update local releases.json for static fallback
    const releasesPath = path.resolve(__dirname, './public/releases.json');
    if (!fs.existsSync(releasesPath)) {
      console.error(`Error: Cannot find releases.json at ${releasesPath}`);
      process.exit(1);
    }

    const releases = JSON.parse(fs.readFileSync(releasesPath, 'utf8'));
    releases.latest.url = publicUrl;
    releases.latest.version = '1.1.4';
    releases.latest.buildNumber = 22;
    releases.latest.date = dateFormatted;
    releases.latest.size = `${fileSizeMB} MB`;
    releases.latest.sha256 = sha256Hash;
    releases.latest.notes = [
      'Added custom email change flow with 6-digit identity OTP.',
      'Configured secure Gmail SMTP mailing to prevent delivery issues.',
      'Under-the-hood optimization for audio streaming stability.',
      'Bumps version code to 22.'
    ];
    
    // Save updated JSON
    fs.writeFileSync(releasesPath, JSON.stringify(releases, null, 2) + '\n');
    console.log('Updated public/releases.json with new static metadata!');

  } catch (err) {
    console.error('Error during upload operation:', err.message || err);
    process.exit(1);
  }
}

uploadApk();
