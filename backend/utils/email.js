const nodemailer = require('nodemailer');
const config = require('../config/config');

class EmailService {
  static async sendContract(contract, recipientEmail, pdfPath) {
    const transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
      }
    });

    const mailOptions = {
      from: config.email.auth.user,
      to: recipientEmail,
      subject: `Contract #${contract.contractNumber} - ${contract.projectName}`,
      text: `Please find attached the contract for project ${contract.projectName}.`,
      attachments: [
        {
          filename: `contract_${contract.id}.pdf`,
          path: pdfPath
        }
      ]
    };

    await transporter.sendMail(mailOptions);
  }

  static async sendInvoice(invoice, recipientEmail, pdfPath) {
    const transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
      }
    });

    const mailOptions = {
      from: config.email.auth.user,
      to: recipientEmail,
      subject: `Invoice #${invoice.invoiceNumber} - ${invoice.projectName}`,
      text: `Please find attached the invoice for project ${invoice.projectName}.`,
      attachments: [
        {
          filename: `invoice_${invoice.id}.pdf`,
          path: pdfPath
        }
      ]
    };

    await transporter.sendMail(mailOptions);
  }

  static async sendContractApprovalNotification(contract) {
    const transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
      }
    });

    const mailOptions = {
      from: config.email.auth.user,
      to: contract.clientEmail,
      subject: `Contract Approved - ${contract.projectName}`,
      text: `Your contract for project ${contract.projectName} has been approved.`
    };

    await transporter.sendMail(mailOptions);
  }
}

module.exports = EmailService;