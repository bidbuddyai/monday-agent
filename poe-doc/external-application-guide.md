---
title: "External Application Guide"
sidebar_position: 1
description: |
  External applications exist outside the Poe client UI. They connect to Poe via a Poe user's API key, and use the Poe API to query Poe bots and models.
---
# Overview

External applications exist outside the Poe client UI. They connect to Poe via a Poe user's API key, and use the Poe API to query Poe bots and models on behalf of that user, spending the user's points in the process.

Examples of possible external applications:

- Browser toolbars
- Shell scripts
- Alternative chat interfaces
- Specialized client applications like IDEs

# Querying Poe bots via an API key

All Poe API keys are associated with a user account. As a creator, you can use your own API key, meaning points will be charged to your own Poe account, or you can ask users of your product to provide their Poe API key, meaning points will be charge to their Poe account. Note that if you are creating a server bot, you can charge requests directly to the user's account without requiring an API key via [Accessing other bots on Poe](/docs/server-bots/accessing-other-bots-on-poe).

> ❗️ Warning
> 
> This API makes the API key owner's entire point balance available to any bot that is queried, so you may want to be careful about calling bots that are not your own or are not marked as official.

#### Get an API Key

Navigate to [poe.com/api_key](https://poe.com/api_key) and copy your user API key (or ask your users to do the same).

![Image](https://files.readme.io/2b74562b026bc968fe54d746148458d34537899901fe4b9fb223e956d2a1d68b-Poe_API_Key_2025-04-03_at_4.06.13_PM.jpg)

#### Install Dependencies

To use the fastapi_poe library in your project, you'll need to install it first. This can be done using pip, Python's package installer. The command `pip install fastapi-poe` will download and install the latest version of the library and its dependencies from PyPI (Python Package Index).

Run this command in your terminal or command prompt to complete the installation.

#### Call "get_bot_response" or "get_bot_response_sync".

In a python shell, run the following after replacing the placeholder with an API key.

```python
import fastapi_poe as fp

api_key = <api_key> # replace this with your API key
message = fp.ProtocolMessage(role="user", content="Hello world")

for partial in fp.get_bot_response_sync(messages=[message], bot_name="GPT-3.5-Turbo", api_key=api_key):
    print(partial)
```

For asynchronous applications, use `fp.get_bot_response` instead of `fp.get_bot_response_sync`.

```python
import asyncio
import fastapi_poe as fp

async def get_response():
    api_key = <api_key> # replace this with your API key
    message = fp.ProtocolMessage(role="user", content="Hello world")
    async for partial in fp.get_bot_response(messages=[message], bot_name="GPT-3.5-Turbo", api_key=api_key): 
        print(partial)

def main():
    asyncio.run(get_response())

if __name__ == "__main__":
    main()
```

#### Sending files in the query

Use `fp.upload_file` to upload the files before sending them in the request.

```python
import fastapi_poe as fp

api_key = <api_key> # replace this with your API key
pdf_attachment = fp.upload_file_sync(open("draconomicon.pdf", "rb"), api_key=api_key)
message = fp.ProtocolMessage(role="user", content="Hello world", attachments=[pdf_attachment])

for partial in fp.get_bot_response_sync(messages=[message], bot_name="GPT-3.5-Turbo", api_key=api_key):
    print(partial)
```

Limitations:

- Requests are rate-limited to 500 requests per minute per user.
- Compute points are deducted directly from the account associated with the API key.

# Questions?

Please [contact us](/docs/resources/how-to-contact-us) if you would like a higher limit or want to request any other changes to support your external application.
