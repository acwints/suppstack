import 'server-only';

import { NextResponse } from 'next/server';

export interface JsonErrorBody<Code extends string = string> {
  error: string;
  /** Machine-readable error code, for clients that branch on the failure. */
  code?: Code;
}

/**
 * An uncached JSON error response: `{ error, code? }` with the given status.
 * Pin `Code` to a route's code union (e.g. `jsonError<MyApiError['code']>`)
 * so typos in codes the client branches on fail to compile.
 */
export function jsonError<Code extends string = never>(
  error: string,
  status: number,
  code?: Code
): NextResponse<JsonErrorBody<Code>> {
  return NextResponse.json<JsonErrorBody<Code>>(code ? { code, error } : { error }, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}
