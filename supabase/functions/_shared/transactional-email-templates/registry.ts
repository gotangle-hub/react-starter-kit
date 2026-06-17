/// <reference types="npm:@types/react@18.3.1" />
import type * as React from 'npm:react@18.3.1'
import { template as welcome } from './welcome.tsx'

export interface TemplateEntry {
  /** Optional React component (used when rawHtml is not provided). */
  component?: React.ComponentType<any>
  /** Optional raw HTML producer — bypasses React Email rendering entirely. */
  rawHtml?: (data: Record<string, any>) => string
  /** Optional plain-text producer; if absent, plain text is derived from HTML. */
  rawText?: (data: Record<string, any>) => string
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  welcome,
}
