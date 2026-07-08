import prisma from './db';

export async function logAction(userId, userRole, action, entity, entityId, details) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        userRole,
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null,
      },
    });
  } catch (err) {
    console.error('Audit log write error:', err);
  }
}
