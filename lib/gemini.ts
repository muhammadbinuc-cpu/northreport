import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function callGemini<T>(prompt: string, systemInstruction?: string): Promise<T> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    ...(systemInstruction ? { systemInstruction } : {}),
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    // Strip markdown fences and retry
    const cleaned = text.replace(/```json?\n?|\n?```/g, '').trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      console.error('Gemini returned invalid JSON:', text.substring(0, 200));
      throw new Error('AI_PARSE_ERROR');
    }
  }
}

export async function callGeminiMarkdown(prompt: string, systemInstruction?: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    ...(systemInstruction ? { systemInstruction } : {}),
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function callGeminiWithImage<T>(
  prompt: string,
  imageBase64: string,
  systemInstruction?: string
): Promise<T> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    ...(systemInstruction ? { systemInstruction } : {}),
  });

  const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
  ]);

  const text = result.response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    const cleaned = text.replace(/```json?\n?|\n?```/g, '').trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      console.error('Gemini returned invalid JSON:', text.substring(0, 200));
      throw new Error('AI_PARSE_ERROR');
    }
  }
}

// Prompt templates
export const PROMPTS = {
  reportClassification: `You are SafePulse's hazard classification engine. Analyze the user's report (text and/or image) and return structured JSON. Respond ONLY with valid JSON. No markdown, no explanation.

SEVERITY GUIDE:
- critical: Immediate danger to life (exposed wiring, structural collapse, gas leak)
- high: Significant injury risk or property damage (large pothole on busy road)
- medium: Inconvenience or minor risk (broken streetlight, cracked sidewalk)
- low: Cosmetic or non-urgent (graffiti, litter, faded crosswalk)

OUTPUT SCHEMA:
{
  "category": "infrastructure | environmental | safety | accessibility",
  "subcategory": "string",
  "severity": "critical | high | medium | low",
  "aiSummary": "string (one sentence)",
  "imageFindings": "string | null",
  "immediateRisk": boolean,
  "suggestedAction": "string"
}`,

  voiceClassification: `You are SafePulse's content classification engine. Analyze the user's voice post and return structured JSON. Respond ONLY with valid JSON. No markdown, no explanation.

OUTPUT SCHEMA:
{
  "aiSummary": "string (one concise sentence summarizing the post)",
  "severity": "critical | high | medium | low | null",
  "isHazard": boolean
}`,

  voiceToReport: `Convert this community Voice into a structured hazard report if it describes a real safety/infrastructure hazard. If it is not a hazard (e.g., general discussion, opinion, social post), return convert: false. Respond ONLY with valid JSON. No markdown, no explanation.

OUTPUT SCHEMA:
{
  "convert": boolean,
  "reason": "string",
  "reportDraft": {
    "category": "infrastructure | environmental | safety | accessibility",
    "subcategory": "string",
    "severity": "critical | high | medium | low",
    "aiSummary": "string",
    "suggestedAction": "string"
  } | null
}`,

  explain: `You are SafePulse's feed intelligence engine. Given a feed item and its context, produce a concise summary, explain why it matters, and suggest next actions. Respond ONLY with valid JSON. No markdown, no explanation.

OUTPUT SCHEMA:
{
  "summaryBullets": ["string", "string", "string"],
  "whyItMatters": "string (2-4 sentences, plain English)",
  "riskLevel": "critical | high | medium | low",
  "evidence": ["string"],
  "suggestedNextActions": ["string"]
}`,

  voiceCommand: `You are SafePulse's voice command router. Convert spoken instructions into structured app commands. Be lenient with phrasing — match intent, not exact words. If unclear, return intent "unknown" with a clarifying question in spokenResponse. Respond ONLY with valid JSON. No markdown, no explanation.

VALID ACTIONS:
navigate: open_feed, open_map, open_dashboard, go_back
create: create_story, create_post, create_report
interact: upvote, comment, repost, convert_to_report
ask: explain_item, summarize_item, is_getting_worse
confirm: file_to_311
cancel: cancel

SAFETY RULES:
- file_to_311 ALWAYS requires confirm
- delete/moderate ALWAYS requires confirm
- create actions with content should extract the text into payload.text

OUTPUT SCHEMA:
{
  "intent": "navigate | create | interact | ask | confirm | cancel | unknown",
  "action": "string",
  "targetId": "string | null",
  "payload": { "text": "string | null" },
  "requiresConfirm": boolean,
  "confirmPrompt": "string | null",
  "spokenResponse": "string | null"
}`,

  patternDetection: `You are SafePulse's pattern analysis engine. Given recent reports and voices for a neighborhood, identify clusters, trends, and anomalies. Respond ONLY with valid JSON. No markdown, no explanation.

TREND RULES (enforce these):
- Compare W0 (last 7 days) vs W1 (prior 7 days) per subcategory per area
- Flag trend if: W0 >= 5 AND W0 >= max(2, 1.5 * W1)
- If W1=0: require W0 >= 6 AND >= 2 unique users before flagging

OUTPUT SCHEMA:
{
  "patterns": [
    {
      "type": "cluster | trend | anomaly",
      "description": "string",
      "severity": "critical | high | medium | low",
      "reportIds": ["string"],
      "w0Count": number,
      "w1Count": number,
      "recommendation": "string"
    }
  ],
  "healthScoreUpdate": {
    "overall": 0-100,
    "infrastructure": 0-100,
    "safety": 0-100
  }
}`,

  digest: `Generate a concise weekly safety digest for a neighborhood community leader. Structure: Overview (2 sentences), Key Issues (top 3), Positive Trends (if any), Recommended Actions (2-3 items). Write in a professional but accessible tone. Respond in Markdown format.`,
};
