
'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing cow health based on a photo.
 * It first checks if the image contains a cow before proceeding with health analysis.
 * Results and suggestions are provided in the user's selected language (English or Nepali).
 *
 * - analyzeCowHealth - A function that takes a photo of a cow and returns an analysis of its body condition and potential health issues.
 * - AnalyzeCowHealthInput - The input type for the analyzeCowHealth function.
 * - AnalyzeCowHealthOutput - The return type for the analyzeCowHealth function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCowHealthInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a cow, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.enum(['en', 'ne']).describe('The language for the response (en for English, ne for Nepali).'),
});
export type AnalyzeCowHealthInput = z.infer<typeof AnalyzeCowHealthInputSchema>;

const AnalyzeCowHealthOutputSchema = z.object({
  isCowDetected: z.boolean().describe('Whether a cow was detected in the image.'),
  bodyConditionScore: z
    .number()
    .optional()
    .describe('The body condition score of the cow (1-5, where 1 is thin and 5 is obese). Only present if a cow is detected.'),
  potentialHealthIssues: z
    .string()
    .describe('A description of any potential health issues identified in the photo, or a message if no cow is detected. This will be in the specified language.'),
  suggestedActionItems: z
    .string()
    .optional()
    .describe('A list of suggested action items for the farmer based on the analysis. Only present if a cow is detected. This will be in the specified language.'),
});
export type AnalyzeCowHealthOutput = z.infer<typeof AnalyzeCowHealthOutputSchema>;

export async function analyzeCowHealth(input: AnalyzeCowHealthInput): Promise<AnalyzeCowHealthOutput> {
  return analyzeCowHealthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCowHealthPrompt',
  input: {schema: AnalyzeCowHealthInputSchema},
  output: {schema: AnalyzeCowHealthOutputSchema},
  prompt: `You are an AI assistant that helps farmers analyze the health of their cows based on photos.
Respond ONLY in the language specified by the '{{language}}' parameter.

Photo: {{media url=photoDataUri}}

Step 1: Determine if the provided photo is of a cow.
- If the photo does NOT clearly show a cow:
  - Set 'isCowDetected' to false.
  - Set 'potentialHealthIssues' to the following message in {{language}}:
    - If {{language}} is 'en': "No cow detected in the image. Please upload a clear photo of a cow for analysis."
    - If {{language}} is 'ne': "फोटोमा गाई भेटिएन। कृपया विश्लेषणको लागि गाईको स्पष्ट फोटो अपलोड गर्नुहोस्।"
  - Leave 'bodyConditionScore' and 'suggestedActionItems' empty or undefined.
  - Do not proceed to Step 2.

- If the photo CLEARLY shows a cow:
  - Set 'isCowDetected' to true.
  - Proceed to Step 2.

Step 2: If a cow is detected, analyze its health and provide the following information IN THE LANGUAGE SPECIFIED BY '{{language}}':
- Body Condition Score: Estimate the Body Condition Score (BCS) of the cow on a scale of 1 to 5, where 1 is emaciated and 5 is obese. If you cannot confidently determine a BCS, leave this field empty or undefined.
- Potential Health Issues: Describe any potential health issues that you can identify from the photo (e.g., swollen udder, lameness, skin lesions). If no issues are apparent, state that the cow appears healthy. This description MUST be in {{language}}.
- Suggested Action Items: Based on your analysis and the BCS, provide specific, actionable advice. This advice MUST be in {{language}}.
  - If BCS is less than 3: "The cow appears thin. Suggest increasing high-quality feed, consider energy-dense supplements. If BCS is very low (e.g., below 2.5), strongly advise consulting a veterinarian or nutritionist for a tailored feeding plan. Emphasize the importance of adequate protein and energy intake for milk production and overall health." (Translate this advice to {{language}}).
  - If BCS is between 3 and 4 (inclusive): "The cow appears to be in good condition. Suggest maintaining current good feeding and management practices. Emphasize continued regular monitoring of health and BCS." (Translate this advice to {{language}}).
  - If BCS is greater than 4: "The cow may be over-conditioned. Suggest gradually adjusting feed intake to prevent excessive weight gain, ensure sufficient exercise if possible, and monitor for signs of metabolic issues. Consult a veterinarian or nutritionist if concerned about over-conditioning or related health problems." (Translate this advice to {{language}}).
  - If BCS could not be determined, but other health issues are identified in 'potentialHealthIssues': Provide relevant action items for those specific issues in {{language}}.
  - If no specific issues are apparent and BCS is in a good range (or cannot be determined but the cow looks generally healthy), a general statement like "Continue routine monitoring and maintain good management practices." (Translate this advice to {{language}}) is suitable.

Provide the output in the specified JSON format. Ensure all textual advice in 'potentialHealthIssues' and 'suggestedActionItems' is in {{language}}.
`,
});

const analyzeCowHealthFlow = ai.defineFlow(
  {
    name: 'analyzeCowHealthFlow',
    inputSchema: AnalyzeCowHealthInputSchema,
    outputSchema: AnalyzeCowHealthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

