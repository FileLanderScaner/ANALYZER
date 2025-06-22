
'use server';
/**
 * @fileOverview Analyzes network configuration descriptions or scan results for security vulnerabilities.
 *
 * - analyzeNetworkSecurity - A function that handles the network security analysis process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  NetworkSecurityAnalysisInputSchema,
  type NetworkSecurityAnalysisInput,
  NetworkSecurityAnalysisOutputSchema,
  type NetworkSecurityAnalysisOutput,
  VulnerabilityFindingSchema,
} from '@/types/ai-schemas';

export async function analyzeNetworkSecurity(input: NetworkSecurityAnalysisInput): Promise<NetworkSecurityAnalysisOutput> {
  return analyzeNetworkSecurityFlow(input);
}

const AnalyzeNetworkPromptOutputSchema = z.object({
  findings: z.array(
    VulnerabilityFindingSchema.omit({ source: true }) // Source will be "Network"
    .extend({
        affectedPort: z.string().optional().describe("The specific port number or range affected, if applicable."),
        affectedProtocol: z.string().optional().describe("The protocol (TCP, UDP, ICMP) related to the finding, if applicable."),
    })
  ),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]),
  executiveSummary: z.string(),
});

const analyzeNetworkSecurityPrompt = ai.definePrompt({
  name: 'analyzeNetworkSecurityPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: NetworkSecurityAnalysisInputSchema },
  output: { schema: AnalyzeNetworkPromptOutputSchema },
  prompt: `You are a Network Security Specialist. Analyze the provided network information for potential security vulnerabilities.
  The information might include a general network description, detailed scan results (e.g., from Nmap), and/or firewall rules.

  Network General Description (if provided):
  {{{networkDescription}}}

  {{#if scanResults}}
  Scan Results (e.g., Nmap output, can be verbose):
  \`\`\`
  {{{scanResults}}}
  \`\`\`
  If verbose scan results like Nmap are provided, pay close attention to:
  - Open ports and their states.
  - Services detected on these ports.
  - Specific versions of these services.
  - Output from any scripts run by the scanner (e.g., Nmap NSE scripts) that indicate vulnerabilities.
  Based on identified service versions, try to recall common vulnerabilities associated with outdated or specific versions of software.
  {{/if}}

  {{#if firewallRules}}
  Firewall Rules Summary (if provided):
  \`\`\`
  {{{firewallRules}}}
  \`\`\`
  {{/if}}

  Task:
  1. Identify potential security issues. Consider:
     - Exposed Sensitive Ports: Common ports like SSH (22), RDP (3389), Telnet (23), FTP (21), SMB (445), database ports (3306, 5432, 1433, 27017) open to untrusted networks (e.g., 0.0.0.0/0).
     - Weak Protocols: Use of unencrypted protocols (Telnet, FTP, HTTP) for sensitive data.
     - Firewall Misconfigurations: Overly permissive 'allow any/any' rules, lack of egress filtering, rules not following principle of least privilege.
     - Network Segmentation Issues: Lack of proper segmentation between critical and less critical zones, flat networks.
     - Vulnerable Services: If scan results provide specific service versions, identify if these versions are known to be vulnerable (e.g., old Apache version with known CVEs).
     - Default Credentials: Implied if common management interfaces (e.g., web admin panels for routers, printers, or services identified in scans) are exposed without mention of credential hardening.
     - Lack of IDS/IPS: If description implies direct internet exposure without mention of intrusion detection/prevention.
     - Information Disclosure: Verbose banners, directory listings on web services found through scans.
  2. For each issue, create a finding:
     - vulnerability: e.g., "Exposed SSH Port to Internet", "FTP Service Using Unencrypted Protocol", "Outdated Apache Version [version] on Port [port] with Potential CVEs", "Vulnerable [Service Name] [Version] Detected on Port [Port]".
     - description: Details of the issue. If a service version is identified as vulnerable, mention it.
     - isVulnerable: Boolean.
     - severity: 'Low', 'Medium', 'High', 'Critical', 'Informational'.
     - cvssScore, cvssVector: (Optional, estimate if a common CWE/CVE maps, especially for known vulnerable software versions).
     - businessImpact, technicalDetails, evidence (e.g., "Port 22/TCP open to 0.0.0.0/0", "Nmap script 'xyz' reported vulnerable", "Firewall rule allows all traffic from any source to any destination"), remediation.
     - affectedPort: (e.g., "22/TCP", "80/TCP", "1000-2000/UDP").
     - affectedProtocol: (e.g., "TCP", "UDP").
  3. Provide 'overallRiskAssessment'.
  4. Write 'executiveSummary'.

  Output: JSON object with "findings", "overallRiskAssessment", "executiveSummary".
  If no specific inputs are substantial, findings can be empty.
  Focus on actionable enterprise network security issues based on the provided text.
  Request CVSS scores and vectors where applicable based on known vulnerability patterns (e.g., CWEs related to exposed ports or weak protocols, or known CVEs for specific software versions identified in scan results).
  `,
});

const analyzeNetworkSecurityFlow = ai.defineFlow(
  {
    name: 'analyzeNetworkSecurityFlow',
    inputSchema: NetworkSecurityAnalysisInputSchema,
    outputSchema: NetworkSecurityAnalysisOutputSchema,
  },
  async (input): Promise<NetworkSecurityAnalysisOutput> => {
     if (!input.networkDescription && !input.scanResults && !input.firewallRules) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "No se proporcionó información suficiente (descripción de red, resultados de escaneo o reglas de firewall) para el análisis de seguridad de la red.",
      };
    }
    const { output: promptOutput } = await analyzeNetworkSecurityPrompt(input);

    if (!promptOutput) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "El análisis de seguridad de la red no pudo completarse o no devolvió datos válidos.",
      };
    }

    const findingsWithSource = (promptOutput.findings || []).map(f => ({
      ...f,
      source: "Network" as const,
    }));

    return {
      findings: findingsWithSource,
      overallRiskAssessment: promptOutput.overallRiskAssessment || "Informational",
      executiveSummary: promptOutput.executiveSummary || "Análisis de seguridad de la red completo.",
    };
  }
);

