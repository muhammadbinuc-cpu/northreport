import { NextRequest } from 'next/server';
import { callGemini, PROMPTS } from '@/lib/gemini';
import { requireAuth, handleApiError } from '@/lib/auth';
import { checkRateLimit, rateLimitError } from '@/lib/rateLimiter';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AgentIntentResponse {
  intent: 'refine' | 'file' | 'cancel' | 'chat';
  spoken_instruction: string | null;
  spoken_response: string;
}

interface RefineResponse {
  description: string;
  spoken_response: string;
}

interface ConversationResponse {
  response: string;
  suggestedFollowUp: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!checkRateLimit(auth.userId, 'agent-command')) return rateLimitError();

    const { transcript, reportState, chatHistory } = await request.json();

    if (!transcript || transcript.length < 2) {
      return Response.json({ error: 'Transcript required' }, { status: 400 });
    }

    // Build chat history context
    const historyContext = chatHistory && chatHistory.length > 0
      ? `\nCONVERSATION HISTORY:\n${chatHistory.map((m: ChatMessage) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}\n`
      : '';

    // Step 1: Classify intent (updated to include 'chat')
    const intentPrompt = `${PROMPTS.agentIntent}

CURRENT REPORT STATE:
- Department: ${reportState?.department || 'Unknown'}
- Severity: ${reportState?.severity || 'Unknown'}
- Description: ${reportState?.technical_description || 'None'}
- Bylaw: ${reportState?.bylaw_reference || 'None'}
${historyContext}
USER VOICE INPUT: "${transcript}"

IMPORTANT: If this is a question or conversational message (not an explicit command to file, cancel, or edit), classify as "chat".`;

    let intentResult: AgentIntentResponse;
    try {
      intentResult = await callGemini<AgentIntentResponse>(intentPrompt);
    } catch {
      // Keyword fallback
      const lower = transcript.toLowerCase();
      if (/^(file|submit|send|confirm|go ahead|yes|do it)$/i.test(lower.trim()) ||
        /file (it|the report|this)/i.test(lower)) {
        intentResult = { intent: 'file', spoken_instruction: null, spoken_response: 'Filing the report now.' };
      } else if (/cancel|start over|never mind|go back|redo/.test(lower)) {
        intentResult = { intent: 'cancel', spoken_instruction: null, spoken_response: 'Starting over.' };
      } else if (/change|edit|update|add|mention|include|modify/.test(lower)) {
        intentResult = { intent: 'refine', spoken_instruction: transcript, spoken_response: 'Updating the description.' };
      } else {
        // Default to chat for questions and conversation
        intentResult = { intent: 'chat', spoken_instruction: null, spoken_response: '' };
      }
    }

    // Step 2: Handle refine intent
    if (intentResult.intent === 'refine' && reportState?.technical_description) {
      const refinePrompt = `${PROMPTS.refineReport}\n\nEXISTING DESCRIPTION:\n"${reportState.technical_description}"\n\nRESIDENT INSTRUCTION:\n"${intentResult.spoken_instruction || transcript}"`;

      try {
        const refined = await callGemini<RefineResponse>(refinePrompt);
        return Response.json({
          intent: 'refine',
          updatedDescription: refined.description,
          spoken_response: refined.spoken_response,
        });
      } catch {
        return Response.json({
          intent: 'refine',
          updatedDescription: reportState.technical_description,
          spoken_response: "Sorry, I couldn't update the description. Please try again.",
        });
      }
    }

    // Backward compatibility: treat 'ask' as 'chat'
    if ((intentResult.intent as string) === 'ask') {
      intentResult.intent = 'chat';
    }

    // Step 3: Handle chat intent with full conversation
    if (intentResult.intent === 'chat') {
      const conversationPrompt = `${PROMPTS.agentConversation}

REPORT STATE:
- Department: ${reportState?.department || 'Unknown'}
- Severity: ${reportState?.severity || 'Unknown'}  
- Description: ${reportState?.technical_description || 'None'}
- Bylaw Reference: ${reportState?.bylaw_reference || 'None'}
${historyContext}
USER: "${transcript}"`;

      try {
        const chatResponse = await callGemini<ConversationResponse>(conversationPrompt);
        return Response.json({
          intent: 'chat',
          updatedDescription: null,
          spoken_response: chatResponse.response,
          suggestedFollowUp: chatResponse.suggestedFollowUp,
        });
      } catch {
        return Response.json({
          intent: 'chat',
          updatedDescription: null,
          spoken_response: "I'm not sure about that. Could you rephrase your question?",
          suggestedFollowUp: null,
        });
      }
    }

    // Step 4: For file/cancel intents, return classification
    return Response.json({
      intent: intentResult.intent,
      updatedDescription: null,
      spoken_response: intentResult.spoken_response,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
