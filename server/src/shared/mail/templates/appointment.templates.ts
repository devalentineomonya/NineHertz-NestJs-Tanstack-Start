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
