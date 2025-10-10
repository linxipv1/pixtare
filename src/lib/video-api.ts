import { fal } from "@fal-ai/client";

const FAL_VIDEO_API_KEY = import.meta.env.VITE_FAL_VIDEO_API_KEY;

interface VideoGenerationParams {
  imageUrl: string;
  prompt: string;
  userId: string;
}

interface VideoGenerationResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
}

export class VideoAPI {
  static async generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResponse> {
    try {
      if (!FAL_VIDEO_API_KEY || FAL_VIDEO_API_KEY === 'your_fal_api_key_here') {
        throw new Error('FAL Video API key is not configured.');
      }

      // Configure fal with video API key
      fal.config({
        credentials: FAL_VIDEO_API_KEY
      });

      // Call fal.ai video generation API
      const result = await fal.subscribe("fal-ai/fast-svd", {
        input: {
          image_url: params.imageUrl,
          prompt: params.prompt,
        },
        logs: true
      });

      return {
        jobId: result.requestId || `video_${Date.now()}`,
        status: 'completed',
        videoUrl: result.data?.video?.url || undefined,
      };
    } catch (error) {
      console.error('Video generation error:', error);
      throw new Error(error instanceof Error ? error.message : 'Video oluşturma başarısız oldu');
    }
  }

  static async checkStatus(jobId: string): Promise<VideoGenerationResponse> {
    try {
      if (!FAL_VIDEO_API_KEY || FAL_VIDEO_API_KEY === 'your_fal_api_key_here') {
        throw new Error('FAL Video API key is not configured.');
      }

      // Configure fal with video API key
      fal.config({
        credentials: FAL_VIDEO_API_KEY
      });

      const status = await fal.queue.status("fal-ai/fast-svd", {
        requestId: jobId,
        logs: true
      });

      return {
        jobId,
        status: status.status === 'COMPLETED' ? 'completed' :
                status.status === 'IN_PROGRESS' ? 'processing' :
                status.status === 'FAILED' ? 'failed' : 'queued',
        videoUrl: status.status === 'COMPLETED' ? (status as any).data?.video?.url : undefined,
      };
    } catch (error) {
      console.error('Status check error:', error);
      throw new Error(error instanceof Error ? error.message : 'Durum kontrolü başarısız oldu');
    }
  }
}
