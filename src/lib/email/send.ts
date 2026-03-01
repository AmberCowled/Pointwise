import { getResend } from "./resend";

interface SendEmailOptions {
	to: string;
	subject: string;
	html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
	const from = process.env.EMAIL_FROM ?? "noreply@pointwise.dev";
	const resend = getResend();

	const { error } = await resend.emails.send({
		from,
		to,
		subject,
		html,
	});

	if (error) {
		console.error("Failed to send email:", error);
		throw new Error("Failed to send email");
	}
}
