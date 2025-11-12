# Extra Scripts and Utilities

This directory contains TypeScript and SQL scripts used for database migrations, seeding, and data imports.

## Files:

### SQL Scripts:
- `assign-devotees-to-namhattas.sql` - SQL script for assigning devotees to namhattas
- `fix-district-supervisor-column.sql` - SQL script to fix district supervisor column
- `migrate-addresses.sql` - SQL script for migrating addresses
- `migrate-district-supervisors.sql` - SQL script for migrating district supervisors

### TypeScript Scripts:
- `create-auth-tables.ts` - Creates authentication tables
- `create-gurudevs-table.ts` - Creates gurudevs table
- `import-csv-addresses.ts` - Imports addresses from CSV
- `import-from-csv.ts` - General CSV import utility
- `import-full-csv-addresses.ts` - Full address import from CSV
- `migrate-data-simple.ts` - Simple data migration script
- `seed-script.ts` - Database seeding script
- `seed-users.ts` - User seeding script
- `test-district-supervisor-integration.ts` - Integration test for district supervisor

## Usage:

These scripts are primarily used for database setup, migration, and testing purposes. They are not part of the main application runtime.
