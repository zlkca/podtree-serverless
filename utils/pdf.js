// src/services/invoice-pdf.js
import PDFDocument from 'pdfkit';
import { fetchLogoFromS3 } from './s3.js';

export const generateInvoicePDF = async (school, parent, charges) => {
    try {
        const doc = new PDFDocument();
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));

        // Fetch logo from S3
        try {
            const logBuff = await fetchLogoFromS3(school.logo);
            if (logBuff) {
                doc.image(logBuff, 50, 45, { width: 100 });
            } else {
                doc.fontSize(12).text(school.name, 50, 50);
            }
        } catch (error) {
            console.error('Error fetching logo from S3:', error);
            doc.fontSize(12).text(school.name, 50, 50);
        }

        // Add invoice title
        doc.fontSize(20).text('Invoice', { align: 'center' });
        doc.moveDown();

        // Add parent information
        doc.fontSize(12).text(`Parent: ${parent.firstName} ${parent.lastName}`, 50, 150);
        doc.moveDown();

        // Add invoice date
        const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.text(`Date: ${currentDate}`, 50, doc.y);
        doc.moveDown();

        // Add charges table
        const tableTop = 240;
        doc.fontSize(12).text('Item', 50, tableTop);
        doc.text('Amount', 400, tableTop);
        doc.moveDown();

        let yPosition = tableTop + 20;
        charges.forEach(charge => {
            doc.text(charge.category, 50, yPosition);
            doc.text(`$${charge.amount.toFixed(2)}`, 400, yPosition);
            yPosition += 20;
        });


        // Add total
        const total = charges.reduce((sum, charge) => sum + charge.amount, 0);
        doc.moveDown().fontSize(14).text(`Total: $${total.toFixed(2)}`, { align: 'right' });

        // Add footer
        doc.fontSize(10).text('Thank you for your support!', 50, 700, { align: 'center' });

        doc.end();

        return new Promise((resolve) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};

// // services/pdf.js
// import PDFDocument from 'pdfkit';

// export const generateInvoicePDF = (charges) => {
//   return new Promise((resolve, reject) => {
//     try {
//       const doc = new PDFDocument();
//       const chunks = [];

//       doc.on('data', chunk => chunks.push(chunk));
//       doc.on('end', () => resolve(Buffer.concat(chunks)));
//       doc.on('error', reject);

//       // Add content to PDF
//       doc.fontSize(20).text('Invoice', { align: 'center' });
//       doc.moveDown();

//       // Add charges table
//       charges.forEach(charge => {
//         doc.fontSize(12).text(`${charge.category} - $${charge.amount}`);
//       });

//       // Add total
//       const total = charges.reduce((sum, charge) => sum + charge.amount, 0);
//       doc.moveDown().fontSize(14).text(`Total: $${total}`, { align: 'right' });

//       doc.end();
//     } catch (error) {
//       reject(error);
//     }
//   });
// };
