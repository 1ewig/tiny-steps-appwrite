import { NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { getAIGatewayModel, getAIReasoningEffort } from '@/lib/ai/gateway';
import { ShrinkStepSchema } from '@/lib/ai/schemas';
import { getShrinkStepPrompt } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const stepText = typeof body.stepText === 'string' ? body.stepText.trim() : '';
    const taskTitle = typeof body.taskTitle === 'string' ? body.taskTitle.trim() : 'Task';
    const previousStepText = typeof body.previousStepText === 'string' ? body.previousStepText.trim() : undefined;
    const nextStepText = typeof body.nextStepText === 'string' ? body.nextStepText.trim() : undefined;

    if (!stepText) {
      return NextResponse.json({ error: 'Step text is required' }, { status: 400 });
    }

    console.log(`[API:Shrink] START - Step: "${stepText}" | Task Title: "${taskTitle}"`);

    const model = getAIGatewayModel();
    if (!model) {
      return NextResponse.json(
        { error: 'AI Gateway is not configured' },
        { status: 503 }
      );
    }

    const { system, prompt } = getShrinkStepPrompt(stepText, taskTitle, previousStepText, nextStepText);

    const { output } = await generateText({
      model,
      output: Output.object({ schema: ShrinkStepSchema }),
      system,
      prompt,
      reasoning: getAIReasoningEffort(),
    });

    console.log(
      `[API:Shrink] END (${Date.now() - startTime}ms) - Micro-steps count: ${output.microSteps.length}`
    );

    return NextResponse.json(output);
  } catch (error: any) {
    console.error(`[API:Shrink] ERROR (${Date.now() - startTime}ms):`, error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to shrink step',
      },
      { status: 500 }
    );
  }
}
