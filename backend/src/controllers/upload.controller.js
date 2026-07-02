/**
 * Upload Controller for Midiscanai
 */

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ReportService } from '../services/database.service.js';
import { asyncWrapper, AppError } from '../utils/errorHandler.js';

export const uploadFile = asyncWrapper(async (req, res, next) => {
  if (!req.file) {
    throw new AppError('No file was uploaded', 400);
  }

  const { size, originalname, path: filePath, mimetype } = req.file;

  const minSizeKb = parseInt(process.env.MIN_FILE_SIZE_KB, 10) || 1;
  const minSize = minSizeKb * 1024;
  if (size < minSize) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw new AppError(`File is too small — minimum size is ${minSizeKb}KB`, 400);
  }

  const fileId = uuidv4();
  const fileSizeKb = parseFloat((size / 1024).toFixed(2));

  const report = await ReportService.createReport({
    fileId,
    originalFilename: originalname,
    filePath,
    fileType: mimetype,
    fileSizeKb,
    uploadedAt: new Date()
  });

  res.status(201).json({
    fileId: report.fileId,
    originalFilename: report.originalFilename,
    fileType: report.fileType,
    fileSizeKb: report.fileSizeKb,
    uploadedAt: report.uploadedAt
  });
});

export const deleteFile = asyncWrapper(async (req, res, next) => {
  const { fileId } = req.params;
  const report = await ReportService.findReportByFileId(fileId);

  if (!report) {
    throw new AppError('File not found', 404);
  }

  if (fs.existsSync(report.filePath)) {
    fs.unlinkSync(report.filePath);
  }

  await ReportService.markReportDeleted(fileId);

  res.status(200).json({ message: 'File deleted successfully' });
});
