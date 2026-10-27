import { NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { getAIGatewayModel, getAIReasoningEffort } from '@/lib/ai/gateway';
import { ShrinkStepSchema } from '@/lib/ai/schemas';
import { getShrinkStepPrompt, normalizePromptStepTree, type PromptStepTreeItem } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const taskTitle = typeof body.taskTitle === 'string' ? body.taskTitle.trim().slice(0, 500) : 'Task';
    const steps: PromptStepTreeItem[] = normalizePromptStepTree(body.steps);
    const targetStepIndex = Number.isInteger(body.targetStepIndex)
      ? body.targetStepIndex
      : -1;

    if (steps.length === 0) {
      return NextResponse.json({ error: 'Steps are required' }, { status: 400 });
    }

    if (targetStepIndex < 0 || targetStepIndex >= steps.length) {
      return NextResponse.json({ error: 'Invalid target step index' }, { status: 400 });
    }

    const targetStep = steps[targetStepIndex];
    const targetTitle = targetStep.title?.trim() || targetStep.text?.trim() || '';
    if (!targetTitle) {
      return NextResponse.json({ error: 'Target step is required' }, { status: 400 });
    }

    const completedCount = steps.filter((step) => step.completed).length;
    console.log(
      `[API:Shrink] START - Steps: ${steps.length} | Completed: ${completedCount} | Target Index: ${targetStepIndex}`
    );

    const model = getAIGatewayModel();
    if (!model) {
      return NextResponse.json(
        { error: 'AI Gateway is not configured' },
        { status: 503 }
      );
    }

    const { system, prompt } = getShrinkStepPrompt(taskTitle, steps, targetStepIndex);

    const { output } = await generateText({
      model,
      output: Output.object({ schema: ShrinkStepSchema }),
      system,
      prompt,
      reasoning: getAIReasoningEffort(),
      abortSignal: req.signal,
    });

    console.log(
      `[API:Shrink] END (${Date.now() - startTime}ms) - Micro-steps count: ${output.microSteps.length}`
    );

    return NextResponse.json(output);
  } catch (error: any) {
    console.error(`[API:Shrink] ERROR (${Date.now() - startTime}ms):`, error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        error: 'Failed to shrink step. Please try again.',
      },
      { status: 500 }
    );
  }
}
