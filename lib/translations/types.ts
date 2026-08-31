export interface DocumentMessages {
  title: string;
  description: string;
}

export interface TranslationMessages {
  accessibility: {
    skipToContent: string;
  };
  header: {
    brandName: string;
    brandTagline: string;
    nav: {
      discover: string;
      communities: string;
      authors: string;
      docs: string;
    };
    mobileNavigation: {
      groups: {
        primary: string;
        resources: string;
        help: string;
      };
      support: string;
      githubStar: {
        title: string;
        description: string;
        action: string;
        ariaLabel: string;
      };
    };
    primaryNavigationAriaLabel: string;
    openNavigationMenuAriaLabel: string;
    closeNavigationMenuAriaLabel: string;
    switchToLightMode: string;
    switchToDarkMode: string;
    themeControlAriaLabel: string;
    languagePlaceholder: string;
    languageAriaLabel: string;
    languageChanged: string;
  };
  home: {
    kicker: string;
    title: string;
    description: string;
    primaryAction: string;
    sourceStatement: string;
    proof: {
      sourceLabel: string;
      sourceValue: string;
      searchLabel: string;
      searchValue: string;
      destinationLabel: string;
      destinationValue: string;
    };
    network: {
      ariaLabel: string;
      repository: string;
      publicIssue: string;
      indexedForSearch: string;
      opportunity: string;
      stack: string;
      location: string;
      originalSource: string;
    };
  };
  sponsorship: {
    banner: {
      message: string;
      detail: string;
      action: string;
    };
  };
  notFound: {
    kicker: string;
    title: string;
    description: string;
    action: string;
  };
  legacyRedirect: {
    title: string;
    description: string;
    action: string;
  };
  communities: {
    header: {
      kicker: string;
      title: string;
      description: string;
      profileKicker: string;
      profileTitle: string;
      profileDescription: string;
    };
    filters: {
      discoveryLabel: string;
      title: string;
      searchLabel: string;
      country: string;
      region: string;
      allCountries: string;
      allRegions: string;
      optionWithCount: string;
      hide: string;
      show: string;
      clear: string;
      searchPlaceholder: string;
      sortLabel: string;
      sortCount: string;
      sortRecent: string;
      sortName: string;
    };
    list: {
      summaryOne: string;
      summary: string;
      listLabel: string;
      emptySourceTitle: string;
      emptySourceDescription: string;
      unavailableTitle: string;
      unavailableDescription: string;
      emptyQueryTitle: string;
      emptyQueryDescription: string;
      emptyGeographyTitle: string;
      emptyGeographyDescription: string;
      emptyCombinedTitle: string;
      emptyCombinedDescription: string;
      clearAll: string;
      browseJobs: string;
      locationLabel: string;
      latestActivityLabel: string;
      opportunityCountOne: string;
      opportunitiesCount: string;
      openCommunity: string;
    };
  };
  users: {
    header: {
      kicker: string;
      title: string;
      description: string;
      profileKicker: string;
      profileTitle: string;
      profileDescription: string;
    };
    filters: {
      discoveryLabel: string;
      title: string;
      searchLabel: string;
      country: string;
      region: string;
      allCountries: string;
      allRegions: string;
      optionWithCount: string;
      hide: string;
      show: string;
      clear: string;
      searchPlaceholder: string;
      sortLabel: string;
      sortCount: string;
      sortRecent: string;
      sortName: string;
    };
    list: {
      summaryOne: string;
      summary: string;
      listLabel: string;
      emptySourceTitle: string;
      emptySourceDescription: string;
      unavailableTitle: string;
      unavailableDescription: string;
      emptyQueryTitle: string;
      emptyQueryDescription: string;
      emptyGeographyTitle: string;
      emptyGeographyDescription: string;
      emptyCombinedTitle: string;
      emptyCombinedDescription: string;
      clearAll: string;
      browseJobs: string;
      locationLabel: string;
      latestActivityLabel: string;
      opportunityCountOne: string;
      opportunitiesCount: string;
      openPublisher: string;
    };
  };
  profiles: {
    communityEyebrow: string;
    publisherEyebrow: string;
    communityDescription: string;
    publisherDescription: string;
    openRoleSingular: string;
    openRolesPlural: string;
    locationLabel: string;
    latestActivityLabel: string;
    publicSourceLabel: string;
    summaryScope: string;
    seeOpenRoles: string;
    shareProfile: string;
    openCommunityOnGitHub: string;
    openPublisherOnGitHub: string;
    shareCommunityText: string;
    sharePublisherText: string;
    shareShared: string;
    shareCopied: string;
    shareFailed: string;
    workspaceCommunityScope: string;
    workspacePublisherScope: string;
  };
  opportunities: {
    header: {
      kicker: string;
      title: string;
      description: string;
      opportunitiesLabel: string;
      locationLabel: string;
      lastPostLabel: string;
    };
    feedback: {
      filtersReset: string;
      loadError: string;
      loadMoreError: string;
      partialLoadError: string;
      rateLimited: string;
      selectedLoading: string;
      selectedNotFound: string;
      selectedLoadError: string;
    };
    range: {
      zeroResults: string;
      rangeOfTotal: string;
    };
    status: {
      ariaLabel: string;
      title: string;
      opportunitiesFound: string;
      updatedRelative: string;
      updatedAt: string;
      updatedUnavailable: string;
    };
    filters: {
      ariaLabel: string;
      title: string;
      activeCount: string;
      hide: string;
      show: string;
      showResultOne: string;
      showResults: string;
      reset: string;
      removeFilter: string;
      searchLabel: string;
      searchPlaceholder: string;
      locationSectionLabel: string;
      repositorySectionLabel: string;
      repositoryLabel: string;
      repositoryPlaceholder: string;
      allRepositories: string;
      regionLabel: string;
      regionPlaceholder: string;
      allRegions: string;
      countryLabel: string;
      countryPlaceholder: string;
      allCountries: string;
      workModeLabel: string;
      workModePlaceholder: string;
      stackLabel: string;
      stackPlaceholder: string;
      anyStack: string;
      applyStack: string;
      clearStack: string;
      stackSelectedCount: string;
      seniorityLabel: string;
      seniorityPlaceholder: string;
      otherTagsLabel: string;
      otherTagsPlaceholder: string;
      tagsLabel: string;
      tagsPlaceholder: string;
      noTagsSelected: string;
      authorLabel: string;
      authorPlaceholder: string;
      noAuthorsSelected: string;
      itemsPerPageLabel: string;
      itemsPerPagePlaceholder: string;
      itemsPerPageOption: string;
      sortLabel: string;
      sortPlaceholder: string;
      sortRecent: string;
      sortOldest: string;
    };
    toolbar: {
      opportunitiesCount: string;
      pageSummaryOne: string;
      pageSummary: string;
      loading: string;
      sortPlaceholder: string;
      sortRecent: string;
      sortOldest: string;
    };
    list: {
      totalMatches: string;
      noMatchesTitle: string;
      noResultsTitle: string;
      noMatchesDescription: string;
      noResultsDescription: string;
      clearFilters: string;
      scrollToLoadMore: string;
      allResultsLoaded: string;
      loading: string;
      loadingMore: string;
    };
    viewMode: {
      ariaLabel: string;
      list: string;
      grid: string;
    };
    card: {
      statusOpen: string;
      detailsTitle: string;
      viewDetails: string;
      openDetailsAriaLabel: string;
      closeDetails: string;
      postedAt: string;
      updatedAt: string;
      openOriginal: string;
      showCommunityJobs: string;
      showAuthorJobs: string;
      noDescription: string;
      share: string;
      shareShared: string;
      shareCopied: string;
      shareFailed: string;
      salaryFrom: string;
      salaryUpTo: string;
      salaryRange: string;
      salaryPeriodMonth: string;
      salaryPeriodYear: string;
      salaryPeriodHour: string;
      moreTag: string;
      moreTags: string;
    };
  };
  footer: {
    brandTagline: string;
    description: string;
    supportText: string;
    supportEmailButtonLabel: string;
    supportEmailCopied: string;
    supportEmailCopyError: string;
    copyrightTemplate: string;
    signature: string;
    groups: {
      project: string;
      openSource: string;
      legal: string;
    };
    groupAriaLabels: {
      project: string;
      openSource: string;
      legal: string;
    };
    links: {
      overview: string;
      communities: string;
      users: string;
      apiReference: string;
      maintainers: string;
      github: string;
      bluesky: string;
      mastodon: string;
      threads: string;
      instagram: string;
      contributing: string;
      reportIssue: string;
      privacyPolicy: string;
      termsOfService: string;
      designSystem: string;
    };
    social: {
      linksAriaLabel: string;
      githubAriaLabel: string;
      blueskyAriaLabel: string;
      mastodonAriaLabel: string;
      threadsAriaLabel: string;
      instagramAriaLabel: string;
    };
  };
  docsHub: {
    eyebrow: string;
    title: string;
    description: string;
    navigationLabel: string;
    groups: {
      startHere: string;
      integration: string;
      product: string;
    };
    resources: {
      overview: DocumentMessages;
      apiReference: DocumentMessages;
      communityGuide: DocumentMessages;
      contributing: DocumentMessages;
      designSystem: DocumentMessages;
      support: DocumentMessages;
      privacy: DocumentMessages;
      terms: DocumentMessages;
    };
  };
  documents: {
    sourceLabel: string;
    breadcrumb: string;
    navigationLabel: string;
    navigationSummary: string;
    tableOfContentsLabel: string;
    tableOfContentsSummary: string;
    skipToContent: string;
    unavailableTitle: string;
    unavailableDescription: string;
    overview: DocumentMessages;
    apiReference: DocumentMessages;
    maintainers: DocumentMessages;
    contributing: DocumentMessages;
    privacy: DocumentMessages;
    terms: DocumentMessages;
  };
  designSystem: {
    eyebrow: string;
    title: string;
    description: string;
    navigationLabel: string;
    sections: {
      foundations: string;
      brand: string;
      primitives: string;
      productPatterns: string;
      content: string;
      states: string;
      responsive: string;
      usage: string;
    };
    guidance: {
      foundations: string;
      brand: string;
      primitives: string;
      productPatterns: string;
      content: string;
      states: string;
      responsive: string;
      usage: string;
    };
    labels: {
      specimen: string;
      representativeData: string;
      lightSurface: string;
      inverseSurface: string;
      defaultState: string;
      selectedState: string;
      disabledState: string;
      invalidState: string;
      loadingState: string;
      emptyState: string;
      destructiveState: string;
      interactiveExamples: string;
    };
    actions: {
      primary: string;
      secondary: string;
      showToast: string;
      openFilters: string;
      openDetails: string;
      demonstrateLoading: string;
      close: string;
    };
    interactive: {
      selectLabel: string;
      selectHint: string;
      selectPlaceholder: string;
      selectOption: string;
      invalidLabel: string;
      invalidError: string;
      toastTitle: string;
      toastDescription: string;
      loadingComplete: string;
    };
    specimens: {
      semanticColors: string;
      themeComparison: string;
      typographyRoles: string;
      displaySample: string;
      bodySample: string;
      editorialSample: string;
      spacingShapeElevation: string;
      iconContract: string;
      searchWithLabel: string;
      productConcept: string;
      sourceLink: string;
      iconHelpAriaLabel: string;
      wordmarkFirstTitle: string;
      wordmarkFirstDescription: string;
      compactMarkTitle: string;
      compactMarkDescription: string;
      oneIdentityTitle: string;
      oneIdentityDescription: string;
      buttonsAndLinks: string;
      secondaryButton: string;
      outlineButton: string;
      quietButton: string;
      removeButton: string;
      searchTermsLabel: string;
      searchTermsHint: string;
      searchTermsPlaceholder: string;
      badgesAndStatus: string;
      needsReview: string;
      publicSource: string;
      profileSpecimenLabel: string;
      directoryCount: string;
      directoryAction: string;
      messageThesis: string;
      claimsBoundary: string;
      actionVocabulary: string;
      avoid: string;
      avoidDescription: string;
      mobileGuidance: string;
      tabletGuidance: string;
      wideGuidance: string;
      emptyTitle: string;
      emptyDescription: string;
      clearSpecimenFilters: string;
      longOpportunityTitle: string;
      liveResponsiveComposition: string;
      colorLimits: string;
      controlGuidance: {
        keyboard: string;
        accessibleName: string;
        errorAssociation: string;
        loadingAnnouncement: string;
        reducedMotion: string;
      };
      values: {
        region: string;
        country: string;
        remote: string;
        seniority: string;
        company: string;
        global: string;
      };
      colorPurposes: {
        canvas: string;
        paper: string;
        surface: string;
        elevated: string;
        overlay: string;
        foreground: string;
        muted: string;
        line: string;
        primary: string;
        lavender: string;
        mint: string;
        peach: string;
        status: string;
      };
    };
  };
}
