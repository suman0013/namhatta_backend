import { neon } from '@neondatabase/serverless';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';

// PostgreSQL connection
const connectionString = 'postgresql://neondb_owner:npg_5MIwCD4YhSdP@ep-calm-silence-a15zko7l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(connectionString);

interface CsvRow {
  stateCode: string;
  stateNameEnglish: string;
  districtCode: string;
  districtNameEnglish: string;
  subdistrictCode: string;
  subdistrictNameEnglish: string;
  villageCode: string;
  villageNameEnglish: string;
  pincode: string;
}

async function importAddresses() {
  console.log('Starting address data import from CSV...');

  try {
    // Clear existing address data
    console.log('Clearing existing addresses...');
    await sql('TRUNCATE TABLE addresses RESTART IDENTITY CASCADE');

    const records: CsvRow[] = [];
    const filePath = './attached_assets/f17a1608-5f10-4610-bb50-a63c80d83974_5440046a63c72fe90e3dc31777d48358_1752915346601.csv';

    // Read and parse CSV file
    await new Promise<void>((resolve, reject) => {
      createReadStream(filePath)
        .pipe(parse({ 
          columns: true,
          skipEmptyLines: true,
          trim: true,
          skipRecordsWithEmptyValues: false
        }))
        .on('data', (row: any) => {
          records.push(row);
        })
        .on('end', () => {
          console.log(`Parsed ${records.length} records from CSV`);
          resolve();
        })
        .on('error', reject);
    });

    // Process records in batches to avoid memory issues
    const batchSize = 1000;
    let processed = 0;
    let imported = 0;

    console.log('Importing addresses to database...');

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      for (const record of batch) {
        try {
          // Only insert if we have valid data
          if (record.stateNameEnglish && record.districtNameEnglish) {
            
            await sql(`
              INSERT INTO addresses (country, state, district, sub_district, village, postal_code, created_at) 
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
              'India', // All records are from India
              record.stateNameEnglish.trim(),
              record.districtNameEnglish.trim(),
              record.subdistrictNameEnglish ? record.subdistrictNameEnglish.trim() : null,
              record.villageNameEnglish ? record.villageNameEnglish.trim() : null,
              record.pincode ? record.pincode.trim() : null,
              new Date()
            ]);
            imported++;
          } else {
            console.log(`Skipping record ${processed + 1}: missing state or district`);
          }
        } catch (error) {
          console.warn(`Error importing record ${processed + 1}:`, error);
          console.warn('Record data:', record);
        }
        processed++;
      }

      // Progress update
      if (i % (batchSize * 10) === 0) {
        console.log(`Processed ${processed}/${records.length} records (${imported} imported)`);
      }
    }

    console.log(`✅ Import completed! Processed ${processed} records, imported ${imported} addresses`);

    // Verify the import
    const count = await sql('SELECT COUNT(*) as count FROM addresses');
    console.log(`Total addresses in database: ${count[0].count}`);

    // Show sample data
    const sample = await sql('SELECT DISTINCT state FROM addresses ORDER BY state');
    console.log(`States available: ${sample.map(s => s.state).join(', ')}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

// Run import
importAddresses().then(() => {
  console.log('Import script finished.');
  process.exit(0);
}).catch((error) => {
  console.error('Import script failed:', error);
  process.exit(1);
});