import React, { useState } from 'react';
import { Wand2, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { generateImage } from '../services/geminiService';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "3:4" | "16:9">("3:4");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setError(null);
    try {
      const base64Image = await generateImage(prompt, aspectRatio);
      setGeneratedImage(base64Image);
    } catch (err) {
      setError("图片生成失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `redbook-ai-gen-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 h-full bg-gray-50 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 配图工作台</h1>
          <p className="text-gray-500">描述你想要的画面，AI 将为你生成符合小红书审美的配图。</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
          {/* Controls */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">画面描述 (Prompt)</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-32 p-3 rounded-lg border border-gray-200 resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                placeholder="例如：一杯拿铁咖啡放在木质桌子上，旁边有一本杂志，阳光洒在桌面上，温馨治愈风格..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">图片比例</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: '3:4', label: '3:4', sub: '小红书默认' },
                  { id: '1:1', label: '1:1', sub: '方形' },
                  { id: '16:9', label: '16:9', sub: '横屏' }
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id as any)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      aspectRatio === ratio.id 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-sm font-bold">{ratio.label}</div>
                    <div className="text-[10px] text-gray-400">{ratio.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="mt-4 w-full py-3 bg-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
              {isGenerating ? '正在绘图...' : '生成图片'}
            </button>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </div>

          {/* Preview */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex items-center justify-center relative overflow-hidden bg-checkered">
             {/* Simple checkered background via CSS or inline SVG if needed, using simple gray bg for now */}
             <div className="absolute inset-0 bg-gray-50 opacity-50" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             
             {generatedImage ? (
               <div className="relative group max-h-full max-w-full shadow-2xl rounded-lg overflow-hidden">
                 <img src={generatedImage} alt="Generated" className="max-h-full max-w-full object-contain" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                   <button 
                    onClick={handleDownload}
                    className="p-3 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform shadow-lg"
                   >
                     <Download size={24} />
                   </button>
                 </div>
               </div>
             ) : (
               <div className="text-center text-gray-400 flex flex-col items-center gap-4 relative z-10">
                 <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                   <ImageIcon size={40} className="text-gray-300" />
                 </div>
                 <p>在左侧输入描述，点击生成</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
