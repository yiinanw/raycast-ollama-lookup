import {
  Action,
  ActionPanel,
  Clipboard,
  Detail,
  Icon,
  LaunchProps,
  Toast,
  getPreferenceValues,
  showToast,
} from "@raycast/api";
import { useEffect, useMemo, useState } from "react";

type Arguments = {
  text?: string;
};

type Preferences = {
  model: string;
  baseUrl: string;
  domain:
    | "auto"
    | "programming"
    | "medicine"
    | "finance"
    | "academic"
    | "english";
};

type OllamaStreamResponse = {
  message?: {
    content?: string;
  };
  done?: boolean;
  error?: string;
};

const domainLabels: Record<Preferences["domain"], string> = {
  auto: "自动判断领域",
  programming: "编程 / 软件工程",
  medicine: "医学 / 生命科学",
  finance: "金融 / 商业",
  academic: "论文 / 学术阅读",
  english: "英文阅读 / 语言学习",
};

function stripThinkTags(content: string) {
  return content
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*$/gi, "")
    .trim();
}

function buildSystemPrompt(domain: Preferences["domain"]) {
  return [
    "你是一个专业术语解释助手，运行在用户的 macOS 本地环境中。",
    "用户会给你一段选中的词、短语、英文表达、代码符号、论文术语或专业概念。",
    `当前解释方向：${domainLabels[domain]}。`,
    "请用中文回答，不要输出推理过程，不要输出 <think> 标签。",
    "如果术语可能属于多个领域，请先给出最可能的含义，再补充其他常见含义。",
    "输出格式固定为：",
    "## 一句话解释",
    "## 专业解释",
    "## 常见上下文",
    "## 例子",
    "## 容易混淆",
    "回答要短而准，适合在 Raycast 小窗口里阅读。总长度控制在 500 字以内。",
  ].join("\n");
}

async function explainWithOllama(
  text: string,
  preferences: Preferences,
  signal: AbortSignal,
  onUpdate: (content: string) => void,
) {
  const response = await fetch(
    `${preferences.baseUrl.replace(/\/$/, "")}/api/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: preferences.model,
        stream: true,
        think: false,
        keep_alive: "10m",
        options: {
          temperature: 0.2,
          num_predict: 700,
        },
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(preferences.domain),
          },
          {
            role: "user",
            content: `/no_think\n请解释下面选中的内容：\n\n${text}`,
          },
        ],
      }),
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(`Ollama returned HTTP ${response.status}`);
  }

  if (!response.body) {
    throw new Error("Ollama returned an empty response body.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const data = JSON.parse(line) as OllamaStreamResponse;

      if (data.error) {
        throw new Error(data.error);
      }

      const token = data.message?.content ?? "";

      if (token) {
        content += token;
        onUpdate(stripThinkTags(content));
      }
    }
  }

  const finalContent = stripThinkTags(content);

  if (!finalContent) {
    throw new Error("Ollama returned an empty response.");
  }

  return finalContent;
}

export default function Command(props: LaunchProps<{ arguments: Arguments }>) {
  const preferences = getPreferenceValues<Preferences>();
  const argumentText = props.arguments.text?.trim();
  const [sourceText, setSourceText] = useState(argumentText ?? "");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300_000);

    async function run() {
      try {
        const text = argumentText || (await Clipboard.readText())?.trim() || "";

        if (!text) {
          throw new Error(
            "没有找到要解释的文本。请先选中文本运行 Explain Selected Text，或复制文本后运行 Explain Text。",
          );
        }

        if (isMounted) {
          setSourceText(text);
        }

        const result = await explainWithOllama(
          text,
          preferences,
          controller.signal,
          (partialResult) => {
            if (isMounted && partialResult) {
              setAnswer(partialResult);
            }
          },
        );

        if (isMounted) {
          setAnswer(result);
        }
      } catch (caughtError) {
        const message =
          caughtError instanceof Error && caughtError.name === "AbortError"
            ? "请求超时。请确认 Ollama 正在运行，或先在终端预热模型。"
            : caughtError instanceof Error
              ? caughtError.message
              : String(caughtError);

        if (isMounted) {
          setError(message);
        }

        await showToast({
          style: Toast.Style.Failure,
          title: "Ollama Lookup failed",
          message,
        });
      } finally {
        clearTimeout(timeout);

        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    run();

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [argumentText]);

  const markdown = useMemo(() => {
    if (error) {
      return [
        "# Ollama Lookup",
        "",
        `**错误：** ${error}`,
        "",
        "请确认：",
        "",
        "- Ollama 已经启动",
        `- 模型 \`${preferences.model}\` 已经下载`,
        `- API 地址是 \`${preferences.baseUrl}\``,
        "",
        "可以先在终端测试：",
        "",
        "```bash",
        "curl http://127.0.0.1:11434/api/version",
        "```",
      ].join("\n");
    }

    if (!answer) {
      return [
        "# Ollama Lookup",
        "",
        isLoading ? "正在调用本地模型..." : "没有生成结果。",
        "",
        sourceText ? `> ${sourceText}` : "",
      ].join("\n");
    }

    return [`# ${sourceText}`, "", answer].join("\n");
  }, [
    answer,
    error,
    isLoading,
    preferences.baseUrl,
    preferences.model,
    sourceText,
  ]);

  return (
    <Detail
      isLoading={isLoading}
      markdown={markdown}
      actions={
        <ActionPanel>
          {answer ? (
            <>
              <Action.CopyToClipboard
                title="Copy Explanation"
                content={answer}
                icon={Icon.Clipboard}
              />
              <Action.CopyToClipboard
                title="Copy Source Text"
                content={sourceText}
                icon={Icon.Text}
              />
            </>
          ) : null}
          <Action.OpenInBrowser
            title="Open Ollama API"
            url={`${preferences.baseUrl.replace(/\/$/, "")}/api/version`}
          />
        </ActionPanel>
      }
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Model" text={preferences.model} />
          <Detail.Metadata.Label
            title="Domain"
            text={domainLabels[preferences.domain]}
          />
          <Detail.Metadata.Label title="Endpoint" text={preferences.baseUrl} />
        </Detail.Metadata>
      }
    />
  );
}
