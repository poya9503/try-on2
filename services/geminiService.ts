
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import type { ImageFile, ModelType } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractImageFromResponse = (response: GenerateContentResponse): string | null => {
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    return null;
};

export const generateTryOnImage = async (
  characterImage: ImageFile,
  clothingImage: ImageFile
): Promise<string> => {
  const prompt = "Take the person from the first image and the clothing from the second image. Create a new image where the person is wearing the clothing. The background should be simple and neutral. Ensure the result is a photorealistic image of only the person in the new outfit.";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [
        { inlineData: { data: characterImage.base64, mimeType: characterImage.mimeType } },
        { inlineData: { data: clothingImage.base64, mimeType: clothingImage.mimeType } },
        { text: prompt },
      ],
    },
    config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  const imageUrl = extractImageFromResponse(response);
  if (!imageUrl) {
    throw new Error("AI failed to generate an image. Please try again.");
  }
  return imageUrl;
};

export const generateFinalImage = async (
    tryOnImage: ImageFile,
    modelType: ModelType
): Promise<string> => {
    const prompt = `Take the person in the provided image. Replace their face and hair with that of a beautiful ${modelType} model with delicate features and a matching hairstyle. The result must be seamless, with no visible signs of editing or face-swapping. The lighting, skin tone, and head angle must match the original image perfectly to create a completely natural and realistic final photo.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                { inlineData: { data: tryOnImage.base64, mimeType: tryOnImage.mimeType } },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    const imageUrl = extractImageFromResponse(response);
    if (!imageUrl) {
        throw new Error("AI failed to generate the final image. Please try again.");
    }
    return imageUrl;
};
