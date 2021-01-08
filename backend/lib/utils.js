import sgMail from '@sendgrid/mail';

require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export function uniqueScrapes(data) {
  //* filter for unique productIDs
  const uniqueIDs = [...new Set(data.map(item => item.productID))];

  //* return most recent item
  const uniqueData = uniqueIDs.map(
    id =>
      data
        .filter(obj => obj.productID === id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  );

  return uniqueData;
}

export function sendEmail(subject, body) {
  const email = {
    to: process.env.EMAIL,
    from: 'product-checker@example.com',
    subject,
    text: body,
    html: body,
  };

  return sgMail.send(email);
}
