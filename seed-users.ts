import { createUser, assignDistrictsToUser } from './server/storage-auth';

async function seedUsers() {
  console.log('Creating test users...');
  
  try {
    // Create ADMIN user
    const admin = await createUser({
      username: 'admin',
      passwordHash: 'Admin@12345', // Will be hashed automatically
      role: 'ADMIN',
      isActive: true
    });
    console.log('✓ Admin user created:', admin.username);

    // Create OFFICE user
    const office = await createUser({
      username: 'office',
      passwordHash: 'Office@12345', // Will be hashed automatically
      role: 'OFFICE',
      isActive: true
    });
    console.log('✓ Office user created:', office.username);

    // Create DISTRICT_SUPERVISOR user
    const supervisor = await createUser({
      username: 'supervisor',
      passwordHash: 'Supervisor@12345', // Will be hashed automatically
      role: 'DISTRICT_SUPERVISOR',
      isActive: true
    });
    console.log('✓ District supervisor user created:', supervisor.username);

    // Assign districts to the supervisor (example districts)
    await assignDistrictsToUser(supervisor.id, ['North 24 Parganas', 'South 24 Parganas']);
    console.log('✓ Districts assigned to supervisor');

    console.log('\n🎉 Test users created successfully!');
    console.log('\nLogin credentials:');
    console.log('- Admin: admin / Admin@12345');
    console.log('- Office: office / Office@12345');
    console.log('- District Supervisor: supervisor / Supervisor@12345');
    console.log('\nAuthentication is currently disabled for development.');
    console.log('Enable it by setting AUTHENTICATION_ENABLED=true in .env file.');

  } catch (error) {
    console.error('Error creating users:', error);
  }
}

seedUsers();