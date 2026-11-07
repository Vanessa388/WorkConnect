const { sendContactMessage } = require('../utils/emailService');

exports.createContactMessage = async (req, res) => {
  try {
    const {
      name = '',
      email = '',
      phone = '',
      subject = '',
      message = '',
    } = req.body;

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required.',
      });
    }

    const result = await sendContactMessage({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    if (!result.success) {
      return res.status(502).json({
        success: false,
        message: 'The message could not be delivered. Please try again later.',
        emailError: result.error || result.reason || null,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully.',
    });
  } catch (err) {
    console.error('Contact message error:', err.message);
    res.status(500).json({ success: false, message: 'Could not process your message.' });
  }
};
