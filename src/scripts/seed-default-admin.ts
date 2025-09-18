import 'dotenv/config';
import mongoose from 'mongoose';

import { seedDefaultAdmin } from '@/lib/initAdmin';

async function main() {
  try {
    const result = await seedDefaultAdmin();

    if (!result.created) {
      console.info(`Администратор с адресом ${result.email} уже существует, создание пропущено.`);
    } else {
      console.info(`Создан администратор ${result.email}.`);
      if (result.password) {
        console.info(`Временный пароль: ${result.password}`);
      }
    }
  } catch (error) {
    console.error('Не удалось создать администратора по умолчанию:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void main();
