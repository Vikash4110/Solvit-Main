import { z } from 'zod';
export const raiseDisputeSchema = z.object({
  bookingId: z
    .string({
      required_error: 'Booking ID is required',
      invalid_type_error: 'Booking ID must be a string',
    })
    .min(1, 'Booking ID is required')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID format'),

  issueType: z.enum(
    [
      'counselor_did_not_join',
      'counselor_joined_late',
      'session_ended_early',
      'session_quality_poor',
      'counselor_not_proper_guidance',
      'counselor_rude_unprofessional',
      'counselor_made_uncomfortable',
      'audio_problem',
      'video_problem',
      'internet_disconnection',
      'other',
    ],
    {
      required_error: 'Please select an issue type',
      invalid_type_error: 'Invalid issue type selected',
    }
  ),

  description: z
    .string({
      required_error: 'Please describe the issue',
      invalid_type_error: 'Description must be text',
    })
    .trim()
    .min(30, 'Description must be at least 30 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),

  needFollowUpCall: z
    .boolean({
      invalid_type_error: 'Follow-up call preference must be true or false',
    })
    .optional()
    .default(false),
});
