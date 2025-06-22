/**
 * @fileOverview Centralized Zod schemas and TypeScript types for AI flows.
 * This file does not use 'use server' and can be safely imported by server components/actions
 * and AI flow definitions.
 */
import { z } from 'zod';

// Schemas and types for analyze-url-vulnerabilities flow (renamed from analyze-vulnerabilities)
export const VulnerabilityFindingSchema = z.object({
  source: z.enum(["URL", "Server", "Database", "SAST", "DAST", "Cloud", "Container", "Dependency", "Network", "Unknown"]).optional().describe("The source of the finding."),
  vulnerability: z.string().describe('The identified vulnerability category (e.g., Cross-Site Scripting (XSS), SQL Injection, Weak Password Policy, Missing Rate Limiting, Insecure Configuration, Outdated OS, Exposed Database Port, Insecure Code Pattern, Dynamic Application Flaw, IAM Misconfiguration, Exposed Container Port, Vulnerable Dependency, Exposed Network Port).'),
  description: z.string().describe('A brief description of the specific finding related to the vulnerability category.'),
  isVulnerable: z.boolean().describe('Whether the target shows signs of being vulnerable to this specific finding.'),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical', 'Informational']).describe('The estimated severity of the vulnerability finding. Critical may be used by AI if multiple Highs or exceptionally severe single High.'),
  cvssScore: z.number().min(0).max(10).optional().describe("The CVSS 3.1 base score, if applicable (e.g., 7.5). AI should attempt to provide this if the vulnerability maps to a known CVE/CWE."),
  cvssVector: z.string().optional().describe("The CVSS 3.1 vector string, if applicable (e.g., CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N). AI should attempt to provide this with the score."),
  businessImpact: z.string().optional().describe("Potential business impact if this vulnerability is exploited (e.g., data breach, service disruption, reputational damage)."),
  technicalDetails: z.string().optional().describe("In-depth technical explanation of the vulnerability, how it occurs, and relevant technical context."),
  evidence: z.string().optional().describe("Specific evidence or observations that support the finding (e.g., specific log entry, configuration snippet, problematic URL parameter)."),
  potentialForAccountLockout: z
    .boolean()
    .optional() 
    .describe('Whether this specific finding could directly contribute to account lockouts (primarily for URL auth vulnerabilities).'),
  remediation: z.string().describe('Suggested remediation steps to address the finding.'),
  // SAST specific fields
  filePath: z.string().optional().describe("For SAST findings, the conceptual path to the vulnerable file (e.g., 'auth/service.py')."),
  lineNumber: z.number().int().min(1).optional().describe("For SAST findings, the conceptual line number of the vulnerability within the snippet."),
  codeSnippetContext: z.string().optional().describe("For SAST findings, a small snippet (3-5 lines) from the input that clearly shows the vulnerable code pattern."),
  suggestedFix: z.string().optional().describe("For SAST findings, a conceptual example of how the vulnerable code could be fixed. Could be a corrected code snippet."),
  // DAST specific fields
  affectedParameter: z.string().optional().describe("For DAST findings, the affected parameter or input field."),
  requestExample: z.string().optional().describe("For DAST findings, an example HTTP request that triggered the vulnerability."),
  responseExample: z.string().optional().describe("For DAST findings, a relevant snippet from the server's HTTP response."),
  // Cloud specific fields
  cloudProvider: z.enum(["AWS", "Azure", "GCP", "Other"]).optional().describe("Cloud provider if applicable."),
  affectedResource: z.string().optional().describe("Specific cloud resource affected (e.g., S3 Bucket Name, VM ID)."),
  // Container specific fields
  imageName: z.string().optional().describe("Container image name and tag if applicable."),
  // Dependency specific fields
  dependencyName: z.string().optional().describe("Name of the vulnerable dependency."),
  dependencyVersion: z.string().optional().describe("Version of the vulnerable dependency."),
  // Network specific fields
  affectedPort: z.string().optional().describe("The specific port number or range affected, if applicable (e.g., '22/TCP', '1000-2000/UDP')."),
  affectedProtocol: z.string().optional().describe("The protocol (TCP, UDP, ICMP) related to the finding, if applicable."),
});
export type VulnerabilityFinding = z.infer<typeof VulnerabilityFindingSchema>;

export const AnalyzeUrlVulnerabilitiesInputSchema = z.object({
  url: z.string().url().describe('The URL of the user registration page or web application endpoint to analyze.'),
});
export type AnalyzeUrlVulnerabilitiesInput = z.infer<typeof AnalyzeUrlVulnerabilitiesInputSchema>;

export const UrlVulnerabilityAnalysisOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.extend({ source: z.literal("URL").default("URL") })).describe("A list of all identified vulnerability findings for the URL."),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]).describe("An overall risk assessment for the analyzed URL based on its findings."),
  executiveSummary: z.string().describe("A concise executive summary (2-3 sentences) of the security posture of the URL."),
  vulnerableFindingsCount: z.number().optional().describe("The total count of findings where isVulnerable is true."),
  highSeverityCount: z.number().optional().describe("Count of high severity vulnerable findings."),
  mediumSeverityCount: z.number().optional().describe("Count of medium severity vulnerable findings."),
  lowSeverityCount: z.number().optional().describe("Count of low severity vulnerable findings."),
});
export type UrlVulnerabilityAnalysisOutput = z.infer<typeof UrlVulnerabilityAnalysisOutputSchema>;


// Schemas and types for server security analysis
export const ServerConfigInputSchema = z.object({
  serverDescription: z.string().min(50).describe(
    'A detailed textual description of the server configuration. Include OS type and version, running services (web server, app server, SSH, RDP, etc.) with versions if known, open ports, firewall rules summary, any known security software, and excerpts from relevant configuration files or tool outputs (e.g., Nmap scan summary, list of installed packages, snippet from hardening guides used).'
  ),
});
export type ServerConfigInput = z.infer<typeof ServerConfigInputSchema>;

export const ServerSecurityAnalysisOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.extend({ source: z.literal("Server").default("Server") })).describe("A list of potential vulnerabilities and misconfigurations identified from the server description."),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]).describe("Overall risk assessment for the described server configuration."),
  executiveSummary: z.string().describe("Concise summary of the server's security posture based on the provided description."),
});
export type ServerSecurityAnalysisOutput = z.infer<typeof ServerSecurityAnalysisOutputSchema>;

// Schemas and types for database security analysis
export const DatabaseConfigInputSchema = z.object({
  databaseDescription: z.string().min(50).describe(
    'A detailed textual description of the database configuration. Include database type (e.g., PostgreSQL, MySQL, MongoDB) and version, authentication methods, network exposure (e.g., accessible from where), user privilege model, relevant snippets of configuration files, examples of concerning query patterns observed in application code, or output from database security assessment tools.'
  ),
});
export type DatabaseConfigInput = z.infer<typeof DatabaseConfigInputSchema>;

export const DatabaseSecurityAnalysisOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.extend({ source: z.literal("Database").default("Database") })).describe("A list of potential vulnerabilities and misconfigurations identified from the database description."),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]).describe("Overall risk assessment for the described database configuration."),
  executiveSummary: z.string().describe("Concise summary of the database's security posture based on the provided description."),
});
export type DatabaseSecurityAnalysisOutput = z.infer<typeof DatabaseSecurityAnalysisOutputSchema>;


// Schemas and types for SAST (Static Application Security Testing)
export const SastAnalysisInputSchema = z.object({
  codeSnippet: z.string().min(10, "El fragmento de código debe tener al menos 10 caracteres.").describe("El fragmento de código fuente a analizar."),
  language: z.string().optional().describe("El lenguaje de programación del fragmento de código (ej: Python, JavaScript, Java). Ayuda a la IA a ser más precisa."),
});
export type SastAnalysisInput = z.infer<typeof SastAnalysisInputSchema>;

export const SastAnalysisOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.extend({ source: z.literal("SAST").default("SAST") })).describe("Lista de posibles vulnerabilidades encontradas en el código."),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]).describe("Evaluación general del riesgo del fragmento de código."),
  executiveSummary: z.string().describe("Resumen conciso de la seguridad del código analizado."),
});
export type SastAnalysisOutput = z.infer<typeof SastAnalysisOutputSchema>;


// Schemas and types for DAST (Dynamic Application Security Testing)
export const DastAnalysisInputSchema = z.object({
  targetUrl: z.string().url("Por favor, ingrese una URL válida para el análisis DAST.").describe("La URL de la aplicación web a escanear dinámicamente."),
  scanProfile: z.enum(["Quick", "Full"]).optional().default("Quick").describe("Perfil de escaneo DAST: Rápido para chequeos comunes, Completo para un análisis exhaustivo."),
});
export type DastAnalysisInput = z.infer<typeof DastAnalysisInputSchema>;

export const DastAnalysisOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.extend({ source: z.literal("DAST").default("DAST") })).describe("Lista de vulnerabilidades descubiertas durante el escaneo dinámico."),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]).describe("Evaluación general del riesgo de la aplicación web basada en el escaneo DAST."),
  executiveSummary: z.string().describe("Resumen ejecutivo de los hallazgos del análisis DAST."),
});
export type DastAnalysisOutput = z.infer<typeof DastAnalysisOutputSchema>;

// Schemas for Cloud Configuration Analysis
export const CloudConfigInputSchema = z.object({
  provider: z.enum(["AWS", "Azure", "GCP", "Other"]).describe("Cloud provider."),
  configDescription: z.string().min(20, "La descripción de la configuración cloud debe tener al menos 20 caracteres.").describe("Descripción detallada de la configuración de la infraestructura cloud (ej. políticas IAM, grupos de seguridad, configuración de almacenamiento S3/Blob, funciones Lambda/Azure Functions, etc.). Incluir extractos de archivos de configuración si es posible (Terraform, CloudFormation, JSON)."),
  region: z.string().optional().describe("Región de la nube donde residen los recursos, si es aplicable."),
});
export type CloudConfigInput = z.infer<typeof CloudConfigInputSchema>;

export const CloudConfigAnalysisOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.extend({ source: z.literal("Cloud").default("Cloud") })).describe("Lista de vulnerabilidades o malas configuraciones encontradas en la infraestructura cloud."),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]).describe("Evaluación general del riesgo de la configuración cloud."),
  executiveSummary: z.string().describe("Resumen ejecutivo de la seguridad de la configuración cloud."),
});
export type CloudConfigAnalysisOutput = z.infer<typeof CloudConfigAnalysisOutputSchema>;

// Schemas for Container Security Analysis
export const ContainerAnalysisInputSchema = z.object({
  imageName: z.string().optional().describe("Nombre e etiqueta de la imagen del contenedor (ej. 'nginx:latest')."),
  dockerfileContent: z.string().min(20, "El contenido del Dockerfile debe tener al menos 20 caracteres si se proporciona.").optional().or(z.literal('')).describe("Contenido del Dockerfile como un string. Proporcionar si se analiza un Dockerfile."),
  kubernetesManifestContent: z.string().min(20, "El contenido del manifiesto K8s debe tener al menos 20 caracteres si se proporciona.").optional().or(z.literal('')).describe("Contenido del manifiesto de Kubernetes (YAML o JSON) como un string. Proporcionar si se analizan configuraciones de K8s."),
  additionalContext: z.string().optional().describe("Contexto adicional sobre el despliegue del contenedor o la imagen."),
}).refine(data => !!data.imageName || !!data.dockerfileContent || !!data.kubernetesManifestContent, {
  message: "Debe proporcionar al menos el nombre de la imagen, el contenido del Dockerfile o el contenido del manifiesto de Kubernetes.",
  path: ["imageName"], 
});
export type ContainerAnalysisInput = z.infer<typeof ContainerAnalysisInputSchema>;

export const ContainerAnalysisOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.extend({ source: z.literal("Container").default("Container") })).describe("Lista de vulnerabilidades encontradas en la imagen del contenedor, Dockerfile o manifiestos de K8s."),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]).describe("Evaluación general del riesgo del contenedor/configuración."),
  executiveSummary: z.string().describe("Resumen ejecutivo de la seguridad del contenedor."),
});
export type ContainerAnalysisOutput = z.infer<typeof ContainerAnalysisOutputSchema>;

// Schemas for Dependency Analysis
export const DependencyAnalysisInputSchema = z.object({
  dependencyFileContent: z.string().min(20, "El contenido del archivo de dependencias debe tener al menos 20 caracteres.").optional().or(z.literal('')).describe("Contenido del archivo de dependencias (ej. package-lock.json, requirements.txt, pom.xml, Gemfile.lock)."),
  fileType: z.enum(["npm", "pip", "maven", "gem", "other"]).optional().describe("Tipo de archivo de dependencias."),
});
export type DependencyAnalysisInput = z.infer<typeof DependencyAnalysisInputSchema>;

export const DependencyAnalysisOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.extend({ source: z.literal("Dependency").default("Dependency") })).describe("Lista de dependencias vulnerables encontradas."),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]).describe("Evaluación general del riesgo de las dependencias."),
  executiveSummary: z.string().describe("Resumen ejecutivo de la seguridad de las dependencias."),
});
export type DependencyAnalysisOutput = z.infer<typeof DependencyAnalysisOutputSchema>;

// Schemas for Network Security Analysis
export const NetworkSecurityAnalysisInputSchema = z.object({
  networkDescription: z.string().optional().describe("Descripción general de la arquitectura de red, topología, segmentos, etc."),
  scanResults: z.string().optional().describe("Resultados textuales de herramientas de escaneo de red (ej. Nmap, Nessus) o un resumen de puertos abiertos y servicios."),
  firewallRules: z.string().optional().describe("Descripción o exportación textual de las reglas del firewall principal."),
}).refine(data => !!data.networkDescription || !!data.scanResults || !!data.firewallRules, {
  message: "Debe proporcionar al menos una descripción de la red, resultados de escaneo o reglas de firewall.",
  path: ["networkDescription"],
});
export type NetworkSecurityAnalysisInput = z.infer<typeof NetworkSecurityAnalysisInputSchema>;

export const NetworkSecurityAnalysisOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.extend({ source: z.literal("Network").default("Network") })).describe("Lista de vulnerabilidades o malas configuraciones encontradas en la red."),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]).describe("Evaluación general del riesgo de la configuración de red."),
  executiveSummary: z.string().describe("Resumen ejecutivo de la seguridad de la red."),
});
export type NetworkSecurityAnalysisOutput = z.infer<typeof NetworkSecurityAnalysisOutputSchema>;


// Schemas and types for generate-attack-vectors flow
export const AttackVectorItemSchema = z.object({
  vulnerabilityName: z.string().describe('The name/category of the vulnerability this attack vector is based on.'),
  source: z.enum(["URL", "Server", "Database", "SAST", "DAST", "Cloud", "Container", "Dependency", "Network", "Unknown"]).optional().describe("The source of the original finding for this attack vector."),
  attackScenarioDescription: z.string().describe('A description of how an attacker might exploit this vulnerability. Tailor to the vulnerability type and source.'),
  examplePayloadOrTechnique: z.string().describe('An example of a malicious payload, code snippet, or technique an attacker might use. This should be illustrative and for educational purposes only.'),
  expectedOutcomeIfSuccessful: z.string().describe('The expected outcome if the attack is successful, e.g., "Account lockout", "Unauthorized data access", "Cross-Site Scripting execution", "SQL Injection successful", "Server compromise".'),
});
export type AttackVectorItem = z.infer<typeof AttackVectorItemSchema>;

export const GenerateAttackVectorsInputSchema = z.array(VulnerabilityFindingSchema);
export type GenerateAttackVectorsInput = z.infer<typeof GenerateAttackVectorsInputSchema>;

export const GenerateAttackVectorsOutputSchema = z.array(AttackVectorItemSchema);
export type GenerateAttackVectorsOutput = z.infer<typeof GenerateAttackVectorsOutputSchema>;

// Schemas for Remediation Playbook Generation
export const RemediationPlaybookInputSchema = z.object({
  vulnerabilityFinding: VulnerabilityFindingSchema.describe("La vulnerabilidad específica para la cual generar un playbook."),
});
export type RemediationPlaybookInput = z.infer<typeof RemediationPlaybookInputSchema>;

export const RemediationPlaybookOutputSchema = z.object({
  playbookTitle: z.string().describe("Título del playbook de remediación."),
  playbookMarkdown: z.string().describe("Playbook de remediación detallado en formato Markdown, con pasos, comandos, y ejemplos de código si aplica."),
});
export type RemediationPlaybookOutput = z.infer<typeof RemediationPlaybookOutputSchema>;


// Schemas and types for the comprehensive security report
export const GenerateSecurityReportInputSchema = z.object({
  analyzedTargetDescription: z.string().optional().describe("A brief overall description of what was targeted for analysis, e.g., 'Registration page for MyService', 'Production Web Server', 'Customer Database Server', 'Code Snippet Analysis', 'Dynamic Application Scan', 'AWS S3 Buckets Configuration', 'Nginx Container Image', 'Node.js Project Dependencies', 'Corporate Network Segment'"),
  urlAnalysis: UrlVulnerabilityAnalysisOutputSchema.optional().describe("Results from the URL vulnerability analysis, if performed."),
  serverAnalysis: ServerSecurityAnalysisOutputSchema.optional().describe("Results from the server security analysis, if performed."),
  databaseAnalysis: DatabaseSecurityAnalysisOutputSchema.optional().describe("Results from the database security analysis, if performed."),
  sastAnalysis: SastAnalysisOutputSchema.optional().describe("Results from the SAST analysis, if performed."),
  dastAnalysis: DastAnalysisOutputSchema.optional().describe("Results from the DAST analysis, if performed."),
  cloudAnalysis: CloudConfigAnalysisOutputSchema.optional().describe("Results from the Cloud configuration analysis, if performed."),
  containerAnalysis: ContainerAnalysisOutputSchema.optional().describe("Results from the Container security analysis, if performed."),
  dependencyAnalysis: DependencyAnalysisOutputSchema.optional().describe("Results from the Dependency analysis, if performed."),
  networkAnalysis: NetworkSecurityAnalysisOutputSchema.optional().describe("Results from the Network security analysis, if performed."),
  overallVulnerableFindings: z.array(VulnerabilityFindingSchema).optional().describe("A combined list of all findings marked as isVulnerable from all analysis types.")
});
export type GenerateSecurityReportInput = z.infer<typeof GenerateSecurityReportInputSchema>;

export const GenerateSecurityReportOutputSchema = z.object({
  report: z
    .string()
    .describe(
      'A comprehensive, well-structured security report in Markdown. It should synthesize findings from all provided analyses (URL, server, database, SAST, DAST, Cloud, Container, Dependency, Network), offer an overall executive summary, detail findings with impacts and remediations, include compliance considerations, and conclude with prioritized recommendations.'
    ),
});
export type GenerateSecurityReportOutput = z.infer<typeof GenerateSecurityReportOutputSchema>;


// Schemas and types for general-query-assistant-flow
export const GeneralQueryInputSchema = z.object({
  userMessage: z.string().min(1, "El mensaje no puede estar vacío.").describe('The user\'s query or message to the AI assistant.'),
  conversationHistory: z.array(z.object({ sender: z.enum(["user", "ai"]), message: z.string() })).optional().describe("Optional history of the conversation so far to provide context to the AI.")
});
export type GeneralQueryInput = z.infer<typeof GeneralQueryInputSchema>;

export const GeneralQueryOutputSchema = z.object({
  aiResponse: z.string().describe('The AI assistant\'s response to the user\'s message.'),
});
export type GeneralQueryOutput = z.infer<typeof GeneralQueryOutputSchema>;


// Application Data Structures (for Supabase database integration)

export const UserProfileSchema = z.object({
  id: z.string().uuid().describe("Identificador único del usuario (debe coincidir con auth.users.id)."),
  email: z.string().email().describe("Correo electrónico del usuario."),
  full_name: z.string().optional().describe("Nombre completo del usuario."),
  avatar_url: z.string().url().optional().describe("URL del avatar del usuario."),
  subscription_status: z.string().default('free').describe("Estado de la suscripción del usuario (ej: 'free', 'active_premium', 'past_due', 'cancelled')."),
  subscription_plan_id: z.string().optional().describe("Identificador del plan de suscripción (si hay múltiples planes premium)."),
  current_period_end: z.date().optional().describe("Fecha en que finaliza el período de suscripción actual."),
  paypal_customer_id: z.string().optional().describe("ID del cliente en PayPal (Payer ID), si es aplicable."),
  paypal_order_id: z.string().optional().describe("Último ID de orden de PayPal exitoso para referencia."),
  created_at: z.date().default(() => new Date()).describe("Fecha de creación del perfil."),
  updated_at: z.date().default(() => new Date()).describe("Fecha de última actualización del perfil."),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const AnalysisRecordSchema = z.object({
  id: z.string().uuid().default(() => crypto.randomUUID()).describe("Identificador único del registro de análisis."), // crypto.randomUUID() may need adjustment for Zod/server env
  user_id: z.string().uuid().describe("ID del usuario que realizó el análisis (FK a auth.users.id)."),
  created_at: z.string().describe("Fecha en que se realizó el análisis."), // Cambiado de Date a string
  analysis_type: z.enum(["URL", "Server", "Database", "SAST", "DAST", "Cloud", "Container", "Dependency", "Network"]).describe("Tipo de análisis realizado."),
  target_description: z.string().describe("Descripción del objetivo analizado (ej. URL, nombre del servidor)."),
  overall_risk_assessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]).optional().describe("Evaluación de riesgo general del análisis."),
  vulnerable_findings_count: z.number().int().min(0).default(0).describe("Número de hallazgos vulnerables activos."),
  report_summary: z.string().optional().describe("Un breve resumen o puntos clave del informe."),
  full_report_data: z.any().optional().describe("Objeto JSON completo con todos los hallazgos y el texto del informe."), // Consider a more specific Zod schema if possible
  // analysisInputDetails: z.any().optional().describe("Detalles de la entrada utilizada para este análisis específico (para reproducibilidad o revisión)."),
});
export type AnalysisRecord = z.infer<typeof AnalysisRecordSchema>;


// Specific input/output schemas for new analysis flows
export { CloudConfigInputSchema as AnalyzeCloudConfigInputSchema };
export type { CloudConfigInput as AnalyzeCloudConfigInput };
export { CloudConfigAnalysisOutputSchema as AnalyzeCloudConfigOutputSchema };
export type { CloudConfigAnalysisOutput as AnalyzeCloudConfigOutput };

export { ContainerAnalysisInputSchema as AnalyzeContainerSecurityInputSchema };
export type { ContainerAnalysisInput as AnalyzeContainerSecurityInput };
export { ContainerAnalysisOutputSchema as AnalyzeContainerSecurityOutputSchema };
export type { ContainerAnalysisOutput as AnalyzeContainerSecurityOutput };

export { DependencyAnalysisInputSchema as AnalyzeDependenciesInputSchema };
export type { DependencyAnalysisInput as AnalyzeDependenciesInput };
export { DependencyAnalysisOutputSchema as AnalyzeDependenciesOutputSchema };
export type { DependencyAnalysisOutput as AnalyzeDependenciesOutput };

export { DastAnalysisInputSchema as AnalyzeDastSecurityInputSchema };
export type { DastAnalysisInput as AnalyzeDastSecurityInput };
export { DastAnalysisOutputSchema as AnalyzeDastSecurityOutputSchema };
export type { DastAnalysisOutput as AnalyzeDastSecurityOutput };

export { NetworkSecurityAnalysisInputSchema as AnalyzeNetworkSecurityInputSchema };
export type { NetworkSecurityAnalysisInput as AnalyzeNetworkSecurityInput };
export { NetworkSecurityAnalysisOutputSchema as AnalyzeNetworkSecurityOutputSchema };
export type { NetworkSecurityAnalysisOutput as AnalyzeNetworkSecurityOutput };
