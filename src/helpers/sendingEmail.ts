import Transporter from "../configurations/mailTransporter";

export const sendResetEmail = async (email: string, resetString: string) => {
  try {
    const mailOptions = {
      to: email,
      subject: "Password Reset Request",
      html: `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333;
        }
        a {
            color: white
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background: #ffffff;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
        }
        p {
            font-size: 16px;
            line-height: 1.5;
            margin: 10px 0;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin: 20px 0;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            text-align: center;
            display: block;
            width: fit-content;
        }
        .footer {
            font-size: 14px;
            color: #777;
            text-align: center;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Password Reset Request</h1>
        <p>Hello,</p>
        <p>You have requested to reset your password. Please use the following link to proceed with resetting your password:</p>
        <a href="http://localhost:8000/resetstring/${resetString}" class="button">Reset Password</a>
        <p>For security reasons, this link will expire in 1 hour. If you did not request this change, please ignore this email.</p>
        <p>Thank you,<br>Your Company Name</p>
        <div class="footer">
            <p>If you have any questions, feel free to contact us at support@yourcompany.com.</p>
        </div>
    </div>
</body>
</html>
      `,
    };
    await Transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};
