import { z } from 'zod';

export const AdCopySchema = z.object({
    headline: z.string().describe('The main headline of the ad.'),
    subheadline: z.string().describe('The subheadline of the ad.'),
    cta: z.string().describe('The call to action for the ad.'),
});

export type AdCopySchemaType = z.infer<typeof AdCopySchema>;
