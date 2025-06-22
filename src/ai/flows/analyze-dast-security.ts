
'use server';
/**
 * @fileOverview Simulates Dynamic Application Security Testing (DAST) analysis on a target URL.
 *
 * - analyzeDastSecurity - A function that handles the DAST analysis process.
 */

import {ai} from '@/ai/genkit';
import {z}from 'zod';
import {
  DastAnalysisInputSchema,
  type DastAnalysisInput,
  DastAnalysisOutputSchema,
  type DastAnalysisOutput,
  VulnerabilityFindingSchema,
} from '@/types/ai-schemas';

export async function analyzeDastSecurity(input: DastAnalysisInput): Promise<DastAnalysisOutput> {
  return analyzeDastSecurityFlow(input);
}

const AnalyzeDastPromptOutputSchema = z.object({
  findings: z.array(
    VulnerabilityFindingSchema.omit({ source: true }) // Source will be "DAST"
    .extend({
        // DAST specific fields that the AI should focus on generating
        affectedParameter: z.string().optional().describe("The HTTP parameter or part of the URL found to be vulnerable."),
        requestExample: z.string().optional().describe("An example HTTP request that demonstrates the vulnerability."),
        responseExample: z.string().optional().describe("A snippet of the HTTP response that indicates the vulnerability."),
    })
  ),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]),
  executiveSummary: z.string(),
});

const analyzeDastSecurityPrompt = ai.definePrompt({
  name: 'analyzeDastSecurityPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: DastAnalysisInputSchema},
  output: {schema: AnalyzeDastPromptOutputSchema},
  prompt: `You are a DAST (Dynamic Application Security Testing) simulation tool.
  Analyze the provided target URL: {{{targetUrl}}}
  Scan Profile: {{{scanProfile}}}

  Task:
  1.  Based on the URL structure and common web application patterns, *simulate* dynamic tests to identify potential vulnerabilities. Consider:
      - **Cross-Site Scripting (XSS):** Reflected, Stored (conceptual, based on URL patterns like forums, comment sections).
      - **SQL Injection (SQLi):** Test parameters in query strings or conceptual form submissions.
      - **Path Traversal:** Attempt to access files outside the web root.
      - **Insecure Direct Object References (IDOR):** If URL suggests numeric IDs, conceptualize testing for access to other users' data.
      - **Security Misconfigurations:** Exposed directories, sensitive files (e.g., .git, .env - conceptual).
      - **Information Disclosure:** Verbose error messages, server banners.
  2.  For each potential issue, create a finding object:
      - vulnerability: General category (e.g., "Reflected XSS", "SQL Injection in 'id' parameter", "Path Traversal").
      - description: Detailed observation of how the URL might be vulnerable.
      - isVulnerable: Boolean, true if the simulation suggests a high likelihood of vulnerability.
      - severity: 'Low', 'Medium', 'High', 'Critical', or 'Informational'.
      - cvssScore: (Optional) Estimated CVSS 3.1 base score.
      - cvssVector: (Optional) CVSS 3.1 vector string.
      - businessImpact: (Optional) Potential impact.
      - technicalDetails: (Optional) Technical nature of the simulated dynamic test.
      - evidence: (Optional) Describe the simulated test that would confirm this (e.g., "Injecting '><script>alert(1)</script>' into 'query' parameter resulted in script execution.").
      - remediation: Suggested high-level remediation.
      - affectedParameter: (Optional) The URL parameter or part found vulnerable (e.g., "search_term", "user_id").
      - requestExample: (Optional) A conceptual HTTP GET/POST request showing the exploit (e.g., "GET /page?id=1' OR '1'='1").
      - responseExample: (Optional) A conceptual snippet of HTTP response indicating success (e.g., "HTTP/1.1 200 OK ... <script>alert(1)</script> ...").
      (Do not include 'source' as it will be "DAST", or 'potentialForAccountLockout').
  3.  Provide an 'overallRiskAssessment': 'Critical', 'High', 'Medium', 'Low', or 'Informational'.
  4.  Write a concise 'executiveSummary' (2-3 sentences) of the application's security posture based on the simulated DAST.

  Output Format:
  Return a JSON object with "findings", "overallRiskAssessment", and "executiveSummary".
  Focus on vulnerabilities that could be found through dynamic interaction. This is a simulation.
  If the URL seems very simple or robust, findings can be empty.
  `,
});

const analyzeDastSecurityFlow = ai.defineFlow(
  {
    name: 'analyzeDastSecurityFlow',
    inputSchema: DastAnalysisInputSchema,
    outputSchema: DastAnalysisOutputSchema,
  },
  async (input): Promise<DastAnalysisOutput> => {
    const { output: promptOutput } = await analyzeDastSecurityPrompt(input);

    if (!promptOutput) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "El análisis DAST simulado no pudo completarse o no devolvió datos válidos del modelo de IA. Esto puede deberse a filtros de contenido restrictivos o un problema con el servicio de IA.",
      };
    }

    const findingsWithSource = (promptOutput.findings || []).map(f => ({
      ...f,
      source: "DAST" as const,
    }));

    return {
      findings: findingsWithSource,
      overallRiskAssessment: promptOutput.overallRiskAssessment || "Informational",
      executiveSummary: promptOutput.executiveSummary || "El análisis DAST simulado está completo. Revise los hallazgos para obtener más detalles.",
    };
  }
);


