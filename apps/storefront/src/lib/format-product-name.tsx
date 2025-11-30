import type { ReactElement } from "react";

/**
 * Normalizes spaces around brackets and commas in product names
 * Rules:
 * - "(" - one space before, no space after
 * - ")" - no space before, one space after
 * - "," - no space before, one space after
 *
 * @param name - Product name to normalize
 * @returns Normalized product name
 *
 * @example
 * normalizeProductName("MB(new)old,value")
 * // Returns: "MB (new) old, value"
 */
function normalizeProductName(name: string): string {
  return (
    name
      // Normalize spaces around opening bracket "("
      // Remove all spaces before and after, then add one space before
      .replace(/\s*\(\s*/g, " (")
      // Normalize spaces around closing bracket ")"
      // Remove all spaces before and after, then add one space after
      .replace(/\s*\)\s*/g, ") ")
      // Normalize spaces around comma ","
      // Remove all spaces before and after, then add one space after
      .replace(/\s*,\s*/g, ", ")
      // Clean up multiple consecutive spaces
      .replace(/\s{2,}/g, " ")
      // Trim leading/trailing spaces
      .trim()
  );
}

/**
 * Formats product name by adding word break opportunities after commas,
 * spaces, and other separators to prevent layout breaking
 *
 * @param name - Product name to format
 * @returns JSX with <wbr> tags inserted for smart line breaking
 *
 * @example
 * formatProductName("MB H310M,2xDDR4,10xUSB")
 * // Returns: <>MB H310M, <wbr />2xDDR4, <wbr />10xUSB</>
 *
 * @example
 * formatProductName("Price: 2,500") // Comma between digits - no break
 * // Returns: <>Price: 2,500</>
 */
export function formatProductName(name: string): ReactElement {
  // First normalize spaces around brackets and commas
  const normalized = normalizeProductName(name);

  const parts: (string | ReactElement)[] = [];
  let currentPart = "";
  let charsSinceLastBreak = 0;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const prevChar = i > 0 ? normalized[i - 1] : "";
    const nextChar = i < normalized.length - 1 ? normalized[i + 1] : "";

    currentPart += char;
    charsSinceLastBreak++;

    let shouldAddBreak = false;

    // Add <wbr> after comma if not between digits
    if (char === "," && (!isDigit(prevChar) || !isDigit(nextChar))) {
      shouldAddBreak = true;
    }
    // Add <wbr> after space if next part looks like it could be long
    else if (char === " " && nextChar && !isDigit(nextChar)) {
      shouldAddBreak = true;
    }
    // Add <wbr> every 15 characters to break very long words
    else if (charsSinceLastBreak >= 15 && char !== " ") {
      shouldAddBreak = true;
    }

    if (shouldAddBreak) {
      parts.push(currentPart);
      parts.push(<wbr key={`wbr-${i}`} />);
      currentPart = "";
      charsSinceLastBreak = 0;
    }
  }

  // Add remaining part
  if (currentPart) {
    parts.push(currentPart);
  }

  return <>{parts}</>;
}

function isDigit(char: string): boolean {
  return /\d/.test(char);
}
