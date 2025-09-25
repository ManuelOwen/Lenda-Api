import { DataSource } from 'typeorm';
// import { cleanupDuplicatePhoneNumbers } from './cleanup-duplicates';
// import { User } from '../users/entities/user.entity';

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'Groceries',
    entities: [ Location],
    synchronize: false, // Don't sync during cleanup
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected successfully');

    // await cleanupDuplicatePhoneNumbers(dataSource);

    console.log('Cleanup script completed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await dataSource.destroy();
  }
}

main().catch(console.error);
