import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

export const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
export const skillsRoot = path.join(repoRoot, "skills");
export const allowedExtensions = new Set([
  ".cjs",
  ".csv",
  ".ics",
  ".json",
  ".js",
  ".md",
  ".mjs",
  ".py",
  ".ps1",
  ".sh",
  ".sql",
  ".svg",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml"
]);

export type SkillMetadata = {
  name?: string;
  description?: string;
  version?: string;
  metadata?: {
    openclaw?: {
      primaryEnv?: string;
      homepage?: string;
      requires?: {
        env?: string[];
        bins?: string[];
        anyBins?: string[];
        config?: string[];
      };
      install?: Array<Record<string, unknown>>;
    };
  };
};

export type SkillFile = {
  absolutePath: string;
  relativePath: string;
  extension: string;
  size: number;
};

export type SkillDefinition = {
  slug: string;
  dir: string;
  skillPath: string;
  markdown: string;
  metadata: SkillMetadata;
  files: SkillFile[];
};

export type SkillValidationResult = {
  slug: string;
  errors: string[];
  warnings: string[];
};

async function walkFiles(dir: string): Promise<SkillFile[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: SkillFile[] = [];
  for (const entry of entries) {
    if (entry.name === "__pycache__" || entry.name === ".runtime" || entry.name === "runtime") {
      continue;
    }
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(absolutePath)));
      continue;
    }
    const stat = await fs.stat(absolutePath);
    files.push({
      absolutePath,
      relativePath: path.relative(dir, absolutePath).replaceAll("\\", "/"),
      extension: path.extname(entry.name).toLowerCase(),
      size: stat.size
    });
  }
  return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

function parseFrontmatter(markdown: string): SkillMetadata {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return {};
  }
  return (parseYaml(match[1]) as SkillMetadata | null) ?? {};
}

function findEnvReferences(fileText: string): string[] {
  const matches = new Set<string>();
  const patterns = [
    /os\.getenv\(\s*["']([A-Z0-9_]+)["']/g,
    /os\.environ\.get\(\s*["']([A-Z0-9_]+)["']/g,
    /os\.environ\[\s*["']([A-Z0-9_]+)["']\s*\]/g
  ];
  for (const pattern of patterns) {
    for (const match of fileText.matchAll(pattern)) {
      if (match[1]) {
        matches.add(match[1]);
      }
    }
  }
  return [...matches].sort();
}

export async function discoverSkills(): Promise<SkillDefinition[]> {
  const entries = await fs.readdir(skillsRoot, { withFileTypes: true });
  const skills: SkillDefinition[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const dir = path.join(skillsRoot, entry.name);
    const skillPath = path.join(dir, "SKILL.md");
    try {
      const markdown = await fs.readFile(skillPath, "utf8");
      const files = await walkFiles(dir);
      skills.push({
        slug: entry.name,
        dir,
        skillPath,
        markdown,
        metadata: parseFrontmatter(markdown),
        files
      });
    } catch {
      // Ignore folders that are not skills.
    }
  }
  return skills.sort((left, right) => left.slug.localeCompare(right.slug));
}

export async function validateSkill(skill: SkillDefinition): Promise<SkillValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { metadata } = skill;
  const openclaw = metadata.metadata?.openclaw;
  const requiredSections = ["## When to Use", "## Commands", "## Safety Boundaries"];

  if (!/^[a-z0-9][a-z0-9-]*$/.test(skill.slug)) {
    errors.push(`Folder slug "${skill.slug}" is not URL-safe.`);
  }
  if (!metadata.name) {
    errors.push("Frontmatter is missing name.");
  }
  if (!metadata.description) {
    errors.push("Frontmatter is missing description.");
  }
  if (!metadata.version) {
    errors.push("Frontmatter is missing version.");
  }
  if (metadata.name && metadata.name !== skill.slug) {
    errors.push(`Frontmatter name "${metadata.name}" must match folder slug "${skill.slug}".`);
  }
  if (!openclaw) {
    errors.push("Frontmatter is missing metadata.openclaw.");
  }
  for (const section of requiredSections) {
    if (!skill.markdown.includes(section)) {
      errors.push(`SKILL.md is missing required section "${section}".`);
    }
  }

  const totalBytes = skill.files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > 50 * 1024 * 1024) {
    errors.push(`Bundle size ${totalBytes} exceeds 50MB limit.`);
  }

  for (const file of skill.files) {
    const lower = path.basename(file.relativePath).toLowerCase();
    if (lower === "skill.md") {
      continue;
    }
    if (!allowedExtensions.has(file.extension)) {
      errors.push(`File "${file.relativePath}" uses unsupported extension "${file.extension}".`);
    }
  }

  const pythonFiles = skill.files.filter((file) => file.extension === ".py");
  const declaredEnv = new Set([
    ...(openclaw?.requires?.env ?? []),
    ...(openclaw?.primaryEnv ? [openclaw.primaryEnv] : [])
  ]);
  for (const file of pythonFiles) {
    const fileText = await fs.readFile(file.absolutePath, "utf8");
    for (const envName of findEnvReferences(fileText)) {
      if (!declaredEnv.has(envName)) {
        errors.push(`Script "${file.relativePath}" references env "${envName}" but metadata does not declare it.`);
      }
    }
  }

  if (pythonFiles.length > 0 && !(openclaw?.requires?.bins ?? []).includes("python")) {
    errors.push("Python helper scripts are present but metadata.openclaw.requires.bins does not include python.");
  }
  if (!openclaw?.homepage) {
    warnings.push("Homepage metadata is not set yet; update this after the public repo URL exists.");
  }
  if ((openclaw?.install ?? []).length === 0) {
    warnings.push("No install metadata is declared; this is acceptable, but future UX can improve with supported installers.");
  }

  return { slug: skill.slug, errors, warnings };
}

export function buildPackagingSummary(skill: SkillDefinition) {
  return {
    slug: skill.slug,
    fileCount: skill.files.length,
    totalBytes: skill.files.reduce((sum, file) => sum + file.size, 0),
    files: skill.files.map((file) => ({
      path: file.relativePath,
      size: file.size
    }))
  };
}
