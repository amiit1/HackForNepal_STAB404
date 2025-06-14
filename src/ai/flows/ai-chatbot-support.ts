
'use server';

/**
 * @fileOverview This file defines a Genkit flow for an AI chatbot that provides support to farmers.
 * It now supports responding in the user's selected language (English or Nepali),
 * handles common greetings, attempts to understand simple follow-up questions,
 * and is restricted to answering questions about cows and agriculture.
 *
 * - aiChatbotSupport - A function that handles the chatbot interaction and provides advice.
 * - AIChatbotSupportInput - The input type for the aiChatbotSupport function.
 * - AIChatbotSupportOutput - The return type for the aiChatbotSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatbotSupportInputSchema = z.object({
  query: z.string().describe('The question asked by the farmer.'),
  language: z.enum(['en', 'ne']).describe('The language for the response (en for English, ne for Nepali).'),
});
export type AIChatbotSupportInput = z.infer<typeof AIChatbotSupportInputSchema>;

const AIChatbotSupportOutputSchema = z.object({
  advice: z.string().describe('The advice provided by the chatbot in response to the farmer’s question, in the specified language.'),
  suggestedVetContact: z.string().optional().describe('The contact of a veterinarian to escalate to if needed, in the specified language.'),
});
export type AIChatbotSupportOutput = z.infer<typeof AIChatbotSupportOutputSchema>;

export async function aiChatbotSupport(input: AIChatbotSupportInput): Promise<AIChatbotSupportOutput> {
  return aiChatbotSupportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatbotSupportPrompt',
  input: {schema: AIChatbotSupportInputSchema},
  output: {schema: AIChatbotSupportOutputSchema},
  prompt: `You are an expert AI assistant for farmers, specializing in cows and agriculture.
Your primary function is to provide helpful advice and information related to these topics ONLY.
Respond ONLY in the language specified by the '{{language}}' parameter.

First, evaluate the user's query: '{{{query}}}'.

1.  **Is it a common greeting?** (e.g., "hello", "hi", "namaste", "good morning", "good evening")
    -   If YES:
        -   Respond with a friendly, general greeting in {{language}}.
            -   If {{language}} is 'en', your 'advice' should be: "Hello! How can I help you with your cow or farming questions today?"
            -   If {{language}} is 'ne', your 'advice' should be: "नमस्ते! आज म तपाईंको गाई वा खेती सम्बन्धी प्रश्नहरूमा कसरी मद्दत गर्न सक्छु?"
        -   Ensure 'suggestedVetContact' is empty or undefined.
        -   Do not proceed to step 2 or 3.

2.  **If not a greeting, does the query seem to be a follow-up question?**
    (e.g., after discussing diseases, the user asks "what are the symptoms for each?", or after discussing feed, "how much should I give?")
    -   If YES, try to answer it in that implied context, assuming relevant prior information about cows or agriculture was exchanged. Your answer must still be strictly related to cows or agriculture.

3.  **Based on the query '{{{query}}}' (and its inferred context if it's a follow-up from step 2), is it related to cows or agriculture?**
    -   If YES (and not a greeting already handled in step 1):
        -   Provide your advice in {{language}}.
        -   If the question (or inferred context) indicates a serious health issue that requires veterinary attention, set the 'suggestedVetContact' field with relevant contact information (e.g., "Contact a local veterinarian immediately." or "तुरुन्तै स्थानीय पशु चिकित्सकलाई सम्पर्क गर्नुहोस्।") in {{language}}. Otherwise, leave 'suggestedVetContact' empty or undefined.
    -   If NO (the query or its inferred context is NOT related to cows or agriculture, AND it's not a greeting):
        -   Politely decline in {{language}}.
            -   If {{language}} is 'ne', your response for 'advice' should be: "माफ गर्नुहोस्, म केवल गाई र कृषि सम्बन्धी प्रश्नहरूको जवाफ दिन सक्छु।"
            -   If {{language}} is 'en', your response for 'advice' should be: "I'm sorry, I can only answer questions related to cows and agriculture."
        -   Do not provide any other information or attempt to answer the out-of-scope question.
        -   Ensure 'suggestedVetContact' field is empty or undefined.

Provide the output in the specified JSON format.
`,
});

const aiChatbotSupportFlow = ai.defineFlow(
  {
    name: 'aiChatbotSupportFlow',
    inputSchema: AIChatbotSupportInputSchema,
    outputSchema: AIChatbotSupportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

