// Author: Morgan Lee
// Issue: Enterprise Sprint 1 - Test organization-scoped user lookup

import { describe, expect, it, vi } from 'vitest';
import { UserRole } from '@helpdesk/shared';

import { createUserService } from '../../packages/server/src/services/userService';

describe('userService', () => {
  it('scopes user lookup by authenticated organization', async () => {
    const prisma = {
      user: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };
    const service = createUserService(prisma as never);

    await service.getUsers(UserRole.AGENT, {
      id: 'admin_1',
      name: 'Casey Admin',
      email: 'casey.admin@example.com',
      role: UserRole.ADMIN,
      organizationId: 'org_helpdesk_demo',
      teamId: 'team-ops',
    });

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        role: UserRole.AGENT,
        organizationId: 'org_helpdesk_demo',
      },
      orderBy: { name: 'asc' },
    });
  });
});
