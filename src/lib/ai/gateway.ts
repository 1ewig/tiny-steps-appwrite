import { createGateway } from '@ai-sdk/gateway';

const DEFAULT_MODEL = 'minimax/minimax-m3.1-flash';

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

export function isAIGatewayConfigured(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY?.trim());
}
