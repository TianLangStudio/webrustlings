
'use server';
/**
 * @fileOverview Provides AI-powered explanations for Rustlings exercises.
 *
 * - explainExercise - A function that generates an explanation for a given exercise.
 * - ExplainExerciseInput - The input type for the explainExercise function.
 * - ExplainExerciseOutput - The return type for the explainExercise function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Exercise } from '@/components/exercise-selector'; // Import the Exercise type
import type {GenerateOptions} from 'genkit/generate';

// Define Zod schema based on the Exercise interface
const ExerciseSchema = z.object({
  id: z.string().describe("The unique identifier for the exercise."),
  name: z.string().describe("The display name of the exercise."),
  category: z.string().describe("The category the exercise belongs to."),
  code: z.string().describe("The initial Rust code provided for the exercise."),
  guide: z.string().describe("The instructional text or guide for the exercise."),
  hints: z.array(z.string()).describe("A list of hints for the exercise."),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe("The difficulty level of the exercise."),
  tags: z.array(z.string()).describe("Keywords or tags associated with the exercise."),
});

// This is the input schema for the prompt object itself
const ExplainExercisePromptInputSchema = z.object({
  exercise: ExerciseSchema.describe("The details of the exercise to be explained."),
  // userCode: z.string().optional().describe("The user's current code for the exercise, if available. This can help the AI provide more tailored feedback."),
});

// This is the input schema for the overall flow, which can include the API key
const ExplainExerciseFlowInputSchema = z.object({
  exercise: ExerciseSchema.describe("The details of the exercise to be explained."),
  userApiKey: z.string().optional().describe("User's API key if provided for this call."),
  // userCode: z.string().optional().describe("The user's current code for the exercise, if available. This can help the AI provide more tailored feedback."),
});
export type ExplainExerciseInput = z.infer<typeof ExplainExerciseFlowInputSchema>;


const ExplainExerciseOutputSchema = z.object({
  explanation: z.string().describe("A detailed explanation of the exercise's concept and goals."),
  howToPass: z.string().describe("Step-by-step guidance or common pitfalls to help the user solve the exercise. Avoid giving the direct answer for non-trivial exercises; guide them instead."),
  learnMore: z.string().describe("Suggestions for further learning, related Rust concepts, or documentation links."),
});
export type ExplainExerciseOutput = z.infer<typeof ExplainExerciseOutputSchema>;

// Exported wrapper function that calls the Genkit flow
export async function explainExercise(input: ExplainExerciseInput): Promise<ExplainExerciseOutput> {
  // Input validation is handled by the flow's inputSchema
  return explainExerciseFlow(input);
}

const explainExerciseLLMPrompt = ai.definePrompt({
  name: 'explainExercisePrompt',
  input: {schema: ExplainExercisePromptInputSchema}, // Prompt takes only exercise details
  output: {schema: ExplainExerciseOutputSchema},
  prompt: `You are an expert Rust programming tutor, similar to the one found in Rustlings. Your goal is to help users understand and solve Rust exercises.
The user is working on the following exercise:
Exercise Name: {{{exercise.name}}}
Category: {{{exercise.category}}}
Difficulty: {{{exercise.difficulty}}}
Tags: {{#if exercise.tags}}{{#each exercise.tags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}N/A{{/if}}

Provided Guide for the exercise:
{{{exercise.guide}}}

Initial Code provided for the exercise:
\`\`\`rust
{{{exercise.code}}}
\`\`\`

Hints available for this exercise:
{{#if exercise.hints}}
{{#each exercise.hints}}
- {{{this}}}
{{/each}}
{{else}}
No specific hints provided for this exercise in the input.
{{/if}}

Based on all this information, please provide the following in a clear, structured, and encouraging manner:
1.  **Explanation**: A clear and concise explanation of the core Rust concepts this exercise is trying to teach. What is the main learning objective?
2.  **How to Pass**: Specific, actionable advice on how to solve this particular exercise. What are the common mistakes users make? What should they focus on in the provided code? *Crucially, for exercises that are not trivial (e.g., more complex than just removing a comment or filling a single blank), do NOT give the direct, complete code answer. Instead, guide them towards the solution by explaining the steps, pointing out relevant parts of the code, or helping them understand the error messages they might encounter. For very simple exercises (like "intro1"), you can be more direct.*
3.  **Learn More**: Suggest related topics, official Rust documentation links (e.g., sections in The Rust Programming Language book, Rust by Example), or other exercises that would reinforce the concepts learned. Provide specific links if possible.

Structure your response clearly with these three distinct sections. Use Markdown for formatting if it helps clarity (e.g., bolding, lists).
{{#if userCode}}
The user has also provided their current code attempt:
\`\`\`rust
{{{userCode}}}
\`\`\`
If their code is provided, you can offer more specific feedback in the "How to Pass" section based on their attempt, focusing on why their approach might be incorrect and guiding them to the correct Rust principles.
{{/if}}
`,
});

const explainExerciseFlow = ai.defineFlow(
  {
    name: 'explainExerciseFlow',
    inputSchema: ExplainExerciseFlowInputSchema, // Flow input includes optional userApiKey
    outputSchema: ExplainExerciseOutputSchema,
  },
  async (flowInput) => {
    const generateOptions: GenerateOptions = {};
    
    if (flowInput.userApiKey) {
      generateOptions.auth = flowInput.userApiKey;
      // Optional: Could adjust safety settings or other model configs if a user key is provided
      // generateOptions.configOverrides = {
      //   safetySettings: [{ category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }],
      // };
    }

    // Prepare the input for the LLM prompt object, which only expects 'exercise' (and potentially 'userCode')
    const promptPayload = {
      exercise: flowInput.exercise,
      // userCode: flowInput.userCode, // if you re-add userCode to the flow input
    };
    
    const {output} = await explainExerciseLLMPrompt(promptPayload, generateOptions);

    if (!output) {
        throw new Error("The AI failed to generate an explanation for the exercise. Please try again.");
    }
    return output;
  }
);
