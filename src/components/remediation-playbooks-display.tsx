"use client";

import type { RemediationPlaybook } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileLock2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type RemediationPlaybooksDisplayProps = {
  playbooks: RemediationPlaybook[] | null;
};

const renderPlaybookMarkdown = (markdownText: string | null): JSX.Element | null => {
  if (!markdownText) return null;
  
  const lines = markdownText.split('\n');
  const elements: JSX.Element[] = [];
  let currentParagraphLines: string[] = [];
  let currentListItems: string[] = [];
  let inList = false;

  const formatLine = (lineContent: string) => {
    return lineContent
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs font-mono">$1</code>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');
  };

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      elements.push(
        <p key={`p-${elements.length}`} className="my-2 text-sm leading-relaxed"
           dangerouslySetInnerHTML={{ __html: formatLine(currentParagraphLines.join('\n')) }}/>
      );
      currentParagraphLines = [];
    }
  };

  const flushList = () => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc space-y-1 pl-6 my-2 text-sm">
          {currentListItems.map((item, idx) => (
            <li key={`li-${elements.length}-${idx}`} dangerouslySetInnerHTML={{ __html: formatLine(item) }}>
            </li>
          ))}
        </ul>
      );
    }
    currentListItems = [];
    inList = false;
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (line.startsWith('```')) {
      flushParagraph(); flushList();
      let codeBlock = '';
      let lang = line.substring(3).trim();
      i++;
      while(i < lines.length && !lines[i].startsWith('```')) {
        codeBlock += lines[i] + '\n';
        i++;
      }
      elements.push(
        <pre key={`codeblock-${elements.length}`} className={`bg-muted p-3 rounded-md text-xs overflow-x-auto my-2 text-foreground border border-border ${lang ? `language-${lang}` : ''}`}>
          <code>{codeBlock.trimEnd()}</code>
        </pre>
      );
      continue;
    }

    if (line.startsWith('# ')) {
      flushParagraph(); flushList();
      elements.push(<h1 key={`h1-${i}`} className="text-xl font-bold mt-5 mb-2 pb-1 border-b border-border" dangerouslySetInnerHTML={{ __html: formatLine(line.substring(2)) }}/>);
    } else if (line.startsWith('## ')) {
      flushParagraph(); flushList();
      elements.push(<h2 key={`h2-${i}`} className="text-lg font-semibold mt-4 mb-1.5 pb-0.5 border-b border-border" dangerouslySetInnerHTML={{ __html: formatLine(line.substring(3)) }}/>);
    } else if (line.startsWith('### ')) {
      flushParagraph(); flushList();
      elements.push(<h3 key={`h3-${i}`} className="text-base font-semibold mt-3 mb-1" dangerouslySetInnerHTML={{ __html: formatLine(line.substring(4)) }}/>);
    } else if (line.startsWith('#### ')) {
      flushParagraph(); flushList();
      elements.push(<h4 key={`h4-${i}`} className="text-sm font-semibold mt-2 mb-0.5" dangerouslySetInnerHTML={{ __html: formatLine(line.substring(5)) }}/>);
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      flushParagraph(); 
      if (!inList) inList = true; 
      currentListItems.push(line.substring(2)); 
    } else if (line.trim() === '') { 
      flushParagraph(); flushList(); 
    } else { 
      if (inList) flushList(); 
      currentParagraphLines.push(line);
    }
  }
  flushParagraph(); flushList(); 
  return <div className="prose dark:prose-invert max-w-none">{elements}</div>;
};

export function RemediationPlaybooksDisplay({ playbooks }: RemediationPlaybooksDisplayProps) {
  if (!playbooks || playbooks.length === 0) {
    return null; // Don't render the card if no playbooks are available
  }

  return (
    <Card className="mt-8 shadow-2xl border-l-4 border-green-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl md:text-3xl text-green-600">
          <FileLock2 className="h-8 w-8" />
          Playbooks de Remediación Sugeridos (Premium)
        </CardTitle>
        <CardDescription className="text-base">
          Guías paso a paso generadas por IA para ayudar a corregir las vulnerabilidades detectadas.
          Verifique y adapte estos playbooks a su entorno específico antes de aplicar cualquier cambio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" collapsible className="w-full">
          {playbooks.map((playbook, index) => (
            <AccordionItem value={`playbook-${index}`} key={index} className="border-border">
              <AccordionTrigger className="text-lg hover:no-underline group">
                <div className="flex items-center gap-3 text-left">
                  <span className="font-semibold text-green-700 dark:text-green-500">{playbook.playbookTitle || `Playbook de Remediación ${index + 1}`}</span>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4 px-2 bg-secondary/30 rounded-md">
                <ScrollArea className="h-auto max-h-[600px] w-full p-2">
                  {renderPlaybookMarkdown(playbook.playbookMarkdown)}
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}