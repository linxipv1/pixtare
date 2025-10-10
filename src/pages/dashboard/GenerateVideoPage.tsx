import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Upload, Sparkles, Download, Eye, Wand2, AlertCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCredits } from '../../hooks/useCredits';
import { supabase } from '../../lib/supabase';
import { generateVideo } from '../../lib/video-api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import toast from 'react-hot-toast';

export const GenerateVideoPage: React.FC = () => {
  const { user } = useAuth();
  const { userCredits, deductCredits, loading: creditsLoading } = useCredits();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `video-inputs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('generated-content')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('generated-content')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Görsel yüklenirken hata oluştu');
    }
  };

  const downloadVideo = async (videoUrl: string, filename: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Video indirildi!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('İndirme sırasında hata oluştu');
    }
  };

  const handleGenerate = async () => {
    if (isGenerating) {
      console.log('⚠️ Generation already in progress');
      return;
    }

    if (!selectedFile) {
      toast.error('Lütfen fotoğraf seçin');
      return;
    }

    if (!user || !user.email) {
      toast.error('Kullanıcı bilgisi yüklenemedi');
      return;
    }

    console.log('🚀 Starting video generation process');

    setIsGenerating(true);
    setGeneratedVideo('');

    try {
      console.log('💳 Checking credit balance...');
      if (!userCredits || userCredits.credits_balance < 6) {
        toast.error('Krediniz yetersiz, lütfen kredi satın alın.');
        return;
      }

      console.log('💳 Deducting credits...');
      const creditSuccess = await deductCredits(6, 'Video oluşturma');

      if (!creditSuccess) {
        toast.error('Kredi düşürme işlemi başarısız oldu');
        return;
      }

      console.log('✅ Credits deducted, uploading image...');

      const imageUrl = await uploadImageToSupabase(selectedFile);

      console.log('✅ Image uploaded, calling video API...');

      const result = await generateVideo({
        imageUrl,
        prompt: prompt.trim() || undefined
      });

      console.log('✅ Video generated successfully:', result.videoUrl);
      setGeneratedVideo(result.videoUrl);

      try {
        await saveGeneration('video', 6, {
          prompt: prompt.trim() || '',
          seed: result.seed
        }, [result.videoUrl]);
        console.log('✅ Generation saved to database');
      } catch (saveError) {
        console.error('⚠️ Failed to save generation to database:', saveError);
      }

      toast.success('Video başarıyla oluşturuldu!');
    } catch (error) {
      console.error('💥 Video generation error:', error);

      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          toast.error('API anahtarı hatası. Lütfen sistem yöneticisi ile iletişime geçin.');
        } else if (error.message.includes('Network')) {
          toast.error('İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edin.');
        } else if (error.message.includes('quota')) {
          toast.error('API kullanım limiti aşıldı. Lütfen daha sonra tekrar deneyin.');
        } else {
          toast.error(`Video oluşturma hatası: ${error.message}`);
        }
      } else {
        toast.error('Beklenmeyen bir hata oluştu');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const saveGeneration = async (
    type: 'image' | 'video',
    creditsUsed: number,
    parameters: any,
    outputs: string[]
  ) => {
    if (!user) {
      console.warn('User not authenticated, skipping generation save');
      return;
    }

    try {
      const { error } = await supabase
        .from('generations')
        .insert({
          user_id: user.id,
          job_id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type,
          status: 'completed',
          credits_used: creditsUsed,
          parameters,
          outputs
        });

      if (error) {
        console.error('Error saving generation:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to save generation:', error);
      throw error;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Oluştur</h1>
            <p className="text-gray-600 mt-1">Fotoğrafınızı yükleyin ve AI ile video oluşturun</p>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg border border-blue-200">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">
              {creditsLoading ? '...' : userCredits?.credits_balance || 0} Kredi
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fotoğraf Yükle
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    disabled={isGenerating}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      previewUrl
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-gray-100'
                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600 font-medium">Fotoğraf seçmek için tıklayın</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG veya JPEG (Max 10MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt (Opsiyonel)
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Video için prompt girin (örn: 'smooth rotation', 'elegant movement')..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  disabled={isGenerating}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 İpucu: Prompt'u İngilizce girmek daha iyi sonuçlar verir. Boş bırakırsanız otomatik hareket oluşturulur.
                </p>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!selectedFile || isGenerating || creditsLoading}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Video Oluştur (6 Kredi)
                  </>
                )}
              </Button>

              {!creditsLoading && userCredits && userCredits.credits_balance < 6 && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Yetersiz Kredi</p>
                    <p className="mt-1">Video oluşturmak için en az 6 krediniz olmalıdır.</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Oluşturulan Video</h3>
                {generatedVideo && (
                  <Badge variant="success">Video Hazır</Badge>
                )}
              </div>

              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                    <Sparkles className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-gray-600 mt-4 font-medium">AI video oluşturuyor...</p>
                  <p className="text-sm text-gray-500 mt-1">Bu işlem 1-3 dakika sürebilir</p>
                </div>
              ) : generatedVideo ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    <video
                      controls
                      className="w-full h-auto"
                      preload="metadata"
                    >
                      <source src={generatedVideo} type="video/mp4" />
                      Tarayıcınız video oynatmayı desteklemiyor.
                    </video>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => downloadVideo(generatedVideo, 'generated-video.mp4')}
                      className="flex-1"
                      variant="secondary"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Video İndir
                    </Button>
                    <Button
                      onClick={() => window.open(generatedVideo, '_blank')}
                      className="flex-1"
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Tam Ekran
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <Video className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Henüz video oluşturulmadı</p>
                  <p className="text-sm text-gray-500 mt-1">Videonuz burada görünecek</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
