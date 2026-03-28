import '../config/env'; // validate env first
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { env } from '../config/env';

const seed = async () => {
  await mongoose.connect(env.MONGODB_URI);

  const existing = await User.findOne({ email: env.ADMIN_SEED_EMAIL });
  if (existing) {
    console.log('Admin already exists:', env.ADMIN_SEED_EMAIL);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(env.ADMIN_SEED_PASSWORD, 12);
  await User.create({
    name: 'Admin',
    email: env.ADMIN_SEED_EMAIL,
    passwordHash,
    role: 'ADMIN',
    status: 'ACTIVE',
  });

  console.log('✅ Admin seeded:', env.ADMIN_SEED_EMAIL);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
