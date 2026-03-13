require('dotenv').config();
const { Resend } = require('resend');

if (!process.env.RESEND_API_KEY) {
    console.error('❌ NO RESEND_API_KEY found in .env');
    process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);
const toEmail = process.env.EMAIL_TO || 'prafulsonwane58@gmail.com';

async function testEmail() {
    console.log(`🚀 Attempting to send test email to: ${toEmail}`);
    console.log(`Using Key: ${process.env.RESEND_API_KEY.substring(0, 10)}...`);

    try {
        const { data, error } = await resend.emails.send({
            from: 'Kiran Beauty Test <onboarding@resend.dev>',
            to: [toEmail],
            subject: '🧪 Resend API Test — Kiran Beauty Salon',
            html: '<h1>If you see this, your Resend API Key is working!</h1><p>Check your dashboard if you do not see it in your inbox.</p>'
        });

        if (error) {
            console.error('❌ Resend API Error:', error);
            if (error.name === 'validation_error') {
                console.log('\n💡 Tip: Check if you need to verify your email or domain in Resend.dev');
            }
        } else {
            console.log('✅ Success! Email Sent. ID:', data.id);
        }
    } catch (err) {
        console.error('❌ Fatal Error:', err.message);
    }
}

testEmail();
