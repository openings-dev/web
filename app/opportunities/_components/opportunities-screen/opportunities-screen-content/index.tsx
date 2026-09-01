import * as React from "react";
import { OpportunitiesFilters } from "@/app/opportunities/_components/opportunities-screen/opportunities-filters";
import { OpportunitiesList } from "@/app/opportunities/_components/opportunities-screen/opportunities-list";
import { OpportunitiesQuickFilters } from "@/app/opportunities/_components/opportunities-screen/opportunities-quick-filters";
import { OpportunitiesToolbar } from "@/app/opportunities/_components/opportunities-screen/opportunities-toolbar";
import { OpportunityDrawer } from "@/app/opportunities/_components/opportunities-screen/opportunity-drawer";
import {
  opportunitiesBodyStyles,
  opportunitiesMainStyles,
} from "@/app/opportunities/_components/opportunities-screen/styles";
import { useOpportunitiesScreenController } from "@/app/opportunities/_components/opportunities-screen/controller/use-opportunities-screen-controller";
import { ComparisonPanel } from "@/app/opportunities/_components/opportunities-screen/comparison-panel";
import { NewForYou } from "@/app/opportunities/_components/opportunities-screen/new-for-you";

interface OpportunitiesScreenContentProps {
  controller: ReturnType<typeof useOpportunitiesScreenController>;
}

export function OpportunitiesScreenContent({
  controller,
}: OpportunitiesScreenContentProps): React.ReactNode {
  return (
    <>
      <OpportunitiesQuickFilters
        filters={controller.normalizedFilters}
        options={controller.options}
        activeFiltersCount={controller.activeFiltersCount}
        advancedFiltersOpen={controller.filtersModalOpen}
        onOpenAdvancedFilters={() => controller.setFiltersModalOpen(true)}
        onFieldChange={controller.handleFieldChange}
        onSearchSubmitted={controller.handleSearchSubmitted}
        onClearFilters={controller.handleClearFilters}
        forcedScope={controller.forcedScope}
      />

      <NewForYou
        previousVisitAt={controller.previousVisitAt}
        hasPersistedPreferences={controller.hasPersistedPreferences}
        hasForcedScope={Boolean(controller.forcedScope)}
        newOnly={controller.normalizedFilters.newOnly}
        onShowNew={() => controller.handleFieldChange("newOnly", true)}
      />

      <div className={opportunitiesBodyStyles}>
        <div className={opportunitiesMainStyles}>
          <OpportunitiesToolbar
            rangeLabel={controller.rangeLabel}
            resultCount={controller.totalCount}
            lastUpdatedAt={controller.lastUpdatedAt}
            isLoading={controller.isLoading}
            hasLoadError={controller.hasLoadError}
            sortOrder={controller.normalizedFilters.sortOrder}
            searchActive={Boolean(controller.normalizedFilters.searchText.trim())}
            viewMode={controller.normalizedFilters.viewMode}
            shareableDiscovery={controller.hasActiveFilters}
            onSortOrderChange={(value) => controller.handleFieldChange("sortOrder", value)}
            onViewModeChange={(value) => controller.handleFieldChange("viewMode", value)}
          />

          <OpportunitiesList
            items={controller.visibleOpportunities}
            viewMode={controller.normalizedFilters.viewMode}
            selectedOpportunityId={controller.selectedOpportunityId}
            isLoading={controller.isLoading}
            hasLoadError={controller.hasLoadError}
            hasLoadMoreError={controller.hasLoadMoreError}
            isFetchingMore={controller.isFetchingMore}
            hasMore={controller.hasMore}
            hasActiveFilters={controller.hasActiveFilters}
            skeletonCount={Math.min(controller.normalizedFilters.itemsPerPage, 8)}
            onLoadMore={controller.handleLoadMore}
            onClearFilters={controller.handleClearFilters}
            onSelectOpportunity={(item) => {
              controller.markViewed(item.id);
              controller.setSelectedOpportunityId(item.id);
            }}
            onCommunitySelect={controller.onCommunitySelect}
            onAuthorSelect={controller.onAuthorSelect}
            hideCommunityIdentity={controller.hideCommunityIdentity}
            hideAuthorIdentity={controller.hideAuthorIdentity}
            savedIds={controller.savedIds}
            comparisonIds={controller.comparisonIds}
            previousVisitAt={controller.previousVisitAt}
            viewedIds={controller.viewedIds}
            onToggleSaved={controller.toggleSaved}
            onToggleComparison={controller.toggleComparison}
          />

          <OpportunityDrawer
            item={controller.selectedOpportunity}
            open={controller.isDetailsOpen}
            selectedOpportunityId={controller.selectedOpportunityId}
            selectionStatus={controller.selectionStatus}
            hideCommunityIdentity={controller.hideCommunityIdentity}
            hideAuthorIdentity={controller.hideAuthorIdentity}
            onClose={controller.closeSelectedOpportunity}
            onCommunitySelect={controller.onCommunitySelect}
            onAuthorSelect={controller.onAuthorSelect}
            savedIds={controller.savedIds}
            onToggleSaved={controller.toggleSaved}
          />
        </div>
      </div>

      <OpportunitiesFilters
        state={controller.normalizedFilters}
        options={controller.options}
        open={controller.filtersModalOpen}
        resultCount={controller.totalCount}
        isLoading={controller.isLoading}
        hasLoadError={controller.hasLoadError}
        hasLoadMoreError={controller.hasLoadMoreError}
        activeFiltersCount={controller.activeFiltersCount}
        onOpenChange={controller.setFiltersModalOpen}
        onFieldChange={controller.handleFieldChange}
        onToggleTag={controller.handleToggleTag}
        onToggleAuthor={controller.handleToggleAuthor}
        onClearFilters={controller.handleClearFilters}
        forcedScope={controller.forcedScope}
      />
      <ComparisonPanel
        items={controller.comparisonItems}
        onRemove={controller.removeComparison}
        onClear={controller.clearComparison}
      />
    </>
  );
}
