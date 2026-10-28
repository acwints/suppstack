import assert from 'node:assert/strict';
import { supplementCatalog } from '../lib/catalog/supplement-catalog';
import { getSupplementKnowledge } from '../lib/catalog/supplement-knowledge';
import { filterPeptideReferences } from '../lib/catalog/peptide-filters';

const all = filterPeptideReferences(supplementCatalog, {});
const names = (filters: Parameters<typeof filterPeptideReferences>[1]) =>
  filterPeptideReferences(supplementCatalog, filters).map((item) => item.supplement_name);
assert.equal(all.length, 8);
assert.deepEqual(names({ status: 'FDA-approved prescription' }), ['Tirzepatide', 'Semaglutide']);
assert.deepEqual(names({ status: 'In clinical trials' }), ['Retatrutide']);
assert.deepEqual(names({ evidence: 'Preclinical only' }), ['TB-500']);
assert.deepEqual(names({ area: 'Weight management', status: 'FDA-approved prescription', route: 'Oral' }), ['Semaglutide']);
assert.deepEqual(names({ area: 'Hormone signaling', evidence: 'Controlled human trials' }), []);
assert.deepEqual(names({ query: '  WEGOVY  ' }), ['Semaglutide']);
assert.deepEqual(names({ query: 'copper tripeptide-1', route: 'Topical' }), ['GHK-Cu']);
assert.deepEqual(names({ query: 'no such compound' }), []);
assert.equal(filterPeptideReferences(all, {}).length, 8, 'clearing filters restores all profiles');
for (const supplement of all) {
  const knowledge = getSupplementKnowledge(supplement.supplement_name, supplement.aliases);
  assert.ok(knowledge?.peptide, `${supplement.supplement_name}: research metadata`);
  assert.ok(knowledge.research && knowledge.safety && knowledge.legalStatus && knowledge.dosing);
  assert.ok(knowledge.peptide.scope && knowledge.peptide.limitations);
  assert.ok(knowledge.citations && knowledge.citations.length >= 2);
  assert.ok(knowledge.citations.every((citation) => new URL(citation.url).protocol === 'https:'));
  assert.ok(supplement.research_only, 'references must retain the no-commerce guard');
}
assert.ok(!all.find((s) => s.supplement_name === 'TB-500')?.aliases?.includes('thymosin beta-4'));
assert.ok(!all.find((s) => s.supplement_name === 'CJC-1295')?.aliases?.includes('mod grf 1-29'));
console.log('Eight peptide profiles and combined filters verified.');
