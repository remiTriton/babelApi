const nodemailer = require('nodemailer');
const sendEmail = async (email, subject, text) => {
    require('dotenv').config();

    try {
        const transporter = nodemailer.createTransport({
            // host: 'smtp.gmail.com',
            service:'gmail',
            // port: 465,
            // secure: true,
            auth: {
                user: "remitriton@gmail.com",
                pass: "qzpqwvukqtfdpbdg",
            },
        });
        console.log(transporter)
        await transporter.sendMail({
            from: "remitriton@gmail.com",
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