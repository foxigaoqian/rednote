import { GoogleGenAI } from "@google/genai";
import { GeneratedContent, PostType, WordCountType, GenerationOptions, Platform } from "../types";

const getAIClient = () => {
  // 优先尝试从 window.process 获取 API Key (适配 index.html 手动注入的情况)
  // 这可以防止构建工具在构建时因找不到环境变量而将 process.env.API_KEY 替换为 undefined
  const apiKey = (typeof window !== 'undefined' && (window as any).process?.env?.API_KEY) || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// 平台特定的 System Prompts
const SYSTEM_PROMPTS: Record<Platform, string> = {
  xiaohongshu: `
你是一名资深小红书内容运营专家。
目标：在不出现广告痕迹的前提下，生成【真实、口语化、有生活感】的笔记。
`,
  wechat: `
你是一名资深微信公众号作者，
擅长撰写逻辑清晰、有观点、有价值密度的原创文章。

你的文章特点：
- 结构完整
- 有思考、有总结
- 不浮夸、不营销
- 偏理性、偏长期价值

文章适合公众号订阅用户阅读与收藏。
`,
  toutiao: `
你是一名今日头条内容创作者，
擅长用通俗易懂的语言解释问题，
内容注重信息量、实用性和大众可读性。

文章适合被算法推荐给广泛用户群体。
`,
  baijiahao: `
你是一名百家号优质内容创作者，
内容风格偏理性、客观、专业，
强调信息准确性和逻辑性。

文章适合搜索和长期收录。
`,
  sohu: `
你是一名搜狐号内容作者，
擅长将专业内容写得通俗、有可读性，
适合普通读者快速理解。

内容强调清晰表达和阅读体验。
`,
  seo: `
你是一名长期为企业官网撰写内容的中文 SEO 编辑，熟悉百度搜索算法，对不同行业的信息型内容表达方式有实践经验。
`
};

export const generateSocialPost = async (
  platform: Platform,
  topic: string,
  extraInfo: string,
  postType: PostType,
  wordCount: WordCountType,
  options: GenerationOptions
): Promise<GeneratedContent> => {
  try {
    const ai = getAIClient();
    const systemPrompt = SYSTEM_PROMPTS[platform] || SYSTEM_PROMPTS.xiaohongshu;
    
    // 图片插入指令 logic
    const imageInsertionPrompt = (options.images && options.images.length > 0) 
      ? `\n【图片插入指令】\n用户提供了 ${options.images.length} 张图片。请在正文中合适的位置（如段落之间）自然插入图片占位符。\n占位符格式严格为：![img](0) , ![img](1) 等，数字代表图片索引（0 到 ${options.images.length - 1}）。\n请根据上下文内容，合理分配这 ${options.images.length} 张图片的位置，不要堆砌在一起。` 
      : '';

    // 基础信息块 (统一输入参数)
    const baseInfo = `
【主题】
${topic}

【内容类型】
${postType}

【目标字数】
${wordCount}

【内容设置】
- 是否添加表情：${options.useEmoji ? '是' : '否'} (请根据平台风格调整浓度)
- 是否添加话题/标签：${options.addHashtags ? '是' : '否'}
- 是否过滤违禁词：${options.filterProhibited ? '是' : '否'}
- 是否过滤营销词：${options.filterMarketing ? '是' : '否'}
- 补充创作信息：${extraInfo || '无'}
${imageInsertionPrompt}
`;

    // 平台特定的 Prompt Body
    let platformBody = "";

    if (platform === 'xiaohongshu') {
      platformBody = `
📌【小红书生成规则】
1️⃣ 自动识别主题所属行业和使用场景  
2️⃣ 内容必须像真实用户分享，不像广告  
3️⃣ 表达自然口语化，多分段，Emoji丰富
`;
    } else if (platform === 'wechat') {
      platformBody = `
【写作要求】

1️⃣ 使用正式但不生硬的中文表达  
2️⃣ 允许适度观点输出  
3️⃣ 不使用网络黑话或过多表情  
4️⃣ 不出现任何引流、营销、联系方式  
5️⃣ 文章需有清晰结构（小标题）  

--------------------------------------

【内容结构要求】

- 引言：提出问题或背景
- 正文：2–4 个小标题，展开分析或经验
- 总结：方法论或建议总结
`;
    } else if (platform === 'toutiao') {
      platformBody = `
【写作要求】

1️⃣ 开头直接点明核心信息  
2️⃣ 语言通俗、偏大众阅读  
3️⃣ 多使用短段落  
4️⃣ 不需要深度学术分析  
5️⃣ 不出现营销或引流内容  

--------------------------------------

【结构建议】

- 开头：一句话点题
- 中段：分点说明（列表或自然分段）
- 结尾：总结 + 提示读者思考
`;
    } else if (platform === 'baijiahao') {
      platformBody = `
【写作要求】

1️⃣ 语气客观、中立  
2️⃣ 逻辑清晰，避免情绪化表达  
3️⃣ 不使用夸张标题党  
4️⃣ 不使用口水化表达  
5️⃣ 不出现营销或承诺性语句  

--------------------------------------

【内容结构】

- 背景说明
- 核心内容分析
- 实用建议或总结
`;
    } else if (platform === 'sohu') {
       platformBody = `
【写作要求】

1️⃣ 语言自然流畅  
2️⃣ 允许适度个人视角  
3️⃣ 段落清晰，阅读轻松  
4️⃣ 不需要强观点输出  
5️⃣ 不出现引流或广告内容  

--------------------------------------

【结构建议】

- 开头：引出话题
- 正文：展开说明
- 结尾：简要总结
`;
    } else if (platform === 'seo') {
      const industry = options.industry || '请根据关键词自动推导所属行业';
      const brand = options.brandName || (extraInfo ? `请从以下补充信息中提取品牌名：${extraInfo}` : '无（保持中立客观视角）');

      platformBody = `
请基于以下信息，生成一篇用于企业官网发布的 SEO 信息型文章：

核心关键词：【${topic}】
行业领域：【${industry}】
品牌名称：【${brand}】

一、SEO 与平台要求
1. 面向百度搜索引擎优化
2. 内容偏信息型、认知型，而非促销页
3. 关键词自然融入标题与正文，不刻意堆砌
4. 结构清晰，适合长期收录
5. 正文长度建议 1200–1800 字
6. 必须包含 SEO Meta Description（放在文章最顶部，以 > Meta Description: 开头）

二、去 AI 痕迹要求
1. 行文需接近人工撰写风格
2. 避免模板化、总结式、列表堆叠
3. 多使用解释型、经验型、因果型表达
4. 语气理性、克制、专业，不夸张

三、行业合规要求（动态适配行业）
1. 内容表达需严格符合关键词所属行业的合规边界
2. 若涉及敏感领域（如医疗、健康、金融、教育等），使用科普、认知、原理、使用场景等中性表述
3. 禁止承诺结果、禁止夸大效果、禁止使用绝对化用语
4. 明确“信息介绍 / 使用参考”属性

四、品牌融入要求
1. 若提供了品牌名称，将其自然融入文章，以“行业实践者 / 经验总结者 / 解决方案提供方”身份出现
2. 不硬广、不促销、不堆品牌名
3. 品牌出现 2–4 次即可，分散在正文不同位置
4. 若无品牌信息，则保持客观行业科普视角

五、文章结构要求（可灵活调整，避免模板感）
- 顶部：> Meta Description: 120字以内，包含核心词，吸引点击
- 引言：从用户常见疑问或认知误区切入【${topic}】
- 关键词相关概念解释（结合行业背景）
- 从行业原理或理论角度解析其价值或意义
- 实际应用或使用场景分析
- 适合人群 / 适用对象 / 使用条件说明
- 理性看待其作用或边界
- 总结：回到关键词，强调理性选择与长期价值

六、输出要求
1. 直接输出完整可发布文章
2. 使用 Markdown 标题结构 (H1/H2/H3)
3. 不解释写作思路
4. 不添加模板化免责声明
`;
    }

    // 组合最终 Prompt
    // 强制添加输出格式控制，以便前端解析 Title 和 Body
    const fullPrompt = `
${baseInfo}

${platformBody}

✅ 最终指令
请直接输出最终可发布的内容。
为了便于系统识别，请务必严格按照以下标记格式输出：

【标题】
(此处写文章标题)

【正文】
(此处写文章正文内容，请根据平台风格排版，支持 Markdown)

${platform === 'xiaohongshu' ? '【话题标签】\n(#话题)' : ''}

不要解释，不要分析，不要额外说明。
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: fullPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const text = response.text || '';
    
    // --- 增强的解析逻辑 ---

    // 1. 分离话题标签（通常在最后，针对小红书）
    const tagsRegex = /(【话题标签】|【话题】|#话题)\s*([\s\S]*)$/;
    const tagsMatch = text.match(tagsRegex);
    let tags = '';
    let mainText = text;

    if (tagsMatch) {
        tags = tagsMatch[2].trim();
        mainText = text.replace(tagsRegex, '').trim();
    }

    let title = '';
    let body = '';

    // 2. 解析标题和正文
    // 尝试匹配标准的 【标题】...【正文】... 结构
    const standardMatch = mainText.match(/【标题】\s*([\s\S]*?)\s*【正文】\s*([\s\S]*)/);

    if (standardMatch) {
        title = standardMatch[1].trim();
        body = standardMatch[2].trim();
    } else {
        // 如果没有匹配到 【正文】 标签，可能模型遗漏了
        // 尝试只匹配 【标题】
        const titleOnlyMatch = mainText.match(/【标题】\s*([\s\S]*)/);
        if (titleOnlyMatch) {
            const contentAfterTitleTag = titleOnlyMatch[1].trim();
            // 假设第一行是标题，剩下的是正文
            const firstLineBreak = contentAfterTitleTag.indexOf('\n');
            if (firstLineBreak > -1) {
                title = contentAfterTitleTag.substring(0, firstLineBreak).trim();
                body = contentAfterTitleTag.substring(firstLineBreak).trim();
            } else {
                // 只有一行内容
                if (contentAfterTitleTag.length < 50) {
                     title = contentAfterTitleTag;
                     body = '';
                } else {
                     title = topic; // 标题太长，可能是正文，使用原主题作为标题
                     body = contentAfterTitleTag;
                }
            }
        } else {
            // 完全没有标签，纯文本
            const lines = mainText.split('\n').filter(l => l.trim());
            if (lines.length > 0) {
                // 如果第一行比较短，当作标题
                if (lines[0].length < 40) {
                    title = lines[0].trim();
                    body = lines.slice(1).join('\n').trim();
                } else {
                    // 第一行很长，说明整个都是正文
                    title = topic;
                    body = mainText;
                }
            }
        }
    }

    // 清理标题中的引号
    title = title.replace(/^["']|["']$/g, '');

    // 重新组合正文和标签
    if (body && tags) {
      body += `\n\n${tags}`;
    } else if (!body && tags) {
        // 只有标签没有正文？极其罕见，可能是解析错误
        // 如果刚才把所有内容都给了 Title，这里修正一下
        if (title.length > 100) {
            body = title + `\n\n${tags}`;
            title = topic;
        } else {
            body = tags;
        }
    }

    return { title, body };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// 保持兼容性，原函数调用新逻辑
export const generateRedBookPost = (
  topic: string,
  extraInfo: string,
  postType: PostType,
  wordCount: WordCountType,
  options: GenerationOptions
) => {
  return generateSocialPost('xiaohongshu', topic, extraInfo, postType, wordCount, options);
};

export const rewriteSection = async (
  content: string,
  instruction: string = "优化这段文字，使其更具吸引力"
): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
    原始内容: "${content}"
    
    修改指令: ${instruction}
    
    请只返回修改后的内容，不要包含任何解释或前缀后缀。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || content;
  } catch (error) {
    console.error("Rewrite Error:", error);
    return content;
  }
};

export const imitateRedBookPost = async (
  originalContent: string,
  targetStyle: string
): Promise<GeneratedContent> => {
  try {
    const ai = getAIClient();
    const prompt = `
    我提供了一篇小红书爆款笔记作为参考。
    请分析它的【结构逻辑】、【情绪钩子】和【行文节奏】，然后用【${targetStyle}】的语气重新创作一篇类似主题的笔记。
    
    注意：不要抄袭原文，而是模仿它的“爆款公式”。内容必须完全原创，适合发布。

    【原文内容】:
    ${originalContent}

    ----------------

    【输出格式要求】:
    严格按照以下格式输出：

    【标题】
    (新标题)

    【正文】
    (新正文内容)

    【话题】
    (新话题标签)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPTS.xiaohongshu, // Keep copycat XHS focused
        temperature: 0.8, 
      }
    });

    const text = response.text || '';
    
    // 使用新的解析逻辑 (简化版)
    let title = ''; 
    let body = '';
    
    const parts = text.split(/【标题】|【正文】|【话题】/).filter(p => p.trim());
    if (parts.length >= 2) {
        title = parts[0].trim();
        body = parts[1].trim();
        if (parts[2]) body += `\n\n${parts[2].trim()}`;
    } else {
        body = text;
        title = "模仿改写";
    }

    return { title, body };
  } catch (error) {
    console.error("Imitate Error:", error);
    throw error;
  }
};

export const extractContentFromText = async (input: string): Promise<string> => {
  try {
    const ai = getAIClient();
    
    // Check if it's a "command" (口令) containing a link
    const hasUrl = /https?:\/\/[^\s]+/.test(input);
    
    let prompt = '';
    let config = {};

    if (hasUrl) {
        prompt = `
        用户提供了一段包含链接的小红书分享口令：
        "${input}"

        请尝试：
        1. 使用 Google Search 工具搜索该链接，获取页面标题和正文。
        2. 如果搜索无法获取完整正文，请提取口令中的现有文字信息作为内容。
        3. 返回整理后的【笔记正文】，不要包含“打开小红书”等干扰词。
        `;
        
        config = {
            tools: [{ googleSearch: {} }],
        };
    } else {
        prompt = `
        请清理以下文本，去除分享口令的干扰词（如“复制”、“打开App”），只保留核心内容：
        "${input}"
        `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: config
    });

    return response.text || input;

  } catch (error) {
    console.error("Extract Error:", error);
    // If search fails or other error, just return input cleaned roughly
    return input.replace(/https?:\/\/[^\s]+/, '').replace(/复制.*打开.*App.*/, '');
  }
};

export const generateImage = async (
  prompt: string,
  aspectRatio: "1:1" | "3:4" | "4:3" | "16:9" = "3:4"
): Promise<string> => {
  try {
    const ai = getAIClient();
    const fullPrompt = `High quality, photorealistic lifestyle photography for social media, Xiaohongshu style aesthetic: ${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};