import { Resend } from "resend";

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY || "placeholder");
}

export async function sendGoalSubmittedEmail(
  managerEmail: string,
  employeeName: string,
  managerName: string
) {
  const resend = getResendClient();
  try {
    await resend.emails.send({
      from: "AtomQuest <noreply@atomquest.demo>",
      to: managerEmail,
      subject: `${employeeName} has submitted goals for your review`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">AtomQuest</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">Goal Setting & Tracking Portal</p>
          </div>
          <div style="background: #f8f9fa; padding: 32px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1a1a2e;">Hi ${managerName},</h2>
            <p style="color: #4a4a6a; line-height: 1.6;">
              <strong>${employeeName}</strong> has submitted their goals for the current cycle and they are pending your review and approval.
            </p>
            <a href="${process.env.NEXTAUTH_URL}/manager/approvals" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
              Review Goals →
            </a>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email send error:", error);
  }
}

export async function sendGoalApprovedEmail(
  employeeEmail: string,
  employeeName: string
) {
  const resend = getResendClient();
  try {
    await resend.emails.send({
      from: "AtomQuest <noreply@atomquest.demo>",
      to: employeeEmail,
      subject: "Your goals have been approved! 🎉",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0F6E56 0%, #1a9973 100%); padding: 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">AtomQuest</h1>
          </div>
          <div style="background: #f8f9fa; padding: 32px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1a1a2e;">Congratulations, ${employeeName}!</h2>
            <p style="color: #4a4a6a; line-height: 1.6;">
              Your goals have been approved by your manager. They are now locked for the current cycle. 
              You can start logging your quarterly achievements.
            </p>
            <a href="${process.env.NEXTAUTH_URL}/employee/achievements" 
               style="display: inline-block; background: #0F6E56; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
              View Your Goals →
            </a>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email send error:", error);
  }
}

export async function sendGoalReturnedEmail(
  employeeEmail: string,
  employeeName: string,
  reason: string
) {
  const resend = getResendClient();
  try {
    await resend.emails.send({
      from: "AtomQuest <noreply@atomquest.demo>",
      to: employeeEmail,
      subject: "Your goals require revision",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #e05252 0%, #c0392b 100%); padding: 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">AtomQuest</h1>
          </div>
          <div style="background: #f8f9fa; padding: 32px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1a1a2e;">Hi ${employeeName},</h2>
            <p style="color: #4a4a6a; line-height: 1.6;">
              Your manager has returned your goals for revision. Please review the feedback below and resubmit.
            </p>
            <div style="background: #fff3f3; border-left: 4px solid #e05252; padding: 16px; border-radius: 4px; margin: 16px 0;">
              <strong>Manager's feedback:</strong><br/>
              <p style="margin: 8px 0 0 0; color: #4a4a6a;">${reason}</p>
            </div>
            <a href="${process.env.NEXTAUTH_URL}/employee/goals" 
               style="display: inline-block; background: #e05252; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
              Revise Goals →
            </a>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email send error:", error);
  }
}

export async function sendCheckinReminderEmail(
  employeeEmail: string,
  employeeName: string,
  quarter: string
) {
  const resend = getResendClient();
  try {
    await resend.emails.send({
      from: "AtomQuest <noreply@atomquest.demo>",
      to: employeeEmail,
      subject: `Reminder: Log your ${quarter} achievements`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); padding: 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">AtomQuest</h1>
          </div>
          <div style="background: #f8f9fa; padding: 32px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1a1a2e;">Hi ${employeeName},</h2>
            <p style="color: #4a4a6a; line-height: 1.6;">
              This is a reminder to log your <strong>${quarter}</strong> achievements. 
              The check-in window is currently open.
            </p>
            <a href="${process.env.NEXTAUTH_URL}/employee/achievements" 
               style="display: inline-block; background: #f39c12; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
              Log Achievements →
            </a>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email send error:", error);
  }
}
