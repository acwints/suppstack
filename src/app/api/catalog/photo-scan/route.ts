import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  buildCounterScanCatalogContext,
  buildRecognitionsFromText,
  matchCounterScanRecognitions,
} from '@/lib/catalog/counter-scan';
import type {
  CounterScanApiError,
  CounterScanApiResponse,
  CounterScanRecognizedInput,
} from '@/lib/catalog/counter-scan-types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const DEFAULT_MODEL = 'gpt-5.6';
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

let authClient: SupabaseClient | null = null;

interface OpenAITextContent {
  type?: string;
  text?: string;
}

interface OpenAIOutputItem {
  content?: OpenAITextContent[];
}

interface OpenAIResponsePayload {
  output_text?: string;
  output?: OpenAIOutputItem[];
}

function jsonError(
  code: CounterScanApiError['code'],
  error: string,
  status: number
) {
  return NextResponse.json<CounterScanApiError>(
    { code, error },
    {
      status,
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}

function getSupabaseAuthClient() {
  if (authClient) return authClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !supabaseAnonKey) return null;

  authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return authClient;
}

async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;

  const supabase = getSupabaseAuthClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return data.user ?? null;
}

function isValidImageFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as File).arrayBuffer === 'function' &&
    typeof (value as File).type === 'string' &&
    typeof (value as File).size === 'number'
  );
}

function extractOpenAIText(payload: OpenAIResponsePayload) {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text;
  }

  return (
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join('\n') ?? ''
  );
}

function parseRecognitionsFromOpenAI(payload: OpenAIResponsePayload): CounterScanRecognizedInput[] {
  const text = extractOpenAIText(payload);
  const parsed = JSON.parse(text) as { items?: CounterScanRecognizedInput[] };
  return Array.isArray(parsed.items) ? parsed.items : [];
}

async function recognizeCounterImage(imageDataUrl: string) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const catalogContext = buildCounterScanCatalogContext();
  const model = process.env.OPENAI_COUNTER_SCAN_MODEL?.trim() || DEFAULT_MODEL;

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      store: false,
      input: [
        {
          role: 'system',
          content:
            'You recognize supplement containers in countertop photos for SuppStack AI. Return only products or supplement bottles that are visibly present. Do not invent hidden labels, dosages, medical advice, vendors, or purchase paths. If a label is partially visible, use low confidence and include the visible text.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: [
                'Identify each distinct supplement container in this image.',
                'Prefer exact brand and product names from this canonical catalog when visible.',
                'If you cannot read a product name, still return the visible brand or supplement category with low confidence.',
                'Canonical catalog candidates:',
                JSON.stringify(catalogContext),
              ].join('\n'),
            },
            {
              type: 'input_image',
              image_url: imageDataUrl,
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'suppstack_counter_scan',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              items: {
                type: 'array',
                maxItems: 24,
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    label: { type: 'string' },
                    brandName: { type: 'string' },
                    productName: { type: 'string' },
                    supplementName: { type: 'string' },
                    confidence: { type: 'number' },
                    visibleText: {
                      type: 'array',
                      maxItems: 12,
                      items: { type: 'string' },
                    },
                    visualCues: { type: 'string' },
                  },
                  required: [
                    'label',
                    'brandName',
                    'productName',
                    'supplementName',
                    'confidence',
                    'visibleText',
                    'visualCues',
                  ],
                },
              },
            },
            required: ['items'],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('Counter scan OpenAI request failed:', response.status, detail);
    throw new Error('OpenAI counter scan request failed');
  }

  return parseRecognitionsFromOpenAI((await response.json()) as OpenAIResponsePayload);
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return jsonError('AUTH_REQUIRED', 'Sign in to scan supplement photos.', 401);
  }

  const formData = await request.formData();
  const image = formData.get('image');
  const hint = String(formData.get('hint') ?? '').trim();

  if (!isValidImageFile(image)) {
    return jsonError('INVALID_IMAGE', 'Upload a supplement photo to scan.', 400);
  }

  if (!image.type.startsWith('image/')) {
    return jsonError('INVALID_IMAGE', 'Upload a valid image file.', 400);
  }

  if (image.size > MAX_IMAGE_BYTES) {
    return jsonError('IMAGE_TOO_LARGE', 'Image is too large. Try a smaller photo.', 413);
  }

  try {
    const bytes = Buffer.from(await image.arrayBuffer());
    const dataUrl = `data:${image.type};base64,${bytes.toString('base64')}`;
    const aiRecognitions = await recognizeCounterImage(dataUrl);
    const recognitions = aiRecognitions ?? buildRecognitionsFromText(hint);

    if (!aiRecognitions && recognitions.length === 0) {
      return jsonError(
        'AI_NOT_CONFIGURED',
        'Counter Scan is not configured in this environment.',
        503
      );
    }

    const items = matchCounterScanRecognitions(recognitions);
    const response: CounterScanApiResponse = {
      mode: aiRecognitions ? 'ai' : 'text',
      scannedAt: new Date().toISOString(),
      matchedCount: items.filter((item) => item.matchStatus === 'matched').length,
      unresolvedCount: items.filter((item) => item.matchStatus !== 'matched').length,
      items,
    };

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Counter scan failed:', error);
    return jsonError('SCAN_FAILED', 'Unable to scan this photo. Please try again.', 502);
  }
}
