import { SKILLS_REGEX } from '../config.js';

export function normalizeDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function extractSkills(text = '') {
  return SKILLS_REGEX
    .filter((regex) => regex.test(text))
    .map((regex) => regex.source.replace(/\./g, ''));
}

export function cleanLocation(loc) {
  return loc?.replace(/\s+/g, ' ').trim() || null;
}
