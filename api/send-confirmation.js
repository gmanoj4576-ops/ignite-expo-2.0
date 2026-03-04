import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { teamData } = req.body;

    if (!teamData || !teamData.leaderEmail) {
        return res.status(400).json({ error: 'Missing team data or leader email' });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('SERVER ERROR: EMAIL_USER or EMAIL_PASS environment variables are missing on Vercel.');
        return res.status(500).json({
            error: 'Email configuration missing',
            details: 'Please add EMAIL_USER and EMAIL_PASS to Vercel Environment Variables.'
        });
    }

    try {
        console.log(`ATTEMPTING EMAIL: To ${teamData.leaderEmail} for Team ${teamData.teamName}`);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            // Increase timeout for serverless functions
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
        });

        // Verify connection before sending
        await transporter.verify();
        console.log('Transporter verified: SMTP Connection Successful');

        // Prepare member list for HTML (Safely handle potentially missing members array)
        const members = [
            { name: teamData.leaderName, regNo: teamData.leaderRegNo, email: teamData.leaderEmail, type: 'Leader' },
            ...(teamData.members || []).map(m => ({ ...m, type: 'Member' }))
        ];

        const membersHtml = members.map((member) => `
            <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #1e293b; border-radius: 12px; background-color: #0f172a; color: white;">
                <h3 style="margin: 0 0 5px 0; color: #00D1FF;">${member.name}</h3>
                <p style="margin: 0; font-size: 14px; color: #94a3b8;">${member.type} | Reg No: ${member.regNo}</p>
            </div>
        `).join('');

        const mailOptions = {
            from: `"IEEE IGNITE 2.0" <${process.env.EMAIL_USER}>`,
            to: teamData.leaderEmail,
            subject: `Registration Successful - Team ${teamData.teamName}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 40px; border-radius: 20px;">
                    <h1 style="text-align: center; color: #00D1FF;">IEEE IGNITE 2.0</h1>
                    <p style="text-align: center; font-size: 18px; color: #94a3b8;">Registration Confirmed!</p>
                    
                    <div style="background: linear-gradient(135deg, #00D1FF 0%, #7000FF 100%); padding: 1px; border-radius: 15px; margin: 30px 0;">
                        <div style="background-color: #000; padding: 25px; border-radius: 14px;">
                            <h2 style="margin-top: 0; font-size: 20px;">Team Detail</h2>
                            <p><strong>Team Name:</strong> ${teamData.teamName}</p>
                            <p><strong>Leader:</strong> ${teamData.leaderName}</p>
                        </div>
                    </div>

                    <h2 style="font-size: 20px; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">Registered Members</h2>
                    
                    ${membersHtml}

                    <div style="margin-top: 30px; padding: 20px; background-color: #0f172a; border-radius: 12px; border: 1px dashed #00D1FF;">
                        <p style="margin: 0; color: #00D1FF; font-size: 14px; text-align: center;">
                            Our team will contact you soon with further details about the event schedule and venue.
                        </p>
                    </div>

                    <div style="margin-top: 40px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px dotted #1e293b; padding-top: 20px;">
                        <p>© 2024 IEEE IGNITE 2.0. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('EMAIL SENT SUCCESS:', info.messageId);

        return res.status(200).json({ message: 'Email sent successfully', messageId: info.messageId });
    } catch (error) {
        console.error('CRITICAL EMAIL ERROR:', error);
        return res.status(500).json({
            error: 'Failed to send email',
            details: error.message,
            code: error.code
        });
    }
}
