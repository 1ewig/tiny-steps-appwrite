import { NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { getAIGatewayModel } from '@/lib/ai/gateway';
import { ShrinkStepSchema } from '@/lib/ai/schemas';
import { getShrinkStepPrompt } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const stepText = typeof body.stepText === 'string' ? body.stepText.trim() : '';
    const taskTitle = typeof body.taskTitle === 'string' ? body.taskTitle.trim() : 'Task';

    if (!stepText) {
      return NextResponse.json({ error: 'Step text is required' }, { status: 400 });
    }

    const model = getAIGatewayModel();
    if (!model) {
      return NextResponse.json(
        { error: 'AI Gateway is not configured', fallback: true },
        { status: 503 }
      );
    }

    const { system, prompt } = getShrinkStepPrompt(stepText, taskTitle);

    const { output } = await generateText({
      model,
      output: Output.object({ schema: ShrinkStepSchema }),
      system,
      prompt,
    });

    return NextResponse.json(output);
  } catch (error: any) {
    console.error('API /api/shrink error:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to shrink step',
        fallback: true,
      },
      { status: 500 }
    );
  }
}
