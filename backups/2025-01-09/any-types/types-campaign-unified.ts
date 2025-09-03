/**
 * Unified Campaign Types
 * Provides unified interface for campaign data across different sources
 */

// Base interface for campaign data from database
export interface RawCampaignFromDB {
  id: string;
  rank?: number;
  title: string;
  brand?: string;
  company?: string;
  applicants: number;
  maxApplicants: number;
  maxParticipants?: number;
  participants?: number;
  deadline: number;
  dueDate?: string;
  category: string;
  platforms: string[];
  description: string;
  createdAt: string;
  updatedAt?: string;
  budget?: string;
  reward?: string;
  rewardType?: "cash" | "product";
  imageUrl?: string;
  image?: string;
  thumbnail?: string;
  tags?: string[];
  isHot?: boolean;
  isNew?: boolean;
  difficulty?: "easy" | "medium" | "hard";
  status?: "active" | "pending" | "completed" | "cancelled";
  requirements?: string[];
  targetAudience?: string;
  location?: string;
  isUrgent?: boolean;
  priority?: number;
}

// Unified campaign interface that components can use
export interface UnifiedCampaign {
  id: string;
  title: string;
  brand: string;
  company?: string;
  category: string;
  description: string;
  image: string;
  thumbnail?: string;
  
  // Participant information
  participants: number;
  maxParticipants: number;
  applicants?: number;
  maxApplicants?: number;
  
  // Timing
  deadline: Date;
  createdAt: Date;
  updatedAt?: Date;
  
  // Reward information
  reward: {
    type: "cash" | "product";
    value: string;
    amount?: number;
    currency?: string;
  };
  
  // Platform and targeting
  platforms: string[];
  requirements?: string[];
  targetAudience?: string;
  location?: string;
  
  // Status and metadata
  status: "active" | "pending" | "completed" | "cancelled";
  tags: string[];
  isHot: boolean;
  isNew: boolean;
  isUrgent?: boolean;
  difficulty: "easy" | "medium" | "hard";
  priority: number;
  
  // Additional fields
  budget?: string;
  rank?: number;
}

// Campaign data mapper utility class
export class CampaignDataMapper {
  /**
   * Convert raw database campaign to unified campaign format
   */
  static fromDB(raw: RawCampaignFromDB): UnifiedCampaign {
    return {
      id: raw.id,
      title: raw.title,
      brand: raw.brand || raw.company || "Unknown Brand",
      company: raw.company || raw.brand,
      category: raw.category,
      description: raw.description,
      image: raw.imageUrl || raw.image || "/placeholder.svg",
      thumbnail: raw.thumbnail || raw.imageUrl || raw.image || "/placeholder.svg",
      
      participants: raw.participants || raw.applicants || 0,
      maxParticipants: raw.maxParticipants || raw.maxApplicants || 100,
      applicants: raw.applicants,
      maxApplicants: raw.maxApplicants,
      
      deadline: new Date(raw.deadline || raw.dueDate || Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(raw.createdAt || Date.now()),
      updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : undefined,
      
      reward: {
        type: raw.rewardType || (raw.reward?.includes("원") || raw.reward?.includes("₩") ? "cash" : "product"),
        value: raw.reward || raw.budget || "TBD",
        amount: this.extractAmount(raw.reward || raw.budget),
        currency: "KRW"
      },
      
      platforms: Array.isArray(raw.platforms) ? raw.platforms : 
                typeof raw.platforms === 'string' ? raw.platforms.split(',') : [],
      requirements: raw.requirements || [],
      targetAudience: raw.targetAudience,
      location: raw.location,
      
      status: raw.status || "active",
      tags: raw.tags || [],
      isHot: raw.isHot || false,
      isNew: raw.isNew || this.isNewCampaign(raw.createdAt),
      isUrgent: raw.isUrgent || this.isUrgent(raw.deadline || raw.dueDate),
      difficulty: raw.difficulty || "medium",
      priority: raw.priority || raw.rank || 0,
      
      budget: raw.budget,
      rank: raw.rank
    };
  }

  /**
   * Convert legacy static campaign format to unified format
   */
  static fromLegacyStatic(legacy: any): UnifiedCampaign {
    return {
      id: legacy.id,
      title: typeof legacy.title === 'string' ? legacy.title : legacy.title.ko,
      brand: legacy.brand,
      category: legacy.category,
      description: typeof legacy.description === 'string' ? legacy.description : legacy.description.ko,
      image: legacy.image || "/placeholder.svg",
      thumbnail: legacy.thumbnail || legacy.image || "/placeholder.svg",
      
      participants: legacy.participants || 0,
      maxParticipants: legacy.maxParticipants || 100,
      
      deadline: new Date(legacy.dueDate || Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      
      reward: {
        type: legacy.reward?.type || "cash",
        value: legacy.reward?.value || "TBD",
        amount: this.extractAmount(legacy.reward?.value),
        currency: "KRW"
      },
      
      platforms: legacy.platforms || [],
      status: "active",
      tags: legacy.tags || [],
      isHot: legacy.isHot || false,
      isNew: legacy.isNew || false,
      difficulty: legacy.difficulty || "medium",
      priority: 0
    };
  }

  /**
   * Extract numeric amount from reward string
   */
  private static extractAmount(reward?: string): number | undefined {
    if (!reward) return undefined;
    const match = reward.match(/[\d,]+/);
    if (match) {
      return parseInt(match[0].replace(/,/g, ''));
    }
    return undefined;
  }

  /**
   * Check if campaign is new (created within last 7 days)
   */
  private static isNewCampaign(createdAt?: string): boolean {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created > weekAgo;
  }

  /**
   * Check if campaign is urgent (deadline within 3 days)
   */
  private static isUrgent(deadline?: number | string): boolean {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return deadlineDate < threeDaysFromNow;
  }
}

// Additional utility types
export interface CampaignFilters {
  category?: string;
  status?: string;
  isHot?: boolean;
  isNew?: boolean;
  minReward?: number;
  maxReward?: number;
  difficulty?: string;
  platforms?: string[];
}

export interface CampaignSortOptions {
  field: "createdAt" | "deadline" | "participants" | "reward" | "priority";
  direction: "asc" | "desc";
}

// API response types
export interface CampaignResponse {
  campaigns: UnifiedCampaign[];
  total: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

export interface CampaignStats {
  total: number;
  active: number;
  completed: number;
  totalParticipants: number;
  averageReward: number;
}