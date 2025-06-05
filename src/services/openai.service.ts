import OpenAI from "openai";
import { IGitHubDiffSummary } from "../types/index.types";

export class OpenAIService {
    private static openai: OpenAI;

    private static initialize() {
        if (!this.openai) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
        }
    }

    private static cleanJsonResponse(text: string): string {
        // First clean any markdown formatting
        let cleaned = text
            .replace(/```json\s*/g, '')
            .replace(/```\s*$/g, '')
            .replace(/```/g, '')
            .replace(/^[\s\n]+|[\s\n]+$/g, '')
            .trim();

        // If the text doesn't start with {, wrap it in a proper JSON structure
        if (!cleaned.startsWith('{')) {
            // If it's just a string, wrap it in a proper summary object
            if (!cleaned.includes('"summary"')) {
                cleaned = `{"summary": ${JSON.stringify(cleaned)}}`;
            } else {
                // If it has summary but no proper JSON structure, fix it
                cleaned = `{${cleaned}}`;
            }
        }

        return cleaned;
    }

    public static async analyzeGitHubDiff(diff: string): Promise<IGitHubDiffSummary> {
        try {
            this.initialize();

            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: `You will be provided with github diffs

A plus icon in starting shows new lines added and a minus sign shows old lines removed or replaced if followed by plus icons

No + or - icon shows untouched code

Your job is to analyze the github diff and provide the summary what has been done by developer.

IMPORTANT:
- Return a JSON object in this EXACT format: {"summary": "your summary here"}
- Do not include any markdown formatting or backticks
- The summary should be a string describing the changes
- Do not include any other fields or formatting`
                    },
                    {
                        role: "user",
                        content: diff
                    }
                ],
                temperature: 0.7,
                max_tokens: 2048,
                top_p: 1,
            });

            const summaryText = response.choices[0]?.message?.content;
            if (!summaryText) {
                throw new Error("No summary generated from OpenAI");
            }

            // Clean and ensure proper JSON structure
            const cleanJson = this.cleanJsonResponse(summaryText);

            try {
                const parsed = JSON.parse(cleanJson);
                
                // Validate the structure
                if (!parsed.summary || typeof parsed.summary !== 'string') {
                    throw new Error("Invalid summary structure");
                }

                return parsed as IGitHubDiffSummary;
            } catch (parseError) {
                console.error("Error parsing summary JSON:", cleanJson);
                // Return a default summary if parsing fails
                return { summary: "Failed to parse changes" };
            }
        } catch (error) {
            console.error("Error analyzing GitHub diff with OpenAI:", error);
            // Return a default summary instead of throwing
            return { summary: "Failed to analyze changes" };
        }
    }

    public static async generateTasks(summaries: string): Promise<{
        technicalTasks: {
            title: string;
            description: string;
        }[];
        nonTechnicalTasks: {
            title: string;
            description: string;
        }[];
    }> {
        try {
            this.initialize();

            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: `You are a task analyzer. Your job is to analyze commit summaries and generate two types of tasks: technical and non-technical.

For each commit summary, identify:
1. Technical tasks: Code-related changes, implementations, fixes, etc.
2. Non-technical tasks: Documentation, communication, planning, etc.

Return a JSON object in this EXACT format:
{
  "technicalTasks": [
    {
      "title": "Task title",
      "description": "Task description"
    }
  ],
  "nonTechnicalTasks": [
    {
      "title": "Task title",
      "description": "Task description"
    }
  ]
}

IMPORTANT:
- Return ONLY the JSON object, no markdown formatting
- Do not include any backticks or code block markers
- Include at least one task in each category if possible
- If no tasks are found in a category, return an empty array`
                    },
                    {
                        role: "user",
                        content: summaries
                    }
                ],
                temperature: 0.7,
                max_tokens: 2048,
                top_p: 1,
            });

            const tasksText = response.choices[0]?.message?.content;
            if (!tasksText) {
                throw new Error("No tasks generated from OpenAI");
            }

            // Clean and ensure proper JSON structure
            const cleanJson = this.cleanJsonResponse(tasksText);

            try {
                const parsedTasks = JSON.parse(cleanJson);
                
                // Validate the structure
                if (!parsedTasks.technicalTasks || !parsedTasks.nonTechnicalTasks) {
                    throw new Error("Invalid task structure");
                }

                // Ensure arrays exist and are properly formatted
                if (!Array.isArray(parsedTasks.technicalTasks)) {
                    parsedTasks.technicalTasks = [];
                }
                if (!Array.isArray(parsedTasks.nonTechnicalTasks)) {
                    parsedTasks.nonTechnicalTasks = [];
                }

                // Validate each task has required fields
                parsedTasks.technicalTasks = parsedTasks.technicalTasks.map((task: { title?: string; description?: string }) => ({
                    title: task.title || "Untitled Task",
                    description: task.description || "No description provided"
                }));

                parsedTasks.nonTechnicalTasks = parsedTasks.nonTechnicalTasks.map((task: { title?: string; description?: string }) => ({
                    title: task.title || "Untitled Task",
                    description: task.description || "No description provided"
                }));

                return parsedTasks;
            } catch (parseError) {
                console.error("Error parsing tasks JSON:", cleanJson);
                // Return empty tasks if parsing fails
                return {
                    technicalTasks: [],
                    nonTechnicalTasks: []
                };
            }
        } catch (error) {
            console.error("Error generating tasks with OpenAI:", error);
            // Return empty tasks instead of throwing error
            return {
                technicalTasks: [],
                nonTechnicalTasks: []
            };
        }
    }
}
