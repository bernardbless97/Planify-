import { GoogleGenAI, Type } from "@google/genai";
import type { StudyPlan, ResourceResult, GroundingChunk, StudyTask } from '../types';

const API_KEY = "AIzaSyCCF5ekSZWRK6dq63lhF7aMIsPSmL_cK-Y";

const ai = new GoogleGenAI({ apiKey: API_KEY });

const studyPlanSchema = {
  type: Type.OBJECT,
  properties: {
    plan: {
      type: Type.ARRAY,
      description: "A detailed study plan broken down by day and time.",
      items: {
        type: Type.OBJECT,
        properties: {
          day: {
            type: Type.STRING,
            description: "The day of the week for the study session (e.g., 'Monday')."
          },
          timeSlot: {
            type: Type.STRING,
            description: "The suggested time for the study session (e.g., '9:00 AM - 11:00 AM')."
          },
          subject: {
            type: Type.STRING,
            description: "The subject to be studied."
          },
          topic: {
            type: Type.STRING,
            description: "The specific topic to focus on during the session."
          },
          task: {
            type: Type.STRING,
            description: "A concrete, actionable task for the session (e.g., 'Read Chapter 3 and summarize key points')."
          },
          description: {
              type: Type.STRING,
              description: "A brief, one-paragraph description of the topic and what needs to be covered."
          }
        },
        required: ["day", "timeSlot", "subject", "topic", "task", "description"]
      }
    }
  },
  required: ["plan"]
};

export const generateTaskImage = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `A minimalist, abstract, and aesthetically pleasing image representing the concept of "${prompt}". Use a cool and calming color palette. Should be suitable as a background header.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating task image:", error);
        return null;
    }
};

export const generateStudyPlan = async (subjects: string, deadline: string, hoursPerDay: string, additionalInfo: string): Promise<StudyTask[] | null> => {
  const prompt = `
    Create a detailed study plan for a student who needs to study the following subjects/topics: ${subjects}.
    The deadline is ${deadline}.
    The student can study for approximately ${hoursPerDay} hours per day.
    ${additionalInfo ? `The student has also provided the following specific instructions or notes: "${additionalInfo}". Please incorporate these requests into the plan.` : ''}
    Break down the plan into manageable daily sessions with specific subjects, topics, and actionable tasks. For each task, also provide a short description of what the student should focus on.
    Ensure the plan is realistic and covers all the mentioned subjects before the deadline.
    Prioritize topics that might need more time. Be very specific in the tasks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: studyPlanSchema,
        temperature: 0.7,
      },
    });
    
    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText) as { plan: Omit<StudyTask, 'id' | 'status' | 'progress' | 'subtasks' | 'completedAt' | 'imageUrl'>[] };
    
    const tasksWithImagePromises = parsedJson.plan.map(async (task) => {
        const imagePrompt = `${task.topic}, ${task.subject}`;
        const imageUrl = await generateTaskImage(imagePrompt);
        return {
            ...task,
            imageUrl: imageUrl || undefined,
        };
    });

    const tasksWithImages = await Promise.all(tasksWithImagePromises);

    const tasksWithStatusAndId: StudyTask[] = tasksWithImages.map((task, index) => ({
      ...task,
      id: index,
      status: 'pending' as const,
      progress: 0,
      subtasks: [],
    }));
    
    return tasksWithStatusAndId;

  } catch (error) {
    console.error("Error generating study plan:", error);
    return null;
  }
};

export const generateLearningIdea = async (subject: string, topic: string): Promise<string | null> => {
  const prompt = `
    You are a helpful and creative learning assistant. Your goal is to make complex topics easy and fun to understand.
    For the subject "${subject}" and the topic "${topic}", provide a simple and creative idea to help a student learn it.
    Your response should be one of the following:
    1.  A very simple, easy-to-understand paragraph explaining the core concept.
    2.  A relatable analogy or a real-world example.
    3.  A small, hands-on task or a mini-project suggestion.

    The tone should be encouraging and clear. Format the output for readability.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating learning idea:", error);
    return null;
  }
};

export const findResources = async (query: string): Promise<ResourceResult | null> => {
    const prompt = `
        You are a helpful academic resource assistant. A student is looking for syllabus information.
        Find relevant, high-quality resources (like official PDFs, educational websites, and documents) for the following query: "${query}".
        Provide a brief summary of the information you found and list the key resources.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const summary = response.text.trim();
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
        
        return { summary, sources };

    } catch (error) {
        console.error("Error finding resources:", error);
        return null;
    }
};