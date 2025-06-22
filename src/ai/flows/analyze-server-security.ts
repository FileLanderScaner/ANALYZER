
'use server';
/**
 * @fileOverview Analyzes a textual description of a server's configuration (including game servers) for potential security vulnerabilities.
 *
 * - analyzeServerSecurity - A function that handles the server security analysis process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  ServerConfigInputSchema,
  type ServerConfigInput,
  ServerSecurityAnalysisOutputSchema,
  type ServerSecurityAnalysisOutput,
  VulnerabilityFindingSchema,
} from '@/types/ai-schemas';

export async function analyzeServerSecurity(input: ServerConfigInput): Promise<ServerSecurityAnalysisOutput> {
  return analyzeServerSecurityFlow(input);
}

const AnalyzeServerPromptOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.omit({ source: true, potentialForAccountLockout: true })),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]),
  executiveSummary: z.string(),
});

const analyzeServerSecurityPrompt = ai.definePrompt({
  name: 'analyzeServerSecurityPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: ServerConfigInputSchema},
  output: {schema: AnalyzeServerPromptOutputSchema},
  prompt: `You are a senior cybersecurity architect specializing in server and infrastructure hardening for enterprise environments, with deep expertise in securing dedicated game servers (e.g., Lineage 2, Roblox, Tibia, Minecraft, custom MMO servers).
  Analyze the following server description for potential security vulnerabilities, misconfigurations, and areas for improvement, paying close attention to common enterprise security concerns and game server specific risks.

  Server Description:
  {{{serverDescription}}}

  Task:
  1.  Identify potential security issues based *solely* on the provided description. Consider:
      - **OS Hardening:** Outdated OS/kernel versions, unnecessary services/daemons, default credentials, weak password policies, lack of centralized authentication (LDAP, AD), insecure sudo configurations.
      - **Network Security:** Exposed management interfaces (SSH, RDP, web consoles) to untrusted networks, overly permissive firewall rules (including game-specific ports like UDP/TCP ranges for game traffic, authentication, and chat), lack of network segmentation (e.g., separating game worlds, login servers, database servers), default SNMP community strings, DDoS vulnerability if implied by lack of protection mechanisms (e.g., traffic scrubbing services, rate limiting at network/application level).
      - **Application/Service Security (Web/Generic):** Outdated web/app server versions (Apache, Nginx, Tomcat, etc.), insecure service configurations (directory listing, weak SSL/TLS ciphers, default error pages), missing security headers (CSP, HSTS, X-Frame-Options), known CVEs for deployed software.
      - **Game Server Specifics:**
          - Vulnerabilities in game server software itself (e.g., specific engine exploits for Unreal, Unity, or custom engines if version/type is hinted; common exploits for Lineage 2 C4/Interlude/H5 servers, Roblox Luau vulnerabilities, Tibia OTServer issues).
          - Insecure handling of game protocols or real-time communication channels (e.g., unencrypted game traffic, susceptibility to packet manipulation for cheats like speed hacks, teleport, item duplication).
          - Lack of or poorly configured anti-cheat mechanisms if mentioned (e.g., "custom anti-cheat" without details could be weak). Identify risks of bypass.
          - Exposure of sensitive game server commands or APIs (e.g., RCON ports open to public, unauthenticated admin panels, GraphQL endpoints with excessive permissions).
          - Risks related to player data handling on the server (if described, e.g., storing passwords in plaintext, insecure session management).
          - Vulnerabilities to denial-of-service (DoS/DDoS) attacks specific to game servers (e.g., reflection/amplification attacks via game protocols, character/login server flooding).
          - Insecure integration with third-party services (e.g., payment gateways, forums, voice chat).
          - Potential for game logic exploits (e.g., if description mentions "custom game features" without security considerations).
      - **Logging and Monitoring:** Absence of robust logging for OS, applications, and game server events; lack of centralized log management (SIEM); or missing IDS/IPS. Insufficient game-specific logging (e.g., trades, high-value item drops, admin commands).
      - **Patch Management:** Lack of explicit mention of a patch management process for OS, services, and game server software.
      - **Data Protection:** If server hosts databases or sensitive data (e.g., player accounts, game state, virtual currency balances), look for implications of insecure storage or access.
      - **Access Control:** Weaknesses in user account management, privilege separation (e.g., game server running as root).
  2.  For each potential issue, create a finding object:
      - vulnerability: The general category (e.g., "Outdated OS", "Exposed Insecure Game Port", "Weak Anti-Cheat Implementation", "DDoS Amplification Risk via Game Protocol", "Default Game Server Credentials", "RCON Port Exposed").
      - description: Detailed observation and its security implication in an enterprise or game server context.
      - isVulnerable: Boolean, true if description strongly suggests a vulnerability.
      - severity: 'Low', 'Medium', 'High', 'Critical', or 'Informational'.
      - cvssScore: (Optional) Estimated CVSS 3.1 base score.
      - cvssVector: (Optional) CVSS 3.1 vector string.
      - businessImpact: (Optional) Potential impact (e.g., "Server compromise leading to game cheating and item duplication", "Player data exfiltration impacting thousands of accounts", "Game service downtime due to targeted DDoS against login server", "Reputational damage from widespread cheating").
      - technicalDetails: (Optional) Technical nature of the vulnerability.
      - evidence: (Optional) Reference to input description that suggests the issue.
      - remediation: Suggested high-level remediation.
      (Do not include 'source' or 'potentialForAccountLockout' in these finding objects; they are handled by the system for server analysis.)
  3.  Provide an 'overallRiskAssessment': 'Critical', 'High', 'Medium', 'Low', or 'Informational'.
  4.  Write a concise 'executiveSummary' (3-4 sentences) of the server's security posture, suitable for a business audience, highlighting key risks especially for game integrity and player data if applicable.

  Output Format:
  Return a JSON object with "findings", "overallRiskAssessment", and "executiveSummary".
  If the description is too vague, findings can be empty, risk 'Informational', and summary should state this.
  Prioritize actionable findings relevant to enterprise and game server security.
  `,
});

const analyzeServerSecurityFlow = ai.defineFlow(
  {
    name: 'analyzeServerSecurityFlow',
    inputSchema: ServerConfigInputSchema,
    outputSchema: ServerSecurityAnalysisOutputSchema,
  },
  async (input): Promise<ServerSecurityAnalysisOutput> => {
    if (!input.serverDescription || input.serverDescription.trim().length < 50) {
        return {
            findings: [],
            overallRiskAssessment: "Informational",
            executiveSummary: "La descripción del servidor es demasiado breve o está ausente. No se puede realizar un análisis de seguridad significativo. Proporcione información detallada sobre el sistema operativo, los servicios (incluidos los detalles del servidor de juegos si corresponde, como tipo de juego, motor, modificaciones), las configuraciones y cualquier medida de seguridad implementada.",
        };
    }
    const { output: promptOutput } = await analyzeServerSecurityPrompt(input);

    if (!promptOutput) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "El análisis de seguridad del servidor no pudo completarse o no devolvió datos válidos del modelo de IA. Esto puede deberse a filtros de contenido restrictivos o un problema con el servicio de IA.",
      };
    }

    const findingsWithSource = (promptOutput.findings || []).map(f => ({
      ...f,
      source: "Server" as const,
    }));

    return {
      findings: findingsWithSource,
      overallRiskAssessment: promptOutput.overallRiskAssessment || "Informational",
      executiveSummary: promptOutput.executiveSummary || "El análisis de la descripción del servidor está completo. Revise los hallazgos para obtener más detalles. Si el resumen es breve, es posible que la IA haya tenido información limitada para procesar.",
    };
  }
);
