/**
 * Promote an existing user to admin role.
 * Usage: pnpm promote-admin user@example.com
 */
import mongoose from 'mongoose';
import { User } from '../src/models/User';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: pnpm promote-admin <email>');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set');
    process.exit(1);
  }

  await mongoose.connect(uri);

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: 'admin' },
    { new: true }
  );

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  console.log(`✓ ${user.email} is now an admin`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
