# Ollama Lookup for Raycast

简体中文 | [English](README.md)

一个 Raycast 扩展，用本机运行的 Ollama 模型解释你在任意应用中选中的文本。

## 功能

- `Explain Selected Text`：适合绑定全局快捷键。它会读取当前前台应用中的选中文本，然后打开解释页面。
- `Explain Text`：解释手动输入的文本。如果没有传入文本，会读取剪贴板内容。

默认模型是 `qwen3:14b`，默认 Ollama 地址是 `http://127.0.0.1:11434`。

## 安装

```bash
cd raycast-ollama-lookup
npm install
npm run dev
```

然后打开 Raycast，搜索 `Ollama Lookup`。

如果你已经克隆了这个仓库，请在项目根目录运行上面的命令。

## 推荐配置

1. 确认 Ollama 正在运行：

   ```bash
   curl http://127.0.0.1:11434/api/version
   ```

2. 确认模型已经下载：

   ```bash
   ollama list
   ```

3. 在 Raycast 中给 `Explain Selected Text` 绑定一个全局快捷键。

4. 如果 macOS 弹出权限提示，请给 Raycast 授予辅助功能权限。Raycast 需要这个权限来读取其他应用里的选中文本。

## 使用

在任意应用中选中文本，按下你绑定的快捷键，Raycast 会显示：

- 一句话解释
- 专业解释
- 常见上下文
- 示例
- 容易混淆的概念

如果某个应用无法读取选中文本，可以手动复制文本，然后运行 `Explain Text`。
