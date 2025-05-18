import { Request, Response } from 'express';
import Waitlist from '../models/waitlist.model';
import { Responses } from "../utils/responseHendler";
import { sendWaitlistEmail } from '../utils/mailer';

export const joinWaitlist = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) res.status(400).json(Responses.badRequest('Email is required'));

  try {
    const exists = await Waitlist.findOne({ email });
    if (exists) res.status(400).json(Responses.badRequest('Email already exists in the waitlist'));
    const waitlistEntry = await Waitlist.create({ email });
    await sendWaitlistEmail(email);
    res.status(201).json(Responses.created(waitlistEntry, 'Successfully joined the waitlist'));
  } catch (err: any) {
    console.error('Waitlist error:', err);
    res.status(500).json(Responses.serverError('Failed to join the waitlist', err));
  }
};
