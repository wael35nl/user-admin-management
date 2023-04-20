import nodemailer from 'nodemailer';

import dev from "../config/index.js";

export const sendEmailWithNodeMailer = async (emailData) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: dev.app.smtpUserName,
                pass: dev.app.smtpPassword,
            }
        });

        const mailOptions = {
            from: dev.app.smtpUserName,
            to: emailData.email,
            subject: emailData.subject,
            html: emailData.html,
        }

        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('----SMTP ERROR1----');
                console.log(error);
            } else {
                console.log('Message sent: %s', info.response);
            }
        })
    } catch (error) {
        console.log('----SMTP ERROR2----');
        console.log('Problem sending email: ', error);
    }
}