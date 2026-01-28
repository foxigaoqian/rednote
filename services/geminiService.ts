import { GoogleGenAI } from "@google/genai";
import { GeneratedContent, PostType, WordCountType, GenerationOptions } from "../types";

const SYSTEM_PROMPT = `
你是一名专业的小红书内容创作者，深度理解小红书推荐算法与内容结构。

你的任务是：
生成“可直接发布的小红书图文笔记内容”。

你必须严格遵守以下规则：

【平台结构】
1. 标题不超过 20 个汉字
2. 内容为真实用户第一视角
3. 禁止出现 AI、模型、生成 等字样
4. 前 3 行必须具有强吸引力
5. 使用短句、空行结构
6. 每段不超过 2 行

【内容风控】
- 不出现营销引导
- 不出现联系方式
- 不出现极限承诺
- 使用经验分享语气

【最终输出格式必须严格如下】

【标题】
xxx

【正文】
xxx

【话题】
#xxx #xxx #xxx
`;

const getAIClient = () => {
  // 直接使用您提供的 API Key，避免浏览器环境中 process 未定义导致崩溃
  const apiKey = "AlzaSyCyEh9zoQKKIZ22QeeHmEAENCJ--Rzt3W0";
  
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
    请根据以下要求创作小红书笔记：
    
    1. 主题/产品名称: ${topic}
    2. 笔记类型: ${postType}
    3. 字数要求: ${wordCount}
    4. 补充信息/核心卖点: ${extraInfo || "无"}
    
    【内容要求】
    `;

    if (options.useEmoji) {
      prompt += `- 必须使用丰富的Emoji表情符号，增加趣味性。\n`;
    } else {
      prompt += `- 尽量少用Emoji。\n`;
    }

    if (options.addHashtags) {
      prompt += `- 结尾必须包含8-15个相关话题标签。\n`;
    } else {
      prompt += `- 结尾不要包含话题标签。\n`;
    }

    if (options.filterProhibited) {
      prompt += `- 严格过滤违禁词，确保内容安全合规。\n`;
    }

    if (options.filterMarketing) {
      prompt += `- 避免过于生硬的营销词汇，使用真实分享的语气。\n`;
    }
    
    if (options.quoteTitle) {
      prompt += `- 正文开头请引用一次标题。\n`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
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
            title: topic,
            body: text
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