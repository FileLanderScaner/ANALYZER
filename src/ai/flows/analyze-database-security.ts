
'use server';
/**
 * @fileOverview Analyzes a textual description of a database's configuration (including game databases) for potential security vulnerabilities.
 *
 * - analyzeDatabaseSecurity - A function that handles the database security analysis process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  DatabaseConfigInputSchema,
  type DatabaseConfigInput,
  DatabaseSecurityAnalysisOutputSchema,
  type DatabaseSecurityAnalysisOutput,
  VulnerabilityFindingSchema,
} from '@/types/ai-schemas';

export async function analyzeDatabaseSecurity(input: DatabaseConfigInput): Promise<DatabaseSecurityAnalysisOutput> {
  return analyzeDatabaseSecurityFlow(input);
}

const AnalyzeDatabasePromptOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.omit({ source: true, potentialForAccountLockout: true })),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]),
  executiveSummary: z.string(),
});


const analyzeDatabaseSecurityPrompt = ai.definePrompt({
  name: 'analyzeDatabaseSecurityPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: DatabaseConfigInputSchema},
  output: {schema: AnalyzeDatabasePromptOutputSchema},
  prompt: `You are a database security specialist with expertise in various database systems (SQL and NoSQL), focusing on enterprise security best practices and specific considerations for game databases (e.g., for Lineage 2, Roblox, Tibia, MMOs).
  Analyze the following database description for potential security vulnerabilities, misconfigurations, and data protection issues.

  Database Description:
  {{{databaseDescription}}}

  Task:
  1.  Identify potential security issues based *solely* on the provided description. Consider:
      - **Authentication & Authorization:** Weak authentication (e.g., shared accounts, no MFA if implied context needs it), excessive privileges for application accounts or users, lack of principle of least privilege, insecure password storage (e.g., plaintext, weak hashing).
      - **Network Security:** Unnecessary network exposure (e.g., DB port open to 0.0.0.0), lack of firewall rules for DB ports, connections from untrusted sources.
      - **Data Protection:** Lack of encryption for sensitive data at rest (e.g., PII, financial data, player credentials, virtual currency, item inventories) or in transit (e.g., SSL/TLS for DB connections). Insecure handling of sensitive data within stored procedures or application logic if hinted.
      - **Injection Risks:** SQL/NoSQL injection risks if query patterns or lack of input sanitization are hinted in the description of how applications interact with the DB.
      - **Auditing & Logging:** Insufficient logging/auditing of database access, DDL/DML changes, or administrative actions. Lack of monitoring for suspicious activities (e.g., unusual item duplication queries, mass account data access, attempts to bypass game economy rules).
      - **Configuration & Patching:** Outdated database versions, default/insecure configurations (e.g., default admin accounts, sample databases enabled), missing security patches.
      - **Specific Database Features:** Misuse or insecure configuration of database-specific features (e.g., XML external entities, insecure UDFs).
      - **Game Database Specifics:**
          - Vulnerabilities allowing item/currency duplication or manipulation through direct DB interaction or exploitable queries.
          - Insecure storage of player account credentials (passwords, session tokens) or sensitive player PII.
          - Lack of integrity checks for game state, player progression, or virtual item attributes stored in the database.
          - Insufficient logging for player actions or transactions that could aid in cheat detection, exploit investigation, or dispute resolution (e.g., item trades, high-value transactions).
          - Risks related to insecure direct database access from game clients (if implied) or overly privileged game server accounts.
          - Insecure handling of data related to anti-cheat systems, potentially allowing tampering or bypass.
          - Lack of validation or constraints on data that could affect game balance or economy if manipulated (e.g., item stats, drop rates).
  2.  For each potential issue, create a finding object:
      - vulnerability: General category (e.g., "Weak Authentication", "SQL Injection Risk", "Player Data Exposure", "Item Duplication Vulnerability via DB", "Insecure Game Economy Data Storage").
      - description: Detailed observation and its security implication in an enterprise or game database context.
      - isVulnerable: Boolean, true if description strongly suggests a vulnerability.
      - severity: 'Low', 'Medium', 'High', 'Critical', or 'Informational'.
      - cvssScore: (Optional) Estimated CVSS 3.1 base score.
      - cvssVector: (Optional) CVSS 3.1 vector string.
      - businessImpact: (Optional) Potential impact (e.g., "Unauthorized access to player accounts and PII", "Compromise of virtual economy leading to player dissatisfaction", "Game data corruption and rollbacks", "Inability to detect or prove cheating").
      - technicalDetails: (Optional) Technical nature of the vulnerability.
      - evidence: (Optional) Reference to input description.
      - remediation: Suggested high-level remediation.
      (Do not include 'source' or 'potentialForAccountLockout' in these finding objects; they are handled by the system for database analysis.)
  3.  Provide an 'overallRiskAssessment': 'Critical', 'High', 'Medium', 'Low', or 'Informational'.
  4.  Write a concise 'executiveSummary' (3-4 sentences) of the database's security posture, suitable for a business audience, highlighting key risks to data integrity, player information, and game economy if applicable.

  Output Format:
  Return a JSON object with "findings", "overallRiskAssessment", and "executiveSummary".
  If the description is too vague, findings can be empty, risk 'Informational', and summary should state this.
  Prioritize actionable findings relevant to enterprise and game database security.
  `,
});

const analyzeDatabaseSecurityFlow = ai.defineFlow(
  {
    name: 'analyzeDatabaseSecurityFlow',
    inputSchema: DatabaseConfigInputSchema,
    outputSchema: DatabaseSecurityAnalysisOutputSchema,
  },
  async (input): Promise<DatabaseSecurityAnalysisOutput> => {
    if (!input.databaseDescription || input.databaseDescription.trim().length < 50) {
        return {
            findings: [],
            overallRiskAssessment: "Informational",
            executiveSummary: "La descripción de la base de datos es demasiado breve o está ausente. No se puede realizar un análisis de seguridad significativo. Proporcione información detallada sobre el tipo de base de datos, versión, autenticación, configuración de red, prácticas de manejo de datos y cualquier consideración específica del juego (como datos de jugadores, economía virtual, etc.).",
        };
    }
    const { output: promptOutput } = await analyzeDatabaseSecurityPrompt(input);

    if (!promptOutput) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "El análisis de seguridad de la base de datos no pudo completarse o no devolvió datos válidos del modelo de IA. Esto puede deberse a filtros de contenido restrictivos o un problema con el servicio de IA.",
      };
    }

    const findingsWithSource = (promptOutput.findings || []).map(f => ({
      ...f,
      source: "Database" as const,
    }));

    return {
      findings: findingsWithSource,
      overallRiskAssessment: promptOutput.overallRiskAssessment || "Informational",
      executiveSummary: promptOutput.executiveSummary || "El análisis de la descripción de la base de datos está completo. Revise los hallazgos para obtener más detalles. Si el resumen es breve, es posible que la IA haya tenido información limitada para procesar.",
    };
  }
);
