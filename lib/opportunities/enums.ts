export enum OpportunityIssueState {
  Open = "open",
  Closed = "closed",
}

export enum OpportunitySalaryPeriod {
  Month = "month",
  Year = "year",
  Hour = "hour",
}

export enum OpportunitySortOrder {
  Relevance = "relevance",
  Recent = "recent",
  Oldest = "oldest",
  Updated = "updated",
  Salary = "salary",
}

export enum TechnologyMatchMode {
  Any = "any",
  All = "all",
}

export enum OpportunitySourceType {
  GithubIssue = "github-issue",
  GithubDiscussion = "github-discussion",
  CommunityBoard = "community-board",
}

export enum OpportunityViewMode {
  List = "list",
  Grid = "grid",
}
