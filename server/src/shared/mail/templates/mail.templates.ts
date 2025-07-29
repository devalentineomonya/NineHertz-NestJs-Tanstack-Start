export const baseStyles = {
  body: "background-color:#ffffff;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;margin:0;padding:0;color:#1a1a1a;",
  container: 'max-width:600px;margin:0 auto;padding:40px 20px;',
  table: 'width:100%;border-collapse:collapse;margin-bottom:15px;',
  labelCell:
    'padding:5px 0;font-weight:600;color:#4b5563;text-align:left;width:40%;',
  valueCell:
    'padding:5px 0;color:#000;text-align:right;width:60%;font-weight:500',
  headerCell:
    'padding: 10px 8px; font-weight: 700; color: #111827; background-color: #f9fafb; text-align: left; border-bottom: 1px solid #e5e7eb;',
  subHeading:
    'font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 20px 0 10px 0; line-height: 1.3; text-align: left;',

  logoSection: 'text-align:center;margin-bottom:40px;',
  logo: 'font-size:24px;font-weight:700;color:#00d4ff;margin:0;letter-spacing:-0.5px;',
  mainCard:
    'background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:40px 32px;text-align:center;box-shadow:0 1px 3px 0 rgba(0, 0, 0, 0.1);',
  heading:
    'font-size:24px;font-weight:600;color:#1a1a1a;margin:0 0 16px 0;line-height:1.3;',
  description:
    'font-size:16px;color:#6b7280;margin:0 0 32px 0;line-height:1.5;',
  otpContainer: 'display:flex;justify-content:center;margin-bottom:32px;',
  otpDigit:
    'font-size:32px;font-weight:700;color:#1a1a1a;font-family:monospace;padding:12px;background-color:#f9fafb;border-radius:8px;border:2px dashed #d1d5db;margin:0 4px;min-width:50px;text-align:center;',
  expiryText: 'font-size:14px;color:#9ca3af;margin:5px 0 5px 0;',
  actionButton:
    'background-color:#00d4ff;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;display:inline-block;margin:5px 0 5px 0;width:100%;max-width:100%;box-sizing:border-box;',
  divider: 'border-top:1px solid #e5e7eb;margin:20px 0;',
  securityWarning:
    'font-size:14px;color:#6b7280;margin:0 0 8px 0;line-height:1.5;text-align:left;',
  supportLink: 'color:#00d4ff;text-decoration:underline;',
  thankYou: 'font-size:16px;color:#1a1a1a;margin:24px 0 0 0;font-weight:500;',
  footer:
    'text-align:center;margin-top:40px;padding:5px 0;border-top:1px solid #f3f4f6;',
  footerText: 'font-size:12px;color:#9ca3af;margin:0 0 4px 0;',
  footerTagline: 'font-size:12px;color:#6b7280;margin:0;',
  contentText:
    'font-size:16px;color:#1a1a1a;margin:0 0 16px 0;line-height:1.5;text-align:left;',
  statusBadge:
    'display:inline-block;padding:4px 12px;border-radius:5px;font-weight:600;margin:0 0 16px 0;width:96%;',
  messageBox:
    'background-color: #F3F4F6; border-left: 4px solid #3B82F6; padding: 12px 16px; margin: 20px 0;',
  messageHeading:
    'font-size: 16px; font-weight: 600; color: #1F2937; margin: 0 0 8px 0;text-align:start;',
  messageText: 'color: #4B5563; margin: 0; line-height: 1.6;text-align:start;',
};

export function baseEmailTemplate({
  companyName = 'CRM Nexus',
  title,
  content,
  footerTagline = 'Empowering Connections, Driving Growth',
}: {
  companyName?: string;
  title: string;
  content: string;
  footerTagline?: string;
}) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="${baseStyles.body}">
      <div style="${baseStyles.container}">
        <!-- Logo Section -->
        <div style="${baseStyles.logoSection}">
          <p style="${baseStyles.logo}">≡ ${companyName}</p>
        </div>

        <!-- Main Content Card -->
        <div style="${baseStyles.mainCard}">
          ${content}
        </div>

        <!-- Footer -->
        <div style="${baseStyles.footer}">
          <p style="${baseStyles.footerText}">
            © ${companyName} Inc ${new Date().getFullYear()}
          </p>
          <p style="${baseStyles.footerTagline}">${footerTagline}</p>
        </div>
      </div>
    </body>
  </html>
  `;
}

export interface otpEmailProps {
  otpCode: string;
  expiryMinutes?: number;
  supportEmail?: string;
  companyName?: string;
}
export function otpEmail({
  otpCode,
  expiryMinutes = 30,
  supportEmail = 'support@example.com',
  companyName = 'NineHertz Medic',
}: otpEmailProps) {
  const minutesText = expiryMinutes === 1 ? 'minute' : 'minutes';
  const otpDigits = otpCode
    .split('')
    .map((digit) => `<span style="${baseStyles.otpDigit}">${digit}</span>`)
    .join('');

  const content = `
    <h1 style="${baseStyles.heading}">Multi-Factor Authentication</h1>
    <p style="${baseStyles.description}">
      Please use the one-time-password (OTP) below:
    </p>

    <div style="${baseStyles.otpContainer}">
      ${otpDigits}
    </div>

    <p style="${baseStyles.expiryText}">
      The OTP will expire in ${expiryMinutes} ${minutesText}.
    </p>

    <hr style="${baseStyles.divider}" />

    <p style="${baseStyles.securityWarning}">
      If you did not initiate this request, please reset your password immediately and contact
      <a href="mailto:${supportEmail}" style="${baseStyles.supportLink}">
        ${supportEmail}
      </a>.
    </p>
    <p style="${baseStyles.thankYou}">Thank you.</p>
  `;

  return baseEmailTemplate({
    companyName,
    title: 'Your MFA Code',
    content,
  });
}

export function ResetPasswordEmail({
  resetLink,
  companyName = 'CRM Nexus',
}: {
  resetLink: string;
  companyName?: string;
}) {
  const content = `
    <h1 style="${baseStyles.heading}">Reset Your Password</h1>
    <p style="${baseStyles.description}">
      You've requested to reset your password. Click the button below to proceed:
    </p>

    <a href="https://127.0.0.1:3000/api/reset-password?token=${resetLink}" style="${baseStyles.actionButton};">
      Reset Password
    </a>

    <p style="${baseStyles.contentText}">
      If you didn't request this, please ignore this email. The link will expire in 1 hour.
    </p>

    <hr style="${baseStyles.divider}" />

    <p style="${baseStyles.securityWarning}">
      For security reasons, do not share this email with anyone.
    </p>
  `;

  return baseEmailTemplate({
    companyName,
    title: 'Password Reset Request',
    content,
  });
}
export interface QuotationStatusEmailProps {
  quoteNumber: string;
  projectName: string;
  customerName: string;
  estimatedCost?: string;
  currency?: string;
  validUntil?: Date;
  message?: string;
  dashboardUrl: string;
  companyName?: string;
}
export function QuotationStatusEmail({
  quoteNumber,
  projectName,
  message,
  dashboardUrl,
  customerName,
  estimatedCost,
  currency = 'USD',
  validUntil,
  companyName = 'CRM Nexus',
}: QuotationStatusEmailProps): string {
  const text = 'helo';
  const color = '#fff000';
  const statusStyle = `background-color:${color}20;color:${color};${baseStyles.statusBadge}`;

  const content = `
    <h1 style="${baseStyles.heading}text-align:start;">Quotation Update: ${projectName}</h1>

    <div style=" margin-bottom:25px;">
      <span style="${statusStyle}text-align:center;">
        ${text}
      </span>
    </div>

    <table style="${baseStyles.table}">
      <tr>
        <td style="${baseStyles.labelCell}">Quote Number:</td>
        <td style="${baseStyles.valueCell}">
          ${quoteNumber.split('-')[0]}-${quoteNumber.split('-').slice(-1)[0]}
        </td>
      </tr>
      <tr>
        <td style="${baseStyles.labelCell}">Project:</td>
        <td style="${baseStyles.valueCell}">${projectName}</td>
      </tr>
      ${
        estimatedCost
          ? `<tr>
             <td style="${baseStyles.labelCell}">Estimated Cost:</td>
             <td style="${baseStyles.valueCell}">${currency} ${estimatedCost}</td>
           </tr>`
          : ''
      }
      ${
        validUntil
          ? `<tr>
             <td style="${baseStyles.labelCell}">Valid Until:</td>
             <td style="${baseStyles.valueCell}">${new Date(validUntil).toLocaleDateString()}</td>
           </tr>`
          : ''
      }
    </table>

    <p style="${baseStyles.contentText}">
      Hello ${customerName}, your quotation for <strong>${projectName}</strong> has been updated to <strong>${text}</strong>.
    </p>

    ${
      message
        ? `
      <div style="${baseStyles.messageBox}">
        <h3 style="${baseStyles.messageHeading}">Message from our team:</h3>
        <p style="${baseStyles.messageText}">${message}</p>
      </div>
    `
        : ''
    }

    <a href="${dashboardUrl}" style="${baseStyles.actionButton};">
      View Full Quotation Details
    </a>

    <hr style="${baseStyles.divider}" />

    <p style="${baseStyles.footerText}">
      Need assistance? Reply to this email or contact our support team.<br>
      ${companyName} · Your Business Growth, Our Priority
    </p>
  `;

  return baseEmailTemplate({
    companyName,
    title: `Quotation ${text}`,
    content,
    footerTagline: '',
  });
}
export interface IssueAssignmentEmailProps {
  issueId: string;
  issueTitle: string;
  action: 'assigned' | 'closed';
  assignedTo?: string;
  closedBy?: string;
  dashboardUrl: string;
  companyName?: string;
  userName?: string;
  dateString?: string;
}

export function IssueAssignmentEmail({
  issueId,
  issueTitle,
  action,
  assignedTo,
  closedBy,
  dashboardUrl,
  userName,
  dateString,
  companyName = 'CRM Nexus',
}: IssueAssignmentEmailProps) {
  const actionConfig = {
    assigned: {
      color: '#3B82F6',
      text: 'Assigned to You',
    },
    closed: {
      color: '#10B981',
      text: 'Resolved',
    },
  };

  const { color, text } = actionConfig[action];
  const actionStyle = `background-color:${color}20;color:${color};${baseStyles.statusBadge}`;

  const content = `
    <h1 style="${baseStyles.heading}">Issue Update: ${issueTitle}</h1>

    <div style="text-align:left; margin-bottom:25px;">
      <span style="${actionStyle}">
        ${text}
      </span>
    </div>

    <table style="${baseStyles.table}">
      <tr>
        <td style="${baseStyles.labelCell}">Issue ID:</td>
        <td style="${baseStyles.valueCell}">${issueId}</td>
      </tr>
      ${
        action === 'assigned' && assignedTo
          ? `<tr>
             <td style="${baseStyles.labelCell}">Assigned To:</td>
             <td style="${baseStyles.valueCell}">${assignedTo}</td>
           </tr>`
          : ''
      }
      ${
        action === 'closed' && closedBy
          ? `<tr>
             <td style="${baseStyles.labelCell}">Resolved By:</td>
             <td style="${baseStyles.valueCell}">${closedBy}</td>
           </tr>`
          : ''
      }
    </table>

    <p style="${baseStyles.contentText}">
      The issue <strong>${issueTitle}</strong> opened by ${userName ?? 'you'} on ${dateString}  has been ${action === 'assigned' ? 'assigned to you' : 'marked as resolved'}.
    </p>

    <a href="${dashboardUrl}" style="${baseStyles.actionButton}">
      ${action === 'assigned' ? 'View Issue Details' : 'Review Resolution'}
    </a>

    <hr style="${baseStyles.divider}" />

    <p style="${baseStyles.contentText}">
      ${
        action === 'assigned'
          ? 'Please address this issue promptly. Contact support if you need assistance.'
          : "If this resolution doesn't solve the problem, you can reopen the ticket."
      }
    </p>
  `;

  return baseEmailTemplate({
    companyName,
    title: `Issue ${text}`,
    content,
    footerTagline: 'Efficient Solutions for Your Business Needs',
  });
}
