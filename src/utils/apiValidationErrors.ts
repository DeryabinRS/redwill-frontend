import type { FormInstance } from 'antd/es/form'

/** Типичное тело ошибки валидации (Laravel и похожие API) в `response.data` / `FetchBaseQueryError.data` */
export type ApiValidationBody = {
  message?: string
  errors?: Record<string, string[] | string>
  response_code?: number
  status?: string
}

export function normalizeFieldMessages(value: string[] | string): string[] {
  if (Array.isArray(value)) return value.filter(Boolean).map(String)
  return value ? [String(value)] : []
}

/** Достаёт объект из ответа RTK Query (`unwrap` reject) или любого `{ data: object }`. */
export function parseApiValidationBody(rejected: unknown): ApiValidationBody | undefined {
  if (typeof rejected !== 'object' || rejected === null || !('data' in rejected)) return undefined
  const data = (rejected as { data?: unknown }).data
  if (typeof data !== 'object' || data === null) return undefined
  return data as ApiValidationBody
}

export function getFetchErrorDetail(rejected: unknown): string | undefined {
  if (typeof rejected !== 'object' || rejected === null) return undefined
  if ('error' in rejected && typeof (rejected as { error?: unknown }).error === 'string') {
    return (rejected as { error: string }).error
  }
  if ('message' in rejected && typeof (rejected as { message?: unknown }).message === 'string') {
    return (rejected as { message: string }).message
  }
  return undefined
}

function fieldErrorsToJoinedText(errors: Record<string, string[] | string>): string {
  return Object.values(errors)
    .flatMap((v) => normalizeFieldMessages(v))
    .join(' ')
}

/** Подставляет `errors` в Ant Design Form (ключи `foo.bar` → вложенный `name`). */
export function applyValidationErrorsToForm(
  form: FormInstance,
  errors: Record<string, string[] | string>,
): void {
  const fieldData = Object.entries(errors).map(([name, raw]) => ({
    name: name.includes('.') ? name.split('.') : name,
    errors: normalizeFieldMessages(raw),
  }))
  form.setFields(fieldData.filter((f) => f.errors.length > 0))
}

export type HandleApiFormErrorOptions = {
  error: unknown
  /** Если не передан, ошибки по полям только через тост */
  form?: FormInstance
  notifyError: (text: string) => void
  fallback: string
  /**
   * При наличии ошибок по полям и переданной форме не дублировать общий тост
   * для «пустых» сводок вроде Laravel `message: "Validation failed"`.
   * Передайте `null`, чтобы никогда не подавлять `message` с сервера.
   */
  suppressToastSummariesWhenFieldErrors?: string[] | null
}

const defaultSuppressSummaries = ['Validation failed']

/**
 * Универсальная обработка ошибки запроса для форм:
 * разбор `errors` → `form.setFields`, иначе (или без формы) — один тост `notifyError`.
 */
export function handleApiFormError(options: HandleApiFormErrorOptions): void {
  const {
    error,
    form,
    notifyError,
    fallback,
    suppressToastSummariesWhenFieldErrors = defaultSuppressSummaries,
  } = options

  const body = parseApiValidationBody(error)
  const rawErrors = body?.errors
  const hasFieldErrors = Boolean(rawErrors && Object.keys(rawErrors).length > 0)
  const fieldErrors = hasFieldErrors ? rawErrors! : undefined

  const summary = body?.message
  const detail = getFetchErrorDetail(error)

  if (hasFieldErrors && form) {
    applyValidationErrorsToForm(form, fieldErrors!)
  }

  if (!hasFieldErrors) {
    notifyError(summary || detail || fallback)
    return
  }

  if (hasFieldErrors && !form) {
    notifyError(summary || fieldErrorsToJoinedText(fieldErrors!) || detail || fallback)
    return
  }

  const suppress =
    suppressToastSummariesWhenFieldErrors === null
      ? []
      : suppressToastSummariesWhenFieldErrors

  if (summary && !suppress.includes(summary)) {
    notifyError(summary)
  }
}
