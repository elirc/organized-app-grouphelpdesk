// Author: Morgan Lee
// Issue: Learning Phase 4 - Authenticate users and issue learning-friendly sessions

import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';

import { config } from '../config/env';
import { AppError } from '../utils/errors';
import { verifyPassword } from '../utils/password';

const defaultPrisma = new PrismaClient();

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  teamId: string | null;
  organizationId: string | null;
}

interface Session {
  token: string;
  user: CurrentUser;
  createdAt: Date;
  expiresAt: Date;
}

const sessions = new Map<string, Session>();

function toCurrentUser(user: CurrentUser): CurrentUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    teamId: user.teamId,
    organizationId: user.organizationId,
  };
}

export function createAuthService(prisma = defaultPrisma) {
  return {
    async login(email: string, password: string) {
      const user = await prisma.user.findUnique({ where: { email } });
      const isValidPassword = user ? await verifyPassword(password, user.passwordHash) : false;

      if (!user || !isValidPassword) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
      }

      const token = randomUUID();
      const currentUser = toCurrentUser(user);
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + config.SESSION_TTL_HOURS * 3_600_000);
      sessions.set(token, { token, user: currentUser, createdAt, expiresAt });

      await prisma.session
        .create({
          data: {
            token,
            userId: user.id,
            expiresAt,
          },
        })
        .catch(() => undefined);

      return { token, user: currentUser };
    },

    async getCurrentUser(token: string | undefined) {
      if (!token) return null;
      const cached = sessions.get(token);

      if (cached) {
        if (cached.expiresAt > new Date()) {
          return cached.user;
        }

        sessions.delete(token);
      }

      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!session || session.expiresAt <= new Date()) {
        if (session) {
          await prisma.session.delete({ where: { token } }).catch(() => undefined);
        }
        return null;
      }

      const user = toCurrentUser(session.user);
      sessions.set(token, {
        token,
        user,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      });

      return user;
    },

    async logout(token: string | undefined) {
      if (token) {
        sessions.delete(token);
        await prisma.session.delete({ where: { token } }).catch(() => undefined);
      }
    },
  };
}

export const authService = createAuthService();
