import { createGateway } from '@ai-sdk/gateway';

const DEFAULT_MODEL = 'google/gemini-2.5-flash-lite';

export function getAIGatewayModel() {
  const apiKey = process.env.AI_GATEWAY_API_KEY?.trim();
  const modelId = process.env.AI_MODEL?.trim() || DEFAULT_MODEL;
  const baseURL = process.env.AI_GATEWAY_BASE_URL?.trim();

  if (!apiKey) {
    return null;
  }

  const gw = createGateway({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });

  return gw(modelId);
}

export function getAIReasoningEffort(): 'low' | 'high' | undefined {
  const effort = process.env.AI_REASONING_EFFORT?.trim().toLowerCase();
  if (effort === 'low' || effort === 'high') {
    return effort;
  }
  return 'low';
}

export function isAIGatewayConfigured(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY?.trim());
}
