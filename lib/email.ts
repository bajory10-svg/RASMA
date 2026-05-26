import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface OrderEmailData {
  customerName: string
  customerEmail: string
  transactionId: string
  items: { name: string; quantity: number; price: number }[]
  totalAmount: number
  deliveryFee: number
  deliveryMethod: string
  deliveryAddress?: string
  channel: string
  createdAt: string
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e8e5df; font-family: Georgia, serif; color: #4a4039;">${item.name}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e8e5df; text-align: center; color: #4a4039;">${item.quantity}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e8e5df; text-align: right; color: #4a4039;">QAR ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #fafaf9; font-family: Georgia, serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 28px; color: #1a1512; letter-spacing: 4px; font-weight: 400; margin: 0;">HENNA</h1>
          <p style="color: #9c9286; font-size: 12px; letter-spacing: 2px; margin: 4px 0 0;">ORDER CONFIRMATION</p>
        </div>

        <!-- Thank you -->
        <div style="background: #fff; border: 1px solid #e8e5df; padding: 32px; margin-bottom: 24px;">
          <h2 style="color: #1a1512; font-size: 20px; margin: 0 0 8px;">Thank you, ${data.customerName}!</h2>
          <p style="color: #7d7368; font-size: 14px; margin: 0;">Your order has been confirmed. Here's your receipt.</p>
        </div>

        <!-- Order Details -->
        <div style="background: #fff; border: 1px solid #e8e5df; padding: 32px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
            <div>
              <p style="color: #9c9286; font-size: 11px; letter-spacing: 1px; margin: 0 0 4px;">ORDER NUMBER</p>
              <p style="color: #1a1512; font-size: 14px; font-weight: bold; margin: 0;">${data.transactionId}</p>
            </div>
            <div style="text-align: right;">
              <p style="color: #9c9286; font-size: 11px; letter-spacing: 1px; margin: 0 0 4px;">DATE</p>
              <p style="color: #1a1512; font-size: 14px; margin: 0;">${data.createdAt}</p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align: left; font-size: 11px; letter-spacing: 1px; color: #9c9286; padding-bottom: 8px; border-bottom: 2px solid #e8e5df;">ITEM</th>
                <th style="text-align: center; font-size: 11px; letter-spacing: 1px; color: #9c9286; padding-bottom: 8px; border-bottom: 2px solid #e8e5df;">QTY</th>
                <th style="text-align: right; font-size: 11px; letter-spacing: 1px; color: #9c9286; padding-bottom: 8px; border-bottom: 2px solid #e8e5df;">TOTAL</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="margin-top: 16px; text-align: right;">
            ${data.deliveryFee > 0 ? `<p style="color: #7d7368; font-size: 13px; margin: 4px 0;">Delivery: QAR ${data.deliveryFee.toFixed(2)}</p>` : ''}
            <p style="color: #1a1512; font-size: 18px; font-weight: bold; margin: 8px 0 0;">Total: QAR ${data.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <!-- Delivery Info -->
        <div style="background: #fff; border: 1px solid #e8e5df; padding: 32px; margin-bottom: 24px;">
          <p style="color: #9c9286; font-size: 11px; letter-spacing: 1px; margin: 0 0 8px;">DELIVERY METHOD</p>
          <p style="color: #1a1512; font-size: 14px; margin: 0 0 12px; text-transform: capitalize;">${data.deliveryMethod}</p>
          ${data.deliveryAddress ? `<p style="color: #9c9286; font-size: 11px; letter-spacing: 1px; margin: 0 0 8px;">ADDRESS</p><p style="color: #1a1512; font-size: 14px; margin: 0;">${data.deliveryAddress}</p>` : ''}
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 24px 0;">
          <p style="color: #9c9286; font-size: 12px; margin: 0;">Questions? Contact us on WhatsApp.</p>
          <p style="color: #b86815; font-size: 12px; margin: 8px 0 0;">Thank you for your order ✨</p>
        </div>

      </div>
    </body>
    </html>
  `

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'orders@yourdomain.com',
      to: data.customerEmail,
      subject: `Order Confirmed — ${data.transactionId}`,
      html,
    })

    if (error) console.error('Email error:', error)
    return { success: !error, data: emailData }
  } catch (err) {
    console.error('Email send failed:', err)
    return { success: false }
  }
}

export function generateWhatsAppMessage(data: OrderEmailData): string {
  const items = data.items
    .map((item) => `• ${item.name} x${item.quantity} — QAR ${(item.price * item.quantity).toFixed(2)}`)
    .join('\n')

  return encodeURIComponent(
    `Hi ${data.customerName}! 🌿\n\n` +
    `Your order is confirmed!\n\n` +
    `*Order ID:* ${data.transactionId}\n\n` +
    `*Items:*\n${items}\n\n` +
    (data.deliveryFee > 0 ? `*Delivery:* QAR ${data.deliveryFee.toFixed(2)}\n` : '') +
    `*Total:* QAR ${data.totalAmount.toFixed(2)}\n\n` +
    `*Delivery:* ${data.deliveryMethod}${data.deliveryAddress ? `\n*Address:* ${data.deliveryAddress}` : ''}\n\n` +
    `Thank you for your order! ✨`
  )
}
