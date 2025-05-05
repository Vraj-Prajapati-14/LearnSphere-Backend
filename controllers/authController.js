import { register, login } from '../services/authService.js';
import { sendResponse } from '../utils/response.js';

export const registerController = async (req, res) => {
  try {
    const { user, token } = await register(req.body);
    sendResponse(res, 201, { user: { id: user.id, email: user.email, role: user.role, name: user.name }, token });
  } catch (error) {
    sendResponse(res, 400, null, error.message);
  }
};

export const loginController = async (req, res) => {
  try {
    const { user, token } = await login(req.body);
    sendResponse(res, 200, { user: { id: user.id, email: user.email, role: user.role, name: user.name }, token });
  } catch (error) {
    sendResponse(res, 401, null, error.message);
  }
};

export const validateToken = async (req, res) => {
  try {
    sendResponse(res, 200, { user: req.user });
  } catch (error) {
    sendResponse(res, 401, null, 'Invalid token');
  }
};