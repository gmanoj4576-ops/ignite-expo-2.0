import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

async function test() {
    const EMAIL_USER = 'gmanoj4576@gmail.com';
    const EMAIL_PASS = 'kufe hqap mebx ilif';

    console.log("Starting test email from within project...");

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    });

    try {
        console.log("Verifying transporter...");
        await transporter.verify();
        console.log("Transporter verified successfully!");

        const qrBuffer = await QRCode.toDataURL('Test QR Data');

        await transporter.sendMail({
            from: `"IGNITE Test" <${EMAIL_USER}>`,
            to: EMAIL_USER,
            subject: 'IGNITE Test Email',
            html: '<h1>Test Successful</h1><p>If you see this, the Gmail App Password is working.</p>',
        });
        console.log("Test email sent successfully to " + EMAIL_USER);
    } catch (error) {
        console.error("Test failed:", error);
    }
}

test();
