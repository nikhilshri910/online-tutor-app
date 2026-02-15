import { DEFAULT_HOME_CONTENT } from "../defaultHomeContent";

export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

export function normalizeContent(raw) {
  const base = deepClone(DEFAULT_HOME_CONTENT);
  const source = raw && typeof raw === "object" ? raw : {};

  return {
    ...base,
    ...source,
    appMeta: { ...base.appMeta, ...(source.appMeta || {}) },
    hero: {
      ...base.hero,
      ...(source.hero || {}),
      stats: getArray(source.hero?.stats, base.hero.stats)
    },
    programs: getArray(source.programs, base.programs),
    comparison: {
      ...base.comparison,
      ...(source.comparison || {}),
      traditional: getArray(source.comparison?.traditional, base.comparison.traditional),
      flipped: getArray(source.comparison?.flipped, base.comparison.flipped)
    },
    problemSolution: {
      ...base.problemSolution,
      ...(source.problemSolution || {}),
      problem: getArray(source.problemSolution?.problem, base.problemSolution.problem),
      solution: getArray(source.problemSolution?.solution, base.problemSolution.solution)
    },
    flipSteps: getArray(source.flipSteps, base.flipSteps),
    professionals: getArray(source.professionals, base.professionals),
    outcomes: getArray(source.outcomes, base.outcomes),
    journeys: getArray(source.journeys, base.journeys),
    enquiry: { ...base.enquiry, ...(source.enquiry || {}) },
    faq: getArray(source.faq, base.faq),
    footer: { ...base.footer, ...(source.footer || {}) }
  };
}

export function parseLines(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function linesValue(items) {
  return getArray(items).join("\n");
}

