// Author: Morgan Lee
// Issue: Learning Phase 4 - Test password verification and session creation

import { describe, expect, it, vi } from 'vitest';
import { UserRole } from '@helpdesk/shared';

import { createAuthService } from '../../packages/server/src/services/authService';
import { AppError } from '../../packages/server/src/utils/errors';
import { hashPassword } from '../../packages/server/src/utils/password';

const now = new Date('2026-05-20T12:00:00.000Z');

function userRecord(passwordHash: string) {
  return {
    id: 'user_agent_1',
    name: 'Avery Agent',
    email: 'avery.agent@example.com',
    passwordHash,
    role: UserRole.AGENT,
    organizationId: 'org_helpdesk_demo',
    teamId: 'team-it',
  };
}

function createMockPrisma(passwordHash: string) {
  return {
    user: {
      findUnique: vi.fn().mockResolvedValue(userRecord(passwordHash)),
    },
    session: {
      create: vi.fn().mockResolvedValue({}),
      findUnique: vi.fn(),
      delete: vi.fn().mockResolvedValue({}),
    },
  };
}

describe('authService', () => {
  it('logs in with a valid password and returns a session token without exposing the hash', async () => {
    const passwordHash = await hashPassword('agent123');
    const service = createAuthService(createMockPrisma(passwordHash) as never);

    const result = await service.login('avery.agent@example.com', 'agent123');

    expect(result.token).toEqual(expect.any(String));
    expect(result.user.email).toBe('avery.agent@example.com');
    expect(result.user).not.toHaveProperty('passwordHash');
    await expect(service.getCurrentUser(result.token)).resolves.toMatchObject({
      id: 'user_agent_1',
    });
  });

  it('rejects invalid credentials without revealing which field was wrong', async () => {
    const passwordHash = await hashPassword('agent123');
    const service = createAuthService(createMockPrisma(passwordHash) as never);

    await expect(service.login('avery.agent@example.com', 'wrong-password')).rejects.toBeInstanceOf(
      AppError,
    );
  });

  it('resolves a current user from persisted session storage', async () => {
    const passwordHash = await hashPassword('agent123');
    const prisma = createMockPrisma(passwordHash);
    prisma.session.findUnique.mockResolvedValueOnce({
      token: 'persisted_token',
      userId: 'user_agent_1',
      createdAt: now,
      expiresAt: new Date('2099-05-21T12:00:00.000Z'),
      user: userRecord(passwordHash),
    });
    const service = createAuthService(prisma as never);

    await expect(service.getCurrentUser('persisted_token')).resolves.toMatchObject({
      id: 'user_agent_1',
      organizationId: 'org_helpdesk_demo',
    });
  });

  it('deletes expired persisted sessions and returns null', async () => {
    const passwordHash = await hashPassword('agent123');
    const prisma = createMockPrisma(passwordHash);
    prisma.session.findUnique.mockResolvedValueOnce({
      token: 'expired_token',
      userId: 'user_agent_1',
      createdAt: new Date('2026-05-19T12:00:00.000Z'),
      expiresAt: new Date('2000-01-01T00:00:00.000Z'),
      user: userRecord(passwordHash),
    });
    const service = createAuthService(prisma as never);

    await expect(service.getCurrentUser('expired_token')).resolves.toBeNull();
    expect(prisma.session.delete).toHaveBeenCalledWith({ where: { token: 'expired_token' } });
  });
});
