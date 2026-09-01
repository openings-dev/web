import { resultsGridStyles } from "@/app/opportunities/_components/opportunities-screen/styles";
import type {
  OpportunityItem,
  OpportunityViewMode,
} from "@/app/opportunities/_components/opportunities-screen/types";
import { OpportunityCard } from "@/app/opportunities/_components/opportunities-screen/opportunity-card";

interface ResultsGridProps {
  items: OpportunityItem[];
  viewMode: OpportunityViewMode;
  selectedOpportunityId: string | null;
  onSelectOpportunity: (item: OpportunityItem) => void;
  onCommunitySelect: (repository: string) => void;
  onAuthorSelect: (authorHandle: string) => void;
  hideCommunityIdentity: boolean;
  hideAuthorIdentity: boolean;
  savedIds: ReadonlySet<string>;
  comparisonIds: ReadonlySet<string>;
  previousVisitAt: string | null;
  viewedIds: ReadonlySet<string>;
  onToggleSaved: (id: string) => void;
  onToggleComparison: (item: OpportunityItem) => void;
}

export function ResultsGrid({
  items,
  viewMode,
  selectedOpportunityId,
  onSelectOpportunity,
  onCommunitySelect,
  onAuthorSelect,
  hideCommunityIdentity,
  hideAuthorIdentity,
  savedIds,
  comparisonIds,
  previousVisitAt,
  viewedIds,
  onToggleSaved,
  onToggleComparison,
}: ResultsGridProps): React.ReactNode {
  return (
    <ul className={resultsGridStyles({ viewMode })}>
      {items.map((item) => (
        <li key={item.id} className="min-w-0">
          <OpportunityCard
            item={item}
            viewMode={viewMode}
            isSelected={selectedOpportunityId === item.id}
            onSelectOpportunity={onSelectOpportunity}
            onCommunitySelect={onCommunitySelect}
            onAuthorSelect={onAuthorSelect}
            hideCommunityIdentity={hideCommunityIdentity}
            hideAuthorIdentity={hideAuthorIdentity}
            savedIds={savedIds}
            comparisonIds={comparisonIds}
            previousVisitAt={previousVisitAt}
            viewedIds={viewedIds}
            onToggleSaved={onToggleSaved}
            onToggleComparison={onToggleComparison}
          />
        </li>
      ))}
    </ul>
  );
}
