import { NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { getAIGatewayModel } from '@/lib/ai/gateway';
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

    console.log(`[API:Breakdown] START - Prompt: "${promptText}" | Energy Level: ${energyLevel}`);

    const model = getAIGatewayModel();
    if (!model) {
      return NextResponse.json(
        { error: 'AI Gateway is not configured', fallback: true },
        { status: 503 }
      );
    }

    const { system, prompt } = getBreakdownPrompt(promptText, energyLevel);

    const { output } = await generateText({
      model,
      output: Output.object({ schema: TaskBreakdownSchema }),
      system,
      prompt,
      reasoning: 'low',
    });

    if (output.status === 'refused') {
      console.log(
        `[API:Breakdown] REFUSED (${Date.now() - startTime}ms) - Score: ${output.relevanceScore}/100 | Category: ${output.refusalCategory} | Reason: "${output.refusalReason}"`
      );
    } else {
      console.log(
        `[API:Breakdown] ACCEPTED (${Date.now() - startTime}ms) - Score: ${output.relevanceScore}/100 | Title: "${output.title}" | Steps count: ${output.steps.length}`
      );
    }

    return NextResponse.json(output);
  } catch (error: any) {
    console.error(`[API:Breakdown] ERROR (${Date.now() - startTime}ms):`, error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to decompose task',
        fallback: true,
      },
      { status: 500 }
    );
  }
}
