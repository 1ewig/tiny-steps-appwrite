import { NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { getAIGatewayModel, getAIReasoningEffort } from '@/lib/ai/gateway';
import { ShrinkStepSchema } from '@/lib/ai/schemas';
import { getShrinkStepPrompt, type PromptStepTreeItem } from '@/lib/ai/prompts';

function normalizeStep(step: any, index: number): PromptStepTreeItem {
  return {
    id: typeof step?.id === 'number' ? step.id : index + 1,
    title: typeof step?.title === 'string' ? step.title : undefined,
    text: typeof step?.text === 'string' ? step.text : undefined,
    instruction: typeof step?.instruction === 'string' ? step.instruction : undefined,
    completed: Boolean(step?.completed),
    subSteps: Array.isArray(step?.subSteps)
      ? step.subSteps.map((sub: any, subIndex: number) => ({
          id: typeof sub?.id === 'number' ? sub.id : subIndex + 1,
          title: typeof sub?.title === 'string' ? sub.title : undefined,
          text: typeof sub?.text === 'string' ? sub.text : undefined,
          instruction: typeof sub?.instruction === 'string' ? sub.instruction : undefined,
          completed: Boolean(sub?.completed),
        }))
      : undefined,
  };
}

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const taskTitle = typeof body.taskTitle === 'string' ? body.taskTitle.trim() : 'Task';
    const rawSteps = Array.isArray(body.steps) ? body.steps : [];
    const steps: PromptStepTreeItem[] = rawSteps.map(normalizeStep);
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
      `[API:Shrink] START - Target: "${targetTitle}" | Task Title: "${taskTitle}" | Progress: ${completedCount}/${steps.length}`
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
