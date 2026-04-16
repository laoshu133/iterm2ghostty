// Powerlevel10k (.p10k.zsh) → Starship (starship.toml) converter

export interface P10kConfig {
  leftElements: string[];
  rightElements: string[];
  variables: Record<string, string>;
  rawContent: string;
}

export interface StarshipConversionResult {
  config: string;
  warnings: string[];
  mappings: { key: string; p10kValue: string; starshipValue: string }[];
}

// Parse .p10k.zsh file content and extract POWERLEVEL9K_* variables
export function parseP10kConfig(content: string): P10kConfig {
  const variables: Record<string, string> = {};
  const lines = content.split("\n");

  // Match typeset or direct assignment of POWERLEVEL9K_* vars
  // Handles: typeset -g POWERLEVEL9K_FOO=bar  /  POWERLEVEL9K_FOO=bar  /  POWERLEVEL9K_FOO='bar'
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) continue;

    const match = trimmed.match(
      /(?:typeset\s+-g\s+)?(?:local\s+)?(?:export\s+)?(POWERLEVEL9K_\w+)=(.+)/
    );
    if (match) {
      const key = match[1];
      let value = match[2].trim();
      // Strip surrounding quotes
      if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
        value = value.slice(1, -1);
      }
      // Strip inline comments
      value = value.replace(/\s*#.*$/, "").trim();
      variables[key] = value;
    }
  }

  // Parse prompt elements arrays: ( elem1 elem2 elem3 )
  const leftElements = parseElementsArray(variables["POWERLEVEL9K_LEFT_PROMPT_ELEMENTS"] || "");
  const rightElements = parseElementsArray(variables["POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS"] || "");

  return { leftElements, rightElements, variables, rawContent: content };
}

function parseElementsArray(value: string): string[] {
  // Format: (elem1 elem2 newline elem3) — may span multiple lines in raw, but we get the joined value
  const cleaned = value.replace(/[()]/g, "").trim();
  if (!cleaned) return [];
  return cleaned.split(/\s+/).filter(Boolean);
}

// Map p10k segment names to starship module names
const SEGMENT_TO_MODULE: Record<string, string> = {
  dir: "directory",
  vcs: "git_branch",
  status: "status",
  command_execution_time: "cmd_duration",
  background_jobs: "jobs",
  time: "time",
  node_version: "nodejs",
  nvm: "nodejs",
  pyenv: "python",
  virtualenv: "python",
  anaconda: "conda",
  rbenv: "ruby",
  rvm: "ruby",
  java_version: "java",
  go_version: "golang",
  rust_version: "rust",
  dotnet_version: "dotnet",
  php_version: "php",
  swift_version: "swift",
  package: "package",
  kubecontext: "kubernetes",
  aws: "aws",
  gcloud: "gcloud",
  azure: "azure",
  terraform: "terraform",
  docker_machine: "docker_context",
  context: "username",
  battery: "battery",
  ram: "memory_usage",
  os_icon: "os",
  prompt_char: "character",
};

// Map p10k color names to starship-compatible color names
function mapColor(p10kColor: string): string {
  const colorMap: Record<string, string> = {
    "0": "black", "1": "red", "2": "green", "3": "yellow",
    "4": "blue", "5": "purple", "6": "cyan", "7": "white",
    "8": "bright-black", "9": "bright-red", "10": "bright-green", "11": "bright-yellow",
    "12": "bright-blue", "13": "bright-purple", "14": "bright-cyan", "15": "bright-white",
  };
  // Handle numeric ANSI codes
  if (/^\d+$/.test(p10kColor)) {
    return colorMap[p10kColor] || `#${p10kColor}`;
  }
  return p10kColor.toLowerCase();
}

export function convertP10kToStarship(config: P10kConfig): StarshipConversionResult {
  const sections: Record<string, Record<string, string | boolean | number>> = {};
  const warnings: string[] = [];
  const mappings: { key: string; p10kValue: string; starshipValue: string }[] = [];

  // --- Build format string from left elements ---
  const leftModules: string[] = [];
  const rightModules: string[] = [];

  for (const elem of config.leftElements) {
    if (elem === "newline") {
      leftModules.push("$line_break");
      continue;
    }
    const mod = SEGMENT_TO_MODULE[elem];
    if (mod) {
      leftModules.push(`$${mod}`);
      mappings.push({ key: `左侧: ${elem}`, p10kValue: elem, starshipValue: `$${mod}` });
    } else if (elem !== "os_icon" && !elem.startsWith("p10k")) {
      warnings.push(`左侧段 "${elem}" 没有直接对应的 Starship 模块，已跳过`);
    }
  }

  for (const elem of config.rightElements) {
    if (elem === "newline") continue;
    const mod = SEGMENT_TO_MODULE[elem];
    if (mod) {
      rightModules.push(`$${mod}`);
      mappings.push({ key: `右侧: ${elem}`, p10kValue: elem, starshipValue: `$${mod}` });
    } else if (!elem.startsWith("p10k")) {
      warnings.push(`右侧段 "${elem}" 没有直接对应的 Starship 模块，已跳过`);
    }
  }

  // Always ensure character is at the end
  if (!leftModules.includes("$character")) {
    leftModules.push("$line_break");
    leftModules.push("$character");
  }

  // --- Top-level config ---
  const topLines: string[] = [
    `"$schema" = 'https://starship.rs/config-schema.json'`,
    "",
    "# Converted from Powerlevel10k configuration",
    `# Generated at ${new Date().toISOString()}`,
    "",
  ];

  // Add newline setting
  const addNewline = config.variables["POWERLEVEL9K_PROMPT_ADD_NEWLINE"];
  if (addNewline === "true" || addNewline === undefined) {
    topLines.push("add_newline = true");
  } else {
    topLines.push("add_newline = false");
  }

  // Format string
  topLines.push("");
  topLines.push(`format = """${leftModules.join("")}\n"""`);

  if (rightModules.length > 0) {
    topLines.push(`right_format = """${rightModules.join("")}\n"""`);
    mappings.push({ key: "右侧格式", p10kValue: `${config.rightElements.length} segments`, starshipValue: `right_format` });
  }

  topLines.push("");

  // --- Character module ---
  const charOk = config.variables["POWERLEVEL9K_PROMPT_CHAR_OK_{CONTENT}"]
    || config.variables["POWERLEVEL9K_PROMPT_CHAR_OK_VIINS_CONTENT_EXPANSION"]
    || "❯";
  const charError = config.variables["POWERLEVEL9K_PROMPT_CHAR_ERROR_{CONTENT}"]
    || config.variables["POWERLEVEL9K_PROMPT_CHAR_ERROR_VIINS_CONTENT_EXPANSION"]
    || "❯";
  const charOkColor = config.variables["POWERLEVEL9K_PROMPT_CHAR_OK_VIINS_FOREGROUND"]
    || config.variables["POWERLEVEL9K_PROMPT_CHAR_OK_{FOREGROUND}"];
  const charErrColor = config.variables["POWERLEVEL9K_PROMPT_CHAR_ERROR_VIINS_FOREGROUND"]
    || config.variables["POWERLEVEL9K_PROMPT_CHAR_ERROR_{FOREGROUND}"];

  sections["character"] = {};
  if (charOk !== "❯") {
    sections["character"]["success_symbol"] = `"[${charOk}](${charOkColor ? mapColor(charOkColor) : "green"})"`;
  }
  if (charError !== "❯") {
    sections["character"]["error_symbol"] = `"[${charError}](${charErrColor ? mapColor(charErrColor) : "red"})"`;
  }
  if (Object.keys(sections["character"]).length === 0) {
    delete sections["character"];
  } else {
    mappings.push({ key: "提示符", p10kValue: charOk, starshipValue: "character module" });
  }

  // --- Directory module ---
  const dirTrunc = config.variables["POWERLEVEL9K_SHORTEN_DIR_LENGTH"];
  const dirStrategy = config.variables["POWERLEVEL9K_SHORTEN_STRATEGY"];
  const dirFg = config.variables["POWERLEVEL9K_DIR_FOREGROUND"];

  sections["directory"] = {};
  if (dirTrunc) {
    sections["directory"]["truncation_length"] = parseInt(dirTrunc);
    mappings.push({ key: "目录截断", p10kValue: `${dirTrunc} levels`, starshipValue: `truncation_length = ${dirTrunc}` });
  }
  if (dirStrategy === "truncate_to_unique") {
    sections["directory"]["truncation_symbol"] = '"…/"';
    sections["directory"]["fish_style_pwd_dir_length"] = 1;
  } else if (dirStrategy === "truncate_from_right") {
    sections["directory"]["truncation_symbol"] = '"…/"';
  }
  if (dirFg) {
    sections["directory"]["style"] = `"bold ${mapColor(dirFg)}"`;
  }
  if (Object.keys(sections["directory"]).length === 0) {
    delete sections["directory"];
  }

  // --- Git (VCS) module ---
  const gitFg = config.variables["POWERLEVEL9K_VCS_CLEAN_FOREGROUND"]
    || config.variables["POWERLEVEL9K_VCS_FOREGROUND"];
  const gitDirtyFg = config.variables["POWERLEVEL9K_VCS_MODIFIED_FOREGROUND"]
    || config.variables["POWERLEVEL9K_VCS_UNTRACKED_FOREGROUND"];

  if (gitFg) {
    sections["git_branch"] = { style: `"bold ${mapColor(gitFg)}"` };
    mappings.push({ key: "Git 分支颜色", p10kValue: gitFg, starshipValue: mapColor(gitFg) });
  }
  if (gitDirtyFg) {
    sections["git_status"] = { style: `"bold ${mapColor(gitDirtyFg)}"` };
  }

  // --- Time module ---
  const timeFormat = config.variables["POWERLEVEL9K_TIME_FORMAT"];
  if (timeFormat || config.rightElements.includes("time") || config.leftElements.includes("time")) {
    sections["time"] = { disabled: false };
    if (timeFormat) {
      // Convert zsh time format to chrono format
      let starshipFmt = timeFormat
        .replace(/%H/g, "%H")
        .replace(/%M/g, "%M")
        .replace(/%S/g, "%S")
        .replace(/%D/g, "%Y-%m-%d")
        .replace(/%\*/g, "%T");
      sections["time"]["time_format"] = `"${starshipFmt}"`;
      mappings.push({ key: "时间格式", p10kValue: timeFormat, starshipValue: starshipFmt });
    }
  }

  // --- Command duration ---
  const cmdMinDuration = config.variables["POWERLEVEL9K_COMMAND_EXECUTION_TIME_THRESHOLD"];
  if (cmdMinDuration) {
    sections["cmd_duration"] = { min_time: parseInt(cmdMinDuration) * 1000 };
    mappings.push({ key: "命令耗时阈值", p10kValue: `${cmdMinDuration}s`, starshipValue: `${parseInt(cmdMinDuration) * 1000}ms` });
  }

  // --- Node version ---
  const nodeFg = config.variables["POWERLEVEL9K_NODE_VERSION_FOREGROUND"]
    || config.variables["POWERLEVEL9K_NVM_FOREGROUND"];
  if (nodeFg) {
    sections["nodejs"] = { style: `"bold ${mapColor(nodeFg)}"` };
  }

  // --- Python ---
  const pyFg = config.variables["POWERLEVEL9K_PYENV_FOREGROUND"]
    || config.variables["POWERLEVEL9K_VIRTUALENV_FOREGROUND"];
  if (pyFg) {
    sections["python"] = { style: `"bold ${mapColor(pyFg)}"` };
  }

  // --- Kubernetes ---
  if (config.leftElements.includes("kubecontext") || config.rightElements.includes("kubecontext")) {
    sections["kubernetes"] = { disabled: false };
    const k8sFg = config.variables["POWERLEVEL9K_KUBECONTEXT_FOREGROUND"];
    if (k8sFg) {
      sections["kubernetes"]["style"] = `"bold ${mapColor(k8sFg)}"`;
    }
    mappings.push({ key: "Kubernetes", p10kValue: "kubecontext", starshipValue: "[kubernetes] disabled = false" });
  }

  // --- Battery ---
  if (config.leftElements.includes("battery") || config.rightElements.includes("battery")) {
    sections["battery"] = { disabled: false };
    mappings.push({ key: "电池", p10kValue: "battery", starshipValue: "[battery] disabled = false" });
  }

  // --- Transient prompt ---
  if (config.variables["POWERLEVEL9K_TRANSIENT_PROMPT"] === "always" ||
      config.variables["POWERLEVEL9K_TRANSIENT_PROMPT"] === "same-dir") {
    warnings.push("P10k 的 transient prompt 功能在 Starship 中尚不原生支持。可考虑使用 zsh-transient-prompt 插件实现类似效果。");
  }

  // --- Instant prompt ---
  if (config.variables["POWERLEVEL9K_INSTANT_PROMPT"]) {
    warnings.push("P10k 的 instant prompt 功能无需在 Starship 中配置，Starship 本身启动速度极快（~5ms）。");
    mappings.push({ key: "Instant Prompt", p10kValue: config.variables["POWERLEVEL9K_INSTANT_PROMPT"], starshipValue: "不需要（Starship 原生快速）" });
  }

  // --- Vi mode ---
  if (config.variables["POWERLEVEL9K_PROMPT_CHAR_OK_VICMD_CONTENT_EXPANSION"] ||
      config.variables["POWERLEVEL9K_PROMPT_CHAR_OK_VICMD_FOREGROUND"]) {
    warnings.push("检测到 Vi 模式配置。Starship 暂不原生支持 Vi 模式指示，可在 .zshrc 中手动配置。");
  }

  // --- Build final TOML ---
  const tomlLines = [...topLines];

  for (const [section, values] of Object.entries(sections)) {
    tomlLines.push(`[${section}]`);
    for (const [key, val] of Object.entries(values)) {
      if (typeof val === "string" && val.startsWith('"')) {
        tomlLines.push(`${key} = ${val}`);
      } else if (typeof val === "boolean") {
        tomlLines.push(`${key} = ${val}`);
      } else if (typeof val === "number") {
        tomlLines.push(`${key} = ${val}`);
      } else {
        tomlLines.push(`${key} = "${val}"`);
      }
    }
    tomlLines.push("");
  }

  return {
    config: tomlLines.join("\n"),
    warnings,
    mappings,
  };
}
