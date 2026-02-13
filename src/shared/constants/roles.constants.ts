import { Role } from '../../generated/prisma/index.js';

export const Roles = {
  ADMIN: Role.ADMIN,
  USER: Role.USER,
} as const;

export type RoleType = Role;
