// Author: Alex Chen
// Issue: #2 â€” Seed development data for tickets, users, and articles

import { PrismaClient } from '@prisma/client';
import { Priority, TicketStatus, UserRole } from '@helpdesk/shared';

import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.eventOutbox.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.articleFeedback.deleteMany();
  await prisma.articleVersion.deleteMany();
  await prisma.ticketEscalation.deleteMany();
  await prisma.ticketAssignmentHistory.deleteMany();
  await prisma.ticketStatusHistory.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.slaPolicy.deleteMany();
  await prisma.session.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();
  await prisma.organization.deleteMany();

  const organization = await prisma.organization.create({
    data: {
      id: 'org_helpdesk_demo',
      name: 'HelpDesk Demo Co',
      slug: 'helpdesk-demo',
    },
  });

  await prisma.team.createMany({
    data: [
      {
        id: 'team-it',
        name: 'IT Support',
        slug: 'it-support',
        organizationId: organization.id,
      },
      {
        id: 'team-ops',
        name: 'Operations Support',
        slug: 'operations-support',
        organizationId: organization.id,
      },
    ],
  });

  const [customerPassword, agentPassword, adminPassword] = await Promise.all([
    hashPassword('customer123'),
    hashPassword('agent123'),
    hashPassword('admin123'),
  ]);

  const [requester, agent, admin] = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user_requester_1',
        name: 'Riley Requester',
        email: 'riley.requester@example.com',
        passwordHash: customerPassword,
        role: UserRole.CUSTOMER,
        organizationId: organization.id,
        teamId: null,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user_agent_1',
        name: 'Avery Agent',
        email: 'avery.agent@example.com',
        passwordHash: agentPassword,
        role: UserRole.AGENT,
        organizationId: organization.id,
        teamId: 'team-it',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user_admin_1',
        name: 'Casey Admin',
        email: 'casey.admin@example.com',
        passwordHash: adminPassword,
        role: UserRole.ADMIN,
        organizationId: organization.id,
        teamId: 'team-ops',
      },
    }),
  ]);

  const [highSla, mediumSla, lowSla, urgentSla] = await Promise.all([
    prisma.slaPolicy.create({
      data: {
        id: 'sla-high-it',
        name: 'High priority IT response',
        priority: Priority.HIGH,
        organizationId: organization.id,
        teamId: 'team-it',
        responseHours: 4,
        resolutionHours: 24,
        escalationHours: 6,
      },
    }),
    prisma.slaPolicy.create({
      data: {
        id: 'sla-medium-it',
        name: 'Medium priority IT response',
        priority: Priority.MEDIUM,
        organizationId: organization.id,
        teamId: 'team-it',
        responseHours: 8,
        resolutionHours: 72,
        escalationHours: 24,
      },
    }),
    prisma.slaPolicy.create({
      data: {
        id: 'sla-low-it',
        name: 'Low priority IT response',
        priority: Priority.LOW,
        organizationId: organization.id,
        teamId: 'team-it',
        responseHours: 24,
        resolutionHours: 120,
        escalationHours: 48,
      },
    }),
    prisma.slaPolicy.create({
      data: {
        id: 'sla-urgent-it',
        name: 'Urgent priority IT response',
        priority: Priority.URGENT,
        organizationId: organization.id,
        teamId: 'team-it',
        responseHours: 1,
        resolutionHours: 8,
        escalationHours: 2,
      },
    }),
  ]);

  const slaByPriority = {
    [Priority.HIGH]: highSla,
    [Priority.MEDIUM]: mediumSla,
    [Priority.LOW]: lowSla,
    [Priority.URGENT]: urgentSla,
  };

  const sampleTickets = [
    ['Cannot access payroll dashboard', TicketStatus.OPEN, Priority.HIGH, ['payroll', 'access']],
    ['Laptop battery drains quickly', TicketStatus.IN_PROGRESS, Priority.MEDIUM, ['hardware']],
    ['VPN disconnects every hour', TicketStatus.WAITING, Priority.HIGH, ['network', 'vpn']],
    ['Request new design software', TicketStatus.RESOLVED, Priority.LOW, ['software']],
    ['Email forwarding broken', TicketStatus.CLOSED, Priority.URGENT, ['email']],
    ['Printer offline on floor 4', TicketStatus.OPEN, Priority.LOW, ['printer']],
    ['New hire needs account setup', TicketStatus.IN_PROGRESS, Priority.MEDIUM, ['onboarding']],
    ['Shared drive permission issue', TicketStatus.WAITING, Priority.MEDIUM, ['permissions']],
    ['Customer demo room display flickers', TicketStatus.OPEN, Priority.HIGH, ['av']],
    ['Knowledge base typo report', TicketStatus.RESOLVED, Priority.LOW, ['docs']],
  ] as const;

  for (const [title, status, priority, tags] of sampleTickets) {
    const now = new Date();
    const sla = slaByPriority[priority];
    await prisma.ticket.create({
      data: {
        title,
        description: `Sample seeded ticket for ${title.toLowerCase()}.`,
        status,
        priority,
        createdBy: requester.id,
        assigneeId: status === TicketStatus.OPEN ? null : agent.id,
        organizationId: organization.id,
        teamId: 'team-it',
        slaPolicyId: sla.id,
        firstResponseDueAt: new Date(now.getTime() + sla.responseHours * 3_600_000),
        resolutionDueAt: new Date(now.getTime() + sla.resolutionHours * 3_600_000),
        tags: JSON.stringify(tags),
        resolvedAt: status === TicketStatus.RESOLVED || status === TicketStatus.CLOSED ? now : null,
        closedAt: status === TicketStatus.CLOSED ? now : null,
      },
    });
  }

  await prisma.article.createMany({
    data: [
      {
        title: 'How to reset your VPN profile',
        body: '# Reset VPN\n\nDisconnect, remove the old profile, and sign in again.',
        category: 'Network',
        status: 'PUBLISHED',
        tags: JSON.stringify(['vpn', 'network']),
        authorId: admin.id,
      },
      {
        title: 'Payroll dashboard access checklist',
        body: '# Payroll Access\n\nConfirm SSO group membership and browser permissions.',
        category: 'Access',
        status: 'PUBLISHED',
        tags: JSON.stringify(['payroll', 'access']),
        authorId: admin.id,
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
