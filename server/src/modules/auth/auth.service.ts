import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from './user.model';
import { Role } from '../roles/role.model';
import { Designation } from '../designations/designation.model';
import { ApiError } from '../../utils/ApiError';
import { env } from '../../config/env';
import { sendForgotPasswordEmail } from '../../services/email.service';
import type { RegisterInput, LoginInput } from './auth.validation';
import type { IUser } from './user.model';

const SALT_ROUNDS = 10;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: string;
  roleId?: string;
  roleName?: string;
  designationName?: string;
  permissions: string[];
  mustChangePassword: boolean;
  createdAt?: string;
}

function signTokens(userId: string): AuthTokens {
  const options = { expiresIn: env.jwtExpiresIn };
  const accessToken = jwt.sign(
    { sub: userId },
    env.jwtSecret,
    options as jwt.SignOptions
  );
  const refreshToken = jwt.sign(
    { sub: userId, type: 'refresh' },
    env.jwtSecret,
    { expiresIn: '30d' } as jwt.SignOptions
  );
  return {
    accessToken,
    refreshToken,
    expiresIn: env.jwtExpiresIn,
  };
}

async function toAuthUser(user: IUser & { roleId?: unknown; designation?: unknown; mustChangePassword?: boolean }): Promise<AuthUser> {
  let permissions: string[] = [];
  let roleName: string | undefined;
  if (user.roleId) {
    const role = await Role.findById(user.roleId).select('permissions name').lean();
    if (role?.permissions) permissions = role.permissions;
    if (role?.name) roleName = role.name;
  }
  if (!roleName) roleName = user.role === 'admin' ? 'Administrator' : 'Member';
  let designationName: string | undefined;
  if (user.designation) {
    const des = await Designation.findById(user.designation).select('name').lean();
    if (des?.name) designationName = des.name;
  }
  const mustChange = user.mustChangePassword ?? false;
  if (mustChange && permissions.includes('projects:create')) {
    permissions = permissions.filter((p) => p !== 'projects:create');
  }
  const u = user as IUser & { avatarUrl?: string; createdAt?: Date };
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    avatarUrl: u.avatarUrl || undefined,
    role: user.role,
    roleId: user.roleId ? String(user.roleId) : undefined,
    roleName,
    designationName,
    permissions,
    mustChangePassword: mustChange,
    createdAt: u.createdAt ? u.createdAt.toISOString() : undefined,
  };
}

export async function register(input: RegisterInput): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const existing = await User.findOne({ email: input.email }).lean();
  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await User.create({
    email: input.email,
    password: hashedPassword,
    name: input.name,
    role: input.role ?? 'user',
  });

  const tokens = signTokens(user._id.toString());
  const authUser = await toAuthUser(user);
  return { user: authUser, tokens };
}

export async function login(input: LoginInput): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const user = await User.findOne({ email: input.email }).select('+password').lean();
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }
  const u = user as { enabled?: boolean };
  if (u.enabled === false) {
    throw new ApiError(401, 'Account is disabled');
  }

  const match = await bcrypt.compare(input.password, user.password);
  if (!match) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const tokens = signTokens(user._id.toString());
  const authUser = await toAuthUser(user as unknown as IUser & { roleId?: unknown; mustChangePassword?: boolean });
  return { user: authUser, tokens };
}

export async function refresh(refreshToken: string): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const decoded = jwt.verify(refreshToken, env.jwtSecret) as { sub?: string; type?: string };
  if (decoded.type !== 'refresh' || !decoded.sub) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = await User.findById(decoded.sub).lean();
  if (!user) {
    throw new ApiError(401, 'User not found');
  }
  const u = user as { enabled?: boolean };
  if (u.enabled === false) {
    throw new ApiError(401, 'Account is disabled');
  }

  const tokens = signTokens(user._id.toString());
  const authUser = await toAuthUser(user as unknown as IUser & { roleId?: unknown; mustChangePassword?: boolean });
  return { user: authUser, tokens };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<AuthUser> {
  const user = await User.findById(userId).select('+password').lean();
  if (!user) throw new ApiError(401, 'User not found');
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) throw new ApiError(401, 'Current password is incorrect');
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await User.findByIdAndUpdate(userId, {
    $set: { password: hashed, mustChangePassword: false },
    $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
  });
  const updated = await User.findById(userId).lean();
  if (!updated) throw new ApiError(500, 'User not found after update');
  return toAuthUser(updated as unknown as IUser & { roleId?: unknown; mustChangePassword?: boolean });
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();
  if (!user) return;
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await User.findByIdAndUpdate(user._id, {
    $set: { passwordResetToken: token, passwordResetExpires: expires },
  });
  const resetLink = `${env.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  await sendForgotPasswordEmail(user.email, {
    name: user.name,
    appUrl: env.appUrl,
    resetLink,
  }).catch((err) => console.error('Failed to send forgot password email:', err));
}

export async function resetPassword(token: string, newPassword: string): Promise<AuthUser> {
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() },
  })
    .select('+password +passwordResetToken +passwordResetExpires')
    .lean();
  if (!user) throw new ApiError(400, 'Invalid or expired reset token');
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await User.findByIdAndUpdate(user._id, {
    $set: { password: hashed, mustChangePassword: false },
    $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
  });
  const updated = await User.findById(user._id).lean();
  if (!updated) throw new ApiError(500, 'User not found after update');
  return toAuthUser(updated as unknown as IUser & { roleId?: unknown; designation?: unknown; mustChangePassword?: boolean });
}

export async function updateProfile(
  userId: string,
  input: { name?: string; avatarUrl?: string }
): Promise<AuthUser> {
  const user = await User.findById(userId).lean();
  if (!user) throw new ApiError(401, 'User not found');
  const update: Record<string, unknown> = {};
  if (input.name !== undefined) update.name = input.name;
  if (input.avatarUrl !== undefined) update.avatarUrl = input.avatarUrl === '' ? null : input.avatarUrl;
  if (Object.keys(update).length === 0) {
    return toAuthUser(user as unknown as IUser & { roleId?: unknown; designation?: unknown; mustChangePassword?: boolean });
  }
  const updated = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).lean();
  if (!updated) throw new ApiError(500, 'User not found after update');
  return toAuthUser(updated as unknown as IUser & { roleId?: unknown; designation?: unknown; mustChangePassword?: boolean });
}
