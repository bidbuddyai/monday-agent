---
title: "OpenAI Compatible API"
sidebar_position: 2
description: |
  Use the Poe API with an OpenAI Chat Completions API. 
---

# OpenAI Compatible API

The Poe API provides access to hundreds of AI models and bots through a single OpenAI-compatible endpoint. Switch between frontier models from all major labs, open-source models, and millions of community-created bots using the same familiar interface.

**Key benefits:**
- Use your existing Poe subscription points with no additional setup
- Access models across all modalities: text, image, video, and audio generation  
- OpenAI-compatible interface works with existing tools like [Cursor, Cline, Continue, and more](interface-configuration)
- Single API key for hundreds of models instead of managing multiple provider keys 

If you're already using the OpenAI libraries, you can use this API as a low-cost way to switch between calling OpenAI models and Poe hosted models/bots to compare output, cost, and scalability, without changing your existing code. If you aren't already using the OpenAI libraries, we recommend that you use our [Python SDK](external-application-guide). 

## Using the OpenAI SDK

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python">
```python
# pip install openai
import os, openai

client = openai.OpenAI(
    api_key=os.getenv("POE_API_KEY"), # https://poe.com/api_key
    base_url="https://api.poe.com/v1",
)

chat = client.chat.completions.create(
    model="Claude-Opus-4.1",  # or other models (Claude-Sonnet-4, Gemini-2.5-Pro, Llama-3.1-405B, Grok-4..)
    messages=[{"role": "user", "content": "Top 3 things to do in NYC?"}],
)
print(chat.choices[0].message.content)
```
</TabItem>
<TabItem value="nodejs" label="Node.js">
```tsx
// npm install openai
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: "your_poe_api_key", // https://poe.com/api_key
    baseURL: "https://api.poe.com/v1",
});

const completion = await client.chat.completions.create({
    model: "Grok-4", // or other models (Claude-Sonnet-4, Gemini-2.5-Pro, GPT-Image-1, Veo-3..)
    messages: [
        {
            role: "system",
            content:
                "You are Grok, a highly intelligent, helpful AI assistant.",
        },
        {
            role: "user",
            content:
                "What is the meaning of life, the universe, and everything?",
        },
    ],
});

console.log(completion.choices[0].message.content);
```
</TabItem>
<TabItem value="curl" label="cURL">
```bash
curl "https://api.poe.com/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $POE_API_KEY" \
    -d '{
        "model": "Claude-Sonnet-4",
        "messages": [
            {
                "role": "user",
                "content": "Write a one-sentence bedtime story about a unicorn."
            }
        ]
    }'
```
</TabItem>
</Tabs>

## Options

1. **Poe Python Library** (✅ recommended)
    
    Install with `pip install fastapi-poe` for a native Python interface, better error handling, and ongoing feature support.
    
    → See the [External Application Guide](external-application-guide) to get started.
    
2. **OpenAI-Compatible API** (for compatibility use cases only)
    
    Poe also supports the `/v1/chat/completions` format if you're migrating from OpenAI or need a REST-only setup.
    
    Base URL: `https://api.poe.com/v1`
    

> For new projects, use the Python SDK--it's the most reliable and flexible way to build on Poe.
> 

## Known Issues & Limitations

### Bot Availability
- **Private bots are not currently supported** - Only public bots can be accessed through the API
- **The Assistant bot is not available** via the OpenAI-compatible API endpoint

### Media Bot Recommendations
- **Image, video, and audio bots** should be called with `stream=False` for optimal performance and reliability

### Parameter Handling
- **Best-effort parameter passing** - We make our best attempts to pass down parameters where possible, but some model-specific parameters may not be fully supported across all bots

### Additional Considerations
- Some community bots may have varying response formats or capabilities compared to standard language models

### API behavior

Here are the most substantial differences from using OpenAI:

- The **`strict`** parameter for function calling is ignored, which means the tool use JSON is not guaranteed to follow the supplied schema.
- Audio input is not supported; it will simply be ignored and stripped from input
- Most unsupported fields are silently ignored rather than producing errors. These are all documented below.


## Detailed OpenAI Compatible API Support

### Request fields

| **Field** | **Support status** |
| --- | --- |
| **`model`** | Use poe bot names |
| **`max_tokens`** | Fully supported |
| **`max_completion_tokens`** | Fully supported |
| **`stream`** | Fully supported |
| **`stream_options`** | Fully supported |
| **`top_p`** | Fully supported |
| **`tools`** | Fully Supported |
| **`tool_choice`** | Fully Supported |
| **`parallel_tool_calls`** | Fully Supported |
| **`stop`** | All non-whitespace stop sequences work |
| **`temperature`** | Between 0 and 2 (inclusive). |
| **`n`** | Must be exactly 1 |
| **`logprobs`** | Ignored |
| **`store`** | Ignored |
| **`metadata`** | Ignored |
| **`response_format`** | Ignored |
| **`prediction`** | Ignored |
| **`presence_penalty`** | Ignored |
| **`frequency_penalty`** | Ignored |
| **`seed`** | Ignored |
| **`service_tier`** | Ignored |
| **`audio`** | Ignored |
| **`logit_bias`** | Ignored |
| **`user`** | Ignored |
| **`modalities`** | Ignored |
| **`top_logprobs`** | Ignored |
| **`reasoning_effort`** | Ignored |

### Response fields

| **Field** | **Support status** |
| --- | --- |
| **`id`** | Fully supported |
| **`choices[]`** | Will always have a length of 1 |
| **`choices[].finish_reason`** | Fully supported |
| **`choices[].index`** | Fully supported |
| **`choices[].message.role`** | Fully supported |
| **`choices[].message.content`** | Fully supported |
| **`choices[].message.tool_calls`** | Fully supported |
| **`object`** | Fully supported |
| **`created`** | Fully supported |
| **`model`** | Fully supported |
| **`finish_reason`** | Fully supported |
| **`content`** | Fully supported |
| **`usage.completion_tokens`** | Fully supported |
| **`usage.prompt_tokens`** | Fully supported |
| **`usage.total_tokens`** | Fully supported |
| **`usage.completion_tokens_details`** | Always empty |
| **`usage.prompt_tokens_details`** | Always empty |
| **`choices[].message.refusal`** | Always empty |
| **`choices[].message.audio`** | Always empty |
| **`logprobs`** | Always empty |
| **`service_tier`** | Always empty |
| **`system_fingerprint`** | Always empty |

### Error message compatibility

The compatibility layer maintains consistent error formats with the OpenAI API. However, the detailed error messages may not be equivalent. We recommend only using the error messages for logging and debugging.

All errors return:

```
{
  "error": {
    "code": 401,
    "type": "authentication_error",
    "message": "Invalid API key",
    "metadata": {...}
  }
}

```

| HTTP / `code` | `type` | When it happens |
| --- | --- | --- |
| **400** | `invalid_request_error` | malformed JSON, missing fields |
| **401** | `authentication_error` | bad/expired key |
| **402** | `insufficient_credits` | balance ≤ 0 |
| **403** | `moderation_error` | permission denied or authorization issues |
| **404** | `not_found_error` | wrong endpoint / model |
| **408** | `timeout_error` | model didn't start in a reasonable time |
| **413** | `request_too_large` | tokens > context window  |
| **429** | `rate_limit_error` | rpm/tpm cap hit |
| **502** | `upstream_error` | model backend not working |
| **529** | `overloaded_error` | transient traffic spike |

**Retry tips**

- Respect `Retry-After` header on 429/503.
- Exponential back‑off (starting at 250 ms) plus jitter works well.
- Idempotency: resubmit the exact same payload to safely retry.

### Header compatibility

While the OpenAI SDK automatically manages headers, here is the complete list of headers supported by Poe's API for developers who need to work with them directly.

Response Headers:

| **Header** | **Definition** | **Support Status** |
| --- | --- | --- |
| **`openai-organization`** | OpenAI org | Unsupported |
| **`openai-processing-ms`** | Time taken processing your API request | Supported |
| **`openai-version`** | REST API version (**`2020-10-01`)** | Supported |
| **`x-request-id`** | Unique identifier for this API request (troubleshooting) | Supported |

**Rate Limit Headers**

Our rate limit is 500 rpm, but theres no planned support for any of the following rate limit headers at this time:

- `x-ratelimit-limit-requests` (how many requests allowed for the time window)
- `x-ratelimit-remaining-requests` (how many requests remaining for the time window)
- `x-ratelimit-reset-requests` (timestamp of when the time window resets)

## Getting Started

<Tabs>
<TabItem value="python" label="Python">
```python
# pip install openai
import os
import openai

client = openai.OpenAI(
  api_key=os.environ.get("POE_API_KEY"),
  base_url="https://api.poe.com/v1",
)
completion = client.chat.completions.create(
  model="gemini-2.5-pro",  # or other models (Claude-Sonnet-4, GPT-4.1, Llama-3.1-405B, Grok-4..)
  messages=[{"role": "user", "content": "What are the top 3 things to do in New York?"}],
)

print(completion.choices[0].message.content)
```
</TabItem>
<TabItem value="nodejs" label="Node.js">
```tsx
// npm install openai
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.POE_API_KEY,
    baseURL: "https://api.poe.com/v1",
});

const completion = await client.chat.completions.create({
    model: "Claude-Sonnet-4", // or other models (Gemini-2.5-Pro, GPT-Image-1, Veo-3, Grok-4..)
    messages: [
        {
            role: "user",
            content: "What are the top 3 things to do in New York?",
        },
    ],
});

console.log(completion.choices[0].message.content);
```
</TabItem>
<TabItem value="curl" label="cURL">
```bash
curl "https://api.poe.com/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $POE_API_KEY" \
    -d '{
        "model": "Grok-4",
        "messages": [
            {
                "role": "user",
                "content": "What are the top 3 things to do in New York?"
            }
        ]
    }'
```
</TabItem>
</Tabs>

## Streaming

You can also use OpenAI's streaming capabilities to stream back your response:

<Tabs>
<TabItem value="python" label="Python">
```python
# pip install openai
import os
import openai

client = openai.OpenAI(
  api_key=os.environ.get("POE_API_KEY"),
  base_url="https://api.poe.com/v1",
)

stream = client.chat.completions.create(
  model="Claude-Sonnet-4",  # or other models (Gemini-2.5-Pro, GPT-Image-1, Veo-3, Grok-4..)
  messages=[
    {"role": "system", "content": "You are a travel agent. Be descriptive and helpful."},
    {"role": "user", "content": "Tell me about San Francisco"},
  ],
  stream=True,
)

for chunk in stream:
	print(chunk.choices[0].delta.content or "", end="", flush=True)
```
</TabItem>
<TabItem value="nodejs" label="Node.js">
```tsx
// npm install openai
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.POE_API_KEY,
    baseURL: "https://api.poe.com/v1",
});

const stream = await client.chat.completions.create({
    model: "Gemini-2.5-Pro", // or other models (Claude-Sonnet-4, GPT-Image-1, Veo-3, Llama-3.1-405B..)
    messages: [
        {
            role: "system",
            content: "You are a travel agent. Be descriptive and helpful.",
        },
        {
            role: "user",
            content: "Tell me about San Francisco",
        },
    ],
    stream: true,
});

for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
}
```
</TabItem>
<TabItem value="curl" label="cURL">
```bash
curl "https://api.poe.com/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $POE_API_KEY" \
    -d '{
        "model": "gpt-4.1",
        "messages": [
            {
                "role": "system",
                "content": "You are a travel agent. Be descriptive and helpful."
            },
            {
                "role": "user",
                "content": "Tell me about San Francisco"
            }
        ],
        "stream": true
    }' \
    --no-buffer
```
</TabItem>
</Tabs>

## Migration checklist (OpenAI → Poe in 60 s)

1. Swap base URL - `https://api.openai.com/v1` → `https://api.poe.com/v1`
2. Replace key env var - `OPENAI_API_KEY` → `POE_API_KEY`
3. Select the model/bot you want to use e.g. `Claude-Opus-4.1`
4. Delete any `n > 1`, audio, or `parallel_tool_calls` params.
5. Run tests - output should match except for intentional gaps above.

## Pricing & Availability

All Poe subscribers can use their existing subscription points with the API at no additional cost. 

This means you can seamlessly transition between the web interface and API without worrying about separate billing structures or additional fees. Your regular monthly point allocation works exactly the same way whether you're chatting directly on Poe or accessing bots programmatically through the API.

If your Poe subscription is not enough, you can now purchase add-on points to get as much access as your application requires. Our intent in pricing these points is to charge the same amount for model access that underlying model providers charge. Any add-on points you purchase can be used with any model or bot on Poe and work across both the API and Poe chat on web, iOS, Android, Mac, and Windows.

## Support

Feel free to [reach out to support](mailto:developers@poe.com) if you come across some unexpected behavior when using our API or have suggestions for future improvements.
