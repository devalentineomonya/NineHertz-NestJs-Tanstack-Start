import { OrderStatus } from 'src/enums/order.enum';
import { baseEmailTemplate, baseStyles } from './mail.templates';

export function orderEmail({
  patientName,
  orderId,
  orderDate,
  status,
  items,
  totalAmount,
  action = 'created',
  companyName = 'NineHertz Medic',
  refundStatus,
  refundMessage,
}: {
  patientName: string;
  orderId: string;
  orderDate: string;
  status: OrderStatus;
  items: Array<{
    name: string;
    quantity: number;
    pricePerUnit: number;
    total: number;
  }>;
  totalAmount: number;
  action?: 'created' | 'updated' | 'cancelled';
  companyName?: string;
  refundStatus?: 'refunded' | 'pending' | 'failed' | 'not_required';
  refundMessage?: string;
}) {
  const subjectMap = {
    created: 'Order Confirmation',
    updated: 'Order Update',
    cancelled: 'Order Cancelled',
  };

  const subject = subjectMap[action] || 'Order Update';

  const statusMessages = {
    [OrderStatus.PENDING]: 'Pending - Awaiting payment',
    [OrderStatus.PROCESSING]: 'Processing - Preparing your order',
    [OrderStatus.DELIVERED]: 'Delivered - Ready for pickup',
    [OrderStatus.CANCELLED]: 'Cancelled',
    [OrderStatus.FAILED]: 'Payment Failed',
  };

  // Create items table
  const itemsRows = items
    .map(
      (item) => `
    <tr>
      <td style="${baseStyles.valueCell}">${item.name}</td>
      <td style="${baseStyles.valueCell}">${item.quantity}</td>
      <td style="${baseStyles.valueCell}">${item.pricePerUnit.toFixed(2)}</td>
      <td style="${baseStyles.valueCell}">${item.total.toFixed(2)}</td>
    </tr>
  `,
    )
    .join('');

  let refundSection = '';
  if (action === 'cancelled' && refundStatus && refundMessage) {
    refundSection = `
      <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
        <h3 style="${baseStyles.subHeading}">Refund Information</h3>
        <p style="${baseStyles.contentText}">${refundMessage}</p>
        ${
          refundStatus === 'failed'
            ? `<p style="${baseStyles.contentText}">Please contact our support team for assistance.</p>`
            : ''
        }
      </div>
    `;
  }

  const content = `
    <h1 style="${baseStyles.heading}">${subject}</h1>

    <p style="${baseStyles.contentText}">Hello ${patientName},</p>

    <div style="margin: 20px 0;">
      <table style="${baseStyles.table}">
        <tr>
          <td style="${baseStyles.labelCell}">Order ID:</td>
          <td style="${baseStyles.valueCell}">${orderId}</td>
        </tr>
        <tr>
          <td style="${baseStyles.labelCell}">Date:</td>
          <td style="${baseStyles.valueCell}">${orderDate}</td>
        </tr>
        <tr>
          <td style="${baseStyles.labelCell}">Status:</td>
          <td style="${baseStyles.valueCell}">${statusMessages[status]}</td>
        </tr>
      </table>
    </div>

    <h2 style="${baseStyles.subHeading}">Order Items</h2>
    <table style="${baseStyles.table}">
      <thead>
        <tr>
          <th style="${baseStyles.headerCell}">Medication</th>
          <th style="${baseStyles.headerCell}">Quantity</th>
          <th style="${baseStyles.headerCell}">Price</th>
          <th style="${baseStyles.headerCell}">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="${baseStyles.labelCell} text-align: right;">Grand Total:</td>
          <td style="${baseStyles.valueCell}">${totalAmount.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>

    ${refundSection}

    <div style="${baseStyles.messageBox}">
      <p style="${baseStyles.messageText}">
        ${
          status === OrderStatus.PROCESSING
            ? 'Your order is being prepared. You will be notified when ready for pickup.'
            : status === OrderStatus.CANCELLED
              ? 'Your order has been cancelled. Contact support for assistance.'
              : 'Thank you for your order!'
        }
      </p>
    </div>
  `;

  return baseEmailTemplate({ companyName, title: subject, content });
}
