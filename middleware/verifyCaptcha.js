import axios from "axios";
import env from '../config/env.js';

export const verifyCaptcha = async (req, res, next) => {
  const { captchaToken } = req.body;
  if (!captchaToken) {
    return res.status(400).json({ message: 'Captcha token is required' });
  }
console.log(env.RECAPTCHA_SECRET_KEY);

  try {
    const { data } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: env.RECAPTCHA_SECRET_KEY,
          response: captchaToken,
        },
      }
    );

    if (!data.success) {
      console.log("reCAPTCHA validation failed:", data);
      return res.status(403).json({ message: 'Captcha verification failed' });
    }

    next(); // Proceed to next middleware/controller
  } catch (error) {
    console.error('Error during reCAPTCHA validation:', error);
    return res.status(500).json({ message: 'Internal server error during reCAPTCHA validation' });
  }
};
