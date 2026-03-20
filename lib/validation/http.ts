import { NextRequest, NextResponse } from "next/server";
import { z, ZodError, type ZodTypeAny } from "zod";

type ValidationIssue = {
  path: string;
  message: string;
  code: string;
};

type ValidationErrorPayload = {
  error: "Validation failed";
  details: ValidationIssue[];
};

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse<ValidationErrorPayload> };

const formatPath = (path: PropertyKey[]): string =>
  path.length > 0 ? path.map(String).join(".") : "root";

export const validationErrorResponse = (
  error: ZodError
): NextResponse<ValidationErrorPayload> => {
  const details: ValidationIssue[] = error.issues.map((issue) => ({
    path: formatPath(issue.path),
    message: issue.message,
    code: issue.code,
  }));

  return NextResponse.json(
    {
      error: "Validation failed",
      details,
    },
    { status: 400 }
  );
};

export async function parseJsonBody<TSchema extends ZodTypeAny>(
  request: NextRequest,
  schema: TSchema
): Promise<ParseResult<z.infer<TSchema>>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Validation failed",
          details: [
            {
              path: "body",
              message: "Invalid JSON body",
              code: "invalid_json",
            },
          ],
        },
        { status: 400 }
      ),
    };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { success: false, response: validationErrorResponse(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export function parseSearchParams<TSchema extends ZodTypeAny>(
  request: NextRequest,
  schema: TSchema
): ParseResult<z.infer<TSchema>> {
  const entries = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = schema.safeParse(entries);

  if (!parsed.success) {
    return { success: false, response: validationErrorResponse(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export function parseHeaders<TSchema extends ZodTypeAny>(
  request: NextRequest,
  schema: TSchema
): ParseResult<z.infer<TSchema>> {
  const headersObject = Object.fromEntries(request.headers.entries());
  const parsed = schema.safeParse(headersObject);

  if (!parsed.success) {
    return { success: false, response: validationErrorResponse(parsed.error) };
  }

  return { success: true, data: parsed.data };
}
