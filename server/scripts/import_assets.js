const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Pool } = require('pg');
const sharp = require('sharp');

// Load environment variables from server/.env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const poolConfig = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'falguni_db',
      password: process.env.DB_PASSWORD || 'password',
      port: parseInt(process.env.DB_PORT) || 5432,
    };

// Enable SSL for cloud PostgreSQL (like Neon)
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
if (isProduction || (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1')) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(poolConfig);

const s3Client = new S3Client({
  region: process.env.R2_REGION || 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const IMPORT_DIR = path.join(__dirname, '../../import_assets');

function getMimeType(ext) {
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

async function uploadToR2(filePath, customName = null) {
  const fileContent = fs.readFileSync(filePath);
  let ext = path.extname(filePath).substring(1).toLowerCase();
  let mimeType = getMimeType(ext);
  let finalBuffer = fileContent;

  // Auto-convert images to WebP (skip if already webp or not an image)
  if (mimeType.startsWith('image/') && ext !== 'webp') {
    try {
      finalBuffer = await sharp(fileContent)
        .webp({ quality: 80 })
        .toBuffer();
      ext = 'webp';
      mimeType = 'image/webp';
    } catch (sharpErr) {
      console.error(`  Sharp WebP conversion failed for ${path.basename(filePath)}, uploading original.`);
    }
  }

  // Generate unique name
  const fileName = customName 
    ? `assets/media/${customName}.${ext}`
    : `assets/media/upload_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

  const uploadParams = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: finalBuffer,
    ContentType: mimeType,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  return fileName;
}

async function updateSetting(key, value) {
  await pool.query(
    `INSERT INTO site_settings (setting_key, setting_value, updated_at) 
     VALUES ($1, $2, CURRENT_TIMESTAMP)
     ON CONFLICT (setting_key) 
     DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP`,
    [key, value]
  );
}

async function processPortfolios(subDir, theme) {
  const portfolioPath = path.join(IMPORT_DIR, subDir);
  if (!fs.existsSync(portfolioPath)) {
    console.log(`Directory ${subDir} not found, skipping...`);
    return;
  }

  console.log(`\nProcessing ${subDir} (theme: ${theme})...`);
  const folders = fs.readdirSync(portfolioPath);
  
  for (const folderName of folders) {
    const eventFolderPath = path.join(portfolioPath, folderName);
    if (!fs.statSync(eventFolderPath).isDirectory()) continue;

    const files = fs.readdirSync(eventFolderPath);
    if (files.length === 0) continue;

    console.log(`\n  Importing Event: "${folderName}"...`);
    
    try {
      // 1. Create or Find Event in DB
      let eventId;
      const existRes = await pool.query(
        'SELECT id FROM events WHERE title = $1 AND theme = $2',
        [folderName, theme]
      );
      
      if (existRes.rows.length > 0) {
        eventId = existRes.rows[0].id;
        console.log(`    Event already exists in DB (ID: ${eventId}).`);
      } else {
        const insertRes = await pool.query(
          'INSERT INTO events (title, theme, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id',
          [folderName, theme]
        );
        eventId = insertRes.rows[0].id;
        console.log(`    Created new Event in DB (ID: ${eventId}).`);
      }

      // 2. Identify cover/thumbnail image
      const thumbnailFile = files.find(file => {
        const base = path.basename(file, path.extname(file)).toLowerCase();
        return base === 'thumbnail';
      });

      // Filter out files that are hidden or directories
      const validFiles = files.filter(file => {
        const filePath = path.join(eventFolderPath, file);
        return !file.startsWith('.') && !fs.statSync(filePath).isDirectory();
      });

      // 3. Process and upload files
      for (const file of validFiles) {
        const filePath = path.join(eventFolderPath, file);
        const isThumbnail = file === thumbnailFile;
        console.log(`    Uploading ${file}${isThumbnail ? ' (as Cover)' : ''}...`);

        try {
          const uploadedPath = await uploadToR2(filePath);
          const setAsCover = isThumbnail || (!thumbnailFile && file === validFiles[0]);
          
          if (setAsCover) {
            // Reset other covers
            await pool.query('UPDATE event_images SET is_cover = FALSE WHERE event_id = $1', [eventId]);
          }

          await pool.query(
            'INSERT INTO event_images (event_id, url, is_cover, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
            [eventId, uploadedPath, setAsCover]
          );
          console.log(`      Saved to database -> ${uploadedPath}`);
        } catch (uploadErr) {
          console.error(`      Error processing file ${file}:`, uploadErr.message);
        }
      }
    } catch (eventErr) {
      console.error(`    Failed to process event folder "${folderName}":`, eventErr.message);
    }
  }
}

async function main() {
  if (!fs.existsSync(IMPORT_DIR)) {
    console.log(`\nError: Directory 'import_assets' not found.`);
    console.log(`Please create it at the root of the project:`);
    console.log(`  ${IMPORT_DIR}`);
    console.log(`And populate it with:`);
    console.log(`  - 00_GENERAL_BRANDING/`);
    console.log(`  - 01_PORTRAIT_PORTFOLIO/`);
    console.log(`  - 02_SPORT_PORTFOLIO/\n`);
    process.exit(1);
  }

  console.log('===================================================');
  console.log('  MRF Photography Asset Importer (R2 & PostgreSQL) ');
  console.log('===================================================\n');

  // 1. Process General Branding Assets
  const brandingPath = path.join(IMPORT_DIR, '00_GENERAL_BRANDING');
  if (fs.existsSync(brandingPath)) {
    console.log('Processing 00_GENERAL_BRANDING...');
    const files = fs.readdirSync(brandingPath);
    for (const file of files) {
      const filePath = path.join(brandingPath, file);
      if (fs.statSync(filePath).isDirectory() || file.startsWith('.')) continue;

      const baseName = path.basename(file, path.extname(file)).toLowerCase();
      const settingsMap = {
        'avatar': 'landing_avatar',
        'logo_portrait': 'logo_portrait',
        'logo_sport': 'logo_sport',
        'cover_portrait': 'landing_cover_portrait',
        'cover_sport': 'landing_cover_sport'
      };

      if (settingsMap[baseName]) {
        console.log(`  Uploading branding asset: ${file}...`);
        try {
          const uniqueUploadedPath = await uploadToR2(filePath);
          await updateSetting(settingsMap[baseName], uniqueUploadedPath);
          console.log(`    Updated database setting: ${settingsMap[baseName]} -> ${uniqueUploadedPath}`);
        } catch (err) {
          console.error(`    Failed to upload branding asset ${file}:`, err.message);
        }
      }
    }
  }

  // 2. Process Portrait (Falguni) Portfolios
  await processPortfolios('01_PORTRAIT_PORTFOLIO', 'portrait');

  // 3. Process Sport (VeloLens) Portfolios
  await processPortfolios('02_SPORT_PORTFOLIO', 'sport');

  console.log('\n===================================================');
  console.log('  Asset Import Completed Successfully!              ');
  console.log('===================================================\n');
  
  await pool.end();
}

main().catch(err => {
  console.error('Fatal error during import:', err);
  pool.end();
});
