import axios from 'axios';
import { getContentPromptText, getOpenRouterSecrets } from './settings-store';

type ChatMessage = { role: 'system' | 'user'; content: string };

export async function rewriteCaptionWithOpenRouter(original: string): Promise<string> {
  const secrets = getOpenRouterSecrets();
  const instruction = getContentPromptText();
  if (!secrets?.apiKey) {
    throw new Error('Chưa cấu hình OpenRouter (API key) trong Cài đặt.');
  }
  if (!instruction) {
    throw new Error('Chưa cấu hình prompt nội dung trong Cài đặt.');
  }
  return chatCompletion(secrets.apiKey, secrets.modelId, [
    {
      role: 'system',
      content: instruction,
    },
    {
      role: 'user',
      content:
        `Nội dung mô tả gốc của video (có thể rỗng):\n---\n${original || '(không có)'}\n---\nTrả về chỉ một đoạn mô tả mới phù hợp đăng Facebook, không giải thích thêm.`,
    },
  ]);
}

async function chatCompletion(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  const { data } = await axios.post<{
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  }>(
    'https://openrouter.ai/api/v1/chat/completions',
    { model, messages, temperature: 0.7 },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/okfanpage',
        'X-Title': 'okfanpage',
      },
      timeout: 120_000,
      validateStatus: () => true,
    },
  );
  if (data.error?.message) {
    throw new Error(data.error.message);
  }
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('OpenRouter không trả nội dung hợp lệ.');
  }
  return text;
}
