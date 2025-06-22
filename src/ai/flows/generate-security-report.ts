
'use server';

/**
 * @fileOverview A Genkit flow for generating a detailed and comprehensive security report
 * from various analysis results (URL, server, database, SAST, DAST, Cloud, Container, Dependency, Network).
 *
 * - generateSecurityReport - A function that handles the generation of the security report.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateSecurityReportInputSchema,
  type GenerateSecurityReportInput,
  GenerateSecurityReportOutputSchema,
  type GenerateSecurityReportOutput,
  VulnerabilityFindingSchema, 
} from '@/types/ai-schemas';

export async function generateSecurityReport(
  input: GenerateSecurityReportInput
): Promise<GenerateSecurityReportOutput> {
  return generateSecurityReportFlow(input);
}

const generateSecurityReportPrompt = ai.definePrompt({
  name: 'generateSecurityReportPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: GenerateSecurityReportInputSchema},
  output: {schema: GenerateSecurityReportOutputSchema},
  prompt: `
  You are a senior cybersecurity consultant. Create a comprehensive, professional, and actionable security report in Markdown.
  Synthesize findings from automated scans: URL, server, database, SAST, DAST, Cloud Config, Container Security, Dependency Analysis, and/or Network Security Analysis.
  Ensure CVSS scores and vectors are included for findings if provided in the input data.

  Target Description: {{#if analyzedTargetDescription}} {{{analyzedTargetDescription}}} {{else}} Not specified {{/if}}

  {{#if urlAnalysis}}
  URL Analysis Summary:
  - Analyzed URL: (URL is part of the individual finding objects if available)
  - Overall Risk for URL: {{{urlAnalysis.overallRiskAssessment}}}
  - URL Scan Executive Summary: {{{urlAnalysis.executiveSummary}}}
    {{#if urlAnalysis.vulnerableFindingsCount}}
  Key URL Vulnerable Findings ({{urlAnalysis.vulnerableFindingsCount}}):
      {{#each urlAnalysis.findings}}
        {{#if this.isVulnerable}}
  - Source: URL, Category: {{this.vulnerability}} (Severity: {{this.severity}}{{#if this.cvssScore}}, CVSS: {{this.cvssScore}}{{/if}})
    - Observation: {{this.description}}
    - Remediation: {{this.remediation}}
        {{/if}}
      {{/each}}
    {{else}}
  No active vulnerabilities identified in the URL analysis.
    {{/if}}
  {{/if}}

  {{#if serverAnalysis}}
  Server Analysis Summary:
  - Overall Risk for Server: {{{serverAnalysis.overallRiskAssessment}}}
  - Server Scan Executive Summary: {{{serverAnalysis.executiveSummary}}}
    {{#if (lookup (filter serverAnalysis.findings 'isVulnerable') 'length')}}
  Key Server Vulnerable Findings:
      {{#each serverAnalysis.findings}}
        {{#if this.isVulnerable}}
  - Source: Server, Category: {{this.vulnerability}} (Severity: {{this.severity}}{{#if this.cvssScore}}, CVSS: {{this.cvssScore}}{{/if}})
    - Observation: {{this.description}}
    - Remediation: {{this.remediation}}
        {{/if}}
      {{/each}}
    {{else}}
  No active vulnerabilities identified in the server analysis.
    {{/if}}
  {{/if}}

  {{#if databaseAnalysis}}
  Database Analysis Summary:
  - Overall Risk for Database: {{{databaseAnalysis.overallRiskAssessment}}}
  - Database Scan Executive Summary: {{{databaseAnalysis.executiveSummary}}}
    {{#if (lookup (filter databaseAnalysis.findings 'isVulnerable') 'length')}}
  Key Database Vulnerable Findings:
      {{#each databaseAnalysis.findings}}
        {{#if this.isVulnerable}}
  - Source: Database, Category: {{this.vulnerability}} (Severity: {{this.severity}}{{#if this.cvssScore}}, CVSS: {{this.cvssScore}}{{/if}})
    - Observation: {{this.description}}
    - Remediation: {{this.remediation}}
        {{/if}}
      {{/each}}
    {{else}}
  No active vulnerabilities identified in the database analysis.
    {{/if}}
  {{/if}}

  {{#if sastAnalysis}}
  SAST Analysis (Code Snippet) Summary:
  - Overall Risk for Code: {{{sastAnalysis.overallRiskAssessment}}}
  - SAST Scan Executive Summary: {{{sastAnalysis.executiveSummary}}}
    {{#if (lookup (filter sastAnalysis.findings 'isVulnerable') 'length')}}
  Key SAST Vulnerable Findings:
      {{#each sastAnalysis.findings}}
        {{#if this.isVulnerable}}
  - Source: SAST, Category: {{this.vulnerability}} (Severity: {{this.severity}}{{#if this.cvssScore}}, CVSS: {{this.cvssScore}}{{/if}})
    - Observation: {{this.description}}
          {{#if this.filePath}}- File: {{this.filePath}} {{/if}}{{#if this.lineNumber}}Line: {{this.lineNumber}}{{/if}}
    - Remediation: {{this.remediation}}
        {{/if}}
      {{/each}}
    {{else}}
  No active vulnerabilities identified in the SAST analysis.
    {{/if}}
  {{/if}}

  {{#if dastAnalysis}}
  DAST Analysis (Dynamic Application Scan) Summary:
  - Overall Risk for Application: {{{dastAnalysis.overallRiskAssessment}}}
  - DAST Scan Executive Summary: {{{dastAnalysis.executiveSummary}}}
    {{#if (lookup (filter dastAnalysis.findings 'isVulnerable') 'length')}}
  Key DAST Vulnerable Findings:
      {{#each dastAnalysis.findings}}
        {{#if this.isVulnerable}}
  - Source: DAST, Category: {{this.vulnerability}} (Severity: {{this.severity}}{{#if this.cvssScore}}, CVSS: {{this.cvssScore}}{{/if}})
    - Observation: {{this.description}}
          {{#if this.affectedParameter}}- Parameter: {{this.affectedParameter}}{{/if}}
    - Remediation: {{this.remediation}}
        {{/if}}
      {{/each}}
    {{else}}
  No active vulnerabilities identified in the DAST analysis.
    {{/if}}
  {{/if}}

  {{#if cloudAnalysis}}
  Cloud Configuration Analysis Summary ({{{cloudAnalysis.findings.0.cloudProvider}}}):
  - Overall Risk for Cloud Config: {{{cloudAnalysis.overallRiskAssessment}}}
  - Cloud Scan Executive Summary: {{{cloudAnalysis.executiveSummary}}}
    {{#if (lookup (filter cloudAnalysis.findings 'isVulnerable') 'length')}}
  Key Cloud Vulnerable Findings:
      {{#each cloudAnalysis.findings}}
        {{#if this.isVulnerable}}
  - Source: Cloud, Provider: {{this.cloudProvider}}, Category: {{this.vulnerability}} (Severity: {{this.severity}}{{#if this.cvssScore}}, CVSS: {{this.cvssScore}}{{/if}})
    - Observation: {{this.description}}
          {{#if this.affectedResource}}- Resource: {{this.affectedResource}}{{/if}}
    - Remediation: {{this.remediation}}
        {{/if}}
      {{/each}}
    {{else}}
  No active vulnerabilities identified in the Cloud configuration analysis.
    {{/if}}
  {{/if}}

  {{#if containerAnalysis}}
  Container Security Analysis Summary:
  - Overall Risk for Container(s): {{{containerAnalysis.overallRiskAssessment}}}
  - Container Scan Executive Summary: {{{containerAnalysis.executiveSummary}}}
    {{#if (lookup (filter containerAnalysis.findings 'isVulnerable') 'length')}}
  Key Container Vulnerable Findings:
      {{#each containerAnalysis.findings}}
        {{#if this.isVulnerable}}
  - Source: Container, Category: {{this.vulnerability}} (Severity: {{this.severity}}{{#if this.cvssScore}}, CVSS: {{this.cvssScore}}{{/if}})
    - Observation: {{this.description}}
          {{#if this.imageName}}- Image: {{this.imageName}}{{/if}}
    - Remediation: {{this.remediation}}
        {{/if}}
      {{/each}}
    {{else}}
  No active vulnerabilities identified in the Container security analysis.
    {{/if}}
  {{/if}}

  {{#if dependencyAnalysis}}
  Dependency Analysis Summary (File Type: {{#if dependencyAnalysis.findings.length}}{{{dependencyAnalysis.findings.0.fileType}}}{{else}}N/A{{/if}}):
  - Overall Risk for Dependencies: {{{dependencyAnalysis.overallRiskAssessment}}}
  - Dependency Scan Executive Summary: {{{dependencyAnalysis.executiveSummary}}}
    {{#if (lookup (filter dependencyAnalysis.findings 'isVulnerable') 'length')}}
  Key Vulnerable Dependencies:
      {{#each dependencyAnalysis.findings}}
        {{#if this.isVulnerable}}
  - Source: Dependency, Category: {{this.vulnerability}} (Severity: {{this.severity}}{{#if this.cvssScore}}, CVSS: {{this.cvssScore}}{{/if}})
    - Observation: {{this.description}}
          {{#if this.dependencyName}}- Dependency: {{this.dependencyName}} {{/if}}{{#if this.dependencyVersion}}@{{this.dependencyVersion}}{{/if}}
    - Remediation: {{this.remediation}}
        {{/if}}
      {{/each}}
    {{else}}
  No active vulnerabilities identified in the Dependency analysis.
    {{/if}}
  {{/if}}

  {{#if networkAnalysis}}
  Network Security Analysis Summary:
  - Overall Risk for Network: {{{networkAnalysis.overallRiskAssessment}}}
  - Network Scan Executive Summary: {{{networkAnalysis.executiveSummary}}}
    {{#if (lookup (filter networkAnalysis.findings 'isVulnerable') 'length')}}
  Key Network Vulnerable Findings:
      {{#each networkAnalysis.findings}}
        {{#if this.isVulnerable}}
  - Source: Network, Category: {{this.vulnerability}} (Severity: {{this.severity}}{{#if this.cvssScore}}, CVSS: {{this.cvssScore}}{{/if}})
    - Observation: {{this.description}}
          {{#if this.affectedPort}}- Port: {{this.affectedPort}}{{/if}} {{#if this.affectedProtocol}}({{this.affectedProtocol}}){{/if}}
    - Remediation: {{this.remediation}}
        {{/if}}
      {{/each}}
    {{else}}
  No active vulnerabilities identified in the Network security analysis.
    {{/if}}
  {{/if}}


  {{#if overallVulnerableFindings.length}}
  Consolidated List of All Vulnerable Findings ({{overallVulnerableFindings.length}} total):
    {{#each overallVulnerableFindings}}
  - Source: {{this.source}}, Category: {{this.vulnerability}} (Severity: {{this.severity}}{{#if this.cvssScore}}, CVSS: {{this.cvssScore}}{{/if}})
    - Observation: {{this.description}}
    - Remediation: {{this.remediation}}
    {{/each}}
  {{else}}
    {{#unless urlAnalysis.vulnerableFindingsCount}}
     {{#unless (lookup (filter serverAnalysis.findings 'isVulnerable') 'length')}}
      {{#unless (lookup (filter databaseAnalysis.findings 'isVulnerable') 'length')}}
       {{#unless (lookup (filter sastAnalysis.findings 'isVulnerable') 'length')}}
        {{#unless (lookup (filter dastAnalysis.findings 'isVulnerable') 'length')}}
         {{#unless (lookup (filter cloudAnalysis.findings 'isVulnerable') 'length')}}
          {{#unless (lookup (filter containerAnalysis.findings 'isVulnerable') 'length')}}
           {{#unless (lookup (filter dependencyAnalysis.findings 'isVulnerable') 'length')}}
            {{#unless (lookup (filter networkAnalysis.findings 'isVulnerable') 'length')}}
  No specific active vulnerabilities were identified by the performed scans/analyses.
            {{/unless}}
           {{/unless}}
          {{/unless}}
         {{/unless}}
        {{/unless}}
       {{/unless}}
      {{/unless}}
     {{/unless}}
    {{/unless}}
  {{/if}}


  Instructions for the Report:
  Generate a comprehensive security report based *only* on the provided scan results. Structure the report logically using Markdown:
  1.  **# Overall Executive Summary (Report):**
      - State overall security posture, highest risk (Severity, CVSS if available for top risks).
      - Summarize most significant risks across all sources. Total active vulnerabilities. Call to action.
  2.  **# Detailed Findings and Analysis:**
      Organize by source (e.g., ## URL Analysis, ## Server Configuration, ## SAST Analysis, etc.).
      If no analysis or no findings for a source, state "No [Source Type] analysis was performed or no findings were reported."
      For *each source* with *vulnerable* findings:
      *   Restate its specific executive summary and overall risk (obtained from the input data for that source).
      *   For *each vulnerable* finding (where 'isVulnerable' is true in the input data for that finding):
          *   Generate a sub-heading like: **### [Vulnerability Category] (Severity: [Severity], CVSS: [Score if available] - Vector: [Vector if available])** (Use data from the finding object).
          *   Include **Source Specifics:** Based on the input finding's fields such as 'filePath', 'lineNumber' (for SAST); 'affectedParameter' (for DAST); 'cloudProvider', 'affectedResource' (for Cloud); 'imageName' (for Container); 'dependencyName', 'dependencyVersion' (for Dependency); 'affectedPort', 'affectedProtocol' (for Network). Format this information clearly as a list or sub-section.
          *   Detail the **Specific Finding:** using the 'description' from the input finding object.
          *   Explain the **Potential Business Impact:** using 'businessImpact' from the input finding object, if available.
          *   Provide **Technical Details:** using 'technicalDetails' from the input finding object, if available.
          *   Present **Evidence:**
              *   Include general 'evidence' text from the input finding object, if available.
              *   If the finding's source is 'SAST' and 'codeSnippetContext' (from the input finding) is available, present it clearly as a Markdown code block, for example:
                  **Code Snippet Context (SAST):**
                  \`\`\`[language_if_known_or_omit]
                  [codeSnippetContext_content]
                  \`\`\`
              *   If the finding's source is 'SAST' and 'suggestedFix' (from the input finding) is available, present it clearly as a Markdown code block under a "Suggested Fix (SAST)" heading, for example:
                  **Suggested Fix (SAST):**
                  \`\`\`[language_if_known_or_omit]
                  [suggestedFix_content]
                  \`\`\`
              *   If the finding's source is 'DAST' and 'requestExample' (from the input finding) is available, present it clearly as a Markdown code block.
              *   If the finding's source is 'DAST' and 'responseExample' (from the input finding) is available, present it clearly as a Markdown code block.
          *   Outline **Recommended Remediation:** using 'remediation' from the input finding object.
  3.  **# Prioritized Recommendations:**
      - List top 3-5 vulnerabilities to address first (based on severity and potential impact from input findings).
  4.  **# Compliance Considerations (General Overview):**
      - Briefly mention general compliance impacts if vulnerabilities are relevant to common standards (e.g., PII exposure related to GDPR/CCPA data protection principles, access control issues for ISO 27001/SOC2, network security for PCI-DSS). Do not invent compliance issues or specific control mappings unless directly implied by the vulnerability type (e.g., "unencrypted PII storage" clearly relates to data protection).
  5.  **# Conclusion:**
      - Reiterate overall posture and importance of proactive security. Recommend ongoing practices.

  Format using markdown. Professional tone. Focus solely on provided input data.
  Gracefully omit sections for which no analysis data was provided.
  Ensure all specific fields like CVSS score, vector, file paths, line numbers, code snippets, affected parameters, request/response examples, cloud resources, container images, dependency names/versions, and network ports/protocols are included in the detailed findings section if they exist in the input 'VulnerabilityFinding' objects.
  `,
});


const generateSecurityReportFlow = ai.defineFlow(
  {
    name: 'generateSecurityReportFlow',
    inputSchema: GenerateSecurityReportInputSchema,
    outputSchema: GenerateSecurityReportOutputSchema,
  },
  async (input): Promise<GenerateSecurityReportOutput> => {
    let overallVulnerableFindings: VulnerabilityFinding[] = []; 
    if (input.urlAnalysis?.findings) overallVulnerableFindings = overallVulnerableFindings.concat(input.urlAnalysis.findings.filter(f => f.isVulnerable));
    if (input.serverAnalysis?.findings) overallVulnerableFindings = overallVulnerableFindings.concat(input.serverAnalysis.findings.filter(f => f.isVulnerable));
    if (input.databaseAnalysis?.findings) overallVulnerableFindings = overallVulnerableFindings.concat(input.databaseAnalysis.findings.filter(f => f.isVulnerable));
    if (input.sastAnalysis?.findings) overallVulnerableFindings = overallVulnerableFindings.concat(input.sastAnalysis.findings.filter(f => f.isVulnerable));
    if (input.dastAnalysis?.findings) overallVulnerableFindings = overallVulnerableFindings.concat(input.dastAnalysis.findings.filter(f => f.isVulnerable));
    if (input.cloudAnalysis?.findings) overallVulnerableFindings = overallVulnerableFindings.concat(input.cloudAnalysis.findings.filter(f => f.isVulnerable));
    if (input.containerAnalysis?.findings) overallVulnerableFindings = overallVulnerableFindings.concat(input.containerAnalysis.findings.filter(f => f.isVulnerable));
    if (input.dependencyAnalysis?.findings) overallVulnerableFindings = overallVulnerableFindings.concat(input.dependencyAnalysis.findings.filter(f => f.isVulnerable));
    if (input.networkAnalysis?.findings) overallVulnerableFindings = overallVulnerableFindings.concat(input.networkAnalysis.findings.filter(f => f.isVulnerable));
    
    // Ensure 'source' is populated for all findings in overallVulnerableFindings for the prompt
    overallVulnerableFindings = overallVulnerableFindings.map(f => {
        let findingSource = f.source; 
        if (!findingSource) { 
                 if (input.urlAnalysis?.findings.some(item => item.description === f.description && item.vulnerability === f.vulnerability)) findingSource = "URL";
            else if (input.serverAnalysis?.findings.some(item => item.description === f.description && item.vulnerability === f.vulnerability)) findingSource = "Server";
            else if (input.databaseAnalysis?.findings.some(item => item.description === f.description && item.vulnerability === f.vulnerability)) findingSource = "Database";
            else if (input.sastAnalysis?.findings.some(item => item.description === f.description && item.vulnerability === f.vulnerability)) findingSource = "SAST";
            else if (input.dastAnalysis?.findings.some(item => item.description === f.description && item.vulnerability === f.vulnerability)) findingSource = "DAST";
            else if (input.cloudAnalysis?.findings.some(item => item.description === f.description && item.vulnerability === f.vulnerability)) findingSource = "Cloud";
            else if (input.containerAnalysis?.findings.some(item => item.description === f.description && item.vulnerability === f.vulnerability)) findingSource = "Container";
            else if (input.dependencyAnalysis?.findings.some(item => item.description === f.description && item.vulnerability === f.vulnerability)) findingSource = "Dependency";
            else if (input.networkAnalysis?.findings.some(item => item.description === f.description && item.vulnerability === f.vulnerability)) findingSource = "Network";
        }
        // Ensure all fields from the schema are present, even if undefined, for the AI to process
        const completeFinding: VulnerabilityFinding = {
            source: findingSource || "Unknown" as const,
            vulnerability: f.vulnerability,
            description: f.description,
            isVulnerable: f.isVulnerable,
            severity: f.severity,
            cvssScore: f.cvssScore,
            cvssVector: f.cvssVector,
            businessImpact: f.businessImpact,
            technicalDetails: f.technicalDetails,
            evidence: f.evidence,
            potentialForAccountLockout: f.potentialForAccountLockout,
            remediation: f.remediation,
            filePath: f.filePath,
            lineNumber: f.lineNumber,
            codeSnippetContext: f.codeSnippetContext,
            suggestedFix: f.suggestedFix,
            affectedParameter: f.affectedParameter,
            requestExample: f.requestExample,
            responseExample: f.responseExample,
            cloudProvider: f.cloudProvider,
            affectedResource: f.affectedResource,
            imageName: f.imageName,
            dependencyName: f.dependencyName,
            dependencyVersion: f.dependencyVersion,
            affectedPort: f.affectedPort,
            affectedProtocol: f.affectedProtocol,
        };
        return completeFinding;
    });

    const promptInput = {
      analyzedTargetDescription: input.analyzedTargetDescription || "System components",
      urlAnalysis: input.urlAnalysis,
      serverAnalysis: input.serverAnalysis,
      databaseAnalysis: input.databaseAnalysis,
      sastAnalysis: input.sastAnalysis,
      dastAnalysis: input.dastAnalysis,
      cloudAnalysis: input.cloudAnalysis,
      containerAnalysis: input.containerAnalysis,
      dependencyAnalysis: input.dependencyAnalysis,
      networkAnalysis: input.networkAnalysis,
      overallVulnerableFindings: overallVulnerableFindings, // Pass the enriched findings
      input: input // Keep original input for context if needed, though overallVulnerableFindings is primary for detailed section
    };

    const {output} = await generateSecurityReportPrompt(promptInput);
    
    if (!output || !output.report) {
        const defaultMessage = overallVulnerableFindings.length > 0 ?
            "Security analysis was performed, but the AI could not generate a formatted report. Please review individual findings. This may be due to restrictive content filters or an issue with the AI service." :
            "No vulnerabilities were detected in this scan, or the analysis could not generate a report. If input descriptions were too brief, the AI may not have had enough information.";
        return { report: defaultMessage };
    }
    return output;
  }
);

