
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Loader2, ServerIcon, Database, Globe, Gamepad2, SearchCode, Network as NetworkIconLucide, CloudIcon, BoxIcon, LibraryIcon, Wifi } from "lucide-react";

const formSchema = z.object({
  url: z.string().url({ message: "Por favor, ingresa una URL válida." }).optional().or(z.literal('')),
  serverDescription: z.string().min(10, {message: "La descripción del servidor debe tener al menos 10 caracteres si se proporciona."}).optional().or(z.literal('')),
  gameServerDescription: z.string().min(10, {message: "La descripción del servidor de juegos debe tener al menos 10 caracteres si se proporciona."}).optional().or(z.literal('')),
  databaseDescription: z.string().min(10, {message: "La descripción de la base de datos debe tener al menos 10 caracteres si se proporciona."}).optional().or(z.literal('')),
  codeSnippet: z.string().min(10, {message: "El fragmento de código debe tener al menos 10 caracteres si se proporciona."}).optional().or(z.literal('')),
  sastLanguage: z.string().optional(),
  repositoryUrl: z.string().url({message: "Por favor, ingrese una URL de repositorio válida."}).optional().or(z.literal('')),
  dastTargetUrl: z.string().url({message: "Por favor, ingrese una URL válida para el análisis DAST."}).optional().or(z.literal('')),

  cloudProvider: z.enum(["AWS", "Azure", "GCP", "Other"]).optional(),
  cloudConfigDescription: z.string().optional().or(z.literal('')),
  cloudRegion: z.string().optional().or(z.literal('')),

  containerImageName: z.string().optional().or(z.literal('')),
  dockerfileContent: z.string().min(20, {message: "El contenido del Dockerfile debe tener al menos 20 caracteres si se proporciona."}).optional().or(z.literal('')),
  kubernetesManifestContent: z.string().min(20, {message: "El contenido del manifiesto K8s debe tener al menos 20 caracteres si se proporciona."}).optional().or(z.literal('')),
  containerAdditionalContext: z.string().optional().or(z.literal('')),

  dependencyFileContent: z.string().min(20, { message: "El contenido del archivo de dependencias debe tener al menos 20 caracteres si se proporciona."}).optional().or(z.literal('')),
  dependencyFileType: z.enum(["npm", "pip", "maven", "gem", "other"]).optional(),

  networkDescription: z.string().min(10, { message: "La descripción de la red debe tener al menos 10 caracteres si se proporciona." }).optional().or(z.literal('')),
  networkScanResults: z.string().min(10, { message: "Los resultados del escaneo de red deben tener al menos 10 caracteres si se proporcionan." }).optional().or(z.literal('')),
  networkFirewallRules: z.string().min(10, { message: "Las reglas del firewall deben tener al menos 10 caracteres si se proporcionan." }).optional().or(z.literal('')),

}).refine(data => {
    const isCloudAnalysisAttempted = !!data.cloudProvider;
    const isCloudAnalysisValid = isCloudAnalysisAttempted ? !!data.cloudConfigDescription && data.cloudConfigDescription.length >= 20 : true;

    const isDependencyAnalysisAttempted = !!data.dependencyFileType;
    const isDependencyAnalysisValid = isDependencyAnalysisAttempted ? !!data.dependencyFileContent && data.dependencyFileContent.length >=20 : true;

    const isContainerAnalysisAttempted = !!data.containerImageName || !!data.dockerfileContent || !!data.kubernetesManifestContent;
    const isContainerAnalysisValid = isContainerAnalysisAttempted ? (
        (!!data.containerImageName && data.containerImageName.length > 0) ||
        (!!data.dockerfileContent && data.dockerfileContent.length >= 20) ||
        (!!data.kubernetesManifestContent && data.kubernetesManifestContent.length >= 20)
    ) : true;

    const isNetworkAnalysisAttempted = !!data.networkDescription || !!data.networkScanResults || !!data.networkFirewallRules;
    const isNetworkAnalysisValid = isNetworkAnalysisAttempted ? (
        (!!data.networkDescription && data.networkDescription.length >=10) ||
        (!!data.networkScanResults && data.networkScanResults.length >=10) ||
        (!!data.networkFirewallRules && data.networkFirewallRules.length >=10)
    ) : true;

    const atLeastOneAnalysisProvided = (
      !!data.url ||
      !!data.serverDescription ||
      !!data.gameServerDescription ||
      !!data.databaseDescription ||
      !!data.codeSnippet ||
      !!data.dastTargetUrl ||
      (!!data.cloudProvider && !!data.cloudConfigDescription && data.cloudConfigDescription.length >= 20) ||
      (!!data.containerImageName || (!!data.dockerfileContent && data.dockerfileContent.length >=20) || (!!data.kubernetesManifestContent && data.kubernetesManifestContent.length >=20)) ||
      (!!data.dependencyFileType && !!data.dependencyFileContent && data.dependencyFileContent.length >= 20) ||
      ( (!!data.networkDescription && data.networkDescription.length >=10) || (!!data.networkScanResults && data.networkScanResults.length >=10) || (!!data.networkFirewallRules && data.networkFirewallRules.length >=10) )
    );
    
    return (
      atLeastOneAnalysisProvided &&
      isCloudAnalysisValid &&
      isDependencyAnalysisValid &&
      isContainerAnalysisValid &&
      isNetworkAnalysisValid
    );
  }, {
  message: "Debes proporcionar al menos un objetivo de análisis completo. Verifica los requisitos de longitud mínima si has seleccionado un tipo de análisis específico (ej. Cloud, Contenedor, Dependencias, Red).",
  path: ["url"], // This error message will appear under the first field if refinement fails at the object level
}).superRefine((data, ctx) => {
  if (data.cloudProvider && (!data.cloudConfigDescription || data.cloudConfigDescription.length < 20)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La descripción de la configuración Cloud es requerida (mínimo 20 caracteres) si se selecciona un proveedor.",
      path: ["cloudConfigDescription"],
    });
  }
  if (data.dependencyFileType && (!data.dependencyFileContent || data.dependencyFileContent.length < 20)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El contenido del archivo de dependencias es requerido (mínimo 20 caracteres) si se selecciona un tipo.",
      path: ["dependencyFileContent"],
    });
  }
   if ((data.dockerfileContent && data.dockerfileContent.length > 0 && data.dockerfileContent.length < 20)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El contenido del Dockerfile debe tener al menos 20 caracteres si se proporciona.",
      path: ["dockerfileContent"],
    });
  }
  if ((data.kubernetesManifestContent && data.kubernetesManifestContent.length > 0 && data.kubernetesManifestContent.length < 20)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El contenido del manifiesto K8s debe tener al menos 20 caracteres si se proporciona.",
      path: ["kubernetesManifestContent"],
    });
  }
  if ((data.containerImageName || data.dockerfileContent || data.kubernetesManifestContent) &&
             !(data.containerImageName && data.containerImageName.length > 0) &&
             !(data.dockerfileContent && data.dockerfileContent.length >= 20) &&
             !(data.kubernetesManifestContent && data.kubernetesManifestContent.length >= 20)
            ) {
     ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Si inicia un análisis de contenedor, debe proporcionar un nombre de imagen, o contenido de Dockerfile (mín. 20 caracteres), o contenido de manifiesto K8s (mín. 20 caracteres).",
        path: ["containerImageName"],
      });
  }
  if ((data.networkDescription || data.networkScanResults || data.networkFirewallRules) &&
      !(data.networkDescription && data.networkDescription.length >= 10) &&
      !(data.networkScanResults && data.networkScanResults.length >= 10) &&
      !(data.networkFirewallRules && data.networkFirewallRules.length >= 10)
    ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Si inicia un análisis de red, al menos uno de los campos (descripción, resultados de escaneo, reglas de firewall) debe tener 10+ caracteres.",
      path: ["networkDescription"],
    });
  }
});

export type UrlInputFormValues = z.infer<typeof formSchema>;

type UrlInputFormProps = {
  onSubmit: (values: UrlInputFormValues) => Promise<void>;
  isLoading: boolean;
  defaultUrl?: string;
};

export function UrlInputForm({ onSubmit, isLoading, defaultUrl }: UrlInputFormProps) {
  const form = useForm<UrlInputFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: defaultUrl || "",
      serverDescription: "",
      gameServerDescription: "",
      databaseDescription: "",
      codeSnippet: "",
      sastLanguage: "",
      repositoryUrl: "", // Not currently used in analysis flows, but kept for future
      dastTargetUrl: "",
      cloudProvider: undefined,
      cloudConfigDescription: "",
      cloudRegion: "",
      containerImageName: "",
      dockerfileContent: "",
      kubernetesManifestContent: "",
      containerAdditionalContext: "",
      dependencyFileContent: "",
      dependencyFileType: undefined,
      networkDescription: "",
      networkScanResults: "",
      networkFirewallRules: "",
    },
  });

  async function handleSubmit(values: UrlInputFormValues) {
    const cleanedValues = Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v != null && v !== '')
    ) as UrlInputFormValues;
    await onSubmit(cleanedValues);
  }

  const accordionItems = [
    { value: "item-1", title: "Análisis Web y Dinámico (URL / DAST)", Icon: Globe, fields: (
        <>
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="url-input">URL del Aplicativo Web (Opcional)</FormLabel>
                <FormControl>
                  <Input id="url-input" placeholder="ej., http://www.ejemplo.com/registro" {...field} className="text-sm" />
                </FormControl>
                <FormDescription>Ingrese la URL para análisis de vulnerabilidades comunes (XSS, SQLi, etc.).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dastTargetUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="dast-target-url-input">URL para Análisis DAST (Opcional)</FormLabel>
                <FormControl>
                  <Input id="dast-target-url-input" placeholder="ej., http://www.ejemplo-app.com" {...field} className="text-sm" />
                </FormControl>
                <FormDescription>URL base para el análisis dinámico simulado (DAST).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
    )},
    { value: "item-2", title: "Análisis de Servidores", Icon: ServerIcon, fields: (
      <>
        <FormField
          control={form.control}
          name="serverDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="server-description-input">Descripción del Servidor General (Opcional)</FormLabel>
              <FormControl>
                <Textarea id="server-description-input" placeholder="Describe la configuración del servidor general: OS, servicios (web, app), puertos, versiones, etc." {...field} className="text-sm min-h-[100px]" />
              </FormControl>
              <FormDescription>Detalles para análisis de seguridad del servidor general.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gameServerDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="game-server-description-input" className="flex items-center"><Gamepad2 className="mr-2 h-4 w-4 text-primary" />Descripción Específica del Servidor de Juegos (Opcional)</FormLabel>
              <FormControl>
                <Textarea id="game-server-description-input" placeholder="Detalles del servidor de juegos: tipo (ej. Lineage 2, Roblox), motor, mods, anti-cheat, etc." {...field} className="text-sm min-h-[100px]" />
              </FormControl>
              <FormDescription>Información detallada sobre tu servidor de videojuegos.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    )},
    { value: "item-3", title: "Análisis de Base de Datos", Icon: Database, fields: (
      <FormField
        control={form.control}
        name="databaseDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="database-description-input">Descripción de la Base de Datos (Opcional)</FormLabel>
            <FormControl>
              <Textarea id="database-description-input" placeholder="Describe la configuración de la BD: tipo, versión, autenticación, acceso a red, datos almacenados, etc." {...field} className="text-sm min-h-[100px]" />
            </FormControl>
            <FormDescription>Detalles para análisis de seguridad de la base de datos.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    )},
    { value: "item-4", title: "Análisis Estático de Código (SAST)", Icon: SearchCode, fields: (
      <>
        <FormField
          control={form.control}
          name="codeSnippet"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="code-snippet-input">Fragmento de Código para SAST (Opcional)</FormLabel>
              <FormControl>
                <Textarea id="code-snippet-input" placeholder="Pega aquí un fragmento de código (mín. 10 caracteres)." {...field} className="text-sm min-h-[120px] font-mono" />
              </FormControl>
              <FormDescription>Análisis estático simulado para el fragmento de código.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sastLanguage"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="sast-language-select">Lenguaje del Fragmento (SAST - Opcional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger id="sast-language-select"><SelectValue placeholder="Selecciona un lenguaje" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="php">PHP</SelectItem>
                  <SelectItem value="csharp">C#</SelectItem>
                  <SelectItem value="ruby">Ruby</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="plaintext">Otro/Texto Plano</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Especificar el lenguaje puede mejorar el análisis SAST.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    )},
    { value: "item-5", title: "Análisis de Configuración Cloud", Icon: CloudIcon, fields: (
      <>
        <FormField
          control={form.control}
          name="cloudProvider"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="cloud-provider-select">Proveedor Cloud (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger id="cloud-provider-select"><SelectValue placeholder="Seleccione proveedor" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AWS">Amazon Web Services (AWS)</SelectItem>
                  <SelectItem value="Azure">Microsoft Azure</SelectItem>
                  <SelectItem value="GCP">Google Cloud Platform (GCP)</SelectItem>
                  <SelectItem value="Other">Otro</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Proveedor para análisis de configuración cloud.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cloudConfigDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="cloud-config-description-input">Descripción Config. Cloud (Opcional)</FormLabel>
              <FormControl>
                <Textarea id="cloud-config-description-input" placeholder="Describe config. cloud (IAM, redes, etc. Mín. 20 caracteres)." {...field} className="text-sm min-h-[100px]" />
              </FormControl>
              <FormDescription>Requerida si se selecciona un Proveedor Cloud.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cloudRegion"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="cloud-region-input">Región Cloud (Opcional)</FormLabel>
              <FormControl>
                <Input id="cloud-region-input" placeholder="ej., us-east-1, West Europe" {...field} className="text-sm" />
              </FormControl>
              <FormDescription>Región de la nube donde residen los recursos.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    )},
    { value: "item-6", title: "Análisis de Contenedores", Icon: BoxIcon, fields: (
      <>
        <FormField
          control={form.control}
          name="containerImageName"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="container-image-name-input">Nombre de Imagen de Contenedor (Opcional)</FormLabel>
              <FormControl>
                <Input id="container-image-name-input" placeholder="ej., nginx:latest o mi-app:1.2.3" {...field} className="text-sm" />
              </FormControl>
              <FormDescription>Nombre e etiqueta de la imagen del contenedor.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dockerfileContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="dockerfile-content-input">Contenido del Dockerfile (Opcional)</FormLabel>
              <FormControl>
                <Textarea id="dockerfile-content-input" placeholder="Pega contenido del Dockerfile (mín. 20 caracteres)." {...field} className="text-sm min-h-[120px] font-mono" />
              </FormControl>
              <FormDescription>Para análisis de seguridad de Dockerfile.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="kubernetesManifestContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="kubernetes-manifest-content-input">Contenido Manifiesto Kubernetes (Opcional)</FormLabel>
              <FormControl>
                <Textarea id="kubernetes-manifest-content-input" placeholder="Pega contenido del manifiesto K8s (YAML/JSON, mín. 20 caracteres)." {...field} className="text-sm min-h-[120px] font-mono" />
              </FormControl>
              <FormDescription>Para análisis de seguridad de configuraciones Kubernetes.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="containerAdditionalContext"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="container-additional-context-input">Contexto Adicional de Contenedores (Opcional)</FormLabel>
              <FormControl>
                <Textarea id="container-additional-context-input" placeholder="Contexto adicional sobre el despliegue o imagen." {...field} className="text-sm min-h-[80px]" />
              </FormControl>
              <FormDescription>Ayuda a mejorar la precisión del análisis.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    )},
    { value: "item-7", title: "Análisis de Dependencias", Icon: LibraryIcon, fields: (
      <>
        <FormField
          control={form.control}
          name="dependencyFileType"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="dependency-file-type-select">Tipo de Archivo de Dependencias (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger id="dependency-file-type-select"><SelectValue placeholder="Seleccione tipo de archivo" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="npm">npm (package-lock.json, package.json)</SelectItem>
                  <SelectItem value="pip">pip (requirements.txt)</SelectItem>
                  <SelectItem value="maven">Maven (pom.xml)</SelectItem>
                  <SelectItem value="gem">RubyGems (Gemfile.lock)</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Tipo para análisis de dependencias de software.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dependencyFileContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="dependency-file-content-input">Contenido Archivo Dependencias (Opcional)</FormLabel>
              <FormControl>
                <Textarea id="dependency-file-content-input" placeholder="Pega contenido de archivo dependencias (mín. 20 caracteres)." {...field} className="text-sm min-h-[120px] font-mono" />
              </FormControl>
              <FormDescription>Requerido si se selecciona un Tipo de Archivo.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    )},
    { value: "item-8", title: "Análisis de Seguridad de Red", Icon: Wifi, fields: (
      <>
        <FormField
          control={form.control}
          name="networkDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="network-description-input">Descripción de Red (Opcional)</FormLabel>
              <FormControl>
                <Textarea id="network-description-input" placeholder="Describe arquitectura de red, topología, etc. (mín. 10 caracteres)." {...field} className="text-sm min-h-[100px]" />
              </FormControl>
              <FormDescription>Visión general de la estructura de la red.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="networkScanResults"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="network-scan-results-input">Resultados Escaneo de Red (Opcional)</FormLabel>
              <FormControl>
                <Textarea id="network-scan-results-input" placeholder="Pega resumen de Nmap, etc. (mín. 10 caracteres)." {...field} className="text-sm min-h-[120px] font-mono" />
              </FormControl>
              <FormDescription>Puertos abiertos, servicios y versiones detectados.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="networkFirewallRules"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="network-firewall-rules-input">Reglas de Firewall (Resumen) (Opcional)</FormLabel>
              <FormControl>
                <Textarea id="network-firewall-rules-input" placeholder="Describe reglas clave de firewall (mín. 10 caracteres)." {...field} className="text-sm min-h-[120px]" />
              </FormControl>
              <FormDescription>Permite analizar la configuración del firewall.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    )},
  ];


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Accordion type="multiple" className="w-full space-y-4">
          {accordionItems.map(item => (
            <AccordionItem value={item.value} key={item.value} className="border border-border rounded-lg shadow-sm bg-card">
              <AccordionTrigger className="px-4 py-3 hover:no-underline text-base font-semibold text-primary">
                <div className="flex items-center gap-2">
                  <item.Icon className="h-5 w-5" />
                  {item.title}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4 space-y-6 border-t border-border">
                {item.fields}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {form.formState.errors.url && (form.formState.errors.url.type === "custom" || form.formState.errors.url.message?.includes("objetivo de análisis")) && (
            <FormMessage>{form.formState.errors.url.message}</FormMessage>
        )}

        <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Search className="mr-2 h-5 w-5" />
          )}
          Analizar Seguridad
        </Button>
      </form>
    </Form>
  );
}

