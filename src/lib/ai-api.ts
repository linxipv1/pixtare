interface GenerateRequest {
  type: 'image' | 'video';
  productImages: string[];
  model3d?: string;
  style?: string;
  angles?: string[];
  durationSec?: number;
}

interface GenerateResponse {
  jobId: string;
  estimatedCredits: number;
}

interface JobStatus {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  outputs?: string[];
  error?: string;
}

const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL;
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY;

if (!AI_BASE_URL || !AI_API_KEY) {
  throw new Error('Missing AI API environment variables');
}

export class AIService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${AI_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    return response.json();
  }

  static async generateContent(request: GenerateRequest): Promise<GenerateResponse> {
    return this.request<GenerateResponse>('/v1/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  static async getJobStatus(jobId: string): Promise<JobStatus> {
    return this.request<JobStatus>(`/v1/jobs/${jobId}`);
  }
}