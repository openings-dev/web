interface OpportunityReportMailtoParams {
  title: string;
  canonicalUrl: string;
  primarySourceUrl: string;
  prompt: string;
  categories: string[];
}

function safeSubjectValue(value: string) {
  return value.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

export function buildOpportunityReportMailto(params: OpportunityReportMailtoParams) {
  const subject = safeSubjectValue(`[openings.dev] ${params.title}`);
  const checklist = params.categories.map((category) => `- [ ] ${category}`).join("\n");
  const body = [
    params.prompt,
    "",
    checklist,
    "",
    params.canonicalUrl,
    params.primarySourceUrl,
  ].join("\n");
  const query = new URLSearchParams({ subject, body });
  return `mailto:support@openings.dev?${query.toString()}`;
}
