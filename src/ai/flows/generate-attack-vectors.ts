
'use server';
/**
 * @fileOverview Generates potential attack vectors based on identified vulnerabilities from various sources.
 *
 * - generateAttackVectors - A function that takes vulnerability analysis output and generates corresponding attack vectors.
 */

import { ai } from '@/ai/genkit';
import {
  VulnerabilityFindingSchema,
  type GenerateAttackVectorsInput,
  GenerateAttackVectorsInputSchema,
  type GenerateAttackVectorsOutput,
  GenerateAttackVectorsOutputSchema,
  AttackVectorItemSchema,
  type AttackVectorItem,
} from '@/types/ai-schemas';


export async function generateAttackVectors(
  input: GenerateAttackVectorsInput
): Promise<GenerateAttackVectorsOutput> {
  const vulnerableFindings = input.filter(v => v.isVulnerable);
  if (vulnerableFindings.length === 0) {
    return [];
  }
  return generateAttackVectorsFlow(vulnerableFindings);
}

// The input to this prompt is a single VulnerabilityFinding
const generateAttackVectorForVulnerabilityPrompt = ai.definePrompt({
  name: 'generateAttackVectorForVulnerabilityPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: VulnerabilityFindingSchema }, // Input is a single finding
  output: { schema: AttackVectorItemSchema.omit({ source: true }) }, // The flow will add the source from the input finding
  prompt: `
    You are a cybersecurity expert. Given the following vulnerability finding (from source: {{{source}}}), describe a potential *illustrative* attack vector.
    Focus on how an attacker could exploit this specific finding. Tailor the scenario, payload/technique, and outcome to the vulnerability type, description, and source.
    If 'potentialForAccountLockout' is true (typically for URL/auth vulnerabilities), ensure the scenario reflects this possibility.

    Provide a brief, illustrative example of a payload or technique.
    Clearly state the expected outcome if the attack is successful (e.g., XSS execution, data exposure, account lockout, server compromise, database breach).
    This information is strictly for educational purposes to demonstrate risk. Do NOT generate overly complex or directly executable harmful code. Keep payloads/techniques simple and conceptual.

    Vulnerability Finding Details:
    - Source: {{{source}}}
    - Category: {{{vulnerability}}}
    - Specific Finding: {{{description}}}
    - Severity: {{{severity}}}
    - Is Vulnerable: {{{isVulnerable}}} (This will always be true for inputs to this prompt)
    {{#if potentialForAccountLockout}}
    - Potential for Account Lockout: {{{potentialForAccountLockout}}}
    {{/if}}
    - Remediation (for context, not direct use): {{{remediation}}}

    Based on this, generate the attack vector information:
    - vulnerabilityName: Use the 'Category' (e.g., "Cross-Site Scripting (XSS)", "Outdated Web Server").
    - attackScenarioDescription: Describe the attack based on the 'Specific Finding' and 'Source'.
    - examplePayloadOrTechnique: Provide a conceptual example relevant to the 'Category', 'Specific Finding', and 'Source' (e.g., "Injecting <script>alert(1)</script> into a form field for URL source", "Using known exploit for CVE-XXXX-YYYY for Server source if version is mentioned", "Trying SQL query ' OR 1=1 -- ' for Database source").
    - expectedOutcomeIfSuccessful: State the likely result (e.g., "Execute arbitrary script in user's browser", "Gain shell access to server", "Bypass authentication to database").
  `,
});

const generateAttackVectorsFlow = ai.defineFlow(
  {
    name: 'generateAttackVectorsFlow',
    inputSchema: GenerateAttackVectorsInputSchema, // Array of VulnerabilityFinding
    outputSchema: GenerateAttackVectorsOutputSchema, // Array of AttackVectorItem
  },
  async (vulnerableFindings): Promise<GenerateAttackVectorsOutput> => {
    const attackVectors: AttackVectorItem[] = [];

    for (const vulnFinding of vulnerableFindings) {
      if (vulnFinding.isVulnerable) { // Double check, though pre-filtered
        const { output: attackVectorPromptOutput } = await generateAttackVectorForVulnerabilityPrompt(vulnFinding);
        if (attackVectorPromptOutput) {
          attackVectors.push({
            ...attackVectorPromptOutput,
            vulnerabilityName: vulnFinding.vulnerability, // Ensure consistency
            source: vulnFinding.source || "Unknown", // Carry over the source
          });
        }
      }
    }
    return attackVectors;
  }
);
