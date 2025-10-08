---
title: "Tool Calling"
sidebar_position: 4
description: |
  Dedicated page which explains how to use tool calls.
---

import InteractiveCodeBlock from '@site/src/components/InteractiveCodeBlock';

# Tool Calling

Tool calling enables LLMs to interact with external functions and APIs. The model suggests tool calls with specific arguments, your client executes them, and returns results to continue the conversation.

## Setup

Get your API key at [poe.com/api_key](https://poe.com/api_key). Most current models from major providers support tool calling, including [GPT-5](https://poe.com/GPT-5) (by OpenAI), [Gemini-2.5-Pro](https://poe.com/Gemini-2.5-Pro) (by Google), and [Claude-Opus-4.1](https://poe.com/Claude-Opus-4.1) (by Anthropic).

<InteractiveCodeBlock
  showEnvToggle={true}
  codeTemplate={({ apiKey, model, useEnv }) =>
    useEnv
      ? `# Create .env file with:
# POE_API_KEY=your_api_key_here

import os

POE_API_KEY = os.getenv("POE_API_KEY")  # poe.com/api_key
MODEL = "${model}"`
      : `POE_API_KEY = "${apiKey}"  # poe.com/api_key
MODEL = "${model}"`
  }
/>

Define the tools you want to make available. Here we define two tools:
* `plus` for adding integers, and
* `get_current_weather` for fetching weather data.

```python
import openai

client = openai.OpenAI(
    api_key=POE_API_KEY,
    base_url="https://api.poe.com/v1",
)

# Define the tools
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "plus",
            "description": "Add two integers together",
            "parameters": {
                "type": "object",
                "properties": {
                    "a": {
                        "type": "integer",
                        "description": "First integer to add"
                    },
                    "b": {
                        "type": "integer",
                        "description": "Second integer to add"
                    }
                },
                "required": ["a", "b"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "The unit of temperature to return"
                    }
                },
                "required": ["location"]
            }
        }
    }
]
```

## Example

### Step 1. Request with Tools

Send your first request with the tools:

```python
messages = [
    {
        "role": "user",
        "content": "What is 1999 + 2036? Also, what's the weather like in New York?"
    }
]

response = client.chat.completions.create(
    model=MODEL,
    messages=messages,
    tools=TOOLS,
    tool_choice="auto"
)

print(response.choices[0].message.tool_calls)
```

<details>
<summary>Example output</summary>

:::note
The model may call one or both tools (LLM behavior is non-deterministic).
:::

```python
[
  ChatCompletionMessageToolCall(
    id='call_abc123',
    function=Function(arguments='{"a": 1999, "b": 2036}', name='plus'),
    type='function'
  ),
  ChatCompletionMessageToolCall(
    id='call_def456',
    function=Function(arguments='{"location": "New York"}', name='get_current_weather'),
    type='function'
  )
]
```

</details>

### Step 2. Tool Execution (Client)

Your client executes the suggested tool calls locally:

```python
import json

# Execute tool calls
tool_messages = []

for tool_call in response.choices[0].message.tool_calls:
    if tool_call.function.name == "plus":
        args = json.loads(tool_call.function.arguments)
        result = args["a"] + args["b"]  # 4035
        tool_messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": str(result)
        })

    elif tool_call.function.name == "get_current_weather":
        args = json.loads(tool_call.function.arguments)
        # Mock implementation
        result = {
            "location": args["location"],
            "temperature": 72,
            "unit": "fahrenheit",
            "condition": "sunny",
            "humidity": 65
        }
        tool_messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": json.dumps(result)
        })

print(tool_messages)
```

<details>
<summary>Example tool_messages</summary>

```python
[
  {
    'role': 'tool',
    'tool_call_id': 'call_C2pZc1rVYNVztiusHNI7WMi9',
    'content': '4035'
  },
  {
    'role': 'tool',
    'tool_call_id': 'call_XGg4wSNkpBzkfEdv4IYPDxLH',
    'content': '{"location": "New York, NY", "temperature": 72, "unit": "fahrenheit", "condition": "sunny", "humidity": 65}'
  }
]
```

</details>

### Step 3. Request with Tools, Tool Calls, and Tool Results

Send the tool execution results back to continue the conversation:

```python
# Add assistant's response with tool calls
messages.append(response.choices[0].message)

# Add tool results
messages.extend(tool_messages)

final_response = client.chat.completions.create(
    model=MODEL,
    messages=messages,
    tools=TOOLS
)

print(final_response.choices[0].message.content)
```

<details>
<summary>Example outputs (may vary by model)</summary>

```
1999 + 2036 = 4035.

Current weather in New York, NY: sunny, around 72°F, humidity about 65%.
```

Or:

```
Great! I can help you with both calculations:

1. **1999 + 2036 = 4035**

2. **Current weather in New York, NY:**
   - Temperature: 72°F
   - Condition: Sunny
   - Humidity: 65%

It's a nice sunny day in New York with comfortable temperatures!
```

</details>

## More Examples

Use the `tool_choice` parameter to control how the model uses tools.

### Single Tool Call

Use `"auto"` to get default tool use behavior ([OpenAI documentation](https://platform.openai.com/docs/api-reference/chat/create#chat-create-tool_choice-tool-choice-mode)):

```python
response = client.chat.completions.create(
    model=MODEL,
    messages=[{"role": "user", "content": "What's 42 plus 58?"}],
    tools=TOOLS,
    tool_choice="auto"
)

print(response.choices[0].message.tool_calls)
```

### Allowed Tools

Use `tool_choice` to force the model to call specific tools only ([OpenAI documentation](https://platform.openai.com/docs/api-reference/chat/create#chat-create-tool_choice-allowed-tools)):

```python
# Filter to only allow get_current_weather
allowed_tools = [t for t in TOOLS if t["function"]["name"] == "get_current_weather"]

response = client.chat.completions.create(
    model="o3-mini",  # This feature only works with specific models
    messages=[{"role": "user", "content": "What's the weather in Hong Kong?"}],
    tools=TOOLS,
    tool_choice={
        "type": "allowed_tools",
        "allowed_tools": {
            "mode": "auto",
            "tools": allowed_tools
        }
    }
)

print(response.choices[0].message.tool_calls)
```

<details>
<summary>Example outputs (may vary by model)</summary>

```python
[ChatCompletionMessageFunctionToolCall(
    id='call_0wbeATsht98xETF63nIWz0K7',
    function=Function(arguments='{"location": "Hong Kong", "unit": "celsius"}', name='get_current_weather'),
    type='function'
)]
```

Or if you allow only `plus`:

```python
[ChatCompletionMessageFunctionToolCall(
    id='call_I4gNUX1slNWKXKibtyVBithb',
    function=Function(arguments='{"a": 10, "b": 5}', name='plus'),
    type='function'
)]
```

</details>


<details>
<summary>Note about tool_choice compatibility</summary>

:::note
The `tool_choice` parameter with `allowed_tools` does not work with all models on Poe, even though it is documented as a valid argument in the OpenAI API specification. First-party OpenAI models do not support this parameter. As a result, this feature is only transitively supported by a limited set of models on Poe, such as `o3-mini`.
:::

</details>

### Agentic Loop

The model can iterate through multiple tool calls, reasoning about intermediate results. Here's a simple agentic loop that allows the model to chain tool calls.

:::tip
First copy and paste the code from the [Setup](#setup) section to define your API key, model, client, and tools.
:::

```python
import json

def execute_tool_call(tool_call):
    """Execute a tool call and return the result."""
    function_name = tool_call.function.name
    arguments = json.loads(tool_call.function.arguments)

    if function_name == "plus":
        result = arguments["a"] + arguments["b"]
        return str(result)
    elif function_name == "get_current_weather":
        # Mock implementation
        return json.dumps({
            "location": arguments["location"],
            "temperature": 72,
            "unit": arguments.get("unit", "fahrenheit"),
            "condition": "sunny"
        })

    return "Tool not found"

# Initialize conversation
messages = [
    {"role": "user", "content": "What is 30000 + 30000 + 30000 + 4000 + 41? Treat that number as a ZIP code and tell me the weather there."}
]

# Agentic loop - allow up to 10 iterations
max_iterations = 10
for i in range(max_iterations):
    response = client.chat.completions.create(
        model="GPT-5",
        messages=messages,
        tools=TOOLS
    )

    assistant_message = response.choices[0].message

    # Check if there are tool calls
    if not assistant_message.tool_calls:
        # No more tool calls, the model has finished
        print(f"Final response: {assistant_message.content}")
        break

    # Add assistant's message with tool calls to conversation
    messages.append(assistant_message)

    # Execute each tool call and add results
    for tool_call in assistant_message.tool_calls:
        print(f"Calling {tool_call.function.name} with args: {tool_call.function.arguments}")
        tool_result = execute_tool_call(tool_call)
        print(f"Tool result: {tool_result}")
        messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": tool_result
        })

    print(f"Iteration {i + 1}: Executed {len(assistant_message.tool_calls)} tool(s)")
    print()

print(f"Conversation finished after {i + 1} iteration(s)")
```

<details>
<summary>Example output (may vary by model)</summary>

```
Calling plus with args: {"a": 30000, "b": 30000}
Tool result: 60000
Iteration 1: Executed 1 tool(s)

Calling plus with args: {"a": 60000, "b": 30000}
Tool result: 90000
Iteration 2: Executed 1 tool(s)

Calling plus with args: {"a": 90000, "b": 4041}
Tool result: 94041
Iteration 3: Executed 1 tool(s)

Calling get_current_weather with args: {"location": "94041", "unit": "fahrenheit"}
Tool result: {"location": "94041", "temperature": 72, "unit": "fahrenheit", "condition": "sunny"}
Iteration 4: Executed 1 tool(s)

Final response: The sum is 94,041. Current weather in ZIP 94041: 72°F and sunny.
Conversation finished after 5 iteration(s)
```

</details>

This loop enables:
- **Iterative reasoning**: The model can make decisions based on previous tool results
- **Chained operations**: Results from one tool can inform the next tool call
- **Complex workflows**: Multi-step problem solving with dynamic tool selection

