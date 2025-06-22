
'use server';
/**
 * @fileOverview Simulates Static Application Security Testing (SAST) analysis on a code snippet.
 *
 * - analyzeSastSecurity - A function that handles the SAST analysis process.
 */

import {ai} from '@/ai/genkit';
import {z}from 'zod';
import {
  SastAnalysisInputSchema,
  type SastAnalysisInput,
  SastAnalysisOutputSchema,
  type SastAnalysisOutput,
  VulnerabilityFindingSchema,
} from '@/types/ai-schemas';

export async function analyzeSastSecurity(input: SastAnalysisInput): Promise<SastAnalysisOutput> {
  return analyzeSastSecurityFlow(input);
}

// Schema for the direct output of the SAST prompt, before flow adds calculated fields or defaults.
const AnalyzeSastPromptOutputSchema = z.object({
  findings: z.array(
    VulnerabilityFindingSchema.omit({ source: true }) // Source will be "SAST"
    .extend({
        filePath: z.string().optional().describe("Conceptual file path where the vulnerability might occur (e.g., 'auth/service.py')."),
        lineNumber: z.number().int().min(1).optional().describe("Conceptual line number within the snippet where the issue is primarily located."),
        codeSnippetContext: z.string().optional().describe("A small snippet (3-5 lines) from the input that clearly shows the vulnerable code pattern."),
        suggestedFix: z.string().optional().describe("A conceptual example of how the vulnerable code could be fixed. Show the corrected code snippet if possible.")
    })
  ),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]),
  executiveSummary: z.string(),
});


const analyzeSastSecurityPrompt = ai.definePrompt({
  name: 'analyzeSastSecurityPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: SastAnalysisInputSchema},
  output: {schema: AnalyzeSastPromptOutputSchema},
  prompt: `You are an expert SAST (Static Application Security Testing) simulation tool.
  Analyze the following code snippet for potential security vulnerabilities.
  Language: {{#if language}}{{{language}}}{{else}}Not specified (assume common web language like Python, JavaScript, or PHP){{/if}}
  Code Snippet:
  \`\`\`{{#if language}}{{{language}}}{{else}}text{{/if}}
  {{{codeSnippet}}}
  \`\`\`

  Task:
  1.  Identify potential security issues based *solely* on the provided code snippet. Consider language-specific vulnerabilities and common OWASP Top 10 issues relevant to static analysis.

      {{#if language}}
      Specific guidance for language "{{language}}":
        {{#if (eq language "python")}}
        - Python Specifics: Check for insecure 'pickle' usage, 'eval()'/'exec()' with user input, command injection via 'os.system()' or 'subprocess' with shell=True, hardcoded secrets, SQL injection if ORM usage is incorrect or raw SQL is built with string concatenation, insecure temporary file creation, path traversal, weak cryptography usage.
        {{else if (eq language "javascript")}}
        - JavaScript Specifics: Check for DOM XSS (e.g. '.innerHTML =', 'document.write'), insecure use of 'eval()', 'setTimeout'/'setInterval' with string arguments, prototype pollution possibilities, hardcoded API keys or tokens, insecure RegEx leading to ReDoS, JWT handling issues if visible.
        {{else if (eq language "java")}}
        - Java Specifics: Check for SQL injection (concatenated queries), XML External Entity (XXE) injection if XML parsing is shown, insecure deserialization (e.g. 'ObjectInputStream'), command injection, path traversal, hardcoded credentials, weak cryptography (e.g. ECB mode, static IVs).
        {{else if (eq language "php")}}
        - PHP Specifics: Check for SQL injection (concatenated queries), file inclusion vulnerabilities (LFI/RFI) with 'include'/'require', command execution with 'system'/'shell_exec', XSS from unescaped output ('echo $var'), insecure deserialization with 'unserialize()', usage of 'eval()'.
        {{else if (eq language "csharp")}}
        - C# Specifics: Check for SQL injection (concatenated queries), XXE, insecure deserialization, command injection, path traversal, hardcoded secrets, ASP.NET misconfigurations if discernible (e.g. viewstate not encrypted, debug mode enabled).
        {{else if (eq language "ruby")}}
        - Ruby Specifics: Check for SQL injection (especially with ActiveRecord if not used safely), command injection (e.g. backticks or 'system' with user input), XSS, insecure deserialization (Marshal.load), path traversal, unsafe use of 'eval'.
        {{else if (eq language "go")}}
        - Go Specifics: Check for SQL injection, command injection, path traversal, hardcoded secrets, potential race conditions if concurrency patterns are visible, insecure use of 'unsafe' package.
        {{else if (eq language "rust")}}
        - Rust Specifics: Check for memory safety issues if 'unsafe' blocks are used carelessly (though less common in typical snippets), SQL injection, command injection, hardcoded secrets. Focus on logic flaws or misuse of cryptographic libraries if visible.
        {{else if (eq language "typescript")}}
        - TypeScript Specifics: Similar to JavaScript, check for DOM XSS, insecure use of 'eval()', prototype pollution, hardcoded API keys/tokens, insecure RegEx. Also consider type-related security issues if complex types or assertions are used in a security-sensitive context.
        {{else}}
        - General Guidance: Focus on Inyección (SQL, NoSQL, Command), Autenticación Rota (hardcoded credentials), Exposición de Datos Sensibles, Deserialización Insegura, Configuración Incorrecta de Seguridad, XSS, Falta de Control de Acceso, Manejo de Errores Inseguro.
        {{/if}}
      {{else}}
      - General Guidance: Focus on Inyección (SQL, NoSQL, Command), Autenticación Rota (hardcoded credentials), Exposición de Datos Sensibles, Deserialización Insegura, Configuración Incorrecta de Seguridad, XSS, Falta de Control de Acceso, Manejo de Errores Inseguro.
      {{/if}}

  2.  For each potential issue, create a finding object:
      - vulnerability: General category (e.g., "SQL Injection", "Hardcoded API Key", "Reflected XSS in HTML template").
      - description: Detailed observation of the insecure pattern in the code. Explain *why* it's a vulnerability.
      - isVulnerable: Boolean, true if the snippet strongly suggests a vulnerability.
      - severity: 'Low', 'Medium', 'High', 'Critical', or 'Informational'.
      - cvssScore: (Optional) Estimated CVSS 3.1 base score.
      - cvssVector: (Optional) CVSS 3.1 vector string.
      - businessImpact: (Optional) Potential business impact.
      - technicalDetails: (Optional) Deeper technical explanation of the flaw.
      - evidence: (Optional) Quote the *exact* problematic part of the code snippet.
      - remediation: Suggested high-level code remediation strategy (e.g., "Use parameterized queries", "Store secrets in environment variables", "Encode output before rendering in HTML").
      - filePath: (Optional) Conceptual file path (e.g., "auth/service.py", "utils/db_helpers.java"). Default to "snippet.{{#if language}}{{language}}{{else}}txt{{/if}}" if not otherwise inferable.
      - lineNumber: (Optional) Conceptual line number within the snippet where the core of the issue is.
      - codeSnippetContext: (Required if vulnerable) A small, relevant part (3-5 lines) of the *provided snippet* that shows the vulnerability.
      - suggestedFix: (Optional, but highly encouraged if vulnerable) Provide a conceptual code snippet showing how the 'codeSnippetContext' could be fixed. Be specific. For example, if it's an XSS, show proper encoding. If SQLi, show a parameterized query example.
  3.  Provide an 'overallRiskAssessment': 'Critical', 'High', 'Medium', 'Low', or 'Informational'.
  4.  Write a concise 'executiveSummary' (2-4 sentences) of the code snippet's security posture, highlighting key risks.

  Output Format:
  Return a JSON object with "findings", "overallRiskAssessment", and "executiveSummary".
  If the snippet is too short, generic, or seems secure, findings can be empty, risk 'Informational', and summary should state this.
  Prioritize findings directly observable in the provided code. This is a simulation. Be specific to the provided snippet.
  If the language is not specified, make reasonable assumptions but state them.
  Ensure that if a language is provided, your analysis and examples of vulnerabilities are relevant to that specific language.
  `,
});

const analyzeSastSecurityFlow = ai.defineFlow(
  {
    name: 'analyzeSastSecurityFlow',
    inputSchema: SastAnalysisInputSchema,
    outputSchema: SastAnalysisOutputSchema,
  },
  async (input): Promise<SastAnalysisOutput> => {
    if (!input.codeSnippet || input.codeSnippet.trim().length < 10) { // Adjusted minimum length as per schema
        return {
            findings: [],
            overallRiskAssessment: "Informational",
            executiveSummary: "El fragmento de código es demasiado breve o está ausente. No se puede realizar un análisis SAST simulado significativo. Proporcione un fragmento de código más sustancial.",
        };
    }
    const { output: promptOutput } = await analyzeSastSecurityPrompt(input);

    if (!promptOutput) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "El análisis SAST simulado no pudo completarse o no devolvió datos válidos del modelo de IA. Esto puede deberse a filtros de contenido restrictivos o un problema con el servicio de IA.",
      };
    }

    const findingsWithSource = (promptOutput.findings || []).map(f => ({
      ...f,
      source: "SAST" as const,
      filePath: f.filePath || (input.language ? `snippet.${input.language}` : "snippet.txt"),
    }));

    return {
      findings: findingsWithSource,
      overallRiskAssessment: promptOutput.overallRiskAssessment || "Informational",
      executiveSummary: promptOutput.executiveSummary || "El análisis SAST simulado está completo. Revise los hallazgos para obtener más detalles.",
    };
  }
);

