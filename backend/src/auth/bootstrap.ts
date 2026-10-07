import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../services/auth.service';
async function run() {
  const username = process.env.AUTH_BOOTSTRAP_USERNAME,
    password = process.env.AUTH_BOOTSTRAP_PASSWORD;
  if (!username || !password)
    throw new Error('Set local bootstrap credentials first.');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  try {
    await app.get(AuthService).bootstrap(username, password);
    console.log(
      'Initial administrator created. Remove bootstrap credentials from local settings.',
    );
  } finally {
    await app.close();
  }
}
void run().catch(() => {
  console.error(
    'Administrator setup failed. Check settings, schema, and whether an active administrator already exists.',
  );
  process.exitCode = 1;
});
