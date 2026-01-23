import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { NextResponse, NextRequest } from "next/server";
import { sendEmailSchema } from "@/lib/schemas/icpGenerator";
import {
  getIcpReport,
  updateIcpReportWithEmail,
} from "@/lib/services/icpGenerator";
import { resendClient } from "@/lib/resend/resendClient";
import { IcpReportEmail } from "@/lib/emails/IcpReportEmail";
import config from "@/lib/config";
import { emailLimiter } from "@/lib/ratelimit/client";
import { checkRateLimit } from "@/lib/ratelimit/checkRateLimit";

/**
 * POST /api/tools/icp-generator/send-email - Send ICP report via email
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const rateLimit = await checkRateLimit(req, emailLimiter);
    if (!rateLimit.success) return rateLimit.response;

    const body = await req.json();
    const { reportId, email } = sendEmailSchema.parse(body);

    console.log(`📧 Sending ICP report to: ${email}`);

    // Get report from database
    const report = await getIcpReport(reportId);
    if (!report) {
      return NextResponse.json(
        { error: errorMessages.NOT_FOUND },
        { status: 404 }
      );
    }

    if (!report.report) {
      return NextResponse.json(
        { error: "Report has not been generated yet" },
        { status: 400 }
      );
    }

    // Send email via Resend
    await resendClient.emails.send({
      from: `Prediqte <${config.contact.prediqteEmail}>`,
      to: email,
      subject: `🎯 Your ICP Report`,
      react: IcpReportEmail({
        report: report.report,
      }),
    });

    // Update report with email and timestamp
    await updateIcpReportWithEmail({
      reportId,
      email,
    });

    console.log(`✅ ICP report sent successfully to: ${email}`);

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return errorHandler(error);
  }
}
