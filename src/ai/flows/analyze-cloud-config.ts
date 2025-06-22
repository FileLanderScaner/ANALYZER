'use server';
/**
 * @fileOverview Analyzes cloud configuration descriptions for security vulnerabilities.
 *
 * - analyzeCloudConfig - A function that handles the cloud configuration analysis process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  CloudConfigInputSchema,
  type CloudConfigInput,
  CloudConfigAnalysisOutputSchema,
  type CloudConfigAnalysisOutput,
  VulnerabilityFindingSchema,
} from '@/types/ai-schemas';

export async function analyzeCloudConfig(input: CloudConfigInput): Promise<CloudConfigAnalysisOutput> {
  return analyzeCloudConfigFlow(input);
}

const AnalyzeCloudPromptOutputSchema = z.object({
  findings: z.array(
    VulnerabilityFindingSchema.omit({ source: true }) // Source will be "Cloud"
    .extend({
        cloudProvider: z.enum(["AWS", "Azure", "GCP", "Other"]).optional(),
        affectedResource: z.string().optional(),
    })
  ),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]),
  executiveSummary: z.string(),
});

const analyzeCloudConfigPrompt = ai.definePrompt({
  name: 'analyzeCloudConfigPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: CloudConfigInputSchema },
  output: { schema: AnalyzeCloudPromptOutputSchema },
  prompt: `You are a Cloud Security Expert. Analyze the provided cloud configuration description for {{{provider}}} (region: {{#if region}}{{{region}}}{{else}}not specified{{/if}}) for potential security vulnerabilities.

  Cloud Configuration Description:
  {{{configDescription}}}

  Task:
  1. Identify potential security issues. Consider:
     - IAM: Overly permissive roles/policies, unused credentials, lack of MFA on root/admin accounts.
     - Network Security: Publicly exposed sensitive ports (e.g., DB, SSH, RDP on critical instances), overly permissive security group/firewall rules, lack of network segmentation.
     - Storage Security: Publicly accessible S3 buckets/Azure Blobs/GCS buckets, unencrypted storage volumes for sensitive data.
     - Logging & Monitoring: Insufficient logging, lack of alerts for suspicious activities.
     - Secrets Management: Hardcoded secrets, insecure storage of API keys or credentials.
     - Instance/VM Security: Use of outdated images, missing patches, default credentials.
     - Serverless Security (if applicable): Overly permissive execution roles, insecure event triggers.
     - Kubernetes/Container Service Security (if applicable to the description, otherwise defer to specific container analysis): Insecure K8s API server exposure, default configurations.
  2. For each issue, create a finding:
     - vulnerability: e.g., "Overly Permissive IAM Role", "Public S3 Bucket", "Unencrypted RDS Instance".
     - description: Details of the issue.
     - isVulnerable: Boolean.
     - severity: 'Low', 'Medium', 'High', 'Critical', 'Informational'.
     - cvssScore, cvssVector: (Optional).
     - businessImpact, technicalDetails, evidence, remediation: (As applicable).
     - cloudProvider: (Provider from input).
     - affectedResource: (Specific resource ID/name if identifiable).
  3. Provide 'overallRiskAssessment'.
  4. Write 'executiveSummary'.

  Output: JSON object with "findings", "overallRiskAssessment", "executiveSummary".
  If description is vague, findings can be empty. Focus on actionable enterprise cloud security issues.
  `,
});

const analyzeCloudConfigFlow = ai.defineFlow(
  {
    name: 'analyzeCloudConfigFlow',
    inputSchema: CloudConfigInputSchema,
    outputSchema: CloudConfigAnalysisOutputSchema,
  },
  async (input): Promise<CloudConfigAnalysisOutput> => {
    if (!input.configDescription || input.configDescription.trim().length < 50) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "La descripción de la configuración de la nube es demasiado breve o está ausente. No se puede realizar un análisis de seguridad significativo.",
      };
    }
    const { output: promptOutput } = await analyzeCloudConfigPrompt(input);

    if (!promptOutput) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "El análisis de configuración de la nube no pudo completarse o no devolvió datos válidos.",
      };
    }

    const findingsWithSource = (promptOutput.findings || []).map(f => ({
      ...f,
      source: "Cloud" as const,
      cloudProvider: input.provider, // Ensure provider from input is used
    }));

    return {
      findings: findingsWithSource,
      overallRiskAssessment: promptOutput.overallRiskAssessment || "Informational",
      executiveSummary: promptOutput.executiveSummary || "Análisis de configuración de la nube completo.",
    };
  }
);
