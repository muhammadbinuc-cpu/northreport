// Shared content fields for both Posts and Stories
interface ContentBase {
  userId: string;
  neighborhood: string;
  caption: string;
  mediaUrl: string | null;
  mediaKind: 'image' | 'text';
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  locationApprox: { cellId: string; label: string };
  aiSummary: string | null;
  severity: string | null;
  upvotes: number;
  commentCount: number;
  repostCount: number;
  feedScore: number;
  linkedReportId: string | null;
  flagCount: number;
  flaggedBy: string[];
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Permanent community content
export interface Post extends ContentBase {
  type: 'post';
}

// 24h ephemeral content
export interface Story extends ContentBase {
  type: 'story';
  expiresAt: Date;
}

export type ContentItem = Post | Story;

// Feed item shape returned by /api/feed
export interface FeedItemData {
  id: string;
  source: 'post' | 'story' | 'report';
  type: 'post' | 'story' | 'report';
  userId: string;
  displayName: string;
  neighborhood: string;
  caption: string;
  aiSummary: string | null;
  severity: string | null;
  locationApprox: { cellId: string; label: string } | null;
  mediaUrl: string | null;
  upvotes: number;
  commentCount: number;
  repostCount: number;
  feedScore: number;
  isTrending: boolean;
  linkedReportId: string | null;
  linkedPostId: string | null;
  status: string | null;
  createdAt: string;
  expiresAt: string | null;
}
