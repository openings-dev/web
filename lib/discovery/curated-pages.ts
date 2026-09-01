import type { OpportunityItem } from "@/lib/opportunities/types";
import type { LocaleCode } from "@/lib/constants/locales";

export const CURATED_DISCOVERY_SLUGS = [
  "remote",
  "internships",
  "react",
  "data-ai",
  "devops",
  "salary",
] as const;

export type CuratedDiscoverySlug = typeof CURATED_DISCOVERY_SLUGS[number];

export interface CuratedDiscoveryPreset {
  slug: CuratedDiscoverySlug;
  feedSlug: CuratedDiscoverySlug;
  query: Record<string, string>;
  copy: Record<LocaleCode, CuratedDiscoveryCopy>;
}

export interface CuratedDiscoveryCopy {
  title: string;
  description: string;
  explanation: string;
  cta: string;
  empty: string;
}

export const CURATED_DISCOVERY_PRESETS: CuratedDiscoveryPreset[] = [
  {
    slug: "remote", feedSlug: "remote", query: { workModels: "remote" },
    copy: {
      en: { title: "Remote technology jobs", description: "Recent remote roles from public GitHub communities.", explanation: "Remote scope can be worldwide, country-restricted, or unspecified. Check each original listing before applying.", cta: "Explore all remote jobs", empty: "No remote jobs are available in the current snapshot." },
      pt: { title: "Vagas remotas de tecnologia", description: "Vagas remotas recentes de comunidades públicas no GitHub.", explanation: "O remoto pode ser mundial, restrito a um país ou não especificado. Confira a publicação original.", cta: "Explorar todas as vagas remotas", empty: "Não há vagas remotas no snapshot atual." },
      es: { title: "Vacantes tecnológicas remotas", description: "Puestos remotos recientes de comunidades públicas de GitHub.", explanation: "El alcance remoto puede ser mundial, limitado a un país o no especificado. Revisa la publicación original.", cta: "Explorar todas las vacantes remotas", empty: "No hay vacantes remotas en la instantánea actual." },
      it: { title: "Offerte tecnologiche da remoto", description: "Ruoli da remoto recenti da comunità GitHub pubbliche.", explanation: "L’ambito remoto può essere mondiale, limitato a un paese o non specificato. Controlla l’annuncio originale.", cta: "Esplora tutte le offerte da remoto", empty: "Nessuna offerta da remoto nello snapshot attuale." },
      fr: { title: "Offres technologiques à distance", description: "Postes à distance récents issus de communautés GitHub publiques.", explanation: "Le périmètre peut être mondial, limité à un pays ou non précisé. Vérifiez l’annonce d’origine.", cta: "Explorer toutes les offres à distance", empty: "Aucune offre à distance dans l’instantané actuel." },
      de: { title: "Remote-Stellen in der Technologie", description: "Aktuelle Remote-Rollen aus öffentlichen GitHub-Communities.", explanation: "Remote kann weltweit, auf ein Land beschränkt oder unbestimmt sein. Prüfe die Originalausschreibung.", cta: "Alle Remote-Stellen ansehen", empty: "Im aktuellen Datenstand gibt es keine Remote-Stellen." },
    },
  },
  {
    slug: "internships", feedSlug: "internships", query: { seniority: "internship" },
    copy: {
      en: { title: "Technology internships", description: "Internships and trainee opportunities shared by public communities.", explanation: "This page uses structured seniority or employment evidence, not any arbitrary GitHub label.", cta: "Explore all internships", empty: "No internships are available in the current snapshot." },
      pt: { title: "Estágios em tecnologia", description: "Estágios e oportunidades de formação publicados por comunidades públicas.", explanation: "A seleção usa evidência estruturada de senioridade ou contratação, não qualquer label do GitHub.", cta: "Explorar todos os estágios", empty: "Não há estágios no snapshot atual." },
      es: { title: "Prácticas en tecnología", description: "Prácticas y oportunidades formativas de comunidades públicas.", explanation: "La selección usa evidencia estructurada de nivel o contratación, no cualquier etiqueta de GitHub.", cta: "Explorar todas las prácticas", empty: "No hay prácticas en la instantánea actual." },
      it: { title: "Tirocini in tecnologia", description: "Tirocini e opportunità formative condivisi da comunità pubbliche.", explanation: "La selezione usa evidenze strutturate di livello o contratto, non qualsiasi label GitHub.", cta: "Esplora tutti i tirocini", empty: "Nessun tirocinio nello snapshot attuale." },
      fr: { title: "Stages dans la technologie", description: "Stages et parcours de formation partagés par des communautés publiques.", explanation: "La sélection repose sur des données structurées de niveau ou de contrat, pas sur n’importe quel label GitHub.", cta: "Explorer tous les stages", empty: "Aucun stage dans l’instantané actuel." },
      de: { title: "Technologie-Praktika", description: "Praktika und Ausbildungsangebote aus öffentlichen Communities.", explanation: "Die Auswahl nutzt strukturierte Angaben zu Niveau oder Beschäftigung, nicht beliebige GitHub-Labels.", cta: "Alle Praktika ansehen", empty: "Im aktuellen Datenstand gibt es keine Praktika." },
    },
  },
  {
    slug: "react", feedSlug: "react", query: { technologies: "react" },
    copy: {
      en: { title: "React jobs", description: "Recent roles whose structured technology taxonomy includes React.", explanation: "Technology evidence can be declared or inferred. The confidence panel on each job explains what was found.", cta: "Explore all React jobs", empty: "No React jobs are available in the current snapshot." },
      pt: { title: "Vagas de React", description: "Vagas recentes cuja taxonomia estruturada inclui React.", explanation: "A tecnologia pode ser declarada ou inferida. O painel de confiança de cada vaga explica a evidência.", cta: "Explorar todas as vagas de React", empty: "Não há vagas de React no snapshot atual." },
      es: { title: "Vacantes de React", description: "Puestos recientes cuya taxonomía estructurada incluye React.", explanation: "La tecnología puede estar declarada o inferida. El panel de confianza explica la evidencia.", cta: "Explorar todas las vacantes de React", empty: "No hay vacantes de React en la instantánea actual." },
      it: { title: "Offerte React", description: "Ruoli recenti la cui tassonomia strutturata include React.", explanation: "La tecnologia può essere dichiarata o dedotta. Il pannello di affidabilità spiega le prove.", cta: "Esplora tutte le offerte React", empty: "Nessuna offerta React nello snapshot attuale." },
      fr: { title: "Offres React", description: "Postes récents dont la taxonomie structurée inclut React.", explanation: "La technologie peut être déclarée ou déduite. Le panneau de fiabilité explique les preuves.", cta: "Explorer toutes les offres React", empty: "Aucune offre React dans l’instantané actuel." },
      de: { title: "React-Stellen", description: "Aktuelle Rollen, deren strukturierte Taxonomie React enthält.", explanation: "Technologie kann angegeben oder abgeleitet sein. Die Datenanzeige jeder Stelle erklärt den Beleg.", cta: "Alle React-Stellen ansehen", empty: "Im aktuellen Datenstand gibt es keine React-Stellen." },
    },
  },
  {
    slug: "data-ai", feedSlug: "data-ai", query: { areas: "data-ai" },
    copy: {
      en: { title: "Data and AI jobs", description: "Recent data, machine learning, and AI roles from public communities.", explanation: "The curated area groups structured role evidence while preserving the original listing as authority.", cta: "Explore all Data and AI jobs", empty: "No Data and AI jobs are available in the current snapshot." },
      pt: { title: "Vagas de Dados e IA", description: "Vagas recentes de dados, aprendizado de máquina e IA.", explanation: "A área curada agrupa evidências estruturadas e preserva a publicação original como fonte oficial.", cta: "Explorar todas as vagas de Dados e IA", empty: "Não há vagas de Dados e IA no snapshot atual." },
      es: { title: "Vacantes de Datos e IA", description: "Puestos recientes de datos, aprendizaje automático e IA.", explanation: "El área curada agrupa evidencia estructurada y conserva la publicación original como autoridad.", cta: "Explorar todas las vacantes de Datos e IA", empty: "No hay vacantes de Datos e IA en la instantánea actual." },
      it: { title: "Offerte Dati e IA", description: "Ruoli recenti in dati, machine learning e intelligenza artificiale.", explanation: "L’area curata raggruppa prove strutturate mantenendo l’annuncio originale come autorità.", cta: "Esplora tutte le offerte Dati e IA", empty: "Nessuna offerta Dati e IA nello snapshot attuale." },
      fr: { title: "Offres Data et IA", description: "Postes récents en données, machine learning et intelligence artificielle.", explanation: "Le domaine éditorialisé regroupe des preuves structurées en gardant l’annonce d’origine comme référence.", cta: "Explorer toutes les offres Data et IA", empty: "Aucune offre Data et IA dans l’instantané actuel." },
      de: { title: "Daten- und KI-Stellen", description: "Aktuelle Rollen in Daten, Machine Learning und KI.", explanation: "Der kuratierte Bereich gruppiert strukturierte Belege; die Originalausschreibung bleibt maßgeblich.", cta: "Alle Daten- und KI-Stellen ansehen", empty: "Im aktuellen Datenstand gibt es keine Daten- und KI-Stellen." },
    },
  },
  {
    slug: "devops", feedSlug: "devops", query: { areas: "devops-sre" },
    copy: {
      en: { title: "DevOps and SRE jobs", description: "Recent infrastructure, platform, DevOps, and reliability roles.", explanation: "This curated page uses the structured DevOps and SRE area rather than broad text matching.", cta: "Explore all DevOps jobs", empty: "No DevOps or SRE jobs are available in the current snapshot." },
      pt: { title: "Vagas de DevOps e SRE", description: "Vagas recentes de infraestrutura, plataforma, DevOps e confiabilidade.", explanation: "A página usa a área estruturada de DevOps e SRE, e não uma busca ampla de texto.", cta: "Explorar todas as vagas de DevOps", empty: "Não há vagas de DevOps ou SRE no snapshot atual." },
      es: { title: "Vacantes de DevOps y SRE", description: "Puestos recientes de infraestructura, plataforma y fiabilidad.", explanation: "La página usa el área estructurada de DevOps y SRE, no una búsqueda amplia de texto.", cta: "Explorar todas las vacantes de DevOps", empty: "No hay vacantes de DevOps o SRE en la instantánea actual." },
      it: { title: "Offerte DevOps e SRE", description: "Ruoli recenti in infrastruttura, piattaforma e affidabilità.", explanation: "La pagina usa l’area strutturata DevOps e SRE, non una ricerca testuale ampia.", cta: "Esplora tutte le offerte DevOps", empty: "Nessuna offerta DevOps o SRE nello snapshot attuale." },
      fr: { title: "Offres DevOps et SRE", description: "Postes récents en infrastructure, plateforme et fiabilité.", explanation: "Cette page utilise le domaine structuré DevOps et SRE, pas une recherche textuelle large.", cta: "Explorer toutes les offres DevOps", empty: "Aucune offre DevOps ou SRE dans l’instantané actuel." },
      de: { title: "DevOps- und SRE-Stellen", description: "Aktuelle Rollen in Infrastruktur, Plattform und Zuverlässigkeit.", explanation: "Die Seite nutzt den strukturierten DevOps/SRE-Bereich statt breiter Textsuche.", cta: "Alle DevOps-Stellen ansehen", empty: "Im aktuellen Datenstand gibt es keine DevOps- oder SRE-Stellen." },
    },
  },
  {
    slug: "salary", feedSlug: "salary", query: { salaryOnly: "true" },
    copy: {
      en: { title: "Jobs with disclosed salary", description: "Recent technology jobs that publish compensation information.", explanation: "Amounts keep their source currency and period. They are not converted into a misleading normalized ranking.", cta: "Explore all jobs with salary", empty: "No jobs with disclosed salary are available in the current snapshot." },
      pt: { title: "Vagas com salário divulgado", description: "Vagas recentes de tecnologia que publicam informações de remuneração.", explanation: "Valores mantêm moeda e período da fonte. Não são convertidos em um ranking normalizado enganoso.", cta: "Explorar todas as vagas com salário", empty: "Não há vagas com salário divulgado no snapshot atual." },
      es: { title: "Vacantes con salario publicado", description: "Puestos tecnológicos recientes que publican remuneración.", explanation: "Los importes conservan moneda y período de origen. No se convierten en una clasificación engañosa.", cta: "Explorar todas las vacantes con salario", empty: "No hay vacantes con salario publicado en la instantánea actual." },
      it: { title: "Offerte con retribuzione pubblicata", description: "Ruoli tecnologici recenti con informazioni sulla retribuzione.", explanation: "Gli importi mantengono valuta e periodo della fonte. Non vengono convertiti in classifiche fuorvianti.", cta: "Esplora tutte le offerte con retribuzione", empty: "Nessuna offerta con retribuzione nello snapshot attuale." },
      fr: { title: "Offres avec salaire publié", description: "Postes technologiques récents publiant une rémunération.", explanation: "Les montants conservent la devise et la période d’origine. Ils ne sont pas convertis en classement trompeur.", cta: "Explorer toutes les offres avec salaire", empty: "Aucune offre avec salaire publié dans l’instantané actuel." },
      de: { title: "Stellen mit Gehaltsangabe", description: "Aktuelle Tech-Stellen mit veröffentlichten Vergütungsangaben.", explanation: "Beträge behalten Währung und Zeitraum der Quelle. Sie werden nicht in eine irreführende Rangliste umgerechnet.", cta: "Alle Stellen mit Gehalt ansehen", empty: "Im aktuellen Datenstand gibt es keine Stellen mit Gehaltsangabe." },
    },
  },
];

export function matchesCuratedPreset(
  item: OpportunityItem,
  slug: CuratedDiscoverySlug,
): boolean {
  if (slug === "remote") return item.taxonomy?.workModels.includes("remote") ?? false;
  if (slug === "internships") {
    return Boolean(item.taxonomy?.seniority.includes("internship") ||
      item.taxonomy?.employmentTypes.includes("internship"));
  }
  if (slug === "react") return item.taxonomy?.technologies.includes("react") ?? false;
  if (slug === "data-ai") return item.taxonomy?.areas.includes("data-ai") ?? false;
  if (slug === "devops") return item.taxonomy?.areas.includes("devops-sre") ?? false;
  return Boolean(item.salary);
}

export function curatedPresetBySlug(slug: string) {
  return CURATED_DISCOVERY_PRESETS.find((preset) => preset.slug === slug) ?? null;
}
