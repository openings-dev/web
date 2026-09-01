# State Management

> Define ownership for URL, local interaction, provider, and remote state.

## Current model

The application uses React state, URL search parameters, versioned browser-local candidate state, and two cross-cutting providers. It has no global store, query cache, authentication state, or persistent application database.

`I18nProvider` owns the active locale and typed translations. `ThemeProvider` owns theme selection and synchronization with browser storage, document classes, and system preference. Opportunity and directory features own their transient filters, pagination, fullscreen detail dialog, and loading state locally.

Shareable filters, selected job links, and comparisons live in the URL. Saved jobs, viewed timestamps, the previous visit, and country/work-model/technology/seniority preferences live in the versioned local candidate adapter. They never leave the browser and do not sync across devices. A parameterized URL always takes precedence over stored preferences.

## Ownership order

1. Derive shareable navigation and filters from validated URL state.
2. Keep ephemeral interaction state in the lowest component or hook that needs it.
3. Lift state to the closest shared owner only when siblings coordinate.
4. Use context only for stable cross-cutting values consumed by distant descendants.
5. Keep fetched data in the server or feature boundary that requested it; context is not a server cache.

## Derived state

Calculate values from existing props, URL parameters, or state during render. Use `useMemo` only for a meaningful calculation or referential contract. Do not mirror derived values into state or use an effect for event-driven updates.

## Effects

Effects synchronize with external systems such as history, storage, media queries, and document classes. Include every reactive dependency and clean up subscriptions, timers, and observers. Never disable exhaustive-dependency rules to force a lifecycle shape.

## Remote state

Remote opportunity pages are loaded through the feature data boundary. Represent initial loading, incremental loading, empty, error, and success states explicitly. Preserve cancellation and stale-request protection where the current implementation provides it.
