import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronRight, Save, Download, RefreshCw, Copy, 
  Bold, Italic, List, Wand2, ArrowLeft, Share2, 
  MoreHorizontal, Battery, Wifi, Signal, Loader2,
  Heart, Star, Palette, Type, Layout, AlignLeft, AlignCenter, AlignRight,
  Edit2, ChevronLeft, MessageSquare, Newspaper, Feather, Globe, User, CheckCircle2
} from 'lucide-react';
import { GeneratedContent, Template, PosterConfig, PostType, WordCountType, GenerationOptions, Platform } from '../types';
import { generateSocialPost, rewriteSection } from '../services/geminiService';

interface EditorProps {
  initialTemplate?: Template | null;
  onBack: () => void;
  platform?: Platform;
}

// 优化后的 Markdown 渲染组件
const SimpleMarkdownRenderer: React.FC<{ text: string, platform: Platform }> = ({ text, platform }) => {
  if (!text) return null;

  // 将文本按段落分割 (双换行视为分段)
  const paragraphs = text.split(/\n\s*\n/);
  
  // 内联解析函数：处理加粗 **text**
  const renderInline = (str: string) => {
    // 使用非贪婪匹配捕获 **...**
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        // 渲染加粗，去除星号
        return (
          <strong key={idx} className={`font-bold ${platform === 'wechat' ? 'text-[#333]' : 'text-black'}`}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className={`
      ${platform === 'wechat' ? 'text-[16px] text-[#333] leading-[1.8] tracking-wide text-justify font-sans' : ''}
      ${platform === 'toutiao' ? 'text-[18px] text-[#222] leading-[1.6] tracking-normal text-justify font-sans' : ''}
    `}>
      {paragraphs.map((paragraph, idx) => {
        const cleanPara = paragraph.trim();
        if (!cleanPara) return null;

        // 1. 处理标题 (## )
        if (cleanPara.startsWith('##')) {
          const content = cleanPara.replace(/^##\s*/, '');
          if (platform === 'wechat') {
             return (
               <section key={idx} className="mt-8 mb-4">
                 <div className="flex items-center gap-2 mb-2">
                   <div className="w-1 h-4 bg-[#f20d0d] rounded-full"></div>
                   <h3 className="text-[17px] font-bold text-black">{renderInline(content)}</h3>
                 </div>
               </section>
             );
          }
          return <h3 key={idx} className="text-xl font-bold text-black mt-8 mb-3">{renderInline(content)}</h3>;
        }

        // 2. 处理引用 (> )
        if (cleanPara.startsWith('>')) {
          const content = cleanPara.replace(/^>\s*/, '');
          if (platform === 'wechat') {
             return (
               <div key={idx} className="bg-[#f7f7f7] text-[#666] p-4 rounded-md my-4 text-[15px] leading-relaxed border-l-[3px] border-[#ddd]">
                 {renderInline(content)}
               </div>
             );
          }
          return <blockquote key={idx} className="border-l-4 border-gray-300 pl-4 py-1 text-gray-500 my-4 italic">{renderInline(content)}</blockquote>;
        }

        // 3. 处理列表 (- )
        if (cleanPara.startsWith('- ')) {
           const lines = cleanPara.split('\n');
           return (
             <ul key={idx} className="my-4 space-y-2">
               {lines.map((line, lIdx) => {
                 const lineContent = line.replace(/^- \s*/, '');
                 return (
                   <li key={lIdx} className="flex items-start gap-2">
                     <span className="text-gray-400 mt-2 w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0"></span>
                     <span>{renderInline(lineContent)}</span>
                   </li>
                 )
               })}
             </ul>
           )
        }

        // 4. 普通段落
        return (
          <p key={idx} className="mb-6 break-words">
            {renderInline(cleanPara)}
          </p>
        );
      })}
    </div>
  );
};

export const Editor: React.FC<EditorProps> = ({ initialTemplate, onBack, platform = 'xiaohongshu' }) => {
  // Config per platform
  const isXHS = platform === 'xiaohongshu';
  const isWeChat = platform === 'wechat';
  
  const getPlatformConfig = (p: Platform) => {
    switch(p) {
      case 'wechat': return { name: '公众号文章', icon: <MessageSquare size={18}/>, defaultCount: '1000字以上' as WordCountType };
      case 'toutiao': return { name: '今日头条', icon: <Newspaper size={18}/>, defaultCount: '800字左右' as WordCountType };
      case 'baijiahao': return { name: '百家号', icon: <Globe size={18}/>, defaultCount: '800字左右' as WordCountType };
      case 'sohu': return { name: '搜狐号', icon: <Feather size={18}/>, defaultCount: '800字左右' as WordCountType };
      default: return { name: '小红书笔记', icon: <Layout size={18}/>, defaultCount: '不限字数' as WordCountType };
    }
  };

  const platformConfig = getPlatformConfig(platform as Platform);

  // Input State
  const [topic, setTopic] = useState(initialTemplate?.title || '');
  
  // Dynamic Types based on platform
  const getPostTypes = (p: Platform): PostType[] => {
    if (p === 'xiaohongshu') return ['种草', '攻略', '教程', '分享', '电商', '测评', '干货', '任意'];
    if (p === 'wechat') return ['深度观点', '情感故事', '行业资讯', '官方通告', '任意'];
    return ['热点评论', '行业资讯', '深度观点', '科普', '任意'];
  };

  const [postType, setPostType] = useState<PostType>(getPostTypes(platform as Platform)[0]);
  const [wordCount, setWordCount] = useState<WordCountType>(platformConfig.defaultCount);
  const [options, setOptions] = useState<GenerationOptions>({
    quoteTitle: false,
    useEmoji: isXHS, 
    addHashtags: isXHS,
    filterProhibited: true,
    filterMarketing: true,
  });
  
  const [showExtraInfo, setShowExtraInfo] = useState(!!initialTemplate?.description);
  const [extraInfo, setExtraInfo] = useState(initialTemplate?.description || '');

  // Output State
  const [generatedTitle, setGeneratedTitle] = useState('标题将显示在这里');
  const [generatedBody, setGeneratedBody] = useState(`点击左侧“一键生成”按钮，AI 将为您创作${platformConfig.name}...

输入您的主题，即可开始创作！✨`);
  
  // DIY Poster State (Only for XHS)
  const [posterConfig, setPosterConfig] = useState<PosterConfig>({
    bgColor: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
    textColor: '#ffffff',
    fontFamily: 'sans',
    fontSize: 'large',
    align: 'center',
    style: 'bold'
  });

  const [activeTab, setActiveTab] = useState<'content' | 'design'>('design');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  // Constants
  const postTypes = getPostTypes(platform as Platform);
  const wordCounts: WordCountType[] = isXHS 
    ? ['200字左右', '300字左右', '500字左右', '800字左右', '不限字数']
    : ['500字左右', '800字左右', '1000字以上', '2000字以上', '不限字数'];
  
  const bgOptions = [
    'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)', 
    'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', 
    'linear-gradient(120deg, #f6d365 0%, #fda085 100%)', 
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    '#ffffff', 
    '#000000', 
    '#F20D0D', 
    '#F5F5F7', 
  ];

  const fontOptions = [
    { id: 'sans', name: '无衬线', class: 'font-sans' },
    { id: 'serif', name: '衬线体', class: 'font-serif' },
    { id: 'mono', name: '等宽', class: 'font-mono' },
  ];

  // Logic to split content into slides (Mainly for XHS)
  const slides = useMemo(() => {
    const result = [{ type: 'cover', content: generatedTitle }];
    
    const cleanBody = generatedBody.replace(/#\S+/g, '').trim(); 
    const tags = generatedBody.match(/#\S+/g)?.join(' ') || '';

    const paragraphs = cleanBody.split('\n').filter(p => p.trim().length > 0);
    
    let currentText = '';
    const MAX_CHARS = 120; 

    paragraphs.forEach(p => {
      if (currentText.length + p.length < MAX_CHARS) {
        currentText += (currentText ? '\n\n' : '') + p;
      } else {
        if (currentText) {
          result.push({ type: 'content', content: currentText });
        }
        currentText = p; 
      }
    });
    if (currentText) {
       result.push({ type: 'content', content: currentText });
    }

    if (tags) {
       result.push({ type: 'tags', content: tags });
    }
    
    return result;
  }, [generatedTitle, generatedBody]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
        setError("请输入主题");
        return;
    }
    setIsGenerating(true);
    setError(null);
    setCurrentSlideIndex(0); 
    try {
      const result = await generateSocialPost(platform as Platform, topic, extraInfo, postType, wordCount, options);
      setGeneratedTitle(result.title);
      setGeneratedBody(result.body);
    } catch (e: any) {
      console.error(e);
      const errorMsg = e.message || "未知错误";
      if (errorMsg.includes("403")) {
          setError(`API Key 无效或受限 (403). 请检查 Key 是否正确。`);
      } else if (errorMsg.includes("404")) {
          setError(`模型未找到 (404). 请稍后重试。`);
      } else {
          setError(`生成失败: ${errorMsg}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRewrite = async () => {
    setIsRewriting(true);
    try {
      const newBody = await rewriteSection(generatedBody);
      setGeneratedBody(newBody);
    } catch(e) {
      // ignore
    } finally {
      setIsRewriting(false);
    }
  };

  const handleSave = () => {
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleDownload = () => {
    alert(`准备导出 ${slides.length} 张图片... (需集成html2canvas)`);
  };

  const copyContent = () => {
    const fullContent = `${generatedTitle}\n\n${generatedBody}`;
    navigator.clipboard.writeText(fullContent);
    alert('内容已复制到剪贴板！');
  };

  const toggleOption = (key: keyof GenerationOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) setCurrentSlideIndex(p => p + 1);
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) setCurrentSlideIndex(p => p - 1);
  };

  // --- Render Components for Non-XHS Platforms ---

  const WeChatPreview = () => (
    <div className="flex-1 flex justify-center bg-[#f5f5f7] overflow-y-auto">
      <div className="w-full max-w-[480px] bg-white min-h-[800px] shadow-sm relative flex flex-col my-4 lg:my-0 lg:h-full lg:rounded-none lg:shadow-none xl:shadow-sm xl:rounded-none">
        {/* Fake WeChat Nav */}
        <div className="h-12 flex items-center justify-center text-[17px] font-medium text-black relative bg-white shrink-0 border-b border-gray-100">
          <span>公众号预览</span>
          <div className="absolute right-4 top-3 text-black opacity-80"><MoreHorizontal size={22}/></div>
          <div className="absolute left-4 top-3 text-black opacity-80"><ChevronLeft size={24}/></div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-6 pb-20 bg-white">
          <h1 className="text-[22px] font-bold text-[#333] leading-[1.4] mb-4 tracking-wide text-justify">{generatedTitle}</h1>
          
          <div className="flex items-center gap-2 text-[15px] mb-8">
            <span className="text-[#576b95] font-medium tracking-wide">AI创作工作室</span>
            <span className="text-[#b2b2b2] text-sm">2024-05-20</span>
            <span className="text-[#576b95] text-sm ml-2">发表于上海</span>
          </div>
          
          <SimpleMarkdownRenderer text={generatedBody} platform="wechat" />

          <div className="mt-12 pt-6 flex items-center justify-between text-[#888] text-sm mb-4">
             <div className="flex items-center gap-1">阅读 10万+</div>
             <div className="flex items-center gap-6">
               <div className="flex items-center gap-1"><Heart size={18}/> 666</div>
               <div className="flex items-center gap-1"><Star size={18}/> 888</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const NewsPreview = () => (
    <div className="flex-1 flex justify-center bg-[#f4f5f6] overflow-y-auto">
      <div className="w-full max-w-[480px] bg-white min-h-[800px] shadow-sm relative flex flex-col my-4 lg:my-0 lg:h-full">
         {/* Fake News App Nav */}
         <div className="h-12 border-b border-gray-100 flex items-center gap-4 px-4 text-black bg-white shrink-0">
          <ChevronLeft size={24}/>
          <div className="flex-1"></div>
          <Share2 size={20}/>
          <MoreHorizontal size={20}/>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pt-4 pb-20 bg-white">
           <h1 className="text-[24px] font-bold text-[#222] leading-[1.4] mb-4 tracking-tight">{generatedTitle}</h1>
           
           <div className="flex items-center gap-3 mb-6">
             <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <User size={20} className="text-gray-400"/>
             </div>
             <div className="flex flex-col">
                <span className="text-sm font-bold text-[#222]">AI 科技观察</span>
                <span className="text-[11px] text-gray-400">10分钟前 · 优质科技领域创作者</span>
             </div>
             <button className="ml-auto bg-[#f85959] text-white text-[13px] px-4 py-1 rounded-full font-medium">关注</button>
           </div>

           <SimpleMarkdownRenderer text={generatedBody} platform="toutiao" />
           
           <div className="mt-10 flex flex-wrap gap-2">
             {['科技', '人工智能', '大模型', '观点'].map(tag => (
               <span key={tag} className="bg-[#f4f5f6] text-[#666] text-xs px-3 py-1.5 rounded-full">{tag}</span>
             ))}
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span onClick={onBack} className="cursor-pointer hover:text-gray-900">平台</span>
          <ChevronRight size={16} />
          <span className="text-gray-900 font-medium flex items-center gap-2">
            {platformConfig.icon} {platformConfig.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">
            {saveStatus === 'saved' ? '已保存' : '自动保存中...'}
          </span>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Save size={18} />
            {saveStatus === 'saved' ? '已保存' : '保存草稿'}
          </button>
          {isXHS && (
            <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
                <Download size={18} />
                导出图片
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 bg-gray-50">
          
          {/* Left: Input (3 columns) */}
          <div className="col-span-1 lg:col-span-3 flex flex-col h-full bg-white overflow-y-auto">
             <div className="p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-primary material-symbols-outlined">input</span>
                创作参数
              </h2>
            </div>
            <div className="p-5 flex flex-col gap-6">
              
              {/* Main Topic Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  <span className="text-primary mr-1">*</span>主题
                </label>
                <input 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                  placeholder={isXHS ? "例如：iGEM 备赛经验分享" : "例如：2024人工智能行业发展趋势深度解析"}
                />
              </div>

              {/* Type Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <span className="text-primary mr-1">*</span>类型: 
                  <span className="ml-2 text-primary font-medium">{postType}</span>
                </label>
                <div className="flex flex-wrap gap-x-2 gap-y-2">
                  {postTypes.map((type) => (
                    <label key={type} className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border text-xs transition-colors ${postType === type ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="postType" 
                        className="hidden" 
                        checked={postType === type} 
                        onChange={() => setPostType(type)} 
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Word Count Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <span className="text-primary mr-1">*</span>字数:
                  <span className="ml-2 text-primary font-medium">{wordCount}</span>
                </label>
                <div className="flex flex-wrap gap-x-2 gap-y-2">
                  {wordCounts.map((count) => (
                    <label key={count} className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border text-xs transition-colors ${wordCount === count ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="wordCount" 
                        className="hidden" 
                        checked={wordCount === count} 
                        onChange={() => setWordCount(count)} 
                      />
                      <span>
                        {count.replace('字左右', '').replace('不限字数', '不限').replace('字以上', '+')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Content Options */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-gray-700">
                  <span className="text-primary mr-1">*</span>内容:
                </label>
                <div className="flex flex-col gap-2">
                   {/* Option: Quote Title */}
                   <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" checked={options.quoteTitle} onChange={() => toggleOption('quoteTitle')} />
                      <span className="text-sm text-gray-600">正文引用标题</span>
                   </label>

                   {/* Option: Add Emoji */}
                   <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" checked={options.useEmoji} onChange={() => toggleOption('useEmoji')} />
                      <span className="text-sm text-gray-600">添加表情 Emoji</span>
                   </label>

                   {/* Option: Add Hashtags */}
                   {isXHS && (
                   <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" checked={options.addHashtags} onChange={() => toggleOption('addHashtags')} />
                      <span className="text-sm text-gray-600">添加话题标签</span>
                   </label>
                   )}

                   {/* Option: Filter Prohibited */}
                   <label className="flex items-center gap-2 cursor-pointer group opacity-80">
                      <input type="checkbox" className="w-4 h-4 text-gray-400 rounded border-gray-300" checked={options.filterProhibited} readOnly />
                      <span className="text-sm text-gray-500">过滤平台违禁词 (自动)</span>
                   </label>

                   {/* Option: Extra Info */}
                   <div className="flex items-center gap-2 mt-2">
                     <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" checked={showExtraInfo} onChange={() => setShowExtraInfo(!showExtraInfo)} />
                        <span className="text-sm font-medium text-gray-700">补充创作信息</span>
                     </label>
                   </div>
                </div>
              </div>

              {/* Extra Info Textarea (Conditional) */}
              {showExtraInfo && (
                <div className="flex flex-col gap-2 animate-fade-in">
                  <textarea 
                    value={extraInfo}
                    onChange={(e) => setExtraInfo(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" 
                    placeholder="输入更详细的创作要求，如：核心卖点、目标人群、特定场景..."
                  />
                </div>
              )}

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 px-4 bg-primary hover:bg-red-600 disabled:bg-gray-400 text-white font-bold rounded-lg shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                {isGenerating ? '正在创作...' : '一键生成'}
              </button>
              {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
            </div>
          </div>

          {/* Middle: Text Editor (4 columns) - Fixed uniform width for all platforms */}
          <div className="col-span-1 lg:col-span-4 flex flex-col h-full bg-white overflow-y-auto border-t lg:border-t-0 border-gray-200">
            <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10 flex justify-between items-center">
               <h2 className="text-sm font-bold text-gray-900">文案编辑</h2>
               <div className="flex gap-2">
                   <button onClick={handleRewrite} className="text-xs text-primary flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded">
                     <RefreshCw size={12} className={isRewriting ? "animate-spin" : ""} /> AI 润色
                   </button>
                   <button onClick={copyContent} className="text-xs text-gray-500 hover:text-primary flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100">
                     <Copy size={14} /> 复制全文
                   </button>
               </div>
            </div>
            <div className="p-6 flex flex-col gap-4 h-full">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">标题</label>
                <textarea 
                  value={generatedTitle}
                  onChange={(e) => setGeneratedTitle(e.target.value)}
                  className="text-lg font-bold bg-gray-50/50 rounded-lg p-3 border border-transparent focus:bg-white focus:border-primary/20 focus:ring-2 focus:ring-primary/10 w-full outline-none resize-none h-16 transition-all" 
                  placeholder="标题..."
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-gray-400">正文内容 (支持 Markdown)</label>
                   {platform === 'wechat' && <span className="text-[10px] text-orange-500 bg-orange-50 px-2 py-0.5 rounded">提示：**内容** 会在预览中变粗</span>}
                </div>
                <textarea 
                  value={generatedBody}
                  onChange={(e) => setGeneratedBody(e.target.value)}
                  className="flex-1 w-full bg-gray-50/50 rounded-lg p-4 border border-transparent focus:bg-white focus:border-primary/20 focus:ring-2 focus:ring-primary/10 text-[15px] leading-relaxed text-gray-800 resize-none font-sans outline-none font-mono transition-all" 
                  spellCheck={false}
                  placeholder="此处支持显示 Markdown 语法，右侧预览将实时渲染效果..."
                />
              </div>
            </div>
          </div>

          {/* Right: Preview Column (5 columns) */}
          <div className="col-span-1 lg:col-span-5 flex flex-col h-full bg-gray-100 relative overflow-hidden">
            
            {/* Conditional Rendering based on Platform */}
            {isXHS ? (
              <>
              {/* Toolbar for XHS */}
              <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-center px-4 gap-6 shrink-0 z-20">
                <button 
                  onClick={() => setActiveTab('design')}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'design' ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  <Palette size={18} />
                  图片设计
                </button>
                <div className="w-px h-4 bg-gray-300"></div>
                <button 
                  onClick={() => setActiveTab('content')}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'content' ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  <Layout size={18} />
                  预览效果
                </button>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* DIY Controls Overlay */}
                {activeTab === 'design' && (
                  <div className="absolute top-4 left-4 z-30 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl p-4 shadow-lg w-64 flex flex-col gap-4 max-h-[calc(100%-2rem)] overflow-y-auto animate-slide-in-left">
                     {/* Background Color */}
                     <div>
                       <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center gap-1"><Palette size={12}/> 背景颜色</label>
                       <div className="grid grid-cols-4 gap-2">
                          {bgOptions.map((bg, idx) => (
                            <div 
                              key={idx}
                              onClick={() => setPosterConfig({...posterConfig, bgColor: bg})}
                              className={`w-10 h-10 rounded-full cursor-pointer border-2 transition-all ${posterConfig.bgColor === bg ? 'border-primary scale-110 shadow' : 'border-transparent hover:border-gray-300'}`}
                              style={{ background: bg }}
                            />
                          ))}
                       </div>
                     </div>

                     {/* Font Family */}
                     <div>
                       <label className="text-xs font-bold text-gray-500 mb-2 block flex items-center gap-1"><Type size={12}/> 字体风格</label>
                       <div className="flex gap-2">
                         {fontOptions.map((f) => (
                           <button
                             key={f.id}
                             onClick={() => setPosterConfig({...posterConfig, fontFamily: f.id as any})}
                             className={`flex-1 py-1.5 text-xs rounded border ${posterConfig.fontFamily === f.id ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200'}`}
                           >
                             {f.name}
                           </button>
                         ))}
                       </div>
                     </div>

                     {/* Font Size */}
                     <div>
                       <label className="text-xs font-bold text-gray-500 mb-2 block">文字大小 (全局)</label>
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
                         className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                       />
                     </div>

                     {/* Alignment */}
                     <div>
                       <label className="text-xs font-bold text-gray-500 mb-2 block">对齐方式 (封面)</label>
                       <div className="flex bg-gray-100 p-1 rounded-lg">
                         {[
                           { id: 'left', icon: <AlignLeft size={16}/> },
                           { id: 'center', icon: <AlignCenter size={16}/> },
                           { id: 'right', icon: <AlignRight size={16}/> }
                         ].map((a) => (
                           <button
                             key={a.id}
                             onClick={() => setPosterConfig({...posterConfig, align: a.id as any})}
                             className={`flex-1 py-1 flex justify-center rounded ${posterConfig.align === a.id ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                           >
                             {a.icon}
                           </button>
                         ))}
                       </div>
                     </div>

                     {/* Text Color */}
                     <div>
                        <label className="text-xs font-bold text-gray-500 mb-2 block">文字颜色</label>
                        <div className="flex gap-2">
                          {['#ffffff', '#000000', '#f20d0d', '#ffe600'].map(c => (
                            <div 
                               key={c}
                               onClick={() => setPosterConfig({...posterConfig, textColor: c})}
                               className={`w-8 h-8 rounded border cursor-pointer ${posterConfig.textColor === c ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                               style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                     </div>
                  </div>
                )}

                {/* Phone Preview Area */}
                <div className="flex-1 flex justify-center items-center overflow-y-auto p-8 relative" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                   <div className="w-[320px] h-[680px] bg-white rounded-[40px] shadow-2xl border-[8px] border-gray-900 relative overflow-hidden flex flex-col shrink-0">
                      {/* Phone Status Bar & Nav Bar */}
                      <div className="h-10 px-6 flex justify-between items-center text-xs font-semibold text-black shrink-0 z-20 bg-transparent absolute top-0 w-full">
                        <span>9:41</span>
                        <div className="flex gap-1.5 items-center">
                          <Signal size={14} />
                          <Wifi size={14} />
                          <Battery size={14} />
                        </div>
                      </div>
                      <div className="absolute top-0 w-full h-16 flex justify-between items-end px-4 pb-2 z-10 bg-gradient-to-b from-black/50 to-transparent">
                        <ArrowLeft className="text-white cursor-pointer" size={24} />
                        <div className="flex gap-4">
                          <Share2 className="text-white cursor-pointer" size={24} />
                          <MoreHorizontal className="text-white cursor-pointer" size={24} />
                        </div>
                      </div>

                      <div className="flex-1 overflow-hidden bg-white relative flex flex-col">
                        {/* Image/Slide Render */}
                        <div 
                          className="w-full aspect-[3/4] relative group cursor-pointer overflow-hidden flex flex-col p-8 transition-all duration-300 shadow-md shrink-0"
                          style={{ 
                            background: posterConfig.bgColor,
                            color: posterConfig.textColor,
                            fontFamily: posterConfig.fontFamily === 'serif' ? 'serif' : posterConfig.fontFamily === 'mono' ? 'monospace' : 'sans-serif',
                            textAlign: currentSlideIndex === 0 ? posterConfig.align : 'left',
                            justifyContent: currentSlideIndex === 0 ? 'center' : 'flex-start',
                          }}
                        >
                           {/* Content Rendering Logic */}
                           {slides[currentSlideIndex]?.type === 'cover' ? (
                             <>
                                <h1 
                                  className="leading-tight break-words"
                                  style={{ 
                                    fontSize: posterConfig.fontSize === 'normal' ? '28px' : posterConfig.fontSize === 'large' ? '36px' : '48px',
                                    fontWeight: 800,
                                    textShadow: posterConfig.style === 'outline' ? '0px 0px 3px rgba(0,0,0,0.5)' : 'none'
                                  }}
                                >
                                  {slides[currentSlideIndex].content}
                                </h1>
                                {/* Tag */}
                                <div className={`mt-6 ${posterConfig.align === 'center' ? 'mx-auto' : posterConfig.align === 'right' ? 'ml-auto' : ''} inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium border border-white/30`}>
                                    {topic || '小红书笔记'}
                                </div>
                             </>
                           ) : (
                             <div className="flex flex-col h-full pt-12"> 
                                {/* Small header for content slides */}
                                <div className="text-xs opacity-60 font-bold mb-4 uppercase tracking-widest border-b border-white/20 pb-2">
                                  {topic} • {currentSlideIndex}/{slides.length-1}
                                </div>
                                <div 
                                  className="whitespace-pre-wrap leading-relaxed"
                                  style={{
                                    fontSize: posterConfig.fontSize === 'normal' ? '16px' : posterConfig.fontSize === 'large' ? '18px' : '22px',
                                    fontWeight: 500,
                                  }}
                                >
                                  {slides[currentSlideIndex].content}
                                </div>
                             </div>
                           )}
                           
                           {/* Controls */}
                           <div className="absolute inset-y-0 left-0 w-16 flex items-center justify-start pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {currentSlideIndex > 0 && (
                                <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm">
                                  <ChevronLeft size={20} />
                                </button>
                              )}
                           </div>
                           <div className="absolute inset-y-0 right-0 w-16 flex items-center justify-end pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {currentSlideIndex < slides.length - 1 && (
                                <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm">
                                  <ChevronRight size={20} />
                                </button>
                              )}
                           </div>

                           {/* Dots */}
                           <div className="absolute bottom-4 left-0 w-full flex justify-center gap-1.5 z-10">
                              {slides.map((_, idx) => (
                                <div 
                                  key={idx} 
                                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentSlideIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                                />
                              ))}
                           </div>
                        </div>

                        {/* Remaining Text Body */}
                        <div className="flex-1 overflow-y-auto p-4 pt-3 bg-white">
                          <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">{generatedTitle}</h3>
                          <div className="text-[13px] leading-relaxed text-gray-800 font-normal whitespace-pre-wrap">
                            {generatedBody}
                          </div>
                          <div className="mt-2 text-xs text-gray-400">
                            刚刚 发布于 上海
                          </div>
                          <hr className="border-gray-100 my-4" />
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs text-gray-500 font-medium">小红薯</span>
                              <p className="text-[13px] text-gray-800">这排版太好看了！</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Bottom Action Bar */}
                      <div className="h-14 bg-white border-t border-gray-100 flex items-center justify-between px-6 shrink-0 absolute bottom-0 w-full z-20">
                        <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 w-32">
                          <span className="material-symbols-outlined text-[18px] text-gray-400">edit</span>
                          <span className="text-xs text-gray-400">说点什么...</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <Heart className="text-gray-800" size={20} />
                          <Star className="text-gray-800" size={20} />
                          <span className="material-symbols-outlined text-[24px] text-gray-800">chat_bubble</span>
                        </div>
                      </div>
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full z-30"></div>
                   </div>
                </div>
              </div>
              </>
            ) : isWeChat ? (
               <WeChatPreview />
            ) : (
               <NewsPreview />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};