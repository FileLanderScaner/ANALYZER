
import type {
  UrlVulnerabilityAnalysisOutput,
  ServerSecurityAnalysisOutput,
  DatabaseSecurityAnalysisOutput,
  SastAnalysisOutput,
  DastAnalysisOutput,
  CloudConfigAnalysisOutput,
  ContainerAnalysisOutput,
  DependencyAnalysisOutput,
  NetworkSecurityAnalysisOutput,
  VulnerabilityFinding as SingleVulnerabilityFinding,
  GenerateAttackVectorsOutput as FullGenerateAttackVectorsOutput,
  AttackVectorItem as SingleAttackVectorItem,
  RemediationPlaybookOutput as SingleRemediationPlaybookOutput
} from "@/types/ai-schemas";

// Re-exporting the structured output from individual analyses directly
export type { UrlVulnerabilityAnalysisOutput };
export type { ServerSecurityAnalysisOutput };
export type { DatabaseSecurityAnalysisOutput };
export type { SastAnalysisOutput };
export type { DastAnalysisOutput };
export type { CloudConfigAnalysisOutput };
export type { ContainerAnalysisOutput };
export type { DependencyAnalysisOutput };
export type { NetworkSecurityAnalysisOutput };
export type { SingleRemediationPlaybookOutput as RemediationPlaybook };


export interface AnalysisResult {
  urlAnalysis: UrlVulnerabilityAnalysisOutput | null;
  serverAnalysis: ServerSecurityAnalysisOutput | null;
  databaseAnalysis: DatabaseSecurityAnalysisOutput | null;
  sastAnalysis: SastAnalysisOutput | null;
  dastAnalysis: DastAnalysisOutput | null;
  cloudAnalysis: CloudConfigAnalysisOutput | null;
  containerAnalysis: ContainerAnalysisOutput | null;
  dependencyAnalysis: DependencyAnalysisOutput | null;
  networkAnalysis: NetworkSecurityAnalysisOutput | null;
  // The comprehensive report text generated from all available analyses
  reportText: string | null;
  // Attack vectors generated from any vulnerable findings across all analyses
  attackVectors: FullGenerateAttackVectorsOutput | null; // This is already an array of AttackVectorItem
  // Remediation Playbooks (Premium Feature)
  remediationPlaybooks: SingleRemediationPlaybookOutput[] | null;
  error: string | null;
  // Combined list of all findings from all sources for easier top-level access if needed by UI
  allFindings?: SingleVulnerabilityFinding[] | null;
}

/**
 * Represents a single identified vulnerability finding from any source.
 * This type alias points to the one defined in ai-schemas.ts
 */
export type VulnerabilityFinding = SingleVulnerabilityFinding;

/**
 * Represents a single attack vector generated based on a vulnerability.
 * This type alias points to the one defined in ai-schemas.ts
 */
export type AttackVector = SingleAttackVectorItem;

/**
 * Represents a simple Note fetched from Supabase (example type).
 */
export interface Note {
  id: number;
  title: string | null;
  // Add other fields from your 'notes' table here if necessary
}
