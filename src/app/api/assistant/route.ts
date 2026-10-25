import { NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { getAIGatewayModel } from '@/lib/ai/gateway';
import { AssistantIntentSchema } from '@/lib/ai/schemas';
import { getAssistantInteractionPrompt } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const taskTitle = typeof body.taskTitle === 'string' ? body.taskTitle.trim() : 'Task';
    const activeSteps = Array.isArray(body.activeSteps) ? body.activeSteps : [];

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const model = getAIGatewayModel();
    if (!model) {
      return NextResponse.json(
        { error: 'AI Gateway is not configured', fallback: true },
        { status: 503 }
      );
    }

    const { system, prompt } = getAssistantInteractionPrompt(message, taskTitle, activeSteps);

    const { output } = await generateText({
      model,
      output: Output.object({ schema: AssistantIntentSchema }),
      system,
      prompt,
      reasoning: 'low',
    });

    return NextResponse.json(output);
  } catch (error: any) {
    console.error('API /api/assistant error:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to process assistant intent',
        fallback: true,
      },
      { status: 500 }
    );
  }
}
