import { prisma } from "./prisma";

export async function writeAuditLog({
  entityType,
  entityId,
  userId,
  action,
  oldValue,
  newValue,
}: {
  entityType: string;
  entityId: string;
  userId: string;
  action: string;
  oldValue?: object;
  newValue?: object;
}) {
  await prisma.auditLog.create({
    data: {
      entityType,
      entityId,
      userId,
      action,
      oldValue: oldValue as any,
      newValue: newValue as any,
    },
  });
}
