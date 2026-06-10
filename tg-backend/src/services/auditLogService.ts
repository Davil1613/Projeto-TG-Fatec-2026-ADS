import AuditLogModel from '../models/AuditLog';

class AuditLogService {
  async create(data: {
    tenantId: number;
    userId?: number | null;
    action: string;
    entity: string;
    entityId?: number | null;
    description?: string | null;
  }) {
    return await AuditLogModel.create({
      tenantId: data.tenantId,
      userId: data.userId || null,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId || null,
      description: data.description || null,
    });
  }

  async getAll(tenantId: number) {
    return await AuditLogModel.findAll({
      where: { tenantId },
      order: [['createdAt', 'DESC']],
      limit: 200,
    });
  }
}

export default new AuditLogService();
