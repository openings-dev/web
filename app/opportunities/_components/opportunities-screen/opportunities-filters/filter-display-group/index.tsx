import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select/select-content";
import { SelectItem } from "@/components/ui/select/select-item";
import { SelectTrigger } from "@/components/ui/select/select-trigger";
import { SelectValue } from "@/components/ui/select/select-value";
import { FilterSection } from "../filter-section";
import {
  OpportunitySortOrder,
  type OpportunityFiltersState,
} from "@/app/opportunities/_components/opportunities-screen/types";

interface FilterDisplayGroupProps {
  state: OpportunityFiltersState;
  labels: {
    section: string;
    sort: string;
    sortPlaceholder: string;
    sortRecent: string;
    sortOldest: string;
    sortRelevance: string;
    sortUpdated: string;
    sortSalary: string;
  };
  onSortOrderChange: (value: OpportunitySortOrder) => void;
  portalContainer?: HTMLElement | null;
}

export function FilterDisplayGroup({
  state,
  labels,
  onSortOrderChange,
  portalContainer,
}: FilterDisplayGroupProps): React.ReactNode {
  return (
    <FilterSection label={labels.section}>
      <div className="grid grid-cols-1 gap-3">
        <Field label={labels.sort}>
          {(controlProps) => (
            <Select value={state.sortOrder} onValueChange={onSortOrderChange}>
              <SelectTrigger {...controlProps}>
                <SelectValue placeholder={labels.sortPlaceholder} />
              </SelectTrigger>
              <SelectContent portalContainer={portalContainer ?? undefined}>
                {state.searchText.trim() ? <SelectItem value={OpportunitySortOrder.Relevance}>{labels.sortRelevance}</SelectItem> : null}
                <SelectItem value={OpportunitySortOrder.Recent}>{labels.sortRecent}</SelectItem>
                <SelectItem value={OpportunitySortOrder.Oldest}>{labels.sortOldest}</SelectItem>
                <SelectItem value={OpportunitySortOrder.Updated}>{labels.sortUpdated}</SelectItem>
                <SelectItem value={OpportunitySortOrder.Salary}>{labels.sortSalary}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </Field>
      </div>
    </FilterSection>
  );
}
