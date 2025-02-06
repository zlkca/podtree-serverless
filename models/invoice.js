import { ObjectId } from "mongodb";
import nodemailer from 'nodemailer';

import { ChargeStatus } from "../const.js";
import { getCurrentMonthRange } from "../utils/index.js";
import { getInvoiceDate } from "../utils/scheduler.js";
import BaseModel from "./base.js";
import ChargeModel from "./charge.js";
import SchoolModel from "./school.js";

import { generateInvoicePDF } from './invoice-pdf.js';
// import { capitalizeWords, formatToYYYYMMDD } from '../utils.js';
// import { BrandName, ParentSiteRootUrl } from '../const.js';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    // host: process.env.SMTP_HOST,
    // port: process.env.SMTP_PORT,
    // secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    // auth: {
    //   user: process.env.SMTP_USER,
    //   pass: process.env.SMTP_PASS
    // }
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: 'yocompute@gmail.com',
        pass: 'xwav hfri zlte domf'
    }
});

export default class InvoiceModel extends BaseModel {
    constructor(db) {
        super(db, 'invoices');
    }
    async sendInvoice(db, studentId, parentId, query){
        const parentModel = new parentModel(db);
        const parent = await parentModel.findOne({ _id: new ObjectId(parentId)});
        const billingQuery = {...query, 'student._id': studentId};
        const invoices = await super.find(billingQuery);
        for (const invoice of invoices) {
            await sendInvoiceEmail(parent, invoice.items);
        }
        return;
    }
    async generateInvoices(schoolId) {
        const currTimestamp = new Date().getTime();
        const schoolModel = new SchoolModel(this.db);
        const school = await schoolModel.findById(schoolId);
        const recurringMonthDay = school.paymentSettings.recurringMonthday;
        const invoiceDate = getInvoiceDate(currTimestamp, recurringMonthDay);
        console.log({ invoiceDate })
        const invoiceTimestamp = invoiceDate.getTime();
        const chargeModel = new ChargeModel(this.db);
        const { startTimestamp, endTimestamp } = getCurrentMonthRange();
        console.log({ startTimestamp, endTimestamp })

        const charges = await chargeModel.find({
            invoiceTimestamp: { "$gt": startTimestamp, "$lt": endTimestamp },
            "school._id": schoolId,
            "status": ChargeStatus.NEW // new, pending, paid, failed
        });

        console.log({ charges })
        // Aggregate charges by studentId
        const invoiceMap = {};
        const chargeIds = [];
        charges.forEach(charge => {
            if (!invoiceMap[charge.student._id]) {
                invoiceMap[charge.student._id] = {
                    student: charge.student,
                    payingContact: charge.payingContact,
                    school: { _id: school._id.toString() },
                    amount: 0,
                    invoiceTimestamp: invoiceTimestamp,
                    items: [],
                    createdAt: currTimestamp
                };
            }
            invoiceMap[charge.student._id].amount += charge.chargeTemplate.amount;
            invoiceMap[charge.student._id].items.push({
                _id: charge.chargeTemplate._id.toString(),
                name: charge.chargeTemplate.name,
                description: charge.chargeTemplate.description,
                amount: charge.chargeTemplate.amount,
                createdAt: charge.chargeTemplate.createdAt
            });
            chargeIds.push(ObjectId.createFromHexString(charge._id));
        });

        const retUpdateMany = await chargeModel.updateMany(
            { _id: { $in: chargeIds } },
            { status: ChargeStatus.PENDING });
        console.log({ retUpdateMany });
        console.log({ invoiceMap });
        // Convert the map to an array of invoices
        const invoices = Object.values(invoiceMap);
        console.log({ invoices })
        if (invoices && invoices.length > 0) {
            return await super.insertMany(invoices);
        }
        return null;
    }

    /**
     * Generate HTML table for charges
     * @param {Array} charges - Array of charge objects
     * @returns {string} HTML table string
     */
    generateChargesTable(charges) {
        const tableRows = charges.map(charge => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${charge.category}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${charge.description ? charge.description : ""}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">$${charge.amount.toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${formatToYYYYMMDD(charge.dueDate)}</td>
      </tr>
    `).join('');

        return `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 12px; border: 1px solid #ddd;">Category</th>
            <th style="padding: 12px; border: 1px solid #ddd;">Description</th>
            <th style="padding: 12px; border: 1px solid #ddd;">Amount</th>
            <th style="padding: 12px; border: 1px solid #ddd;">Due Date</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
    };

    /**
     * Calculate total amount from charges
     * @param {Array} charges - Array of charge objects
     * @returns {number} Total amount
     */
    calculateTotal(charges) {
        return charges.reduce((total, charge) => total + charge.amount, 0);
    };

    /**
     * Send invoice email to parent
     * @param {string} parentEmail - Parent's email address
     * @param {string} parent.id - Parent's ID
     * @param {Array} charges - Array of charge objects
     * @returns {Promise} Email sending result
     */
    async sendInvoiceEmail(parent, charges) {
        const parentEmail = parent.email;
        const parentId = parent._id;
        try {
            // Validate inputs
            if (!parentEmail || !parent._id || !Array.isArray(charges)) {
                throw new Error('Invalid input parameters');
            }

            // Calculate total
            const totalAmount = this.calculateTotal(charges);

            // Generate email content
            const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Kinderwood Invoice</h2>
          
          <p style="color: #666;">
            Dear Parent,<br><br>
            Please find below the details of your latest charges.
          </p>
  
          ${this.generateChargesTable(charges)}
  
          <div style="margin-top: 20px; text-align: right;">
            <strong>Total Amount: $${totalAmount.toFixed(2)}</strong>
          </div>
  
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
            <p>
              Please ensure timely payment of these charges. If you have any questions,
              please don't hesitate to contact us.
            </p>
            <p>
              Thank you for your cooperation.
            </p>
          </div>
        </div>
      `;

            // Configure email options
            const mailOptions = {
                from: '"PodTree" <yocompute@gmail.com>', // `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
                to: parentEmail,
                subject: 'New Invoice Generated',
                html: htmlContent,
                // Add PDF attachment if needed
                attachments: [
                    {
                        filename: 'invoice.pdf',
                        content: await generateInvoicePDF(BrandName, parent, charges), // Implement PDF generation if needed
                        contentType: 'application/pdf'
                    }
                ]
            };

            // Send email
            const info = await transporter.sendMail(mailOptions);
            // const payload = {
            //     to: clientMetadata.email,
            //     subject: emailSubject, // Email subject
            //     html: emailMessage
            // }
            // await invokeFunction('arn:aws:lambda:us-east-1:765588567347:function:email-sender', payload);
            console.log('Email sent successfully:', info.messageId);

            // Return success response
            return {
                success: true,
                messageId: info.messageId,
                parentId,
                totalAmount
            };

        } catch (error) {
            console.error('Error sending invoice email:', error);
            throw error;
        }
    }

}