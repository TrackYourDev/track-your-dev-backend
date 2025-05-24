import { Request, Response } from 'express';
import Waitlist from '../models/waitlist.model';
import { errorResponse,successResponse } from "../utils/responseHendler";
import { sendWaitlistEmail } from '../utils/mailer';

export const joinWaitlist = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) return errorResponse(res, 'Email is required', 400);

  try {
    const exists = await Waitlist.findOne({ email });
    if (exists) return errorResponse(res, 'Email already exists in the waitlist', 400);
    const waitlistEntry = await Waitlist.create({ email });
    await sendWaitlistEmail(email);
    return successResponse(res, 'Successfully joined the waitlist', waitlistEntry, 201);
  } catch (err: any) {
    console.error('Waitlist error:', err);
    return errorResponse(res, 'Failed to join the waitlist', 500, err);
  }
};
