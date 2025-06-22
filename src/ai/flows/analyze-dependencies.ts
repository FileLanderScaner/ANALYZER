'use server';
/**
 * @fileOverview Analyzes dependency files for known vulnerabilities.
 *
 * - analyzeDependencies - A function that handles the dependency analysis process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  DependencyAnalysisInputSchema,
  type DependencyAnalysisInput,
  DependencyAnalysisOutputSchema,
  type DependencyAnalysisOutput,
  VulnerabilityFindingSchema,
} from '@/types/ai-schemas';

export async function analyzeDependencies(input: DependencyAnalysisInput): Promise<DependencyAnalysisOutput> {
  return analyzeDependenciesFlow(input);
}

const AnalyzeDependenciesPromptOutputSchema = z.object({
  findings: z.array(
    VulnerabilityFindingSchema.omit({ source: true }) // Source will be "Dependency"
    .extend({
        dependencyName: z.string().optional(),
        dependencyVersion: z.string().optional(),
    })
  ),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]),
  executiveSummary: z.string(),
});

const analyzeDependenciesPrompt = ai.definePrompt({
  name: 'analyzeDependenciesPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: DependencyAnalysisInputSchema },
  output: { schema: AnalyzeDependenciesPromptOutputSchema },
  prompt: `You are a Dependency Security Expert. Analyze the provided dependency file content (type: {{{fileType}}}) for known vulnerabilities.

  Dependency File Content:
  \`\`\`
  {{{dependencyFileContent}}}
  \`\`\`

  Task:
  1. Conceptually parse the dependency file to identify key dependencies and their versions.
  2. For each identified major dependency, *simulate* a lookup against a vulnerability database (like CVEs, Snyk DB, OSV).
  3. For each *potentially* vulnerable dependency found, create a finding:
     - vulnerability: e.g., "Known Vulnerability in [DependencyName]", "Outdated Dependency with Security Fixes".
     - description: Details of the known CVE or type of vulnerability.
     - isVulnerable: Boolean (True if a known high/critical CVE is associated, or if severely outdated with known fixes).
     - severity: 'Low', 'Medium', 'High', 'Critical', 'Informational'.
     - cvssScore, cvssVector: (Optional, if a specific CVE is "found").
     - businessImpact, technicalDetails, evidence (e.g. "Dependency [name]@[version] has CVE-XXXX-YYYY"), remediation (e.g. "Update [DependencyName] to version X.Y.Z or later").
     - dependencyName: Name of the vulnerable dependency.
     - dependencyVersion: Version of the vulnerable dependency.
  4. Provide 'overallRiskAssessment'.
  5. Write 'executiveSummary'.

  Output: JSON object with "findings", "overallRiskAssessment", "executiveSummary".
  If the file content is too generic or dependencies seem up-to-date conceptually, findings can be empty.
  This is a conceptual simulation; no actual database lookups are performed.
  `,
});

const analyzeDependenciesFlow = ai.defineFlow(
  {
    name: 'analyzeDependenciesFlow',
    inputSchema: DependencyAnalysisInputSchema,
    outputSchema: DependencyAnalysisOutputSchema,
  },
  async (input): Promise<DependencyAnalysisOutput> => {
    if (!input.dependencyFileContent || input.dependencyFileContent.trim().length < 20) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "El contenido del archivo de dependencias es demasiado breve o está ausente para un análisis significativo.",
      };
    }
    const { output: promptOutput } = await analyzeDependenciesPrompt(input);

    if (!promptOutput) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "El análisis de dependencias no pudo completarse o no devolvió datos válidos.",
      };
    }

    const findingsWithSource = (promptOutput.findings || []).map(f => ({
      ...f,
      source: "Dependency" as const,
    }));

    return {
      findings: findingsWithSource,
      overallRiskAssessment: promptOutput.overallRiskAssessment || "Informational",
      executiveSummary: promptOutput.executiveSummary || "Análisis de dependencias completo.",
    };
  }
);
