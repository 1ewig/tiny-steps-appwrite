import { NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { getAIGatewayModel, getAIReasoningEffort } from '@/lib/ai/gateway';
import { AssistantIntentSchema } from '@/lib/ai/schemas';
import { getAssistantInteractionPrompt, normalizePromptStepTree } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const taskTitle = typeof body.taskTitle === 'string' ? body.taskTitle.trim().slice(0, 500) : 'Task';
    const activeSteps = normalizePromptStepTree(body.activeSteps);

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message exceeds maximum length of 2000 characters' },
        { status: 400 }
      );
    }

    console.log(
      `[API:Assistant/Tweak] START - Message length: ${message.length} chars | Active Steps: ${activeSteps.length}`
    );

    const model = getAIGatewayModel();
    if (!model) {
      return NextResponse.json(
        { error: 'AI Gateway is not configured' },
        { status: 503 }
      );
    }

    const { system, prompt } = getAssistantInteractionPrompt(message, taskTitle, activeSteps);

    const { output } = await generateText({
      model,
      output: Output.object({ schema: AssistantIntentSchema }),
      system,
      prompt,
      reasoning: getAIReasoningEffort(),
      abortSignal: req.signal,
    });

    console.log(
      `[API:Assistant/Tweak] END (${Date.now() - startTime}ms) - Intent Type: "${output.type}"`
    );

    return NextResponse.json(output);
  } catch (error: any) {
    console.error(`[API:Assistant/Tweak] ERROR (${Date.now() - startTime}ms):`, error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        error: 'Failed to process assistant request. Please try again.',
      },
      { status: 500 }
    );
  }
}
