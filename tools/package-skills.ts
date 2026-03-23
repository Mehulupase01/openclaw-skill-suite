import { buildPackagingSummary, discoverSkills, validateSkill } from "./lib/skills.ts";

async function main() {
  const skills = await discoverSkills();
  const summaries = [];
  let hasErrors = false;
  for (const skill of skills) {
    const validation = await validateSkill(skill);
    hasErrors ||= validation.errors.length > 0;
    summaries.push({
      ...buildPackagingSummary(skill),
      errors: validation.errors,
      warnings: validation.warnings
    });
  }
  console.log(JSON.stringify({ generatedAt: new Date().toISOString(), skills: summaries }, null, 2));
  if (hasErrors) {
    process.exitCode = 1;
  }
}

void main();
