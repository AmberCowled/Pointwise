interface NewDeviceLoginEmailParams {
	deviceName: string;
	ipAddress: string | null;
	location: string | null;
	time: string;
	revokeUrl: string;
}

export function renderNewDeviceLoginEmail({
	deviceName,
	ipAddress,
	location,
	time,
	revokeUrl,
}: NewDeviceLoginEmailParams): { subject: string; html: string } {
	const subject = "New sign-in to your Pointwise account";

	const locationRow = location
		? `<tr>
              <td style="padding: 8px 12px; font-size: 13px; color: #a1a1aa; border-bottom: 1px solid #27272a;">Location</td>
              <td style="padding: 8px 12px; font-size: 13px; color: #e4e4e7; border-bottom: 1px solid #27272a;">${location}</td>
            </tr>`
		: "";

	const ipRow = ipAddress
		? `<tr>
              <td style="padding: 8px 12px; font-size: 13px; color: #a1a1aa; border-bottom: 1px solid #27272a;">IP address</td>
              <td style="padding: 8px 12px; font-size: 13px; color: #e4e4e7; border-bottom: 1px solid #27272a; font-family: monospace;">${ipAddress}</td>
            </tr>`
		: "";

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
              <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #e4e4e7;">New sign-in to your account</h2>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                We detected a sign-in to your account from a new device. If this was you, no action is needed.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 8px 12px; font-size: 13px; color: #a1a1aa; border-bottom: 1px solid #27272a;">Device</td>
                  <td style="padding: 8px 12px; font-size: 13px; color: #e4e4e7; border-bottom: 1px solid #27272a;">${deviceName}</td>
                </tr>
                ${locationRow}
                ${ipRow}
                <tr>
                  <td style="padding: 8px 12px; font-size: 13px; color: #a1a1aa;">Time</td>
                  <td style="padding: 8px 12px; font-size: 13px; color: #e4e4e7;">${time}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 16px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                If this wasn't you, click the button below to revoke access from this device immediately.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <a href="${revokeUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                Revoke access
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 16px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #71717a;">
                We also recommend changing your password and reviewing your linked accounts (Google, GitHub) if you don't recognize this sign-in.
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <p style="margin: 0; font-size: 11px; color: #52525b; word-break: break-all;">
                If the button doesn't work, copy and paste this link: ${revokeUrl}
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
