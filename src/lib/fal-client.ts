import { fal } from "@fal-ai/client";

const FAL_API_KEY = import.meta.env.VITE_FAL_API_KEY;

// Only configure if API key is available
if (FAL_API_KEY && FAL_API_KEY !== 'your_fal_api_key_here') {
  fal.config({
    credentials: FAL_API_KEY
  });
}

export interface GenerateImagesParams {
  prompt: string;
  imageFile: File;
  numImages?: number;
  outputFormat?: 'jpeg' | 'png';
}

export interface GeneratedImage {
  url: string;
  width: number;
  height: number;
}

export interface GenerateImagesResult {
  images: GeneratedImage[];
  timings: any;
  seed: number;
}

// Upload image to a temporary URL (you might want to use your own image hosting)
async function uploadImageToTempUrl(file: File): Promise<string> {
  // For demo purposes, we'll use a data URL
  // In production, you should upload to a proper image hosting service
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export async function generateImages({
  prompt,
  imageFile,
  numImages = 4,
  outputFormat = 'jpeg'
}: GenerateImagesParams): Promise<GenerateImagesResult> {
  try {
    if (!FAL_API_KEY || FAL_API_KEY === 'your_fal_api_key_here') {
      throw new Error('FAL API key is not configured. Please add your FAL API key to the .env file.');
    }

    // Upload image and get URL
    const imageUrl = await uploadImageToTempUrl(imageFile);
    
    // Call fal.ai API
    const result = await fal.subscribe("fal-ai/nano-banana/edit", {
      input: {
        prompt: prompt,
        image_urls: [imageUrl],
        num_images: numImages,
        output_format: outputFormat
      },
      logs: true
    });

    return {
      images: result.data.images || [],
      timings: result.data.timings,
      seed: result.data.seed
    };
  } catch (error) {
    console.error('Error generating images:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('credentials')) {
        throw new Error('API key configuration error. Please check your FAL API key.');
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      if (error.message.includes('quota') || error.message.includes('limit')) {
        throw new Error('API quota exceeded. Please check your FAL AI account limits.');
      }
    }
    
    throw new Error(`Failed to generate images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export default { generateImages };