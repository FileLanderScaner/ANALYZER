
"use client";

import type { AnalysisResult, VulnerabilityFinding } from "@/types"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, AlertTriangle, FileWarning, ShieldCheck, Info, Activity, ServerIcon, Database, Globe, AlertCircle, CloudIcon, BoxIcon, LibraryIcon, SearchCode, Network as NetworkIconLucide, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AnalysisSummaryCardProps = {
  result: AnalysisResult | null; // Primary prop for analysis data
};

interface PostureInfo {
  title: string;
  message: string;
  Icon: React.ElementType;
  colorClass: string;
  badgeVariant: "destructive" | "outline" | "default" | "secondary";
  badgeClass?: string;
  borderColorClass: string;
  bgColorClass: string;
}

export function AnalysisSummaryCard({ result }: AnalysisSummaryCardProps) {
  if (!result || (!result.allFindings?.length && !result.reportText && !result.urlAnalysis && !result.serverAnalysis && !result.databaseAnalysis && !result.sastAnalysis && !result.dastAnalysis && !result.cloudAnalysis && !result.containerAnalysis && !result.dependencyAnalysis && !result.networkAnalysis)) {
    return (
      <Card className="shadow-lg border-l-4 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Info className="h-6 w-6 text-primary" />
            Resumen del Análisis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No hay datos de análisis disponibles o el análisis no produjo hallazgos.
          </p>
        </CardContent>
      </Card>
    );
  }

  const findingsToSummarize = result.allFindings || [];
  
  const totalVulnerable = findingsToSummarize.filter(f => f.isVulnerable).length;
  const highCount = findingsToSummarize.filter(f => f.isVulnerable && (f.severity === 'High' || f.severity === 'Critical')).length;
  const mediumCount = findingsToSummarize.filter(f => f.isVulnerable && f.severity === 'Medium').length;
  const lowCount = findingsToSummarize.filter(f => f.isVulnerable && f.severity === 'Low').length;
  const informationalCount = findingsToSummarize.filter(f => f.severity === 'Informational').length;

  let overallRiskAssessmentCalculated: PostureInfo['badgeVariant'] | "Critical" | "High" | "Medium" | "Low" | "Informational";

  if (highCount > 0) overallRiskAssessmentCalculated = "Critical"; 
  else if (mediumCount > 0) overallRiskAssessmentCalculated = "Medium";
  else if (lowCount > 0) overallRiskAssessmentCalculated = "Low";
  else overallRiskAssessmentCalculated = "Informational";

  // Attempt to get executive summary from the main report first
  let summaryMessage = "Análisis completado. Revise los hallazgos detallados.";
  if (result.reportText) {
    const reportLines = result.reportText.split('\n');
    const execSummaryLine = reportLines.find(line => line.toLowerCase().startsWith('# overall executive summary') || line.toLowerCase().startsWith('## resumen ejecutivo general'));
    if (execSummaryLine) {
        summaryMessage = result.reportText.substring(result.reportText.indexOf(execSummaryLine) + execSummaryLine.length).split("## ")[0].split("# ")[0].trim();
        if(summaryMessage.length < 20 && totalVulnerable > 0) { // If summary is too short
            summaryMessage = `Se detectaron ${totalVulnerable} vulnerabilidad(es) activa(s). ${summaryMessage}`;
        } else if (summaryMessage.length < 20) {
             summaryMessage = "Análisis completado. No se detectaron vulnerabilidades críticas o el resumen es breve.";
        }
    }
  } else if (totalVulnerable > 0) {
    summaryMessage = `Se detectaron ${totalVulnerable} vulnerabilidad(es) activa(s) en total. Revise el informe detallado.`;
  } else {
    summaryMessage = "No se detectaron vulnerabilidades activas en los componentes analizados. Se pueden haber encontrado hallazgos informativos.";
  }


  let posture: PostureInfo;
  switch (overallRiskAssessmentCalculated) {
    case "Critical":
      posture = {
        title: "¡Riesgo Crítico Identificado!", message: summaryMessage, Icon: ShieldAlert, colorClass: "text-destructive", badgeVariant: "destructive",
        borderColorClass: "border-destructive", bgColorClass: "bg-destructive/10",
      }; break;
    case "High": // Should be covered by Critical due to calculation logic, but keep for safety
      posture = {
        title: "¡Atención Urgente Requerida!", message: summaryMessage, Icon: ShieldAlert, colorClass: "text-destructive", badgeVariant: "destructive",
        borderColorClass: "border-destructive", bgColorClass: "bg-destructive/10",
      }; break;
    case "Medium":
      posture = {
        title: "Revisión de Seguridad Necesaria", message: summaryMessage, Icon: AlertTriangle, colorClass: "text-orange-500", badgeVariant: "outline",
        badgeClass: "border-orange-500 text-orange-500", borderColorClass: "border-orange-500", bgColorClass: "bg-orange-500/10",
      }; break;
    case "Low":
      posture = {
        title: "Mejoras de Seguridad Recomendadas", message: summaryMessage, Icon: FileWarning, colorClass: "text-yellow-600", badgeVariant: "outline",
        badgeClass: "border-yellow-600 text-yellow-600", borderColorClass: "border-yellow-600", bgColorClass: "bg-yellow-600/10",
      }; break;
    case "Informational": default:
      posture = {
        title: totalVulnerable === 0 && informationalCount > 0 ? "Hallazgos Informativos Detectados" : "Postura de Seguridad Sólida", message: summaryMessage,
        Icon: totalVulnerable === 0 && informationalCount > 0 ? Info : ShieldCheck,
        colorClass: totalVulnerable === 0 && informationalCount > 0 ? "text-blue-500" : "text-green-600",
        badgeVariant: totalVulnerable === 0 && informationalCount > 0 ? "outline" : "default",
        badgeClass: totalVulnerable === 0 && informationalCount > 0 ? "border-blue-500 text-blue-500" : "bg-green-600 hover:bg-green-700 text-white",
        borderColorClass: totalVulnerable === 0 && informationalCount > 0 ? "border-blue-500" : "border-green-600",
        bgColorClass: totalVulnerable === 0 && informationalCount > 0 ? "bg-blue-500/10" : "bg-green-600/10",
      }; break;
  }

  const getIconForSource = (source?: VulnerabilityFinding['source']) => {
    switch(source) {
        case "URL": return <Globe className="h-4 w-4 mr-1 text-blue-500" />;
        case "Server": return <ServerIcon className="h-4 w-4 mr-1 text-green-500" />;
        case "Database": return <Database className="h-4 w-4 mr-1 text-purple-500" />;
        case "SAST": return <SearchCode className="h-4 w-4 mr-1 text-indigo-500" />;
        case "DAST": return <NetworkIconLucide className="h-4 w-4 mr-1 text-pink-500" />; 
        case "Cloud": return <CloudIcon className="h-4 w-4 mr-1 text-sky-500" />;
        case "Container": return <BoxIcon className="h-4 w-4 mr-1 text-teal-500" />;
        case "Dependency": return <LibraryIcon className="h-4 w-4 mr-1 text-rose-500" />;
        case "Network": return <Wifi className="h-4 w-4 mr-1 text-cyan-500" />;
        default: return <Info className="h-4 w-4 mr-1 text-gray-500" />;
    }
  };

  const summaryItems = [
    { label: "Crítica/Alta Severidad", count: highCount, IconComp: ShieldAlert, color: "text-destructive", badgeVariant: "destructive" as const },
    { label: "Media Severidad", count: mediumCount, IconComp: AlertCircle, color: "text-orange-500", badgeVariant: "outline" as const, badgeClass: "border-orange-500 text-orange-500" },
    { label: "Baja Severidad", count: lowCount, IconComp: FileWarning, color: "text-yellow-600", badgeVariant: "outline" as const, badgeClass: "border-yellow-600 text-yellow-600"},
  ];

  const analysisTypesPerformed = [
    result.urlAnalysis && { name: "URL" as const, count: result.urlAnalysis.findings.filter(f=>f.isVulnerable).length },
    result.serverAnalysis && { name: "Servidor" as const, count: result.serverAnalysis.findings.filter(f=>f.isVulnerable).length },
    result.databaseAnalysis && { name: "Base de Datos" as const, count: result.databaseAnalysis.findings.filter(f=>f.isVulnerable).length },
    result.sastAnalysis && { name: "SAST (Código)" as const, count: result.sastAnalysis.findings.filter(f=>f.isVulnerable).length },
    result.dastAnalysis && { name: "DAST (App)" as const, count: result.dastAnalysis.findings.filter(f=>f.isVulnerable).length },
    result.cloudAnalysis && { name: "Cloud" as const, count: result.cloudAnalysis.findings.filter(f=>f.isVulnerable).length },
    result.containerAnalysis && { name: "Contenedor" as const, count: result.containerAnalysis.findings.filter(f=>f.isVulnerable).length },
    result.dependencyAnalysis && { name: "Dependencias" as const, count: result.dependencyAnalysis.findings.filter(f=>f.isVulnerable).length },
    result.networkAnalysis && { name: "Red" as const, count: result.networkAnalysis.findings.filter(f=>f.isVulnerable).length },
  ].filter(item => item && item.count > 0) as { name: Exclude<VulnerabilityFinding['source'], undefined | "Unknown">, count: number }[];


  return (
    <Card className={cn("shadow-xl border-l-4", posture.borderColorClass)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <Activity className="h-7 w-7 text-primary" />
          Resumen General del Análisis de Seguridad
        </CardTitle>
        <CardDescription>Visión global de los hallazgos en los componentes analizados.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={cn("flex items-start gap-4 p-4 rounded-lg", posture.bgColorClass)}>
          <posture.Icon className={cn("h-12 w-12 flex-shrink-0 mt-1", posture.colorClass)} />
          <div>
            <h3 className={cn("text-xl font-bold mb-1", posture.colorClass)}>{posture.title}</h3>
            <p className="text-sm text-foreground font-medium">{posture.message}</p>
          </div>
        </div>
        
        <div>
            <h4 className="text-md font-semibold mb-3 text-foreground">Distribución de Hallazgos Activos (isVulnerable = true):</h4>
            {totalVulnerable > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {summaryItems.map(item => (
                    item.count > 0 && (
                        <div key={item.label} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm">
                        <div className="flex items-center gap-2">
                            <item.IconComp className={cn("h-5 w-5", item.color)} />
                            <span className="text-sm font-medium text-foreground">{item.label}:</span>
                        </div>
                        <Badge variant={item.badgeVariant} className={cn("font-bold", item.badgeClass)}>
                            {item.count}
                        </Badge>
                        </div>
                    )
                    ))}
                </div>
            ) : (
                 <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg shadow-sm text-sm text-muted-foreground">
                    <ShieldCheck className="h-5 w-5 text-green-600"/>
                    No se encontraron hallazgos activos con las comprobaciones actuales.
                </div>
            )}
        </div>

         {informationalCount > 0 && (
             <div className="mt-4">
                <h4 className="text-md font-semibold mb-2 text-foreground">Hallazgos Informativos:</h4>
                 <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm max-w-xs">
                    <div className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium text-foreground">Informativos:</span>
                    </div>
                    <Badge variant="outline" className="border-blue-500 text-blue-500 font-bold">
                        {informationalCount}
                    </Badge>
                 </div>
            </div>
        )}

        {analysisTypesPerformed.length > 0 && (
            <div className="mt-4 pt-4 border-t">
                <h4 className="text-md font-semibold mb-2 text-foreground">Resumen de Vulnerabilidades Activas por Origen del Análisis:</h4>
                <div className="flex flex-wrap gap-3">
                    {analysisTypesPerformed.map(sourceType => {
                        if (!sourceType || !sourceType.name) return null; 
                        return (
                            <Badge key={sourceType.name} variant="secondary" className="text-sm py-1 px-3">
                                {getIconForSource(sourceType.name)} {sourceType.name}: {sourceType.count}
                            </Badge>
                        );
                    })}
                </div>
            </div>
        )}

        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          Recuerda que este es un análisis automatizado basado en la información proporcionada. Se recomienda una revisión manual por expertos para confirmar todos los hallazgos.
        </p>
      </CardContent>
    </Card>
  );
}
