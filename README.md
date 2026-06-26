# Ollama Lookup for Raycast

[简体中文](README.zh-CN.md) | English

Raycast MVP for explaining selected text with an Ollama model running on your machine.

## What It Does

- `Explain Selected Text`: use as a global hotkey. It captures the selected text from the frontmost app, then opens the explanation view.
- `Explain Text`: explain text passed as an argument. If no argument is passed, it reads the clipboard.

The default model is `qwen3:14b` and the default Ollama URL is `http://127.0.0.1:11434`.

## Install

```bash
cd raycast-ollama-lookup
npm install
npm run dev
```

Then open Raycast and search for `Ollama Lookup`.

If you already have a clone of the repository, run the commands from the project root.

## Recommended Setup

1. Make sure Ollama is running:

   ```bash
   curl http://127.0.0.1:11434/api/version
   ```

2. Make sure the model exists:

   ```bash
   ollama list
   ```

3. In Raycast, assign a hotkey to `Explain Selected Text`.

4. Grant Accessibility permission if macOS asks. Raycast needs it to read selected text from other apps.

## Usage

Select text in any app, press your hotkey, and Raycast will show:

- one-line explanation
- professional explanation
- common context
- example
- commonly confused concepts

If selection capture fails in a specific app, copy the text manually and run `Explain Text`.
