'use server';
/**
 * @fileOverview Generates a remediation playbook for a given vulnerability finding.
 *
 * - generateRemediationPlaybook - A function that handles the playbook generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  RemediationPlaybookInputSchema,
  type RemediationPlaybookInput,
  RemediationPlaybookOutputSchema,
  type RemediationPlaybookOutput,
  VulnerabilityFindingSchema, // For input schema
} from '@/types/ai-schemas';

export async function generateRemediationPlaybook(input: RemediationPlaybookInput): Promise<RemediationPlaybookOutput> {
  return generateRemediationPlaybookFlow(input);
}

const generateRemediationPlaybookPrompt = ai.definePrompt({
  name: 'generateRemediationPlaybookPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: RemediationPlaybookInputSchema },
  output: { schema: RemediationPlaybookOutputSchema },
  prompt: `You are a Senior Cybersecurity Analyst. Generate a detailed, step-by-step remediation playbook in Markdown format for the following vulnerability.
  The playbook should be actionable and provide concrete steps, including example commands or code snippets where appropriate.

  Vulnerability Details:
  - Source: {{{vulnerabilityFinding.source}}}
  - Vulnerability: {{{vulnerabilityFinding.vulnerability}}}
  - Description: {{{vulnerabilityFinding.description}}}
  - Severity: {{{vulnerabilityFinding.severity}}}
  {{#if vulnerabilityFinding.technicalDetails}}- Technical Details: {{{vulnerabilityFinding.technicalDetails}}}{{/if}}
  {{#if vulnerabilityFinding.evidence}}- Evidence: {{{vulnerabilityFinding.evidence}}}{{/if}}
  {{#if vulnerabilityFinding.remediation}}- Suggested Remediation (High-Level): {{{vulnerabilityFinding.remediation}}}{{/if}}
  {{#if vulnerabilityFinding.filePath}}- File Path (SAST): {{{vulnerabilityFinding.filePath}}}{{/if}}
  {{#if vulnerabilityFinding.lineNumber}}- Line Number (SAST): {{{vulnerabilityFinding.lineNumber}}}{{/if}}
  {{#if vulnerabilityFinding.affectedParameter}}- Affected Parameter (DAST): {{{vulnerabilityFinding.affectedParameter}}}{{/if}}
  {{#if vulnerabilityFinding.cloudProvider}}- Cloud Provider: {{{vulnerabilityFinding.cloudProvider}}}{{/if}}
  {{#if vulnerabilityFinding.affectedResource}}- Affected Cloud Resource: {{{vulnerabilityFinding.affectedResource}}}{{/if}}
  {{#if vulnerabilityFinding.imageName}}- Container Image: {{{vulnerabilityFinding.imageName}}}{{/if}}
  {{#if vulnerabilityFinding.dependencyName}}- Dependency Name: {{{vulnerabilityFinding.dependencyName}}}{{/if}}
  {{#if vulnerabilityFinding.dependencyVersion}}- Dependency Version: {{{vulnerabilityFinding.dependencyVersion}}}{{/if}}


  Playbook Structure:
  1.  **Playbook Title:** "Remediation Playbook: [Vulnerability Name]"
  2.  **## 1. Vulnerability Overview:**
      - Briefly restate the vulnerability, its source, and severity.
  3.  **## 2. Impact Assessment:**
      - Briefly explain the potential impact if exploited, using 'businessImpact' if available.
  4.  **## 3. Prerequisites & Preparation:**
      - Any tools, access, or backups needed before starting.
  5.  **## 4. Step-by-Step Remediation Guide:**
      - Detailed, actionable steps.
      - Include example commands (e.g., \`sudo apt update && sudo apt upgrade your-package\`, \`aws s3api put-bucket-acl --bucket BUCKET_NAME --acl private\`)
      - Include example code fixes (e.g., for SAST: show vulnerable line and corrected line).
      - Refer to specific configuration files or settings if applicable (e.g., "In your nginx.conf, change X to Y").
      - Tailor steps based on 'source' (URL, Server, DB, SAST, DAST, Cloud, Container, Dependency).
  6.  **## 5. Verification Steps:**
      - How to confirm the vulnerability is fixed. (e.g., "Re-run scan", "Attempt to access resource", "Verify configuration value").
  7.  **## 6. Rollback Plan (Optional but Recommended):**
      - Brief steps if remediation causes issues.
  8.  **## 7. Further Recommendations & Best Practices:**
      - Broader security advice related to this vulnerability type.

  Generate the 'playbookTitle' and 'playbookMarkdown' fields in the output JSON.
  Ensure the Markdown is well-formatted and easy to follow.
  Adapt the playbook based on the source of the vulnerability (e.g. server hardening commands for 'Server' source, code changes for 'SAST' source, cloud console/CLI steps for 'Cloud' source).
  `,
});

const generateRemediationPlaybookFlow = ai.defineFlow(
  {
    name: 'generateRemediationPlaybookFlow',
    inputSchema: RemediationPlaybookInputSchema,
    outputSchema: RemediationPlaybookOutputSchema,
  },
  async (input): Promise<RemediationPlaybookOutput> => {
    const { output: promptOutput } = await generateRemediationPlaybookPrompt(input);

    if (!promptOutput || !promptOutput.playbookMarkdown) {
      return {
        playbookTitle: `Playbook no generado para: ${input.vulnerabilityFinding.vulnerability}`,
        playbookMarkdown: "No se pudo generar el playbook de remediación. La IA no devolvió contenido o hubo un error.",
      };
    }
    return promptOutput;
  }
);