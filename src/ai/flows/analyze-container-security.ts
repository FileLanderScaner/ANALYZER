'use server';
/**
 * @fileOverview Analyzes container configurations (Dockerfile, K8s manifests, image names) for security vulnerabilities.
 *
 * - analyzeContainerSecurity - A function that handles the container security analysis process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  ContainerAnalysisInputSchema,
  type ContainerAnalysisInput,
  ContainerAnalysisOutputSchema,
  type ContainerAnalysisOutput,
  VulnerabilityFindingSchema,
} from '@/types/ai-schemas';

export async function analyzeContainerSecurity(input: ContainerAnalysisInput): Promise<ContainerAnalysisOutput> {
  return analyzeContainerSecurityFlow(input);
}

const AnalyzeContainerPromptOutputSchema = z.object({
  findings: z.array(
    VulnerabilityFindingSchema.omit({ source: true }) // Source will be "Container"
    .extend({
        imageName: z.string().optional(),
    })
  ),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]),
  executiveSummary: z.string(),
});

const analyzeContainerSecurityPrompt = ai.definePrompt({
  name: 'analyzeContainerSecurityPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: ContainerAnalysisInputSchema },
  output: { schema: AnalyzeContainerPromptOutputSchema },
  prompt: `You are a Container Security Expert. Analyze the provided container information for security vulnerabilities.
  {{#if imageName}}Image Name: {{{imageName}}}{{/if}}
  {{#if dockerfileContent}}
  Dockerfile Content:
  \`\`\`dockerfile
  {{{dockerfileContent}}}
  \`\`\`
  {{/if}}
  {{#if kubernetesManifestContent}}
  Kubernetes Manifest Content:
  \`\`\`yaml
  {{{kubernetesManifestContent}}}
  \`\`\`
  {{/if}}
  {{#if additionalContext}}Additional Context: {{{additionalContext}}}{{/if}}

  Task:
  1. Identify potential security issues. Consider:
     - Base Image Vulnerabilities: Use of outdated or known vulnerable base images (conceptual, based on image name if provided).
     - Dockerfile Best Practices: Running as root, exposing unnecessary ports, hardcoded secrets, ADD vs COPY, multi-stage builds.
     - Kubernetes Manifests: Privileged containers, hostPath mounts, insecure capabilities, missing securityContext, resource limits, network policies.
     - Secrets Management: Secrets embedded in image or manifests.
     - Known Vulnerabilities in Application Layers (conceptual, if image name suggests a known app like 'nginx:1.20').
     (Conceptualize Trivy/Anchore Engine type findings).
  2. For each issue, create a finding:
     - vulnerability: e.g., "Use of Outdated Base Image", "Running Container as Root", "Hardcoded Secret in Dockerfile", "Privileged K8s Pod".
     - description: Details of the issue.
     - isVulnerable: Boolean.
     - severity: 'Low', 'Medium', 'High', 'Critical', 'Informational'.
     - cvssScore, cvssVector: (Optional).
     - businessImpact, technicalDetails, evidence, remediation: (As applicable).
     - imageName: (If applicable from input).
  3. Provide 'overallRiskAssessment'.
  4. Write 'executiveSummary'.

  Output: JSON object with "findings", "overallRiskAssessment", "executiveSummary".
  If no specific inputs (image, dockerfile, manifest) are substantial, findings can be empty.
  `,
});

const analyzeContainerSecurityFlow = ai.defineFlow(
  {
    name: 'analyzeContainerSecurityFlow',
    inputSchema: ContainerAnalysisInputSchema,
    outputSchema: ContainerAnalysisOutputSchema,
  },
  async (input): Promise<ContainerAnalysisOutput> => {
     if (!input.imageName && !input.dockerfileContent && !input.kubernetesManifestContent) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "No se proporcionó información suficiente (nombre de imagen, Dockerfile o manifiesto K8s) para el análisis de seguridad del contenedor.",
      };
    }
    const { output: promptOutput } = await analyzeContainerSecurityPrompt(input);

    if (!promptOutput) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "El análisis de seguridad del contenedor no pudo completarse o no devolvió datos válidos.",
      };
    }

    const findingsWithSource = (promptOutput.findings || []).map(f => ({
      ...f,
      source: "Container" as const,
      imageName: f.imageName || input.imageName, // Ensure image name is carried over
    }));

    return {
      findings: findingsWithSource,
      overallRiskAssessment: promptOutput.overallRiskAssessment || "Informational",
      executiveSummary: promptOutput.executiveSummary || "Análisis de seguridad del contenedor completo.",
    };
  }
);
