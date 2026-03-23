import { discoverSkills, validateSkill } from "./lib/skills.ts";

async function main() {
  const strict = process.argv.includes("--strict");
  const skills = await discoverSkills();
  if (skills.length === 0) {
    throw new Error("No skills were discovered under skills/.");
  }

  let hasErrors = false;
  for (const skill of skills) {
    const result = await validateSkill(skill);
    const status = result.errors.length === 0 ? "OK" : "FAIL";
    console.log(`[${status}] ${result.slug}`);
    for (const error of result.errors) {
      console.log(`  error: ${error}`);
    }
    for (const warning of result.warnings) {
      console.log(`  warning: ${warning}`);
    }
    hasErrors ||= result.errors.length > 0;
  }

  if (strict && hasErrors) {
    process.exitCode = 1;
  }
}

void main();
