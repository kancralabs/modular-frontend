import { z } from 'zod'

declare global {
  interface Window {
    /** Runtime configuration injected by `/config.js` before the bundle loads. */
    __APP_CONFIG__?: Partial<Record<keyof AppConfig, string>>
  }
}

const configSchema = z.object({
  appName: z.string().min(1, 'appName is required (APP_NAME / VITE_APP_NAME)'),
  apiBaseUrl: z
    .string()
    .min(1, 'apiBaseUrl is required (APP_API_BASE_URL / VITE_API_BASE_URL)'),
})

export type AppConfig = z.infer<typeof configSchema>

export class ConfigError extends Error {
  readonly issues: string[]

  constructor(issues: string[]) {
    super(`Invalid application configuration:\n- ${issues.join('\n- ')}`)
    this.name = 'ConfigError'
    this.issues = issues
  }
}

type BuildTimeEnv = Partial<Record<'VITE_APP_NAME' | 'VITE_API_BASE_URL', string>>

/** Runtime values win over build-time values; empty strings count as unset. */
export function loadConfig(
  runtime: Window['__APP_CONFIG__'],
  buildTime: BuildTimeEnv,
): AppConfig {
  const pick = (runtimeValue?: string, buildValue?: string) =>
    runtimeValue || buildValue || undefined

  const result = configSchema.safeParse({
    appName: pick(runtime?.appName, buildTime.VITE_APP_NAME),
    apiBaseUrl: pick(runtime?.apiBaseUrl, buildTime.VITE_API_BASE_URL),
  })

  if (!result.success) {
    throw new ConfigError(result.error.issues.map((issue) => issue.message))
  }
  return result.data
}

let cached: AppConfig | undefined

export function getConfig(): AppConfig {
  cached ??= loadConfig(window.__APP_CONFIG__, import.meta.env)
  return cached
}
