import { z } from 'zod';

export const disputeFormSchema = z.object({
  issueType: z.string().min(1, 'Please select an issue type'),

  description: z
    .string()
    .trim()
    .min(30, 'Description must be at least 30 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),

  needFollowUpCall: z.boolean().default(false),
});
