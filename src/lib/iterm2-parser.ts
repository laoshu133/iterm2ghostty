// iTerm2 Profile JSON → Ghostty config converter

export interface ITerm2Profile {
  "Normal Font"?: string;
  "Non Ascii Font"?: string;
  "Font Size"?: number; // sometimes embedded in Normal Font string
  "Background Color"?: ITerm2Color;
  "Foreground Color"?: ITerm2Color;
  "Cursor Color"?: ITerm2Color;
  "Selection Color"?: ITerm2Color;
  "Selected Text Color"?: ITerm2Color;
  "Bold Color"?: ITerm2Color;
  "Ansi 0 Color"?: ITerm2Color;
  "Ansi 1 Color"?: ITerm2Color;
  "Ansi 2 Color"?: ITerm2Color;
  "Ansi 3 Color"?: ITerm2Color;
  "Ansi 4 Color"?: ITerm2Color;
  "Ansi 5 Color"?: ITerm2Color;
  "Ansi 6 Color"?: ITerm2Color;
  "Ansi 7 Color"?: ITerm2Color;
  "Ansi 8 Color"?: ITerm2Color;
  "Ansi 9 Color"?: ITerm2Color;
  "Ansi 10 Color"?: ITerm2Color;
  "Ansi 11 Color"?: ITerm2Color;
  "Ansi 12 Color"?: ITerm2Color;
  "Ansi 13 Color"?: ITerm2Color;
  "Ansi 14 Color"?: ITerm2Color;
  "Ansi 15 Color"?: ITerm2Color;
  "Columns"?: number;
  "Rows"?: number;
  "Transparency"?: number;
  "Blur"?: boolean;
  "Blur Radius"?: number;
  "Cursor Type"?: number; // 0=underline, 1=vertical bar, 2=box
  "Blinking Cursor"?: boolean;
  "Scrollback Lines"?: number;
  "Unlimited Scrollback"?: boolean;
  "Window Type"?: number;
  "Name"?: string;
  "Guid"?: string;
  "Custom Window Title"?: string;
  "Use Bold Font"?: boolean;
  "Use Italic Font"?: boolean;
  "Vertical Spacing"?: number;
  "Horizontal Spacing"?: number;
  "Draw Powerline Glyphs"?: boolean;
  [key: string]: unknown;
}

interface ITerm2Color {
  "Red Component": number;
  "Green Component": number;
  "Blue Component": number;
  "Alpha Component"?: number;
  "Color Space"?: string;
}

function colorToHex(c: ITerm2Color): string {
  const r = Math.round(c["Red Component"] * 255);
  const g = Math.round(c["Green Component"] * 255);
  const b = Math.round(c["Blue Component"] * 255);
  return `${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function parseFontName(fontStr: string): { name: string; size: number } {
  // Format: "FontName-Style Size" or "FontName Size"
  const match = fontStr.match(/^(.+?)\s+(\d+(?:\.\d+)?)$/);
  if (match) {
    let name = match[1];
    // Convert PostScript name to human-readable
    name = name.replace(/-/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
    return { name, size: parseFloat(match[2]) };
  }
  return { name: fontStr, size: 14 };
}

function cursorTypeToGhostty(type?: number): string {
  switch (type) {
    case 0: return "underline";
    case 1: return "bar";
    case 2: return "block";
    default: return "block";
  }
}

export interface ConversionResult {
  config: string;
  warnings: string[];
  mappings: { key: string; iterm2Value: string; ghosttyValue: string }[];
}

export function convertITerm2ToGhostty(profile: ITerm2Profile): ConversionResult {
  const lines: string[] = [];
  const warnings: string[] = [];
  const mappings: { key: string; iterm2Value: string; ghosttyValue: string }[] = [];

  lines.push("# Ghostty Configuration");
  lines.push(`# Converted from iTerm2 profile${profile["Name"] ? `: ${profile["Name"]}` : ""}`);
  lines.push(`# Generated at ${new Date().toISOString()}`);
  lines.push("");

  // Font
  if (profile["Normal Font"]) {
    const { name, size } = parseFontName(profile["Normal Font"]);
    lines.push("# --- Typography ---");
    lines.push(`font-family = "${name}"`);
    lines.push(`font-size = ${size}`);
    mappings.push({ key: "Font", iterm2Value: profile["Normal Font"], ghosttyValue: `${name} @ ${size}pt` });
  }

  if (profile["Use Bold Font"] !== undefined) {
    lines.push(`bold-is-bright = ${profile["Use Bold Font"]}`);
  }

  if (profile["Vertical Spacing"] && profile["Vertical Spacing"] !== 1) {
    const adjust = Math.round((profile["Vertical Spacing"] - 1) * 10);
    if (adjust !== 0) {
      lines.push(`adjust-cell-height = ${adjust}`);
    }
  }

  lines.push("");
  lines.push("# --- Colors ---");

  // Background & Foreground
  if (profile["Background Color"]) {
    const hex = colorToHex(profile["Background Color"]);
    lines.push(`background = ${hex}`);
    mappings.push({ key: "Background", iterm2Value: `RGB(${Math.round(profile["Background Color"]["Red Component"]*255)},${Math.round(profile["Background Color"]["Green Component"]*255)},${Math.round(profile["Background Color"]["Blue Component"]*255)})`, ghosttyValue: `#${hex}` });
  }

  if (profile["Foreground Color"]) {
    const hex = colorToHex(profile["Foreground Color"]);
    lines.push(`foreground = ${hex}`);
    mappings.push({ key: "Foreground", iterm2Value: `RGB`, ghosttyValue: `#${hex}` });
  }

  if (profile["Cursor Color"]) {
    lines.push(`cursor-color = ${colorToHex(profile["Cursor Color"])}`);
  }

  if (profile["Selection Color"]) {
    lines.push(`selection-background = ${colorToHex(profile["Selection Color"])}`);
  }

  if (profile["Selected Text Color"]) {
    lines.push(`selection-foreground = ${colorToHex(profile["Selected Text Color"])}`);
  }

  // ANSI colors
  const ansiNames = [
    "black", "red", "green", "yellow", "blue", "magenta", "cyan", "white",
    "bright black", "bright red", "bright green", "bright yellow", "bright blue", "bright magenta", "bright cyan", "bright white"
  ];

  for (let i = 0; i < 16; i++) {
    const colorKey = `Ansi ${i} Color` as keyof ITerm2Profile;
    const color = profile[colorKey] as ITerm2Color | undefined;
    if (color) {
      lines.push(`palette = ${i}=#${colorToHex(color)}`);
      mappings.push({ key: `Ansi ${i} (${ansiNames[i]})`, iterm2Value: "RGB", ghosttyValue: `#${colorToHex(color)}` });
    }
  }

  // Transparency
  if (profile["Transparency"] && profile["Transparency"] > 0) {
    const opacity = Math.round((1 - profile["Transparency"]) * 100) / 100;
    lines.push("");
    lines.push(`background-opacity = ${opacity}`);
    if (profile["Blur"]) {
      lines.push(`background-blur-radius = ${profile["Blur Radius"] || 20}`);
    }
    mappings.push({ key: "Transparency", iterm2Value: `${Math.round(profile["Transparency"] * 100)}%`, ghosttyValue: `opacity ${opacity}` });
  }

  // Cursor
  lines.push("");
  lines.push("# --- Cursor ---");
  const cursorStyle = cursorTypeToGhostty(profile["Cursor Type"]);
  lines.push(`cursor-style = ${cursorStyle}`);
  if (profile["Blinking Cursor"] !== undefined) {
    lines.push(`cursor-style-blink = ${profile["Blinking Cursor"]}`);
  }

  // Window
  lines.push("");
  lines.push("# --- Window ---");
  if (profile["Columns"] && profile["Rows"]) {
    lines.push(`window-width = ${profile["Columns"]}`);
    lines.push(`window-height = ${profile["Rows"]}`);
  }
  lines.push("window-padding-x = 4");
  lines.push("window-padding-y = 4");

  // Scrollback
  if (profile["Unlimited Scrollback"]) {
    lines.push("");
    lines.push("scrollback-limit = 0");
    warnings.push("Ghostty uses scrollback-limit=0 for unlimited. This may use more memory.");
  } else if (profile["Scrollback Lines"]) {
    lines.push("");
    lines.push(`scrollback-limit = ${profile["Scrollback Lines"]}`);
  }

  // Shell integration
  lines.push("");
  lines.push("# --- Shell Integration ---");
  lines.push("shell-integration = detect");

  // Keybindings (common iTerm2 defaults)
  lines.push("");
  lines.push("# --- Keybindings (iTerm2-like) ---");
  lines.push("keybind = cmd+t=new_tab");
  lines.push("keybind = cmd+w=close_surface");
  lines.push("keybind = cmd+d=new_split:right");
  lines.push("keybind = cmd+shift+d=new_split:down");
  lines.push("keybind = cmd+shift+left=previous_tab");
  lines.push("keybind = cmd+shift+right=next_tab");
  lines.push("keybind = cmd+alt+left=goto_split:left");
  lines.push("keybind = cmd+alt+right=goto_split:right");
  lines.push("keybind = cmd+alt+up=goto_split:top");
  lines.push("keybind = cmd+alt+down=goto_split:bottom");
  lines.push("keybind = cmd+plus=increase_font_size:1");
  lines.push("keybind = cmd+minus=decrease_font_size:1");

  // Powerline
  if (profile["Draw Powerline Glyphs"]) {
    warnings.push("Ghostty natively supports Powerline glyphs if your font includes them.");
  }

  // Unsupported features
  if (profile["Window Type"] === 1) {
    warnings.push("iTerm2 fullscreen window type detected. Use Cmd+Enter in Ghostty for fullscreen.");
  }

  return {
    config: lines.join("\n"),
    warnings,
    mappings,
  };
}

export function parseITerm2ProfileJSON(text: string): ITerm2Profile {
  const data = JSON.parse(text);
  // Could be a single profile or an array
  if (Array.isArray(data)) {
    return data[0];
  }
  // Could be wrapped in "Profiles" key
  if (data.Profiles && Array.isArray(data.Profiles)) {
    return data.Profiles[0];
  }
  return data;
}
