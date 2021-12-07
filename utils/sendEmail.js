const nodemailer = require('nodemailer');
const sendEmail = async (email, subject, text) => {
    require('dotenv').config();

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.USER+"@gmail.com",
                pass: process.env.PASS,
            },
        });
        console.log(process.env.USER, process.env.PASS)
        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text,
        });
        console.log('email sent sucessfully');
    } catch (error) {

        console.log(error, "email not sent");
    }
};

module.exports = sendEmail;