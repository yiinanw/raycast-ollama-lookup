/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `explain-selection` command */
  export type ExplainSelection = ExtensionPreferences & {}
  /** Preferences accessible in the `explain-text` command */
  export type ExplainText = ExtensionPreferences & {
  /** Ollama Model - The Ollama model to use. */
  "model": string,
  /** Ollama Base URL - The Ollama server URL. */
  "baseUrl": string,
  /** Default Domain - Bias the explanation toward a professional domain. */
  "domain": "auto" | "programming" | "medicine" | "finance" | "academic" | "english"
}
}

declare namespace Arguments {
  /** Arguments passed to the `explain-selection` command */
  export type ExplainSelection = {}
  /** Arguments passed to the `explain-text` command */
  export type ExplainText = {
  /** Text to explain */
  "text": string
}
}

