import { NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { getAIGatewayModel, getAIReasoningEffort } from '@/lib/ai/gateway';
import { TaskBreakdownSchema } from '@/lib/ai/schemas';
import { getBreakdownPrompt } from '@/lib/ai/prompts';
import type { GranularityLevel } from '@/types/task';

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const promptText = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const energyLevel: GranularityLevel = [1, 2, 3].includes(body.energyLevel)
      ? body.energyLevel
      : 2;

    if (!promptText) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (promptText.length > 2000) {
      return NextResponse.json(
        { error: 'Prompt exceeds maximum length of 2000 characters' },
        { status: 400 }
      );
    }

    console.log(
      `[API:Breakdown] START - Prompt length: ${promptText.length} chars | Energy Level: ${energyLevel}`
    );

    const model = getAIGatewayModel();
    if (!model) {
      return NextResponse.json(
        { error: 'AI Gateway is not configured' },
        { status: 503 }
      );
    }

    const { system, prompt } = getBreakdownPrompt(promptText, energyLevel);

    const { output } = await generateText({
      model,
      output: Output.object({ schema: TaskBreakdownSchema }),
      system,
      prompt,
      reasoning: getAIReasoningEffort(),
      abortSignal: req.signal,
    });

    if (output.status === 'refused') {
      console.log(
        `[API:Breakdown] REFUSED (${Date.now() - startTime}ms) - Score: ${output.relevanceScore}/100 | Category: ${output.refusalCategory}`
      );
    } else {
      console.log(
        `[API:Breakdown] ACCEPTED (${Date.now() - startTime}ms) - Score: ${output.relevanceScore}/100 | Steps count: ${output.steps.length}`
      );
    }

    return NextResponse.json(output);
  } catch (error: any) {
    console.error(`[API:Breakdown] ERROR (${Date.now() - startTime}ms):`, error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        error: 'Failed to decompose task. Please try again.',
      },
      { status: 500 }
    );
  }
}
