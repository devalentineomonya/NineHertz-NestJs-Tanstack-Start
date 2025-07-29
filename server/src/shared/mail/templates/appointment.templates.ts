import { baseStyles, baseEmailTemplate } from './mail.templates';

export function appointmentCreatedEmail({
  patientName,
  doctorName,
  appointmentTime,
  meetingLink,
  companyName = 'NineHertz Medic',
}: {
  patientName: string;
  doctorName: string;
  appointmentTime: string;
  meetingLink?: string;
  companyName?: string;
}) {
  const content = `
    <h1 style="${baseStyles.heading}">Appointment Confirmed</h1>

    <div style="margin-bottom: 20px;">
      <p style="${baseStyles.contentText}">
        Hello ${patientName}, your appointment with Dr. ${doctorName} has been scheduled.
      </p>

      <table style="${baseStyles.table}">
        <tr>
          <td style="${baseStyles.labelCell}">Date & Time:</td>
          <td style="${baseStyles.valueCell}">${appointmentTime}</td>
        </tr>
        ${
          meetingLink
            ? `
        <tr>
          <td style="${baseStyles.labelCell}">Meeting Link:</td>
          <td style="${baseStyles.valueCell}">
            <a href="${meetingLink}" target="_blank">Join Virtual Consultation</a>
          </td>
        </tr>
        `
            : ''
        }
      </table>
    </div>

    ${
      meetingLink
        ? `
    <a href="${meetingLink}" style="${baseStyles.actionButton}">
      Join Virtual Appointment
    </a>
    `
        : ''
    }

    <div style="${baseStyles.messageBox}">
      <p style="${baseStyles.messageText}">
        You'll receive a reminder 15 minutes before your appointment time.
      </p>
    </div>
  `;

  return baseEmailTemplate({
    companyName,
    title: 'Appointment Confirmed',
    content,
  });
}

export function appointmentReminderEmail({
  patientName,
  doctorName,
  appointmentTime,
  meetingLink,
  companyName = 'NineHertz Medic',
}: {
  patientName: string;
  doctorName: string;
  appointmentTime: string;
  meetingLink?: string;
  companyName?: string;
}) {
  const content = `
    <h1 style="${baseStyles.heading}">Appointment Reminder</h1>

    <div style="margin-bottom: 20px;">
      <p style="${baseStyles.contentText}">
        Hello ${patientName}, this is a reminder for your upcoming appointment with Dr. ${doctorName}.
      </p>

      <table style="${baseStyles.table}">
        <tr>
          <td style="${baseStyles.labelCell}">Time:</td>
          <td style="${baseStyles.valueCell}">${appointmentTime}</td>
        </tr>
        ${
          meetingLink
            ? `
        <tr>
          <td style="${baseStyles.labelCell}">Meeting Link:</td>
          <td style="${baseStyles.valueCell}">
            <a href="${meetingLink}" target="_blank">Join Virtual Consultation</a>
          </td>
        </tr>
        `
            : ''
        }
      </table>
    </div>

    ${
      meetingLink
        ? `
    <a href="${meetingLink}" style="${baseStyles.actionButton}">
      Join Virtual Appointment
    </a>
    `
        : ''
    }

    <div style="${baseStyles.messageBox}">
      <p style="${baseStyles.messageText}">
        Please join the meeting 5 minutes before your scheduled time.
      </p>
    </div>
  `;

  return baseEmailTemplate({
    companyName,
    title: 'Appointment Reminder',
    content,
  });
}

export function appointmentCancelledEmail({
  patientName,
  doctorName,
  appointmentTime,
  reason,
  refundMessage = '',
  isDoctor = false,
  companyName = 'NineHertz Medic',
}: {
  patientName: string;
  doctorName: string;
  appointmentTime: string;
  reason: string;
  refundMessage?: string;
  isDoctor?: boolean;
  companyName?: string;
}) {
  const content = `
    <h1 style="${baseStyles.heading}">Appointment Cancelled</h1>

    <div style="margin-bottom: 20px;">
      <p style="${baseStyles.contentText}">
        ${
          isDoctor
            ? `Your appointment with ${patientName} has been cancelled.`
            : `Hello ${patientName}, your appointment with Dr. ${doctorName} has been cancelled.`
        }
      </p>

      <table style="${baseStyles.table}">
        <tr>
          <td style="${baseStyles.labelCell}">Date & Time:</td>
          <td style="${baseStyles.valueCell}">${appointmentTime}</td>
        </tr>
        <tr>
          <td style="${baseStyles.labelCell}">Reason:</td>
          <td style="${baseStyles.valueCell}">${reason}</td>
        </tr>
      </table>

      ${
        !isDoctor && refundMessage
          ? `
      <div style="${baseStyles.messageBox}">
        <p style="${baseStyles.messageText}">
          ${refundMessage}
        </p>
      </div>
      `
          : ''
      }
    </div>

    <div style="${baseStyles.messageBox}">
      <p style="${baseStyles.messageText}">
        If you have any questions, please contact our support team.
      </p>
    </div>
  `;

  return baseEmailTemplate({
    companyName,
    title: 'Appointment Cancelled',
    content,
  });
}
export function prescriptionEmail({
  patientName,
  doctorName,
  items,
  issueDate,
  expiryDate,
  action = 'created',
  companyName = 'NineHertz Medic',
}: {
  patientName: string;
  doctorName: string;
  items: Array<{
    name: string;
    dosage: string;
    frequency: string;
    instructions?: string;
  }>;
  issueDate: string;
  expiryDate: string;
  action?: 'created' | 'updated' | 'fulfilled';
  companyName?: string;
}) {
  // Map action to subject line
  const actionMap = {
    created: 'New Prescription',
    updated: 'Prescription Updated',
    fulfilled: 'Prescription Fulfilled',
  };

  const subject = actionMap[action] || 'Prescription Update';

  // Create table rows for prescription items
  const itemsRows = items
    .map(
      (item) => `
    <tr>
      <td style="${baseStyles.valueCell}">${item.name}</td>
      <td style="${baseStyles.valueCell}">${item.dosage}</td>
      <td style="${baseStyles.valueCell}">${item.frequency}</td>
      <td style="${baseStyles.valueCell}">${item.instructions || 'As directed'}</td>
    </tr>
  `,
    )
    .join('');

  const content = `
    <h1 style="${baseStyles.heading}">${subject}</h1>

    <div style="margin-bottom: 20px;">
      <p style="${baseStyles.contentText}">
        Hello ${patientName},
        ${
          action === 'created'
            ? `Dr. ${doctorName} has prescribed the following medications.`
            : action === 'updated'
              ? 'your prescription has been updated.'
              : 'your prescription has been fulfilled and is ready for pickup.'
        }
      </p>

      <h2 style="${baseStyles.subHeading}">Prescription Details</h2>
      <table style="${baseStyles.table}">
        <thead>
          <tr>
            <th style="${baseStyles.headerCell}">Medication</th>
            <th style="${baseStyles.headerCell}">Dosage</th>
            <th style="${baseStyles.headerCell}">Frequency</th>
            <th style="${baseStyles.headerCell}">Instructions</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <table style="${baseStyles.table}">
        <tr>
          <td style="${baseStyles.labelCell}">Issue Date:</td>
          <td style="${baseStyles.valueCell}">${issueDate}</td>
        </tr>
        <tr>
          <td style="${baseStyles.labelCell}">Expiry Date:</td>
          <td style="${baseStyles.valueCell}">${expiryDate}</td>
        </tr>
        ${
          action === 'fulfilled'
            ? `
        <tr>
          <td style="${baseStyles.labelCell}">Status:</td>
          <td style="${baseStyles.valueCell}">Ready for pickup</td>
        </tr>
        `
            : ''
        }
      </table>
    </div>

    <div style="${baseStyles.messageBox}">
      <p style="${baseStyles.messageText}">
        ${
          action === 'created'
            ? 'This prescription can be fulfilled at any pharmacy. If you have any questions, contact your doctor.'
            : action === 'fulfilled'
              ? 'Your medication is ready for pickup. Please bring your ID when collecting.'
              : 'If you have any questions about these changes, contact your doctor.'
        }
      </p>
    </div>
  `;

  return baseEmailTemplate({
    companyName,
    title: subject,
    content,
  });
}
