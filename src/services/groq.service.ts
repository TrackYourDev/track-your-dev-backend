import { Groq } from 'groq-sdk';
import { IGitHubDiffSummary } from "../types/index.types";

let groq: Groq;

function initialize() {
    if (!groq) {
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }
}

function cleanJsonResponse(text: string): string {
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

export async function analyzeGitHubDiff(diff: string): Promise<IGitHubDiffSummary> {
    try {
        initialize();

        const response = await groq.chat.completions.create({
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
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_completion_tokens: 2048,
            top_p: 1,
            stream: true
        });

        let summaryText = '';
        for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                summaryText += content;
            }
        }

        if (!summaryText) {
            throw new Error("No summary generated from Groq");
        }

        // Clean and ensure proper JSON structure
        const cleanJson = cleanJsonResponse(summaryText);

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
        console.error("Error analyzing GitHub diff with Groq:", error);
        // Return a default summary instead of throwing
        return { summary: "Failed to analyze changes" };
    }
}

export async function generateTasks(summaries: string): Promise<{
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
        initialize();

        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a task analyzer for code changes. Your job is to:
1. Create technical tasks that describe the exact technical changes made
2. Create non-technical tasks by translating those technical changes into user-friendly language

For example:
Technical: "Updated linear gradient CSS from 'linear-gradient(45deg, #2196F3, #E91E63)' to 'linear-gradient(45deg, #FF0000, #00FF00)'"
Non-technical: "Changed button color from blue-pink gradient to red-green gradient"

Another example:
Technical: "Added error handling for API timeout with 30s threshold and exponential backoff"
Non-technical: "Improved app reliability by handling slow network connections better"

Return a JSON object in this EXACT format:
{
  "technicalTasks": [
    {
      "title": "Technical task title",
      "description": "Detailed technical description"
    }
  ],
  "nonTechnicalTasks": [
    {
      "title": "User-friendly task title",
      "description": "Simple description without technical jargon"
    }
  ]
}

IMPORTANT:
- Technical tasks should contain exact technical details
- Non-technical tasks should be understandable by non-technical people
- Both should describe the same changes but in different ways
- Return ONLY the JSON object, no markdown formatting
- Do not include any backticks or code block markers`
                },
                {
                    role: "user",
                    content: summaries
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_completion_tokens: 2048,
            top_p: 1,
            stream: true
        });

        let tasksText = '';
        for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                tasksText += content;
            }
        }

        if (!tasksText) {
            throw new Error("No tasks generated from Groq");
        }

        // Clean and ensure proper JSON structure
        const cleanJson = cleanJsonResponse(tasksText);

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
        console.error("Error generating tasks with Groq:", error);
        // Return empty tasks instead of throwing error
        return {
            technicalTasks: [],
            nonTechnicalTasks: []
        };
    }
} 