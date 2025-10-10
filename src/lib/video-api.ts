import { fal } from "@fal-ai/client";

const FAL_API_KEY = import.meta.env.VITE_FAL_API_KEY;

interface VideoGenerationParams {
  imageUrl: string;
  prompt?: string;
}

interface VideoGenerationResponse {
  videoUrl: string;
  seed?: number;
}

export async function generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResponse> {
  try {
    if (!FAL_API_KEY) {
      throw new Error('FAL API key is not configured');
    }

    console.log('🎬 Starting video generation with params:', params);

    fal.config({
      credentials: FAL_API_KEY
    });

    const result = await fal.subscribe("fal-ai/bytedance/seedance/v1/pro/image-to-video", {
      input: {
        image_url: params.imageUrl,
        prompt: params.prompt || "",
        num_inference_steps: 30,
        guidance_scale: 7.5,
        num_frames: 81,
        fps: 30
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS" && update.logs) {
          update.logs.forEach((log) => console.log('📹 Video generation log:', log.message));
        }
      },
    });

    console.log('✅ Video generation completed:', result);

    if (!result.data?.video?.url) {
      throw new Error('Video URL not found in response');
    }

    return {
      videoUrl: result.data.video.url,
      seed: result.data.seed
    };
  } catch (error) {
    console.error('💥 Video generation error:', error);
    throw new Error(error instanceof Error ? error.message : 'Video generation failed');
  }
}
