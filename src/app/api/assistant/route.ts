import { NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { getAIGatewayModel, getAIReasoningEffort } from '@/lib/ai/gateway';
import { AssistantIntentSchema } from '@/lib/ai/schemas';
import { getAssistantInteractionPrompt } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const taskTitle = typeof body.taskTitle === 'string' ? body.taskTitle.trim() : 'Task';
    const activeSteps = Array.isArray(body.activeSteps) ? body.activeSteps : [];

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log(
      `[API:Assistant/Tweak] START - Message: "${message}" | Task Title: "${taskTitle}" | Active Steps: ${activeSteps.length}`
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
    });

    console.log(
      `[API:Assistant/Tweak] END (${Date.now() - startTime}ms) - Intent Type: "${output.type}"`
    );

    return NextResponse.json(output);
  } catch (error: any) {
    console.error(`[API:Assistant/Tweak] ERROR (${Date.now() - startTime}ms):`, error);

    // If model returned malformed output or Zod validation failed, fallback gracefully to encouragement
    // so executive-dysfunction users are not stranded with a jarring HTTP 500 failure
    return NextResponse.json({
      type: 'encouragement',
      acknowledgment: "I'm right here with you. Which specific step feels heaviest right now?",
    });
  }
}
