// Email sending is disabled in this version
const sendOtpEmail = async (toEmail, otp) => {
    console.log(`Email disabled. Would have sent OTP ${otp} to ${toEmail}`);
    return true;
};

const sendPasswordResetEmail = async (toEmail, otp) => {
    console.log(`Email disabled. Would have sent Password Reset OTP ${otp} to ${toEmail}`);
    return true;
};

module.exports = {
    sendOtpEmail,
    sendPasswordResetEmail
};
