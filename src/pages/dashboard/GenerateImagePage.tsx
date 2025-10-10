import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Sparkles, Download, Eye, Wand2, AlertCircle, CreditCard, Video, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCredits } from '../../hooks/useCredits';
import { supabase } from '../../lib/supabase';
import { generateImages, GeneratedImage } from '../../lib/fal-client';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const GenerateImagePage: React.FC = () => {
  const { user } = useAuth();
  const { userCredits, deductCredits, loading: creditsLoading } = useCredits();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Görsel indirildi!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('İndirme sırasında hata oluştu');
    }
  };

  const handleGenerate = async () => {
    // Prevent multiple simultaneous generations
    if (isGenerating) {
      console.log('⚠️ Generation already in progress');
      return;
    }

    // Validate inputs
    if (!selectedFile || !prompt.trim()) {
      toast.error('Lütfen fotoğraf seçin ve prompt girin');
      return;
    }

    // Check user
    if (!user || !user.email) {
      toast.error('Kullanıcı bilgisi yüklenemedi');
      return;
    }

    console.log('🚀 Starting image generation process');

    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      // Check credit balance
      console.log('💳 Checking credit balance...');
      if (!userCredits || userCredits.credits_balance < 1) {
        toast.error('Krediniz yetersiz, lütfen kredi satın alın.');
        return;
      }

      // Deduct credits locally
      console.log('💳 Deducting credits...');
      const creditSuccess = await deductCredits(1, 'Fotoğraf oluşturma');

      if (!creditSuccess) {
        toast.error('Kredi düşürme işlemi başarısız oldu');
        return;
      }

      console.log('✅ Credits deducted, calling fal.ai API...');

      // Call fal.ai API
      const result = await generateImages({
        prompt: prompt.trim(),
        imageFile: selectedFile,
        numImages: 4,
        outputFormat: 'jpeg'
      });

      console.log('✅ Images generated successfully:', result.images.length);

      setGeneratedImages(result.images);

      // Save to database
      try {
        await saveGeneration('image', 1, {
          prompt: prompt.trim(),
          num_images: 4,
          output_format: 'jpeg'
        }, result.images.map(img => img.url));
        console.log('✅ Generation saved to database');
      } catch (saveError) {
        console.error('⚠️ Failed to save generation to database:', saveError);
      }

      toast.success('4 fotoğraf başarıyla oluşturuldu!');

    } catch (error) {
      console.error('💥 Generation error:', error);

      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          toast.error('API anahtarı hatası. Lütfen sistem yöneticisi ile iletişime geçin.');
        } else if (error.message.includes('Network')) {
          toast.error('İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edin.');
        } else if (error.message.includes('quota')) {
          toast.error('API kullanım limiti aşıldı. Lütfen daha sonra tekrar deneyin.');
        } else {
          toast.error(`Görsel oluşturma hatası: ${error.message}`);
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
            <h1 className="text-3xl font-bold text-gray-900">Fotoğraf Oluştur</h1>
            <p className="text-gray-600 mt-1">Fotoğrafınızı yükleyin ve AI ile yeni görüntüler oluşturun</p>
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
                  Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Görsel için prompt girin (örn: 'a beautiful sunset over mountains', 'make it look like a painting')..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  disabled={isGenerating}
                />
                <p className="text-xs text-gray-500 mt-2">
                  �� İpucu: Prompt'u İngilizce girmek daha iyi sonuçlar verir
                </p>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!selectedFile || !prompt.trim() || isGenerating || creditsLoading}
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
                    4 Fotoğraf Oluştur (1 Kredi)
                  </>
                )}
              </Button>

              {!creditsLoading && userCredits && userCredits.credits_balance < 1 && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Yetersiz Kredi</p>
                    <p className="mt-1">Görsel oluşturmak için en az 1 krediniz olmalıdır.</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Oluşturulan Görseller</h3>
                {generatedImages.length > 0 && (
                  <Badge variant="success">{generatedImages.length} Görsel</Badge>
                )}
              </div>

              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                    <Sparkles className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-gray-600 mt-4 font-medium">AI görseller oluşturuyor...</p>
                  <p className="text-sm text-gray-500 mt-1">Bu işlem 30-60 saniye sürebilir</p>
                </div>
              ) : generatedImages.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {generatedImages.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group"
                      >
                        <img
                          src={image.url}
                          alt={`Generated ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <a
                              href={image.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <Eye className="w-5 h-5 text-gray-900" />
                            </a>
                            <button
                              onClick={() => downloadImage(image.url, `generated-image-${index + 1}.jpg`)}
                              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <Download className="w-5 h-5 text-gray-900" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Video className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Fotoğraflarınız Hazır!</h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Şimdi görsellerinizi video haline getirebilirsiniz
                          </p>
                          <Button
                            onClick={() => navigate('/dashboard/generate-video')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Video Oluştur
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Henüz görsel oluşturulmadı</p>
                  <p className="text-sm text-gray-500 mt-1">Görselleriniz burada görünecek</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};