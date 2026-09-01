# Metodologia dos dados

## Objetivo e escopo

O openings.dev facilita a descoberta de vagas públicas de tecnologia mantidas por comunidades em repositórios do GitHub. O projeto indexa e organiza publicações públicas; não é empregador, recrutador nem proprietário dessas vagas.

## Fontes elegíveis

Uma fonte deve ser um repositório público do GitHub cujas issues sejam usadas intencionalmente para publicar vagas de uma comunidade ou organização. Cada fonte é revisada antes de entrar no catálogo. Quando o repositório usa labels de vagas, somente as labels configuradas são coletadas; repositórios dedicados a vagas podem ser coletados sem labels. A inclusão não significa endosso.

## Frequência de sincronização e estado da issue

O pipeline programado tenta sincronizar as fontes a cada três horas. Issues abertas viram candidatas ao snapshot público; issues fechadas são excluídas após uma execução bem-sucedida. `/status` publica a última sincronização bem-sucedida, quantidade de vagas abertas, postagem mais recente e um resumo operacional de 30 dias sem erros brutos do provedor. A disponibilidade e os limites do GitHub podem atrasar atualizações.

## Geografia

A geografia da fonte e a geografia da vaga são separadas. O país da comunidade descreve a fonte; não comprova onde a vaga está. País, cidade, estado, modalidade e restrições do remoto vêm de campos estruturados explícitos ou de inferência cuidadosa sobre a publicação. Sem evidência suficiente, o valor permanece desconhecido. “Remoto” nunca significa automaticamente “mundo inteiro”.

## Taxonomia

As labels do GitHub continuam disponíveis como tags da fonte, mas nem toda label vira categoria de emprego. Regras curadas mapeiam evidências para áreas, tecnologias, senioridade, tipos de contratação, modalidades e idiomas. Labels operacionais de moderação ou estado da publicação ficam fora da taxonomia.

## Agrupamento de duplicatas

O pipeline agrupa publicações somente com evidência forte em comum, como a mesma URL específica de candidatura ou sinais normalizados e estáveis da vaga. Páginas iniciais de empresas, índices de carreiras, artigos e documentação não bastam. Uma vaga canônica é exibida com links para todas as fontes preservadas. As heurísticas ainda podem deixar passar duplicatas ou agrupar incorretamente um caso extremo.

## Atualidade

A idade é calculada a partir da publicação original na geração do snapshot. Vagas com até 30 dias são `fresh`, de 31 a 90 dias são `aging` e as mais antigas são `stale`. Os filtros de últimos 7, 30 e 90 dias usam o mesmo horário de publicação. Uma data recente não garante que a empresa ainda aceite candidaturas.

## Proveniência dos campos

Localização, salário, senioridade e modalidade recebem `declared`, `inferred` ou `unknown`. `declared` indica que a fonte informou explicitamente; `inferred`, que um parser determinístico derivou o dado da publicação; `unknown`, que não houve evidência suficiente. Vagas deduplicadas mantêm a evidência mais forte disponível e todos os links de origem.

## Vagas patrocinadas

Vagas patrocinadas são aceitas apenas pela fonte estruturada dedicada e aparecem claramente identificadas. Podem ser exibidas antes dos resultados orgânicos, mas nunca como orgânicas nem silenciosamente misturadas. O patrocínio não altera as regras de proveniência nem garante qualidade, disponibilidade ou conduta do empregador.

## Correções e suporte

Use a ação de reporte ou escreva para support@openings.dev para informar vaga encerrada, duplicada, localização incorreta, conteúdo inadequado, correção ou remoção de fonte. O reporte cria uma mensagem de suporte; não altera automaticamente a fonte pública. A correção é conferida na publicação original e aplicada ao catálogo, parser ou fonte quando necessário.

## Privacidade e observabilidade

O Sentry recebe falhas técnicas higienizadas, com coleta padrão de dados pessoais desativada, sem replay de sessão e sem cabeçalhos ou mensagens brutas de erro do pipeline. O Mixpanel só carrega após consentimento explícito e recebe uma lista pequena de eventos de produto. Não coletamos autocaptura, gravação de sessão, texto bruto da busca, e-mails, URLs completas nem perfis publicitários. Preferências e vagas salvas permanecem no armazenamento local do navegador até o usuário removê-las.

## Limitações e autoridade

Dados públicos podem estar incompletos, desatualizados, inconsistentes ou temporariamente indisponíveis. Parsing, tradução, interpretação salarial e deduplicação são determinísticos, mas imperfeitos. O openings.dev não verifica empregadores, termos, elegibilidade legal nem resultados de candidaturas. A issue original do GitHub é a fonte oficial para detalhes atuais e instruções de candidatura; confira-a antes de agir.
