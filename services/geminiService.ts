import { GoogleGenAI } from "@google/genai";
import { GeneratedContent, PostType, WordCountType, GenerationOptions } from "../types";

const SYSTEM_PROMPT = `
你是一名资深小红书内容运营专家，
长期为不同行业的新媒体运营人员创作真实自然的爆款笔记。

你擅长：
- 种草内容
- 干货分享
- 教程拆解
- 测评对比
- 电商转化型内容

你的目标是：

在不出现广告痕迹的前提下，
生成【真实、口语化、有生活感、适合直接发布到小红书】的笔记内容。

请严格按照用户输入参数生成内容，
不要自行增加未提供的信息。
`;

const getAIClient = () => {
  // 修正 API Key：通常以 AIza 开头 (大写 I)，而不是 Alza (小写 l)
  const apiKey = "AIzaSyCyEh9zoQKKIZ22QeeHmEAENCJ--Rzt3W0";
  
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateRedBookPost = async (
  topic: string,
  extraInfo: string,
  postType: PostType,
  wordCount: WordCountType,
  options: GenerationOptions
): Promise<GeneratedContent> => {
  try {
    const ai = getAIClient();
    
    let prompt = `
【主题】
${topic}

【内容类型】
${postType}
（可选值：种草 / 攻略 / 教程 / 分享 / 电商 / 测评 / 干货 / 任意）

【目标字数】
${wordCount}
（例如：200 / 300 / 500 / 800 / 不限）

【内容设置】
- 是否引用标题：${options.quoteTitle ? '是' : '否'}
- 是否添加表情：${options.useEmoji ? '是' : '否'}
- 是否添加话题标签：${options.addHashtags ? '是' : '否'}
- 是否过滤违禁词：${options.filterProhibited ? '是' : '否'}
- 是否过滤营销词：${options.filterMarketing ? '是' : '否'}
- 是否补充创作信息：${extraInfo ? `是，补充内容：${extraInfo}` : '否'}

--------------------------------------

请根据以上信息生成一篇【完整小红书笔记】，并遵循以下规则：

📌【统一生成规则】
1️⃣ 自动识别主题所属行业和使用场景  
2️⃣ 内容必须像真实用户分享，不像广告  
3️⃣ 不出现“推荐”“转化”“引流”“私信我”等营销词  
4️⃣ 不出现联系方式、价格、二维码  
5️⃣ 表达自然口语化，多分段、多换行  
6️⃣ 每段不超过 60 字  
7️⃣ 整体节奏符合小红书阅读习惯  

------------------------------------------------

【不同类型内容写作要求】

如果类型为：

● 种草：
- 强体验感
- 使用前 vs 使用后
- 情绪明显

● 攻略：
- 明确步骤
- 清晰清单
- 强实操

● 教程：
- Step 1 / 2 / 3
- 小白也能看懂

● 分享：
- 第一人称经历
- 时间线清晰

● 电商：
- 以使用体验为主
- 不出现购买引导

● 测评：
- 优点 / 不足 / 适合人群
- 不拉踩竞品

● 干货：
- 总结型
- 条列输出
- 信息密度高

● 任意：
- 自动选择最适合该主题的类型

🧱【输出结构（非常关键）】
请严格按照以下结构输出内容：

【标题】
一句完整的小红书标题

【正文】
正文内容（符合字数要求）

【话题标签】
#话题1 #话题2 #话题3 #话题4 #话题5

🔥【标题规则】

标题必须满足至少 2 条：

数字型（3 个方法 / 7 天 / 5 个坑）

情绪词（真的、后悔、没想到、太香了）

明确人群（新手 / 打工人 / 学生党）

明确结果（效率提升 / 少走弯路）

😊【表情规则】

若选择「添加表情」：

每 2–3 段插入 1 个 emoji

总数 ≤ 6 个

禁止整段 emoji

#️⃣【话题规则】

若开启「添加话题」：

自动生成 5–8 个话题

包含：

行业词

场景词

人群词

内容形式词

🧹【过滤规则】

若开启：

✅ 过滤违禁词

✅ 过滤营销词

请自动规避以下类型：

最好 / 第一 / 100%有效

加微信 / 私信 / 免费领取

保证效果 / 立刻变现

引流、割韭菜、暴利

🧠【补充创作信息开启时】

可适当补充：

使用场景

背景故事

心理活动

小总结

但禁止虚构数据或收益。

✅ 最终指令
请直接输出最终可发布的小红书笔记内容，
不要解释，不要分析，不要额外说明。
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      }
    });

    const text = response.text || '';
    
    // Improved Regex to handle possible variations in output format
    const titleMatch = text.match(/【标题】\s*([\s\S]*?)(\n\s*【正文】|$)/);
    const bodyMatch = text.match(/【正文】\s*([\s\S]*?)(\n\s*【话题标签】|\n\s*【话题】|$)/);
    const tagsMatch = text.match(/(【话题标签】|【话题】)\s*([\s\S]*)/);

    let title = titleMatch ? titleMatch[1].trim() : '';
    let body = bodyMatch ? bodyMatch[1].trim() : '';
    const tags = tagsMatch ? tagsMatch[2].trim() : '';

    if (body && tags) {
      body += `\n\n${tags}`;
    }

    // Fallback if regex fails but there is text
    if (!title && !body && text) {
        // Try to guess content based on newlines if structure is missing
        const parts = text.split('\n\n');
        if (parts.length >= 2) {
             title = parts[0];
             body = parts.slice(1).join('\n\n');
        } else {
             title = topic;
             body = text;
        }
    }

    return { title, body };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
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
    
    请只返回修改后的内容，不要包含任何解释或前缀后缀。保持小红书的风格（口语化、Emoji）。
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
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.8, 
      }
    });

    const text = response.text || '';
    
    const titleMatch = text.match(/【标题】\s*([\s\S]*?)\s*【正文】/);
    const bodyMatch = text.match(/【正文】\s*([\s\S]*?)\s*【话题】/);
    const tagsMatch = text.match(/【话题】\s*([\s\S]*)/);

    let title = titleMatch ? titleMatch[1].trim() : '';
    let body = bodyMatch ? bodyMatch[1].trim() : '';
    const tags = tagsMatch ? tagsMatch[1].trim() : '';

    if (body && tags) {
      body += `\n\n${tags}`;
    }

    if (!title && !body) {
        return {
            title: "改写结果",
            body: text
        }
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