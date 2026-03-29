'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating product marketing copy.
 *
 * - generateProductMarketingCopy - A function that handles the generation of product descriptions and marketing taglines.
 * - GenerateProductMarketingCopyInput - The input type for the generateProductMarketingCopy function.
 * - GenerateProductMarketingCopyOutput - The return type for the generateProductMarketingCopy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductMarketingCopyInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z
    .string()
    .optional()
    .describe('An existing brief description of the product, if any.'),
  keywords: z.string().describe('Comma-separated keywords describing the product (e.g., elegant, luxury, handmade).'),
  targetAudience: z.string().describe('The primary target audience for the product (e.g., fashion-conscious women aged 25-45).'),
});
export type GenerateProductMarketingCopyInput = z.infer<
  typeof GenerateProductMarketingCopyInputSchema
>;

const GenerateProductMarketingCopyOutputSchema = z.object({
  productDescription: z.string().describe('An engaging and concise product description.'),
  marketingTaglines: z.array(z.string()).describe('An array of 3-5 compelling marketing taglines.'),
});
export type GenerateProductMarketingCopyOutput = z.infer<
  typeof GenerateProductMarketingCopyOutputSchema
>;

export async function generateProductMarketingCopy(
  input: GenerateProductMarketingCopyInput
): Promise<GenerateProductMarketingCopyOutput> {
  return generateProductMarketingCopyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductMarketingCopyPrompt',
  input: {schema: GenerateProductMarketingCopyInputSchema},
  output: {schema: GenerateProductMarketingCopyOutputSchema},
  prompt: `You are a professional marketing copywriter for a premium e-commerce boutique named 'Divine.Co'. Your task is to craft an engaging product description and 3-5 compelling marketing taglines based on the provided product details.

Ensure the tone is feminine, elegant, and appeals to a discerning customer.

Product Name: {{{productName}}}

{{#if productDescription}}
Existing Description: {{{productDescription}}}
{{/if}}

Keywords: {{{keywords}}}

Target Audience: {{{targetAudience}}}

Your output MUST be a JSON object conforming to the following schema, ensuring that the marketingTaglines field is an array of strings:

`,
});

const generateProductMarketingCopyFlow = ai.defineFlow(
  {
    name: 'generateProductMarketingCopyFlow',
    inputSchema: GenerateProductMarketingCopyInputSchema,
    outputSchema: GenerateProductMarketingCopyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
