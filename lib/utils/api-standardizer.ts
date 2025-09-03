/**
 * API Data Standardizer
 * Converts various campaign data formats to a standardized structure
 */

export interface StandardizedCampaign {
  id: string;
  title: string;
  brand: string;
  category: string;
  description: string;
  image: string;
  thumbnail?: string;
  participants: number;
  maxParticipants: number;
  deadline: string;
  reward: {
    type: "cash" | "product";
    value: string;
    amount?: number;
  };
  platforms: string[];
  status: "active" | "pending" | "completed" | "cancelled";
  tags: string[];
  isHot: boolean;
  isNew: boolean;
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
}

/**
 * Standardize campaign data from various sources
 */
export function standardizeCampaign(rawCampaign: unknown): StandardizedCampaign {
  return {
    id: rawCampaign.id || rawCampaign._id || `campaign_${Date.now()}`,
    title: rawCampaign.title || rawCampaign.name || "Untitled Campaign",
    brand: rawCampaign.brand || rawCampaign.company || "Unknown Brand",
    category: rawCampaign.category || "General",
    description: rawCampaign.description || rawCampaign.summary || "No description available",
    image: rawCampaign.imageUrl || rawCampaign.image || rawCampaign.thumbnail || "/placeholder.svg",
    thumbnail: rawCampaign.thumbnail || rawCampaign.imageUrl || rawCampaign.image || "/placeholder.svg",
    
    participants: parseInt(rawCampaign.participants || rawCampaign.applicants || "0"),
    maxParticipants: parseInt(rawCampaign.maxParticipants || rawCampaign.maxApplicants || "100"),
    
    deadline: rawCampaign.deadline || rawCampaign.dueDate || rawCampaign.endDate || 
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    
    reward: {
      type: determineRewardType(rawCampaign.reward || rawCampaign.budget),
      value: rawCampaign.reward || rawCampaign.budget || "TBD",
      amount: extractAmount(rawCampaign.reward || rawCampaign.budget)
    },
    
    platforms: Array.isArray(rawCampaign.platforms) ? rawCampaign.platforms :
               typeof rawCampaign.platforms === 'string' ? rawCampaign.platforms.split(',') :
               rawCampaign.platform ? [rawCampaign.platform] : [],
    
    status: rawCampaign.status || "active",
    tags: Array.isArray(rawCampaign.tags) ? rawCampaign.tags : [],
    isHot: Boolean(rawCampaign.isHot || rawCampaign.hot || rawCampaign.featured),
    isNew: Boolean(rawCampaign.isNew || rawCampaign.new || isRecentlyCreated(rawCampaign.createdAt)),
    difficulty: rawCampaign.difficulty || rawCampaign.level || "medium",
    createdAt: rawCampaign.createdAt || new Date().toISOString()
  };
}

/**
 * Determine reward type from reward string
 */
function determineRewardType(reward?: string): "cash" | "product" {
  if (!reward) return "cash";
  
  const cashKeywords = ["원", "₩", "won", "cash", "money", "KRW"];
  const lowerReward = reward.toLowerCase();
  
  return cashKeywords.some(keyword => lowerReward.includes(keyword)) ? "cash" : "product";
}

/**
 * Extract numeric amount from reward string
 */
function extractAmount(reward?: string): number | undefined {
  if (!reward) return undefined;
  
  const match = reward.match(/[\d,]+/);
  if (match) {
    return parseInt(match[0].replace(/,/g, ''));
  }
  
  return undefined;
}

/**
 * Check if campaign was created recently (within 7 days)
 */
function isRecentlyCreated(createdAt?: string): boolean {
  if (!createdAt) return false;
  
  const created = new Date(createdAt);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  return created > weekAgo;
}

/**
 * Standardize multiple campaigns
 */
export function standardizeCampaigns(rawCampaigns: unknown[]): StandardizedCampaign[] {
  return rawCampaigns.map(campaign => standardizeCampaign(campaign));
}

/**
 * Standardize campaign for API response
 */
export function standardizeCampaignForAPI(campaign: unknown) {
  const standardized = standardizeCampaign(campaign);
  
  return {
    ...standardized,
    // Add any API-specific fields
    url: `/campaigns/${standardized.id}`,
    shortDescription: standardized.description.substring(0, 100) + "...",
    formattedDeadline: new Date(standardized.deadline).toLocaleDateString('ko-KR'),
    participationRate: standardized.maxParticipants > 0 
      ? Math.round((standardized.participants / standardized.maxParticipants) * 100) 
      : 0
  };
}

/**
 * Filter and sort standardized campaigns
 */
export function filterAndSortCampaigns(
  campaigns: StandardizedCampaign[], 
  filters: {
    category?: string;
    status?: string;
    isHot?: boolean;
    difficulty?: string;
  } = {},
  sortBy: "createdAt" | "deadline" | "participants" = "createdAt",
  sortOrder: "asc" | "desc" = "desc",
  limit?: number
): StandardizedCampaign[] {
  let filtered = campaigns;
  
  // Apply filters
  if (filters.category) {
    filtered = filtered.filter(c => c.category === filters.category);
  }
  
  if (filters.status) {
    filtered = filtered.filter(c => c.status === filters.status);
  }
  
  if (filters.isHot !== undefined) {
    filtered = filtered.filter(c => c.isHot === filters.isHot);
  }
  
  if (filters.difficulty) {
    filtered = filtered.filter(c => c.difficulty === filters.difficulty);
  }
  
  // Sort
  filtered.sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case "createdAt":
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
        break;
      case "deadline":
        aVal = new Date(a.deadline).getTime();
        bVal = new Date(b.deadline).getTime();
        break;
      case "participants":
        aVal = a.participants;
        bVal = b.participants;
        break;
      default:
        aVal = a.id;
        bVal = b.id;
    }
    
    return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
  });
  
  // Apply limit
  if (limit && limit > 0) {
    filtered = filtered.slice(0, limit);
  }
  
  return filtered;
}