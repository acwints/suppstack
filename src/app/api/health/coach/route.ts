import { NextResponse } from 'next/server';
import {
  buildDailyHealthReadout,
  buildHealthSignalMap,
  buildHealthSignalReadiness,
  buildHealthProgressLoop,
  buildHealthTrendSummary,
  buildHealthTrackerPlan,
  buildSleepCommerceProtocol,
  buildLocalAiCoachResponse,
  buildLocalHealthCoachPlan,
  type AiHealthCoachStackPlan,
  type AiHealthCoachResponse,
  type HealthMetricSnapshot,
} from '@/lib/health/health-intelligence';
import { buildHealthCommercePlan, type HealthCommercePlan } from '@/lib/health/health-commerce';

export const runtime = 'nodejs';

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['headline', 'summary', 'nextBestActions', 'safetyNote'],
  properties: {
    headline: { type: 'string' },
    summary: { type: 'string' },
    nextBestActions: {
      type: 'array',
      minItems: 1,
      maxItems: 4,
      items: { type: 'string' },
    },
    safetyNote: { type: 'string' },
  },
};

function isSnapshot(value: unknown): value is HealthMetricSnapshot {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as Partial<HealthMetricSnapshot>;
  return (
    typeof maybe.source === 'string' &&
    typeof maybe.dateRangeDays === 'number' &&
    maybe.dateRangeDays > 0 &&
    maybe.dateRangeDays <= 90
  );
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);

  return trimmed;
}

function buildCoachStackPlan(commercePlan: HealthCommercePlan): AiHealthCoachStackPlan | null {
  if (!commercePlan.primaryExperiment || commercePlan.items.length === 0) return null;

  return {
    headline: commercePlan.headline,
    summary: commercePlan.summary,
    experimentTitle: commercePlan.primaryExperiment.title,
    actionLabel: commercePlan.primaryExperiment.actionLabel,
    goalId: commercePlan.primaryExperiment.goalId,
    shelfHref: `/products?goal=${commercePlan.primaryExperiment.goalId}`,
    totalOneTimeCost: commercePlan.totalOneTimeCost,
    estimatedMonthlyCost: commercePlan.estimatedMonthlyCost,
    products: commercePlan.items.map((item) => ({
      productId: item.product.product_id,
      productName: item.product.product_name,
      supplementName: item.product.directory_supplement_name,
      price: item.product.product_price,
      matchScore: item.match.score,
      href: `/product/${item.product.product_id}`,
    })),
    routineSlots: commercePlan.routineSlots.map((slot) => ({
      label: slot.label,
      timingLabel: slot.timingLabel,
      goalId: slot.goalId,
      headline: slot.headline,
      measurementLabel: slot.measurementLabel,
      productNames: slot.productNames,
      isPrimary: slot.isPrimary,
    })),
    impactForecasts: commercePlan.impactForecasts.map((forecast) => ({
      productId: forecast.productId,
      productName: forecast.productName,
      supplementName: forecast.supplementName,
      slotLabel: forecast.slotLabel,
      measurementWindow: forecast.measurementWindow,
      baselineLabel: forecast.baselineLabel,
      targetLabel: forecast.targetLabel,
      keepSignal: forecast.keepSignal,
      swapSignal: forecast.swapSignal,
      stopSignal: forecast.stopSignal,
    })),
  };
}

async function createOpenAiCoachResponse(
  snapshot: HealthMetricSnapshot,
  history: HealthMetricSnapshot[]
): Promise<AiHealthCoachResponse | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_HEALTH_MODEL;
  if (!apiKey || !model) return null;

  const localPlan = buildLocalHealthCoachPlan(snapshot);
  const trackerPlan = buildHealthTrackerPlan(snapshot);
  const sleepProtocol = buildSleepCommerceProtocol(snapshot);
  const dailyReadout = buildDailyHealthReadout(snapshot);
  const signalMap = buildHealthSignalMap(snapshot);
  const signalReadiness = buildHealthSignalReadiness(snapshot);
  const commercePlan = buildHealthCommercePlan(snapshot);
  const trend = buildHealthTrendSummary(history);
  const progressLoop = buildHealthProgressLoop(history.length ? history : [snapshot]);
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text:
                'You are SuppStack Health Intelligence. Summarize wellness-commerce opportunities from user-provided health metrics. Do not diagnose, treat, promise outcomes, or tell the user to take a supplement. Keep recommendations educational, cautious, and focused on experiments the user can discuss with a professional.',
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON.stringify({
                snapshot,
                history,
	                trend,
	                progressLoop: {
	                  status: progressLoop.status,
	                  title: progressLoop.title,
	                  summary: progressLoop.summary,
	                  decision: progressLoop.decision,
	                  metrics: progressLoop.metrics,
	                  nextActions: progressLoop.nextActions,
	                },
	                localPlan: {
                  headline: localPlan.headline,
                  summary: localPlan.summary,
                  tracker: {
                    readinessScore: trackerPlan.readinessScore,
                    readinessLabel: trackerPlan.readinessLabel,
                    sleepDebtHours: trackerPlan.sleepDebtHours,
                    focusExperiment: trackerPlan.focusExperiment,
                    scores: trackerPlan.scores.map((score) => ({
                      label: score.label,
                      value: score.value,
                      metricLabel: score.metricLabel,
                      goalId: score.goalId,
                    })),
                  },
                  sleepProtocol: {
                    status: sleepProtocol.status,
                    score: sleepProtocol.score,
                    title: sleepProtocol.title,
                    focusMetricLabel: sleepProtocol.focusMetricLabel,
                    experimentTitle: sleepProtocol.experimentTitle,
                    metrics: sleepProtocol.metrics,
                    stackSlots: sleepProtocol.stackSlots.map((slot) => ({
                      label: slot.label,
                      supplementNames: slot.supplementNames,
                      testLabel: slot.testLabel,
                    })),
                    measurementPlan: sleepProtocol.measurementPlan,
                    safetyNote: sleepProtocol.safetyNote,
                  },
                  dailyReadout: {
                    status: dailyReadout.status,
                    title: dailyReadout.title,
                    summary: dailyReadout.summary,
                    focusGoalId: dailyReadout.focusGoalId,
                    focusShelfLabel: dailyReadout.focusShelfLabel,
                    primaryMetricLabel: dailyReadout.primaryMetricLabel,
                    commerceActionLabel: dailyReadout.commerceActionLabel,
                    experimentTitle: dailyReadout.experimentTitle,
                    signals: dailyReadout.signals,
                    morningActions: dailyReadout.morningActions,
                    tonightProtocol: dailyReadout.tonightProtocol,
                  },
                  signalMap: signalMap.map((signal) => ({
                    label: signal.label,
                    status: signal.status,
                    goalId: signal.goalId,
                    valueLabel: signal.valueLabel,
                    targetLabel: signal.targetLabel,
                    shelfLabel: signal.shelfLabel,
                    headline: signal.headline,
                    supplementNames: signal.supplementNames,
                  })),
                  signalReadiness: {
                    connectedCount: signalReadiness.connectedCount,
                    totalCount: signalReadiness.totalCount,
                    coveragePercent: signalReadiness.coveragePercent,
                    confidenceLabel: signalReadiness.confidenceLabel,
                    summary: signalReadiness.summary,
                    missingPriority: signalReadiness.missingPriority.map((metric) => ({
                      label: metric.label,
                      commerceImpact: metric.commerceImpact,
                    })),
                    domains: signalReadiness.domains.map((domain) => ({
                      label: domain.label,
                      status: domain.status,
                      connectedCount: domain.connectedCount,
                      totalCount: domain.totalCount,
                      shelfLabel: domain.shelfLabel,
                      commerceImpact: domain.commerceImpact,
                    })),
                  },
                  opportunities: localPlan.opportunities.slice(0, 3).map((item) => ({
                    title: item.title,
                    metricLabel: item.metricLabel,
                    supplementNames: item.supplementNames,
                    caution: item.caution,
                  })),
                  commercePlan: {
                    headline: commercePlan.headline,
                    summary: commercePlan.summary,
                    totalOneTimeCost: commercePlan.totalOneTimeCost,
                    estimatedMonthlyCost: commercePlan.estimatedMonthlyCost,
                    directCheckoutCount: commercePlan.directCheckoutCount,
                    primaryExperiment: commercePlan.primaryExperiment,
                    routineSlots: commercePlan.routineSlots.map((slot) => ({
                      label: slot.label,
                      timingLabel: slot.timingLabel,
                      goalId: slot.goalId,
                      headline: slot.headline,
                      rationale: slot.rationale,
                      measurementLabel: slot.measurementLabel,
                      productNames: slot.productNames,
                      isPrimary: slot.isPrimary,
                    })),
                    items: commercePlan.items.map((item) => ({
                      slotLabel: item.slotLabel,
                      goalId: item.goalId,
                      productName: item.product.product_name,
                      supplementName: item.product.directory_supplement_name,
                      price: item.product.product_price,
                      matchScore: item.match.score,
                      reasons: item.match.reasons,
                    })),
                    impactForecasts: commercePlan.impactForecasts.map((forecast) => ({
                      productName: forecast.productName,
                      supplementName: forecast.supplementName,
                      slotLabel: forecast.slotLabel,
                      measurementWindow: forecast.measurementWindow,
                      baselineLabel: forecast.baselineLabel,
                      targetLabel: forecast.targetLabel,
                      keepSignal: forecast.keepSignal,
                      swapSignal: forecast.swapSignal,
                      stopSignal: forecast.stopSignal,
                    })),
                  },
                  nextBestActions: localPlan.nextBestActions,
                },
              }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'suppstack_health_coach',
          strict: true,
          schema: responseSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || 'OpenAI coach request failed.');
  }

  const payload = await response.json();
  const outputText =
    payload.output_text ??
    payload.output
      ?.flatMap((item: any) => item.content ?? [])
      ?.map((content: any) => content.text)
      ?.filter(Boolean)
      ?.join('\n');

  if (!outputText) return null;

  const parsed = JSON.parse(extractJsonObject(outputText));
  return {
    source: 'openai',
    headline: String(parsed.headline || localPlan.headline),
    summary: String(parsed.summary || localPlan.summary),
    nextBestActions: Array.isArray(parsed.nextBestActions)
      ? parsed.nextBestActions.slice(0, 4).map(String)
      : localPlan.nextBestActions,
    safetyNote: String(parsed.safetyNote || localPlan.disclaimer),
    stackPlan: buildCoachStackPlan(commercePlan),
  };
}

function normalizeHistory(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter(isSnapshot).slice(0, 8);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!isSnapshot(body?.snapshot)) {
      return NextResponse.json({ error: 'A valid health snapshot is required.' }, { status: 400 });
    }

    const history = normalizeHistory(body?.history);
    const openAiResponse = await createOpenAiCoachResponse(body.snapshot, history);
    if (openAiResponse) {
      return NextResponse.json(openAiResponse);
    }

    const localResponse = buildLocalAiCoachResponse(body.snapshot, history);
    return NextResponse.json({
      ...localResponse,
      stackPlan: buildCoachStackPlan(buildHealthCommercePlan(body.snapshot)),
    });
  } catch (error) {
    console.error('Health coach error:', error);
    const fallbackSnapshot: HealthMetricSnapshot = {
      source: 'demo',
      dateRangeDays: 14,
    };
    return NextResponse.json(
      {
        ...buildLocalAiCoachResponse(fallbackSnapshot),
        stackPlan: buildCoachStackPlan(buildHealthCommercePlan(fallbackSnapshot)),
      },
      { status: 200 }
    );
  }
}
