import React, { useState, useMemo } from 'react';
import { 
  Copy, ArrowRight, Wand2, Loader2, Link as LinkIcon, RefreshCw, Clipboard,
  Palette, Type, AlignLeft, AlignCenter, AlignRight, Signal, Wifi, Battery,
  ChevronLeft, ChevronRight, Share2, MoreHorizontal, ArrowLeft, Heart, Star,
  Layout, Image as ImageIcon
} from 'lucide-react';
import { imitateRedBookPost, extractContentFromText } from '../services/geminiService';
import { PosterConfig } from '../types';

export const ViralCopycat: React.FC = () => {
  const [inputLink, setInputLink] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [targetStyle, setTargetStyle] = useState('种草风（热情推荐）');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<{title: string, body: string} | null>(null);

  // Poster State
  const [activeTab, setActiveTab] = useState<'text' | 'poster'>('text');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [posterConfig, setPosterConfig] = useState<PosterConfig>({
    bgColor: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
    textColor: '#ffffff',
    fontFamily: 'sans',
    fontSize: 'large',
    align: 'center',
    style: 'bold'
  });

  const styles = [
    '种草风（热情推荐，口语化）',
    '清冷风（极简，高冷，短句）',
    '干货风（专业，逻辑清晰，结构化）',
    '搞笑风（幽默，自嘲，夸张）',
    '故事感（情感共鸣，Vlog叙事）',
  ];

  const bgOptions = [
    'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)', // Pink
    'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', // Blue Green
    'linear-gradient(120deg, #f6d365 0%, #fda085 100%)', // Orange
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    '#ffffff', // White
    '#000000', // Black
    '#F20D0D', // RedBook Red
    '#F5F5F7', // Gray
  ];

  const fontOptions = [
    { id: 'sans', name: '无衬线' },
    { id: 'serif', name: '衬线体' },
    { id: 'mono', name: '等宽' },
  ];

  const handleExtract = async () => {
    if (!inputLink) return;
    setIsExtracting(true);
    try {
        const extracted = await extractContentFromText(inputLink);
        setOriginalContent(extracted);
    } catch (e) {
        console.error(e);
        // Fallback: Just set what we have
        setOriginalContent(inputLink);
    } finally {
        setIsExtracting(false);
    }
  };

  const handleImitate = async () => {
    if (!originalContent) return;
    setIsProcessing(true);
    try {
      const res = await imitateRedBookPost(originalContent, targetStyle);
      setResult(res);
      setCurrentSlideIndex(0); // Reset slide index on new generation
    } catch (e) {
      console.error(e);
      alert('改写失败，请检查网络或 Key 设置');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${result.title}\n\n${result.body}`);
    alert('已复制到剪贴板');
  };

  const slides = useMemo(() => {
    if (!result) return [];
    const slidesArr = [{ type: 'cover', content: result.title }];
    
    const cleanBody = result.body.replace(/#\S+/g, '').trim(); 
    const tags = result.body.match(/#\S+/g)?.join(' ') || '';

    const paragraphs = cleanBody.split('\n').filter(p => p.trim().length > 0);
    
    let currentText = '';
    const MAX_CHARS = 120; 

    paragraphs.forEach(p => {
      if (currentText.length + p.length < MAX_CHARS) {
        currentText += (currentText ? '\n\n' : '') + p;
      } else {
        if (currentText) {
          slidesArr.push({ type: 'content', content: currentText });
        }
        currentText = p; 
      }
    });
    if (currentText) {
       slidesArr.push({ type: 'content', content: currentText });
    }

    if (tags) {
       slidesArr.push({ type: 'tags', content: tags });
    }
    
    return slidesArr;
  }, [result]);

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) setCurrentSlideIndex(p => p + 1);
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) setCurrentSlideIndex(p => p - 1);
  };

  return (
    <div className="flex-1 h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Copy className="text-primary" /> 爆款模仿
          </h1>
          <p className="text-gray-500 mt-1">输入爆款笔记链接或口令，AI 将智能解析内容并为您生成原创同款。</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          
          {/* Left: Input */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            
            {/* Link Input Section */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <LinkIcon size={16} /> 来源链接 / 口令
              </label>
              <div className="flex gap-2">
                <input 
                  value={inputLink}
                  onChange={(e) => setInputLink(e.target.value)}
                  placeholder="粘贴小红书分享链接或口令..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <button 
                  onClick={handleExtract}
                  disabled={isExtracting || !inputLink}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1"
                >
                  {isExtracting ? <Loader2 className="animate-spin" size={14}/> : '智能提取'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                * 支持解析包含链接的分享口令，AI 将尝试联网搜索或从口令文本中提取核心内容。
              </p>
            </div>

            {/* Original Content Area */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-gray-700">原文内容 (AI 参考对象)</label>
                <button 
                  onClick={() => {navigator.clipboard.readText().then(t => setOriginalContent(t))}}
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  <Clipboard size={12}/> 粘贴剪贴板
                </button>
              </div>
              <textarea 
                value={originalContent}
                onChange={(e) => setOriginalContent(e.target.value)}
                placeholder="提取成功后内容将显示在这里，您也可以直接粘贴爆款笔记的正文..."
                className="flex-1 w-full p-3 rounded-lg border border-gray-200 resize-none text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[200px]"
              />
              
              <div className="mt-4 flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">改写风格</label>
                <div className="grid grid-cols-2 gap-2">
                  {styles.map(s => (
                    <button 
                      key={s}
                      onClick={() => setTargetStyle(s)}
                      className={`text-xs py-2 px-2 rounded border transition-all text-left truncate ${targetStyle === s ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleImitate}
                disabled={isProcessing || !originalContent}
                className="mt-4 w-full py-3 bg-primary hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg shadow-red-200/50 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                开始魔法改写
              </button>
            </div>
          </div>

          {/* Right: Output */}
          <div className="w-full lg:w-1/2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
             
             {/* Header with Tabs */}
             <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50 shrink-0">
               <div className="flex bg-gray-200 p-1 rounded-lg">
                 <button 
                   onClick={() => setActiveTab('text')}
                   className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'text' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   文案结果
                 </button>
                 <button 
                   onClick={() => setActiveTab('poster')}
                   className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${activeTab === 'poster' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   <ImageIcon size={12}/> 海报预览
                 </button>
               </div>
               
               <div className="flex gap-2">
                 {result && (
                   <button onClick={handleImitate} className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg" title="重新生成">
                     <RefreshCw size={18} />
                   </button>
                 )}
                 <button onClick={copyResult} className="flex items-center gap-1 px-3 py-1.5 bg-black text-white text-xs rounded-lg hover:opacity-80">
                   <Copy size={14} /> 复制结果
                 </button>
               </div>
             </div>
             
             {/* Content Area */}
             <div className="flex-1 overflow-hidden relative">
               {!result ? (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 bg-gray-50">
                   <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                     <ArrowRight size={32} className="text-gray-300" />
                   </div>
                   <p className="text-sm">在左侧输入原文并点击生成<br/>AI 将为您重写一篇全新的爆款笔记</p>
                 </div>
               ) : (
                 <>
                   {activeTab === 'text' ? (
                     <div className="h-full overflow-y-auto bg-gray-50 p-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-full">
                          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">{result.title}</h3>
                          <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 font-sans">
                            {result.body}
                          </div>
                        </div>
                     </div>
                   ) : (
                     <div className="h-full flex flex-col relative bg-gray-100">
                        {/* Poster Controls */}
                        <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl p-3 shadow-lg w-56 flex flex-col gap-3 max-h-[calc(100%-2rem)] overflow-y-auto">
                            {/* Color */}
                           <div>
                             <label className="text-[10px] font-bold text-gray-500 mb-1 block flex items-center gap-1"><Palette size={10}/> 背景风格</label>
                             <div className="grid grid-cols-5 gap-1.5">
                                {bgOptions.map((bg, idx) => (
                                  <div 
                                    key={idx}
                                    onClick={() => setPosterConfig({...posterConfig, bgColor: bg})}
                                    className={`w-6 h-6 rounded-full cursor-pointer border hover:scale-110 transition-transform ${posterConfig.bgColor === bg ? 'border-primary ring-1 ring-primary' : 'border-gray-200'}`}
                                    style={{ background: bg }}
                                  />
                                ))}
                             </div>
                           </div>
                           
                           {/* Font Size */}
                           <div>
                             <label className="text-[10px] font-bold text-gray-500 mb-1 block flex items-center gap-1"><Type size={10}/> 文字大小</label>
                             <input 
                               type="range" 
                               min="0" max="2" 
                               step="1"
                               value={posterConfig.fontSize === 'normal' ? 0 : posterConfig.fontSize === 'large' ? 1 : 2}
                               onChange={(e) => {
                                 const v = parseInt(e.target.value);
                                 const s = v === 0 ? 'normal' : v === 1 ? 'large' : 'huge';
                                 setPosterConfig({...posterConfig, fontSize: s});
                               }}
                               className="w-full accent-primary h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                             />
                           </div>

                           {/* Alignment */}
                           <div>
                             <label className="text-[10px] font-bold text-gray-500 mb-1 block">对齐方式 (封面)</label>
                             <div className="flex bg-gray-100 p-0.5 rounded-md">
                               {[
                                 { id: 'left', icon: <AlignLeft size={12}/> },
                                 { id: 'center', icon: <AlignCenter size={12}/> },
                                 { id: 'right', icon: <AlignRight size={12}/> }
                               ].map((a) => (
                                 <button
                                   key={a.id}
                                   onClick={() => setPosterConfig({...posterConfig, align: a.id as any})}
                                   className={`flex-1 py-0.5 flex justify-center rounded ${posterConfig.align === a.id ? 'bg-white shadow text-primary' : 'text-gray-400'}`}
                                 >
                                   {a.icon}
                                 </button>
                               ))}
                             </div>
                           </div>

                           {/* Text Color */}
                           <div>
                              <label className="text-[10px] font-bold text-gray-500 mb-1 block">文字颜色</label>
                              <div className="flex gap-1.5">
                                {['#ffffff', '#000000', '#f20d0d', '#ffe600'].map(c => (
                                  <div 
                                     key={c}
                                     onClick={() => setPosterConfig({...posterConfig, textColor: c})}
                                     className={`w-5 h-5 rounded border cursor-pointer ${posterConfig.textColor === c ? 'ring-1 ring-primary ring-offset-1' : ''}`}
                                     style={{ backgroundColor: c }}
                                  />
                                ))}
                              </div>
                           </div>
                        </div>

                        {/* Preview Canvas */}
                        <div className="flex-1 flex justify-center items-center overflow-hidden p-4 relative" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                           <div className="w-[280px] h-[600px] bg-white rounded-[32px] shadow-2xl border-[6px] border-gray-900 relative overflow-hidden flex flex-col shrink-0 scale-90 sm:scale-100 transition-transform">
                              
                              {/* Status Bar */}
                              <div className="h-8 px-5 flex justify-between items-center text-[10px] font-semibold text-black shrink-0 z-20 absolute top-0 w-full">
                                <span>9:41</span>
                                <div className="flex gap-1 items-center">
                                  <Signal size={10} />
                                  <Wifi size={10} />
                                  <Battery size={10} />
                                </div>
                              </div>

                              {/* Nav Bar Overlay */}
                              <div className="absolute top-0 w-full h-14 flex justify-between items-end px-3 pb-2 z-10 bg-gradient-to-b from-black/40 to-transparent pointer-events-none">
                                <ArrowLeft className="text-white" size={20} />
                                <div className="flex gap-3">
                                  <Share2 className="text-white" size={20} />
                                  <MoreHorizontal className="text-white" size={20} />
                                </div>
                              </div>

                              {/* Main Display Area */}
                              <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                                
                                {/* The Slide Image */}
                                <div 
                                  className="w-full aspect-[3/4] relative group cursor-pointer overflow-hidden flex flex-col p-6 transition-all duration-300 shadow-sm shrink-0"
                                  style={{ 
                                    background: posterConfig.bgColor,
                                    color: posterConfig.textColor,
                                    fontFamily: posterConfig.fontFamily === 'serif' ? 'serif' : posterConfig.fontFamily === 'mono' ? 'monospace' : 'sans-serif',
                                    textAlign: currentSlideIndex === 0 ? posterConfig.align : 'left',
                                    justifyContent: currentSlideIndex === 0 ? 'center' : 'flex-start',
                                  }}
                                >
                                   {/* Content Render */}
                                   {slides[currentSlideIndex]?.type === 'cover' ? (
                                     <>
                                        <h1 
                                          className="leading-tight break-words"
                                          style={{ 
                                            fontSize: posterConfig.fontSize === 'normal' ? '24px' : posterConfig.fontSize === 'large' ? '32px' : '40px',
                                            fontWeight: 800,
                                            textShadow: posterConfig.style === 'outline' ? '0px 0px 3px rgba(0,0,0,0.5)' : 'none'
                                          }}
                                        >
                                          {slides[currentSlideIndex].content}
                                        </h1>
                                        <div className={`mt-4 ${posterConfig.align === 'center' ? 'mx-auto' : posterConfig.align === 'right' ? 'ml-auto' : ''} inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-medium border border-white/30`}>
                                            模仿改写
                                        </div>
                                     </>
                                   ) : (
                                     <div className="flex flex-col h-full pt-10"> 
                                        <div className="text-[10px] opacity-60 font-bold mb-3 uppercase tracking-widest border-b border-white/20 pb-1">
                                          P{currentSlideIndex} / {slides.length-1}
                                        </div>
                                        <div 
                                          className="whitespace-pre-wrap leading-relaxed"
                                          style={{
                                            fontSize: posterConfig.fontSize === 'normal' ? '14px' : posterConfig.fontSize === 'large' ? '16px' : '20px',
                                            fontWeight: 500,
                                          }}
                                        >
                                          {slides[currentSlideIndex].content}
                                        </div>
                                     </div>
                                   )}

                                   {/* Nav Controls Overlay */}
                                   <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-start pl-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {currentSlideIndex > 0 && (
                                        <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm">
                                          <ChevronLeft size={16} />
                                        </button>
                                      )}
                                   </div>
                                   <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {currentSlideIndex < slides.length - 1 && (
                                        <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm">
                                          <ChevronRight size={16} />
                                        </button>
                                      )}
                                   </div>

                                   {/* Dots */}
                                   <div className="absolute bottom-3 left-0 w-full flex justify-center gap-1 z-10">
                                      {slides.map((_, idx) => (
                                        <div 
                                          key={idx} 
                                          className={`w-1 h-1 rounded-full transition-all ${idx === currentSlideIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                                        />
                                      ))}
                                   </div>
                                </div>

                                {/* Body Text below image */}
                                <div className="flex-1 overflow-y-auto p-3 bg-white">
                                  <h3 className="text-sm font-bold text-gray-900 mb-1 leading-snug">{result.title}</h3>
                                  <div className="text-[11px] leading-relaxed text-gray-700 whitespace-pre-wrap">
                                    {result.body}
                                  </div>
                                  <hr className="border-gray-100 my-3" />
                                  <div className="flex gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] text-gray-500 font-medium">小红薯</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Bottom Action Bar */}
                                <div className="h-10 bg-white border-t border-gray-100 flex items-center justify-between px-4 shrink-0 absolute bottom-0 w-full z-20">
                                  <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 w-24">
                                    <span className="material-symbols-outlined text-[14px] text-gray-400">edit</span>
                                    <span className="text-[10px] text-gray-400">说点什么...</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Heart className="text-gray-800" size={16} />
                                    <Star className="text-gray-800" size={16} />
                                    <span className="material-symbols-outlined text-[20px] text-gray-800">chat_bubble</span>
                                  </div>
                                </div>

                              </div>
                              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-black/20 rounded-full z-30"></div>
                           </div>
                        </div>
                     </div>
                   )}
                 </>
               )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};