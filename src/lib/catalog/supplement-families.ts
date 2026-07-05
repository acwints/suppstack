import type { Supplement } from '@/types';

/**
 * Ingredient families: one browse tile per ingredient, with each form
 * (e.g. Creatine Monohydrate vs Creatine HCl) as a subcategory inside it.
 *
 * Members are catalog supplement names. Only same-ingredient form splits
 * belong here — distinct compounds that merely share a goal (e.g. NMN vs NR,
 * Alpha-GPC vs CDP-Choline, mushroom species) stay as separate tiles.
 */
const SUPPLEMENT_FAMILY_MEMBERS: Record<string, string[]> = {
  Creatine: ['Creatine Monohydrate', 'Creatine HCl'],
  Magnesium: ['Magnesium Glycinate', 'Magnesium Citrate'],
  'Omega-3s': ['Omega-3 Fish Oil', 'Krill Oil', 'Algal Oil', 'Cod Liver Oil'],
  Protein: ['Whey Protein', 'Casein Protein', 'Plant Protein', 'Mass Gainer', 'Protein Bars'],
};

const FAMILY_BY_SUPPLEMENT_NAME = new Map<string, string>(
  Object.entries(SUPPLEMENT_FAMILY_MEMBERS).flatMap(([family, members]) =>
    members.map((member) => [member.toLowerCase(), family] as const)
  )
);

export function familyNameForSupplement(supplementName?: string | null): string | null {
  if (!supplementName) return null;
  return FAMILY_BY_SUPPLEMENT_NAME.get(supplementName.toLowerCase()) ?? null;
}

export function familyMemberNames(familyName: string): string[] {
  return SUPPLEMENT_FAMILY_MEMBERS[familyName] ?? [];
}

/**
 * Short label for a form within its family, e.g. "Creatine Monohydrate" in
 * the Creatine family reads "Monohydrate"; names that do not repeat the
 * family word (e.g. "Mass Gainer" under Protein) are kept as-is.
 */
export function familyFormLabel(supplementName: string, familyName: string): string {
  const familyWords = new Set(
    familyName
      .toLowerCase()
      .split(/[\s-]+/)
      .map((word) => word.replace(/s$/, ''))
  );

  const remaining = supplementName
    .split(/\s+/)
    .filter((word) => !familyWords.has(word.toLowerCase().replace(/s$/, '')))
    .join(' ');

  return remaining || supplementName;
}

export interface SupplementBrowseGroup {
  /** Stable key for React lists: family name or supplement id. */
  key: string;
  /** Display name: family name for grouped tiles, supplement name otherwise. */
  name: string;
  /** True when this tile aggregates multiple forms of one ingredient. */
  isFamily: boolean;
  /** The member the tile links to and takes its image from (most options). */
  flagship: Supplement;
  members: Supplement[];
  /** Total purchasable options across members (undefined when unknown). */
  productCount?: number;
  /** Lowest member price — rendered as "From $X" on family tiles. */
  priceFrom?: number;
}

function groupFor(members: Supplement[], name: string, isFamily: boolean): SupplementBrowseGroup {
  const flagship = members.reduce((best, candidate) =>
    (candidate.product_count ?? 0) > (best.product_count ?? 0) ? candidate : best
  );

  const counts = members
    .map((member) => member.product_count)
    .filter((count): count is number => typeof count === 'number');
  const prices = members
    .map((member) => member.lowest_price ?? member.average_price)
    .filter((price): price is number => typeof price === 'number' && price > 0);

  return {
    key: isFamily ? `family:${name}` : `supplement:${members[0].supplement_id}`,
    name,
    isFamily,
    flagship,
    members,
    productCount: counts.length > 0 ? counts.reduce((sum, count) => sum + count, 0) : undefined,
    priceFrom: prices.length > 0 ? Math.min(...prices) : undefined,
  };
}

/**
 * Collapses a supplement list into browse tiles: when two or more forms of
 * the same ingredient are present, they merge into a single family tile.
 * A lone matching form (e.g. a search for "HCl") stays an individual tile so
 * results remain precise.
 */
export function groupSupplementsForBrowse(supplements: Supplement[]): SupplementBrowseGroup[] {
  const membersByFamily = new Map<string, Supplement[]>();

  for (const supplement of supplements) {
    const family = familyNameForSupplement(supplement.supplement_name);
    if (!family) continue;
    const bucket = membersByFamily.get(family) ?? [];
    bucket.push(supplement);
    membersByFamily.set(family, bucket);
  }

  const groups: SupplementBrowseGroup[] = [];
  const emittedFamilies = new Set<string>();

  for (const supplement of supplements) {
    const family = familyNameForSupplement(supplement.supplement_name);
    const familyMembers = family ? membersByFamily.get(family) ?? [] : [];

    if (family && familyMembers.length > 1) {
      if (!emittedFamilies.has(family)) {
        emittedFamilies.add(family);
        groups.push(groupFor(familyMembers, family, true));
      }
      continue;
    }

    groups.push(groupFor([supplement], supplement.supplement_name, false));
  }

  return groups;
}

/**
 * For curated shelves that show individual supplements: keeps only one form
 * per family (the flagship) so an ingredient never appears twice.
 */
export function collapseToFamilyFlagships(supplements: Supplement[]): Supplement[] {
  return groupSupplementsForBrowse(supplements).map((group) => group.flagship);
}

/**
 * Sibling forms for a supplement page's form switcher. Returns the family
 * and all members that exist in the given catalog, or null when the
 * supplement is not part of a family.
 */
export function familyForSupplement(
  supplement: Supplement,
  catalog: Supplement[]
): { familyName: string; members: Supplement[] } | null {
  const familyName = familyNameForSupplement(supplement.supplement_name);
  if (!familyName) return null;

  const memberNames = new Set(familyMemberNames(familyName).map((name) => name.toLowerCase()));
  const members = catalog.filter((item) => memberNames.has(item.supplement_name.toLowerCase()));

  if (members.length < 2) return null;
  return { familyName, members };
}
