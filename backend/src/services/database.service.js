/**
 * Database Service for Midiscanai using Prisma ORM
 */

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
});

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;

export class ReportService {
  static async createReport(data) {
    return await prisma.report.create({ data });
  }

  static async findReportByFileId(fileId) {
    return await prisma.report.findUnique({
      where: { fileId },
      include: { analysisResult: true }
    });
  }

  static async markReportDeleted(fileId) {
    return await prisma.report.update({
      where: { fileId },
      data: { isDeleted: true }
    });
  }
}

export class AnalysisService {
  static async saveAnalysisResult(data) {
    const formattedData = {
      ...data,
      extracted_metrics: typeof data.extracted_metrics === 'object' ? JSON.stringify(data.extracted_metrics) : data.extracted_metrics
    };
    return await prisma.analysisResult.create({ data: formattedData });
  }

  static async findResultByFileId(fileId) {
    const result = await prisma.analysisResult.findUnique({
      where: { fileId }
    });
    if (result && typeof result.extracted_metrics === 'string') {
      try { result.extracted_metrics = JSON.parse(result.extracted_metrics); } catch (e) {}
    }
    return result;
  }

  static async getResultsByUserId(userId, limit = 10) {
    const results = await prisma.analysisResult.findMany({
      where: { 
        report: { userId }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { report: true }
    });
    return results.map(result => {
      if (typeof result.extracted_metrics === 'string') {
        try { result.extracted_metrics = JSON.parse(result.extracted_metrics); } catch (e) {}
      }
      return result;
    });
  }
}

export class AuditService {
  static async log(action, options = {}) {
    try {
      const { userId, resourceType, resourceId, ipAddress, additionalData } = options;
      await prisma.auditLog.create({
        data: {
          action,
          userId,
          resourceType,
          resourceId,
          ipAddress,
          additionalData: additionalData ? JSON.stringify(additionalData) : null
        }
      });
    } catch (err) {
      console.error('Audit logging failed:', err.message);
      // Non-blocking, do not throw
    }
  }
}
