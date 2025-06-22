
'use server';

/**
 * @fileOverview Analyzes a web application URL for common web application vulnerabilities.
 *
 * - analyzeUrlVulnerabilities - A function that handles the URL vulnerability analysis process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  AnalyzeUrlVulnerabilitiesInputSchema,
  type AnalyzeUrlVulnerabilitiesInput,
  UrlVulnerabilityAnalysisOutputSchema,
  type UrlVulnerabilityAnalysisOutput,
  VulnerabilityFindingSchema,
} from '@/types/ai-schemas';


export async function analyzeUrlVulnerabilities(input: AnalyzeUrlVulnerabilitiesInput): Promise<UrlVulnerabilityAnalysisOutput> {
  return analyzeUrlVulnerabilitiesFlow(input);
}

// This schema is specific to the prompt's direct output, before flow adds calculated fields.
// The `source` field will be added by the flow logic. `potentialForAccountLockout` is also handled by flow for URL.
const AnalyzeUrlPromptOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.omit({ source: true, potentialForAccountLockout: true })),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]),
  executiveSummary: z.string(),
});

const analyzeUrlVulnerabilitiesPrompt = ai.definePrompt({
  name: 'analyzeUrlVulnerabilitiesPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: AnalyzeUrlVulnerabilitiesInputSchema},
  output: {schema: AnalyzeUrlPromptOutputSchema},
  prompt: `You are a security expert analyzing web application URLs, particularly user registration pages or publicly accessible endpoints, for common web application vulnerabilities.

  Analyze the provided URL: {{{url}}}

  Task:
  1.  Identify potential vulnerabilities focusing on common web risks including, but not limited to:
      - Cross-Site Scripting (XSS) - Reflected, Stored, DOM-based
      - SQL Injection (SQLi)
      - Weak Password Policies (if observable from registration form requirements)
      - Lack of Rate Limiting (on registration attempts, password resets - infer if possible)
      - Missing or Weak CAPTCHA (if a form is present)
      - Information Disclosure (e.g., verbose error messages, user enumeration, server banners)
      - Insecure Security Headers (e.g., missing CSP, HSTS, X-Frame-Options)
      - Input Validation Issues (general, beyond XSS/SQLi)
      - CSRF (Cross-Site Request Forgery) - if form structure suggests lack of tokens
  2.  For each potential issue, create a finding object with:
      - vulnerability: The general category (e.g., "Cross-Site Scripting (XSS)", "Rate Limiting").
      - description: A brief description of the *specific* observation or finding for the URL.
      - isVulnerable: Boolean, true if the URL appears vulnerable to this *specific* finding.
      - severity: 'Low', 'Medium', 'High', 'Critical', or 'Informational'.
      - cvssScore: (Optional) If applicable and a standard CVE or CWE exists, provide an estimated CVSS 3.1 base score (e.g., 7.5).
      - cvssVector: (Optional) The CVSS 3.1 vector string for the score (e.g., CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N).
      - businessImpact: (Optional) Describe the potential business impact if exploited (e.g., "Compromise of user accounts leading to unauthorized access and potential data theft.").
      - technicalDetails: (Optional) Provide more in-depth technical details about why this is a vulnerability in this context.
      - evidence: (Optional) Mention any specific evidence observed (e.g., "Error message '...' reveals internal path", "No CSRF token observed in form submission").
      - remediation: Suggested high-level remediation steps.
      (Do not include 'source' or 'potentialForAccountLockout' in these finding objects; they are handled by the system for URL analysis.)
  3.  Based on all findings, provide an 'overallRiskAssessment': 'Critical' (if multiple High severity vulnerable findings or one High with significant impact), 'High' (if at least one High severity vulnerable finding), 'Medium' (if Medium severity vulnerable findings exist without any High), 'Low' (if only Low severity vulnerable findings), or 'Informational' (if no active vulnerabilities are found, only informational findings).
  4.  Write a concise 'executiveSummary' (2-3 sentences) of the page's security posture, highlighting the most critical risks if any. If no active vulnerabilities, state that.

  Output Format:
  Return a JSON object with three top-level keys: "findings" (an array of finding objects), "overallRiskAssessment" (string enum), and "executiveSummary" (string).
  Focus on vulnerabilities observable or inferable from accessing the URL.
  If no specific vulnerabilities are confidently identified, "findings" should be an empty array, "overallRiskAssessment" should be "Informational", and "executiveSummary" should reflect this.
  `,
});

const analyzeUrlVulnerabilitiesFlow = ai.defineFlow(
  {
    name: 'analyzeUrlVulnerabilitiesFlow',
    inputSchema: AnalyzeUrlVulnerabilitiesInputSchema,
    outputSchema: UrlVulnerabilityAnalysisOutputSchema,
  },
  async (input): Promise<UrlVulnerabilityAnalysisOutput> => {
    const { output: promptOutput } = await analyzeUrlVulnerabilitiesPrompt(input);

    if (!promptOutput) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "URL analysis could not be completed or returned no valid data from the AI model.",
        vulnerableFindingsCount: 0,
        highSeverityCount: 0,
        mediumSeverityCount: 0,
        lowSeverityCount: 0,
      };
    }
    
    const findingsWithSourceAndLockout = (promptOutput.findings || []).map(f => {
        // Determine potentialForAccountLockout based on vulnerability type for URL analysis
        const lockoutRiskCategories = ["Weak Password Policies", "Rate Limiting", "Missing or Weak CAPTCHA"];
        const potentialForAccountLockout = lockoutRiskCategories.some(cat => 
            f.vulnerability.toLowerCase().includes(cat.toLowerCase())
        ) && f.isVulnerable;

        return { 
            ...f, 
            source: "URL" as const, 
            potentialForAccountLockout: potentialForAccountLockout
        };
    });
    
    const vulnerableFindings = findingsWithSourceAndLockout.filter(f => f.isVulnerable);
    const vulnerableFindingsCount = vulnerableFindings.length;
    const highSeverityCount = vulnerableFindings.filter(f => f.severity === 'High' || f.severity === 'Critical').length;
    const mediumSeverityCount = vulnerableFindings.filter(f => f.severity === 'Medium').length;
    const lowSeverityCount = vulnerableFindings.filter(f => f.severity === 'Low').length;

    const overallRiskAssessment = promptOutput.overallRiskAssessment || (vulnerableFindingsCount > 0 ? "Medium" : "Informational");
    const executiveSummary = promptOutput.executiveSummary || (vulnerableFindingsCount > 0 ? "Vulnerabilities were identified for the URL. Please review the findings." : "No active vulnerabilities were identified for the URL in this scan.");

    return {
      findings: findingsWithSourceAndLockout,
      overallRiskAssessment: overallRiskAssessment,
      executiveSummary: executiveSummary,
      vulnerableFindingsCount: vulnerableFindingsCount,
      highSeverityCount: highSeverityCount,
      mediumSeverityCount: mediumSeverityCount,
      lowSeverityCount: lowSeverityCount,
    };
  }
);
