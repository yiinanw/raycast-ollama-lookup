import {
  LaunchType,
  Toast,
  getSelectedText,
  launchCommand,
  showHUD,
  showToast,
} from "@raycast/api";

export default async function Command() {
  await showToast({
    style: Toast.Style.Animated,
    title: "Capturing selection...",
  });

  try {
    const selectedText = (await getSelectedText()).trim();

    if (!selectedText) {
      await showHUD(
        "No selected text found. Try copying text first, then run Explain Text.",
      );
      return;
    }

    await launchCommand({
      name: "explain-text",
      type: LaunchType.UserInitiated,
      arguments: { text: selectedText },
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Could not capture selected text",
      message: "Grant Raycast Accessibility permission, or copy text and run Explain Text.",
    });
  }
}
