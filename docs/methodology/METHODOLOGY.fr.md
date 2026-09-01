# Méthodologie des données

## Objectif et périmètre

openings.dev facilite la découverte d’offres technologiques publiques gérées par des communautés sur GitHub. Le service indexe et organise des publications publiques ; il n’est ni employeur, ni recruteur, ni propriétaire des offres.

## Sources admissibles

Une source doit être un dépôt public dont les issues servent volontairement à publier des emplois. Chaque source est examinée avant son ajout. Si le dépôt utilise des labels d’emploi, seuls ceux configurés sont collectés ; un tableau dédié peut l’être sans labels. L’inclusion ne constitue pas une recommandation.

## Fréquence de synchronisation et état de l’issue

Le pipeline planifié tente une synchronisation toutes les trois heures. Les issues ouvertes deviennent candidates au snapshot ; les issues fermées sont exclues après une exécution réussie. `/status` publie dernière synchronisation, offres ouvertes, dernière publication et résumé sur 30 jours sans erreurs brutes. La disponibilité et les limites de GitHub peuvent retarder les mises à jour.

## Géographie

La géographie de la source et celle de l’emploi sont distinctes. Le pays de la communauté ne prouve pas le lieu du poste. Pays, ville, subdivision, mode de travail et restrictions à distance viennent de champs explicites ou d’inférences prudentes. Sans preuve suffisante, la valeur reste inconnue. « À distance » ne signifie pas automatiquement mondial.

## Taxonomie

Les labels GitHub restent des tags de source, mais ne deviennent pas tous des catégories d’emploi. Des règles éditorialisées associent domaines, technologies, niveau, contrat, modes de travail et langues. Les labels opérationnels de modération ou d’état sont exclus.

## Regroupement des doublons

Les publications ne sont regroupées qu’avec des preuves fortes : même URL précise de candidature ou signaux normalisés stables. Pages d’accueil, index de carrières, articles et documentation génériques ne suffisent pas. Une offre canonique conserve tous les liens sources. Les heuristiques peuvent encore manquer ou mal regrouper des cas limites.

## Fraîcheur

L’âge part de la publication d’origine lors de la génération du snapshot. Jusqu’à 30 jours : `fresh` ; de 31 à 90 : `aging` ; au-delà : `stale`. Les filtres 7, 30 et 90 jours utilisent le même horodatage. Une date récente ne garantit pas que l’offre soit ouverte.

## Provenance des champs

Localisation, salaire, niveau et mode de travail sont `declared`, `inferred` ou `unknown`. `declared` est explicite dans la source ; `inferred` est déduit par un analyseur déterministe ; `unknown` indique des preuves insuffisantes. Les offres dédupliquées gardent la preuve la plus forte et tous les liens.

## Offres sponsorisées

Les offres sponsorisées proviennent uniquement de la source structurée dédiée et sont clairement signalées. Elles peuvent précéder les résultats organiques, mais ne sont jamais présentées comme organiques ni mélangées en silence. Le sponsoring ne garantit ni qualité, ni disponibilité, ni conduite.

## Corrections et assistance

Utilisez le signalement ou support@openings.dev pour une offre fermée, un doublon, une mauvaise localisation, un contenu inapproprié, une correction ou un retrait. Le signalement crée un message d’assistance et ne modifie pas automatiquement la source. L’original est vérifié avant correction du catalogue, de l’analyseur ou de la source.

## Confidentialité et observabilité

Sentry reçoit des erreurs techniques nettoyées, sans données personnelles par défaut, replay, en-têtes bruts ni messages bruts du pipeline. Mixpanel ne charge qu’après consentement explicite et reçoit une liste restreinte d’événements. Nous ne collectons ni autocapture, ni enregistrement, ni recherche brute, ni e-mails, ni URL complètes, ni profils publicitaires. Préférences et favoris restent dans le stockage local.

## Limites et autorité

Les données publiques peuvent être incomplètes, anciennes, incohérentes ou indisponibles. Analyse, traduction, salaire et regroupement sont déterministes mais imparfaits. openings.dev ne vérifie ni employeurs, ni conditions, ni admissibilité, ni résultats. L’issue GitHub originale fait autorité pour les détails et instructions actuels ; vérifiez-la avant d’agir.
