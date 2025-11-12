import { neon } from '@neondatabase/serverless';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: ['.env.local', '.env'] });

// PostgreSQL connection - use environment variable for security
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);

async function importFullAddressCSV() {
  console.log('Starting full CSV address import to PostgreSQL...');

  try {
    // First, drop and recreate the addresses table to match the new structure
    console.log('Updating addresses table structure...');
    
    // Drop the old table
    await sql('DROP TABLE IF EXISTS addresses CASCADE');
    
    // Create new table with matching CSV structure
    await sql(`
      CREATE TABLE addresses (
        id SERIAL PRIMARY KEY,
        country TEXT NOT NULL DEFAULT 'India',
        state_code TEXT,
        state_name_english TEXT,
        district_code TEXT,
        district_name_english TEXT,
        subdistrict_code TEXT,
        subdistrict_name_english TEXT,
        village_code TEXT,
        village_name_english TEXT,
        pincode TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✓ New addresses table created');

    // Read and import the full CSV
    console.log('Reading CSV file...');
    const records: any[] = [];
    
    await new Promise<void>((resolve, reject) => {
      createReadStream('./attached_assets/f17a1608-5f10-4610-bb50-a63c80d83974_5440046a63c72fe90e3dc31777d48358_1752923323908.csv')
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
          console.log(`✓ Parsed ${records.length} records from CSV`);
          resolve();
        })
        .on('error', reject);
    });

    // Import records in batches for better performance
    const batchSize = 1000;
    let imported = 0;
    let skipped = 0;

    console.log('Importing address data to database...');

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Prepare batch insert
      const values = [];
      const placeholders = [];
      let paramIndex = 1;
      
      for (const record of batch) {
        if (record.stateNameEnglish && record.districtNameEnglish) {
          placeholders.push(`($${paramIndex}, $${paramIndex+1}, $${paramIndex+2}, $${paramIndex+3}, $${paramIndex+4}, $${paramIndex+5}, $${paramIndex+6}, $${paramIndex+7}, $${paramIndex+8}, $${paramIndex+9}, $${paramIndex+10})`);
          values.push(
            'India', // country
            record.stateCode?.trim() || null,
            record.stateNameEnglish?.trim() || null,
            record.districtCode?.trim() || null,
            record.districtNameEnglish?.trim() || null,
            record.subdistrictCode?.trim() || null,
            record.subdistrictNameEnglish?.trim() || null,
            record.villageCode?.trim() || null,
            record.villageNameEnglish?.trim() || null,
            record.pincode?.trim() || null,
            new Date()
          );
          paramIndex += 11;
        } else {
          skipped++;
        }
      }
      
      if (placeholders.length > 0) {
        try {
          await sql(`
            INSERT INTO addresses (country, state_code, state_name_english, district_code, district_name_english, 
                                   subdistrict_code, subdistrict_name_english, village_code, village_name_english, 
                                   pincode, created_at) 
            VALUES ${placeholders.join(', ')}
          `, values);
          
          imported += placeholders.length;
          console.log(`Processed batch ${Math.ceil((i + batchSize) / batchSize)}/${Math.ceil(records.length / batchSize)} - Imported: ${imported}, Skipped: ${skipped}`);
        } catch (err) {
          console.error(`Error in batch ${Math.ceil((i + batchSize) / batchSize)}:`, err.message);
        }
      }
    }

    console.log(`✅ Import completed successfully!`);
    console.log(`📊 Total records processed: ${records.length}`);
    console.log(`✅ Successfully imported: ${imported}`);
    console.log(`⚠️  Skipped (invalid data): ${skipped}`);

    // Verify the import
    const totalCount = await sql('SELECT COUNT(*) as count FROM addresses');
    console.log(`🔍 Verification: ${totalCount[0].count} total records in database`);

    // Show sample of imported data
    const sample = await sql('SELECT * FROM addresses LIMIT 5');
    console.log('📝 Sample imported data:');
    sample.forEach(row => {
      console.log(`- ${row.state_name_english}, ${row.district_name_english}, ${row.village_name_english || 'N/A'} (${row.pincode || 'No PIN'})`);
    });

  } catch (error) {
    console.error('❌ Error importing CSV data:', error);
    throw error;
  }
}

// Run the import
importFullAddressCSV().then(() => {
  console.log('✅ Full CSV import completed successfully');
  process.exit(0);
}).catch(err => {
  console.error('❌ Full CSV import failed:', err);
  process.exit(1);
});