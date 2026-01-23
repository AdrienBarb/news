import { prisma } from "@/lib/db/prisma";
import { InputType } from "@prisma/client";
import type { AnalyzedData } from "@/lib/schemas/icpGenerator";

export async function createIcpReport({
  input,
  inputType,
  analyzedData,
  source,
}: {
  input: string;
  inputType: InputType;
  analyzedData: AnalyzedData;
  source?: string;
}) {
  return await prisma.icpReport.create({
    data: {
      input,
      inputType,
      analyzedData,
      source,
    },
  });
}

export async function getIcpReport(reportId: string) {
  return await prisma.icpReport.findUnique({
    where: { id: reportId },
  });
}

export async function updateIcpReportWithGeneration({
  reportId,
  finalData,
  report,
}: {
  reportId: string;
  finalData: AnalyzedData;
  report: string;
}) {
  return await prisma.icpReport.update({
    where: { id: reportId },
    data: {
      finalData,
      report,
    },
  });
}

export async function updateIcpReportWithEmail({
  reportId,
  email,
}: {
  reportId: string;
  email: string;
}) {
  return await prisma.icpReport.update({
    where: { id: reportId },
    data: {
      email,
      emailSentAt: new Date(),
    },
  });
}
