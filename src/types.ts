export interface TextIssueDistribution {
  category: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DetailedAnalysisResult {
  aiMarkersCount: number;
  aiMarkersFound: string[];
  legalMarkersCount: number;
  legalMarkersFound: string[];
  invisibleCount: number;
  invisibleBreakdown: { [key: string]: number };
  grammarFixesCount: number;
  totalIssues: number;
  chartData: TextIssueDistribution[];
}

export interface TextHistoryItem {
  id: string;
  timestamp: number;
  dateStr: string;
  title: string;
  type: "clean" | "proofread" | "humanize" | "custom_command";
  inputText: string;
  outputText: string;
  inputWordCount: number;
  outputWordCount: number;
  stats: any;
  analysis: DetailedAnalysisResult;
}

export type TonePreset = "natural" | "academic" | "executive" | "journalistic" | "creative" | "plain_legal";

export type HumanizeMode = "authentic" | "academic" | "story" | "executive" | "simple";

export interface HumanizeModeOption {
  id: HumanizeMode;
  label: string;
  badge: string;
  icon: string;
  description: string;
}

export interface QuickCommandOption {
  id: string;
  label: string;
  prompt: string;
  icon: string;
  category: "summarize" | "tone" | "structure" | "style";
}

export interface HumanScoreResult {
  beforeScore: number; // 0 to 100
  afterScore: number;  // 0 to 100
  label: string;
  description: string;
}

export interface TextMetrics {
  readingTimeMinutes: number;
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  lexicalDiversity: number; // percentage
}

export interface ProcessingStats {
  originalLength: number;
  cleanedLength: number;
  diffChars: number;
  removedCliches?: number;
  grammarFixesCount?: number;
  chunksProcessed?: number;
  invisibleCharsRemoved?: number;
  invisibleBreakdown?: { [key: string]: number };
  modelUsed?: string;
  temperature?: number;
  detectedLanguage?: string;
  isProofread?: boolean;
  isHumanized?: boolean;
  isCustomCommand?: boolean;
  commandUsed?: string;
  humanizeMode?: HumanizeMode;
  toneUsed?: TonePreset;
  humanScore?: HumanScoreResult;
}
