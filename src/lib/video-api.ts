import { fal } from "@fal-ai/client";

const FAL_VIDEO_API_KEY = import.meta.env.VITE_FAL_VIDEO_API_KEY;

interface VideoGenerationParams {
  imageUrl: string;
  prompt?: string;
  duration?: number;
  aspectRatio?: '16:9' | '9:16';
}

interface VideoGenerationResponse {
  videoUrl: string;
  seed?: number;
}

export async function generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResponse> {
  try {
    if (!FAL_VIDEO_API_KEY) {
      throw new Error('FAL Video API key is not configured');
    }

    console.log('🎬 Starting video generation with params:', params);

    fal.config({
      credentials: FAL_VIDEO_API_KEY
    });

    const duration = params.duration || 5;
    const numFrames = duration === 5 ? 81 : duration === 7 ? 113 : 161;

    const result = await fal.subscribe("fal-ai/bytedance/seedance/v1/pro/image-to-video", {
      input: {
        image_url: params.imageUrl,
        prompt: params.prompt || "",
        num_inference_steps: 30,
        guidance_scale: 7.5,
        num_frames: numFrames,
        fps: duration === 5 ? 16 : duration === 7 ? 16 : 16
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
