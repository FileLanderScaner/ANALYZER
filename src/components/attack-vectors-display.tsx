
'use client';

import type { AttackVector } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertTriangle, BugPlay, Zap, Info, ServerIcon, Database, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // Badge might not be used here, but keep if planned
import { cn } from '@/lib/utils';

type AttackVectorsDisplayProps = {
  attackVectors: AttackVector[] | null;
};

export function AttackVectorsDisplay({ attackVectors }: AttackVectorsDisplayProps) {
  if (!attackVectors || attackVectors.length === 0) {
    return (
      <Card className="mt-8 shadow-lg border-l-4 border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Info className="h-6 w-6 text-blue-500" />
            Escenarios de Ataque Ilustrativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No se generaron ejemplos de vectores de ataque para las vulnerabilidades activas detectadas, o no se encontraron vulnerabilidades activas.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const getSourceIcon = (source?: "URL" | "Server" | "Database" | "Unknown") => {
    switch(source) {
        case "URL": return <Globe className="h-4 w-4 text-blue-500"/>;
        case "Server": return <ServerIcon className="h-4 w-4 text-green-500"/>;
        case "Database": return <Database className="h-4 w-4 text-purple-500"/>;
        default: return <Zap className="h-4 w-4 text-amber-500"/>;
    }
  };

  return (
    <Card className="mt-8 shadow-2xl border-l-4 border-amber-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl md:text-3xl text-amber-500">
          <BugPlay className="h-8 w-8" />
          Posibles Escenarios de Ataque (Ejemplos Ilustrativos)
        </CardTitle>
        <CardDescription className="text-base">
          A continuación, se presentan ejemplos conceptuales de cómo las vulnerabilidades activas identificadas podrían ser explotadas. Estos escenarios son simplificados.
          <strong className="block mt-1 text-destructive">ADVERTENCIA: Esta información es estrictamente para fines educativos. No intente replicar estas acciones en sistemas sin autorización explícita.</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {attackVectors.map((vector, index) => (
            <AccordionItem value={`item-${index}`} key={index} className="border-border">
              <AccordionTrigger className="text-lg hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  {getSourceIcon(vector.source)}
                  <span className="font-semibold">{vector.vulnerabilityName}</span>
                  {vector.source && <Badge variant="outline" className="text-xs">{vector.source}</Badge>}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4 px-2 space-y-4 bg-secondary/30 rounded-md">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Escenario de Ataque:</h4>
                  <p className="text-muted-foreground text-sm">{vector.attackScenarioDescription}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Ejemplo Conceptual de Payload/Técnica:</h4>
                  <pre className="bg-muted p-3 rounded-md text-xs text-foreground overflow-x-auto">
                    <code>{vector.examplePayloadOrTechnique}</code>
                  </pre>
                   <p className="text-xs text-muted-foreground italic mt-1">Nota: Ejemplo simplificado para ilustración.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Resultado Esperado (Si Exitoso):</h4>
                  <p className="text-muted-foreground text-sm flex items-center gap-2">
                     <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                     <span className="font-medium text-destructive">{vector.expectedOutcomeIfSuccessful}</span>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
