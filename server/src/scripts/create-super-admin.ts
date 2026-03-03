/**
 * Creates a Super Admin role (all permissions) and optionally a super-admin user.
 *
 * Usage:
 *   Set env vars then run: npm run create-super-admin
 *
 * Env:
 *   SUPER_ADMIN_EMAIL    (required to create/update user) e.g. admin@example.com
 *   SUPER_ADMIN_PASSWORD (required for new user) e.g. YourSecurePassword
 *   SUPER_ADMIN_NAME     (optional) e.g. "Super Admin"
 *
 * If SUPER_ADMIN_EMAIL is set and the user exists, their role is updated to Super Admin.
 * If the user does not exist, they are created with the given password.
 * If SUPER_ADMIN_EMAIL is not set, only the Super Admin role is ensured (no user created).
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Role } from '../modules/roles/role.model';
import { User } from '../modules/auth/user.model';
import { PERMISSION_CODES } from '../constants/permissions';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/pm-tool';
const SUPER_ADMIN_ROLE_NAME = 'Super Admin';
const SALT_ROUNDS = 10;

async function main(): Promise<void> {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const allPermissions = [...PERMISSION_CODES];
  let roleId: mongoose.Types.ObjectId;

  let superAdminRole = await Role.findOne({ name: SUPER_ADMIN_ROLE_NAME }).lean();
  if (!superAdminRole) {
    const created = await Role.create({
      name: SUPER_ADMIN_ROLE_NAME,
      permissions: allPermissions,
    });
    roleId = created._id;
    console.log(`Created role "${SUPER_ADMIN_ROLE_NAME}" with ${allPermissions.length} permissions.`);
  } else {
    roleId = superAdminRole._id;
    await Role.findOneAndUpdate(
      { name: SUPER_ADMIN_ROLE_NAME },
      { $set: { permissions: allPermissions } }
    );
    console.log(`Role "${SUPER_ADMIN_ROLE_NAME}" exists with ${allPermissions.length} permissions.`);
  }

  const email = process.env.SUPER_ADMIN_EMAIL?.trim();
  if (!email) {
    console.log('SUPER_ADMIN_EMAIL not set. Skipping user create/update.');
    await mongoose.disconnect();
    process.exit(0);
    return;
  }

  const password = process.env.SUPER_ADMIN_PASSWORD?.trim();
  const name = process.env.SUPER_ADMIN_NAME?.trim() || 'Super Admin';

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    await User.updateOne(
      { _id: existingUser._id },
      {
        $set: {
          roleId,
          role: 'admin',
          mustChangePassword: false,
          ...(name ? { name } : {}),
        },
      }
    );
    console.log(`Updated user "${email}" to role "${SUPER_ADMIN_ROLE_NAME}".`);
  } else {
    if (!password || password.length < 6) {
      console.error('SUPER_ADMIN_PASSWORD is required (min 6 characters) to create a new user.');
      await mongoose.disconnect();
      process.exit(1);
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'admin',
      roleId,
      mustChangePassword: false,
    });
    console.log(`Created super admin user: ${email}`);
  }

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
