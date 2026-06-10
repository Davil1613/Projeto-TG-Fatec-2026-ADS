interface SendPasswordResetEmailPayload {
  to: string;
  userName: string;
  resetCode: string;
}

class EmailService {
  async sendPasswordResetEmail(payload: SendPasswordResetEmailPayload) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !fromEmail) {
      console.log('[PASSWORD RESET][DEV MODE]');
      console.log(`Para: ${payload.to}`);
      console.log(`Codigo: ${payload.resetCode}`);
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: payload.to,
        subject: 'Codigo para redefinir sua senha',
        html: `
          <p>Olá, ${payload.userName}.</p>
          <p>Seu código de redefinição é:</p>
          <p style="font-size:24px;font-weight:700;letter-spacing:2px;">${payload.resetCode}</p>
          <p>Esse código expira em 30 minutos.</p>
          <p>Se você não solicitou, ignore este e-mail.</p>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Falha ao enviar e-mail: ${errorText}`);
    }
  }
}

export default new EmailService();
