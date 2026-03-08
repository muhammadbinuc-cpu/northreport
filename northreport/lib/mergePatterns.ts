/**
 * Pattern Deduplication and Merging Utility
 * 
 * Groups patterns by CATEGORY ONLY (e.g., all "Road Hazard" → one card).
 * Accumulates all locations so user can see where issues are when expanded.
 */

export interface Pattern {
    _id?: string;
    type: string;
    description: string;
    severity: string;
    w0Count: number;
    w1Count: number;
    recommendation?: string;
    detectedAt?: Date | string;
    neighborhood?: string;
    relatedReportIds?: string[];
    relatedVoiceIds?: string[];
    acknowledged?: boolean;
    hotspots?: Array<{ label: string; count: number }>;
    confidence?: number;
    // NEW: accumulated locations from merged patterns
    locations?: Array<{ label: string; count: number }>;
    mergedCount?: number; // How many patterns were merged into this one
}

// Severity priority (lower = more severe)
const SEVERITY_ORDER: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
};

/**
 * Extract the primary category/issue type from description
 * This is the ONLY grouping key - all patterns of same category merge together
 */
function extractCategory(p: Pattern): string {
    const desc = p.description.toLowerCase();

    // Traffic-related (group traffic incidents, accidents, safety together)
    if (desc.includes('traffic') || desc.includes('accident') || desc.includes('collision')) {
        return 'traffic';
    }

    // Road hazards (potholes, road damage, hazards)
    if (desc.includes('road hazard') || desc.includes('pothole') || desc.includes('road damage')) {
        return 'road-hazard';
    }

    // Noise complaints
    if (desc.includes('noise')) return 'noise';

    // Vandalism/graffiti
    if (desc.includes('graffiti') || desc.includes('vandalism')) return 'vandalism';

    // Litter/waste
    if (desc.includes('litter') || desc.includes('garbage') || desc.includes('waste') || desc.includes('dumping')) {
        return 'litter';
    }

    // Lighting issues
    if (desc.includes('light') || desc.includes('streetlight') || desc.includes('dark')) {
        return 'lighting';
    }

    // Safety concerns (general)
    if (desc.includes('safety') || desc.includes('dangerous') || desc.includes('hazard')) {
        return 'safety';
    }

    // Infrastructure (catch-all for infrastructure)
    if (desc.includes('sidewalk') || desc.includes('crosswalk') || desc.includes('sign')) {
        return 'infrastructure';
    }

    return 'general';
}

/**
 * Extract location from pattern description
 */
function extractLocation(p: Pattern): string | null {
    // Try hotspots first
    if (p.hotspots && p.hotspots.length > 0) {
        const topHotspot = [...p.hotspots].sort((a, b) => b.count - a.count)[0];
        return topHotspot.label;
    }

    // Try to extract location from description
    const locationMatch = p.description.match(/(?:in|at|near|on)\s+([^,.]+)/i);
    if (locationMatch) {
        return locationMatch[1].trim();
    }

    return null;
}

/**
 * Generate dedupe key - BY CATEGORY ONLY
 */
function getDedupeKey(p: Pattern): string {
    return extractCategory(p);
}

/**
 * Get a clean title for a category
 */
function getCategoryTitle(category: string, count: number): string {
    const titles: Record<string, string> = {
        'traffic': count === 1 ? 'Traffic Incident' : 'Traffic Incidents',
        'road-hazard': count === 1 ? 'Road Hazard Report' : 'Road Hazard Reports',
        'noise': count === 1 ? 'Noise Complaint' : 'Noise Complaints',
        'vandalism': count === 1 ? 'Vandalism Report' : 'Vandalism Reports',
        'litter': count === 1 ? 'Litter Issue' : 'Litter & Waste Issues',
        'lighting': count === 1 ? 'Lighting Issue' : 'Lighting Issues',
        'safety': count === 1 ? 'Safety Concern' : 'Safety Concerns',
        'infrastructure': count === 1 ? 'Infrastructure Issue' : 'Infrastructure Issues',
        'general': count === 1 ? 'Community Report' : 'Community Reports',
    };
    return titles[category] || (count === 1 ? 'Community Report' : 'Community Reports');
}

/**
 * Select the best (most actionable) recommendation
 */
function selectBestRecommendation(recommendations: (string | undefined)[]): string | undefined {
    const valid = recommendations.filter((r): r is string => !!r && r.length > 0);
    if (valid.length === 0) return undefined;

    // Prefer recommendations that mention urgent actions
    const urgent = valid.find(r =>
        /immediately|urgent|priority|dispatch|deploy/i.test(r)
    );
    if (urgent) return urgent;

    // Otherwise return the longest (most detailed) one
    return [...valid].sort((a, b) => b.length - a.length)[0];
}

/**
 * Merge multiple patterns into one (grouped by category)
 */
function mergePatternGroup(group: Pattern[], category: string): Pattern {
    // Sort by severity (most severe first), then by count (highest first)
    const sorted = [...group].sort((a, b) => {
        const sevDiff = (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99);
        if (sevDiff !== 0) return sevDiff;
        return (b.w0Count || 0) - (a.w0Count || 0);
    });

    const primary = sorted[0];

    // Sum all counts
    const totalW0 = group.reduce((sum, p) => sum + (p.w0Count || 0), 0);
    const totalW1 = group.reduce((sum, p) => sum + (p.w1Count || 0), 0);

    // Merge report IDs (dedupe)
    const allReportIds = new Set<string>();
    group.forEach(p => p.relatedReportIds?.forEach(id => allReportIds.add(id)));

    // Merge voice IDs (dedupe)
    const allVoiceIds = new Set<string>();
    group.forEach(p => p.relatedVoiceIds?.forEach(id => allVoiceIds.add(id)));

    // Collect ALL locations from all patterns
    const locationMap = new Map<string, number>();

    // From hotspots
    group.forEach(p => {
        p.hotspots?.forEach(h => {
            const existing = locationMap.get(h.label) || 0;
            locationMap.set(h.label, existing + h.count);
        });
    });

    // From descriptions (extract location mentions)
    group.forEach(p => {
        const loc = extractLocation(p);
        if (loc && !locationMap.has(loc)) {
            locationMap.set(loc, p.w0Count || 1);
        }
    });

    const mergedLocations = Array.from(locationMap.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

    // Select best recommendation
    const bestRecommendation = selectBestRecommendation(group.map(p => p.recommendation));

    // Keep highest confidence
    const maxConfidence = Math.max(...group.map(p => p.confidence ?? 0));

    // Use category title as unified description
    const unifiedDescription = getCategoryTitle(category, totalW0);

    // Pick most severe severity
    const bestSeverity = sorted[0].severity;

    return {
        ...primary,
        description: unifiedDescription,
        severity: bestSeverity,
        w0Count: totalW0,
        w1Count: totalW1,
        recommendation: bestRecommendation,
        relatedReportIds: Array.from(allReportIds),
        relatedVoiceIds: Array.from(allVoiceIds),
        hotspots: mergedLocations.length > 0 ? mergedLocations : undefined,
        locations: mergedLocations.length > 0 ? mergedLocations : undefined,
        confidence: maxConfidence > 0 ? maxConfidence : undefined,
        mergedCount: group.length,
    };
}

/**
 * Deduplicate and merge patterns BY CATEGORY
 * @param patterns Array of patterns (possibly with duplicates)
 * @returns Array of unique patterns (one per category) with all data merged
 */
export function mergePatterns(patterns: Pattern[]): Pattern[] {
    if (!patterns || patterns.length === 0) return [];

    // Group by category ONLY
    const groups = new Map<string, Pattern[]>();

    for (const pattern of patterns) {
        const key = getDedupeKey(pattern);
        const existing = groups.get(key) || [];
        existing.push(pattern);
        groups.set(key, existing);
    }

    // Merge each group
    const merged: Pattern[] = [];
    for (const [category, group] of groups.entries()) {
        merged.push(mergePatternGroup(group, category));
    }

    // Sort by severity, then by total count
    return merged.sort((a, b) => {
        const sevDiff = (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99);
        if (sevDiff !== 0) return sevDiff;
        return (b.w0Count || 0) - (a.w0Count || 0);
    });
}

export default mergePatterns;
