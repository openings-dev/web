# Metodologia dei dati

## Scopo e ambito

openings.dev rende più facili da trovare le offerte tecnologiche pubbliche gestite dalle comunità su GitHub. Indicizza e organizza contenuti pubblici; non è datore di lavoro, recruiter o proprietario delle offerte.

## Fonti idonee

La fonte deve essere un repository pubblico le cui issue siano usate intenzionalmente per pubblicare lavoro. Ogni fonte viene esaminata prima del catalogo. Se usa label per le offerte, raccogliamo solo quelle configurate; una bacheca dedicata può essere raccolta senza label. L’inclusione non è un’approvazione.

## Frequenza di sincronizzazione e stato della issue

La pipeline pianificata tenta la sincronizzazione ogni tre ore. Le issue aperte diventano candidate allo snapshot; quelle chiuse vengono escluse dopo un’esecuzione riuscita. `/status` pubblica ultima sincronizzazione, offerte aperte, ultimo post e riepilogo di 30 giorni senza errori grezzi. Disponibilità e limiti di GitHub possono causare ritardi.

## Geografia

Geografia della fonte e del lavoro sono separate. Il paese della comunità non dimostra il luogo dell’offerta. Paese, città, suddivisione, modalità e vincoli da remoto derivano da campi espliciti o inferenze prudenti. Senza prove restano sconosciuti. “Da remoto” non significa automaticamente mondiale.

## Tassonomia

Le label GitHub restano tag della fonte, ma non diventano tutte categorie lavorative. Regole curate mappano aree, tecnologie, livello, contratto, modalità e lingue. Le label operative di moderazione o stato sono escluse.

## Raggruppamento dei duplicati

Le pubblicazioni vengono raggruppate solo con prove forti, come lo stesso URL specifico di candidatura o segnali normalizzati stabili. Homepage, indici carriere, articoli e documentazione generici non bastano. Mostriamo un’offerta canonica con tutte le fonti. Le euristiche possono ancora perdere o unire male casi limite.

## Attualità

L’età parte dalla pubblicazione originale al momento dello snapshot. Fino a 30 giorni è `fresh`, da 31 a 90 `aging`, oltre `stale`. I filtri 7, 30 e 90 giorni usano lo stesso orario. Una data recente non garantisce che l’offerta sia aperta.

## Provenienza dei campi

Località, retribuzione, livello e modalità sono `declared`, `inferred` o `unknown`. `declared` è esplicito nella fonte; `inferred` è derivato da un parser deterministico; `unknown` indica prove insufficienti. Le offerte deduplicate conservano la prova più forte e tutti i link.

## Offerte sponsorizzate

Le offerte sponsorizzate arrivano solo dalla fonte strutturata dedicata e sono chiaramente indicate. Possono precedere i risultati organici, ma non sono mai presentate come organiche o mescolate in silenzio. La sponsorizzazione non garantisce qualità, disponibilità o condotta.

## Correzioni e supporto

Usa la segnalazione o support@openings.dev per offerte chiuse, duplicate, località errate, contenuti inappropriati, correzioni o rimozioni. La segnalazione crea un messaggio di supporto e non modifica automaticamente la fonte. Verifichiamo l’originale prima di correggere catalogo, parser o fonte.

## Privacy e osservabilità

Sentry riceve errori tecnici sanificati, senza dati personali predefiniti, replay, header grezzi o messaggi grezzi della pipeline. Mixpanel si carica solo con consenso esplicito e riceve pochi eventi consentiti. Non raccogliamo autocapture, registrazioni, ricerca grezza, email, URL completi o profili pubblicitari. Preferenze e offerte salvate restano nello storage locale.

## Limiti e autorità

I dati pubblici possono essere incompleti, vecchi, incoerenti o indisponibili. Parsing, traduzione, interpretazione salariale e raggruppamento sono deterministici ma imperfetti. openings.dev non verifica datori, condizioni, idoneità o esiti. La issue GitHub originale è la fonte autorevole per dettagli e istruzioni attuali; controllala prima di agire.
