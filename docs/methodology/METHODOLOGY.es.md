# Metodología de datos

## Objetivo y alcance

openings.dev facilita el descubrimiento de vacantes tecnológicas públicas gestionadas por comunidades en GitHub. Indexa y organiza publicaciones públicas; no es empleador, reclutador ni propietario de las vacantes.

## Fuentes elegibles

La fuente debe ser un repositorio público cuyas issues se usen intencionadamente para publicar empleo. Cada fuente se revisa antes de entrar al catálogo. Si usa etiquetas de empleo, solo se recopilan las configuradas; un tablón dedicado puede recopilarse sin etiquetas. La inclusión no implica recomendación.

## Frecuencia de sincronización y estado de la issue

El pipeline programado intenta sincronizar cada tres horas. Las issues abiertas son candidatas al snapshot y las cerradas se excluyen tras una ejecución correcta. `/status` publica última sincronización correcta, vacantes abiertas, última publicación y un resumen de 30 días sin errores brutos. La disponibilidad y los límites de GitHub pueden retrasar cambios.

## Geografía

La geografía de la fuente y la de la vacante son distintas. El país de la comunidad no demuestra dónde está el empleo. País, ciudad, región, modalidad y restricciones remotas proceden de campos explícitos o de inferencias cuidadosas. Sin evidencia suficiente quedan desconocidos. “Remoto” no significa automáticamente mundial.

## Taxonomía

Las etiquetas de GitHub se conservan como etiquetas de origen, pero no todas son categorías laborales. Reglas curadas asignan áreas, tecnologías, nivel, contratación, modalidad e idiomas. Se excluyen etiquetas operativas de moderación o estado.

## Agrupación de duplicados

Solo se agrupan publicaciones con evidencia fuerte, como la misma URL específica de candidatura o señales normalizadas estables. Páginas corporativas genéricas, índices de empleo, artículos y documentación no bastan. Se muestra una vacante canónica con todas sus fuentes. Las heurísticas aún pueden omitir o agrupar mal casos límite.

## Actualidad

La edad parte de la publicación original al generar el snapshot. Hasta 30 días es `fresh`, de 31 a 90 es `aging` y después es `stale`. Los filtros de 7, 30 y 90 días usan la misma fecha. Una publicación reciente no garantiza que siga abierta.

## Procedencia de los campos

Ubicación, salario, nivel y modalidad se marcan `declared`, `inferred` o `unknown`. `declared` viene explícitamente de la fuente; `inferred` lo deriva un parser determinista; `unknown` indica evidencia insuficiente. Las vacantes deduplicadas conservan la evidencia más fuerte y todos los enlaces.

## Vacantes patrocinadas

Las vacantes patrocinadas solo llegan por la fuente estructurada dedicada y se identifican claramente. Pueden preceder a resultados orgánicos, pero nunca se presentan como orgánicas ni se mezclan en silencio. El patrocinio no garantiza calidad, vigencia ni conducta del empleador.

## Correcciones y soporte

Usa la acción de reporte o support@openings.dev para informar cierres, duplicados, ubicación errónea, contenido inadecuado, correcciones o retiradas. El reporte crea un mensaje de soporte y no modifica automáticamente la fuente. Se contrasta con la publicación original antes de corregir catálogo, parser o fuente.

## Privacidad y observabilidad

Sentry recibe fallos técnicos saneados, sin datos personales predeterminados, replay, cabeceras brutas ni mensajes brutos del pipeline. Mixpanel carga solo tras consentimiento explícito y recibe una lista limitada de eventos. No recopilamos autocaptura, grabación de sesión, búsqueda en bruto, correos, URLs completas ni perfiles publicitarios. Preferencias y favoritos permanecen en el almacenamiento local.

## Limitaciones y autoridad

Los datos públicos pueden ser incompletos, antiguos, inconsistentes o no estar disponibles. El análisis, traducción, salario y agrupación son deterministas pero imperfectos. openings.dev no verifica empleadores, condiciones, elegibilidad ni resultados. La issue original de GitHub es la fuente autorizada para detalles e instrucciones actuales; verifícala antes de actuar.
