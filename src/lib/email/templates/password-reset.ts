interface PasswordResetEmailParams {
	resetUrl: string;
}

export function renderPasswordResetEmail({
	resetUrl,
}: PasswordResetEmailParams): { subject: string; html: string } {
	const subject = "Reset your Pointwise password";

	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 40px;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #fafafa;">Pointwise</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 16px;">
              <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #e4e4e7;">Reset your password</h2>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                We received a request to reset your password. Click the button below to choose a new password. This link will expire in 1 hour.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #a855f7, #ec4899); color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                Reset Password
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 16px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #71717a;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <p style="margin: 0; font-size: 11px; color: #52525b; word-break: break-all;">
                If the button doesn't work, copy and paste this link: ${resetUrl}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

	return { subject, html };
}
