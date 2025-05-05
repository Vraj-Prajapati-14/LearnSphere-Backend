import { generateToken } from '../config/jwt.js';
import { sendResponse } from '../utils/response.js';
import env from '../config/env.js';

export const googleAuthCallbackController = async (req, res) => {
  try {
    const user = req.user;
    const token = generateToken(user);

    // Redirect to frontend with token in query parameter
    const redirectUrl = `${env.FRONTEND_URL}/auth/google/callback?token=${token}&role=${user.role}`;
    res.redirect(redirectUrl);
  } catch (error) {
    sendResponse(res, 500, null, error.message);
  }
};