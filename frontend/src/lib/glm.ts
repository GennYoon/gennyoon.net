const BASE_URL = import.meta.env.DEV
  ? '/api/glm'
  : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/glm-proxy`

export const GLM_MODELS = {
  default: 'claude-3-5-haiku-20241022',
  powerful: 'claude-sonnet-4-5',
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface GLMOptions {
  model: string
  system?: string
  messages: Message[]
  maxTokens?: number
}

const getHeaders = () =>
  import.meta.env.DEV
    ? { 'x-api-key': import.meta.env.VITE_GLM_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }
    : { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`, 'Content-Type': 'application/json' }

export async function glmStream(options: GLMOptions): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model: options.model,
      system: options.system,
      messages: options.messages,
      max_tokens: options.maxTokens ?? 4096,
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GLM API error: ${err}`)
  }

  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue

            try {
              const json = JSON.parse(data)
              if (json.type === 'content_block_delta' && json.delta?.text) {
                controller.enqueue(encoder.encode(json.delta.text))
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      } finally {
        controller.close()
        reader.releaseLock()
      }
    },
  })
}

export async function glmText(options: GLMOptions): Promise<string> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model: options.model,
      system: options.system,
      messages: options.messages,
      max_tokens: options.maxTokens ?? 2048,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GLM API error: ${err}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}
