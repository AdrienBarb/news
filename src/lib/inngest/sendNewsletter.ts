import { inngest } from "./client";
import { prisma } from "@/lib/db/prisma";
import { getNewsletterArticles } from "@/lib/services/newsletter/getNewsletterArticles";
import { resendClient } from "@/lib/resend/resendClient";
import { NewsletterEmail } from "@/lib/emails/NewsletterEmail";
import {
  computeNextNewsletterAtUtc,
  type WeekdayName,
} from "@/lib/utils/date/computeNextNewsletterAtUtc";
import config from "@/lib/config";

export const sendNewsletter = inngest.createFunction(
  { id: "send-newsletter" },
  { cron: "*/30 * * * *" }, // Every 30 minutes
  async ({ step }) => {
    const now = new Date();

    // Find users whose newsletter should be sent
    const usersToNotify = await step.run("find-users-to-notify", async () => {
      return prisma.user.findMany({
        where: {
          nextNewsletterAtUtc: {
            lte: now,
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          newsletterDay: true,
          newsletterTime: true,
          timezone: true,
          nextNewsletterAtUtc: true,
        },
      });
    });

    if (usersToNotify.length === 0) {
      return { status: "no_users_to_notify", count: 0 };
    }

    const results = await Promise.allSettled(
      usersToNotify.map((user) =>
        step.run(`send-newsletter-${user.id}`, async () => {
          // Check if we've already sent this newsletter (prevent duplicates)
          const existingLog = await prisma.newsletterSendLog.findUnique({
            where: {
              userId_scheduledForUtc: {
                userId: user.id,
                scheduledForUtc: user.nextNewsletterAtUtc!,
              },
            },
          });

          if (existingLog) {
            return {
              userId: user.id,
              status: "skipped",
              reason: "already_sent",
            };
          }

          // Get articles for this user
          const articles = await getNewsletterArticles(user.id);

          if (articles.length === 0) {
            return {
              userId: user.id,
              status: "skipped",
              reason: "no_articles",
            };
          }

          // Compute next newsletter time before sending
          const nextNewsletterAtUtc = computeNextNewsletterAtUtc({
            newsletterDay: user.newsletterDay as WeekdayName,
            newsletterTime: user.newsletterTime,
            timezone: user.timezone,
            now,
          });

          try {
            // Create send log entry first to prevent duplicates
            // Use a transaction to ensure atomicity
            await prisma.$transaction(async (tx) => {
              // Create log entry for the scheduled time
              await tx.newsletterSendLog.create({
                data: {
                  userId: user.id,
                  scheduledForUtc: user.nextNewsletterAtUtc!,
                },
              });

              // Update user's newsletter timestamps
              await tx.user.update({
                where: { id: user.id },
                data: {
                  lastNewsletterAtUtc: now,
                  nextNewsletterAtUtc,
                },
              });
            });
          } catch (error: any) {
            // Handle race condition: if log entry already exists, skip
            if (error?.code === "P2002") {
              return {
                userId: user.id,
                status: "skipped",
                reason: "already_sent_race",
              };
            }
            throw error;
          }

          // Send email after database operations succeed
          try {
            await resendClient.emails.send({
              from: config.contact.email,
              to: user.email,
              subject: `Your Weekly Tech Brief`,
              react: NewsletterEmail({
                articles,
                unsubscribeUrl: `${config.project.url}/news`,
              }),
            });
          } catch (emailError) {
            // Log email error but don't fail the entire process
            // The log entry is already created, so we won't send duplicates
            console.error(
              `Failed to send newsletter email to ${user.email}:`,
              emailError
            );
            return {
              userId: user.id,
              status: "error",
              reason: "email_send_failed",
              error:
                emailError instanceof Error
                  ? emailError.message
                  : "Unknown error",
            };
          }

          return {
            userId: user.id,
            status: "sent",
            articlesCount: articles.length,
            nextNewsletterAtUtc: nextNewsletterAtUtc.toISOString(),
          };
        })
      )
    );

    const sent = results.filter(
      (r) => r.status === "fulfilled" && r.value.status === "sent"
    ).length;
    const skipped = results.length - sent;

    return {
      status: "completed",
      total: usersToNotify.length,
      sent,
      skipped,
    };
  }
);
