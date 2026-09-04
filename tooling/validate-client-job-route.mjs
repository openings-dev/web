import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile("app/jobs/page.tsx", "utf8");
const client = await readFile("app/jobs/_components/client-job-page.tsx", "utf8");
const redirects = await readFile("public/_redirects", "utf8");
const authorClient = await readFile("app/entity/author/client-author-page.tsx", "utf8");
const communityClient = await readFile("app/entity/community/client-community-page.tsx", "utf8");

assert.match(page, /ClientJobPage/u);
assert.match(client, /window\.location\.pathname/u);
assert.match(client, /fetchOpportunityById/u);
assert.match(client, /decodeURIComponent/u);
assert.match(client, /OpportunityDetails/u);
assert.match(client, /OpportunitySelectionStatus\.Loading/u);
assert.match(client, /OpportunitySelectionStatus\.NotFound/u);
assert.match(redirects, /^\/jobs\/\*\s+\/jobs\/\s+200$/mu);
assert.match(redirects, /^\/authors\/\s+\/route-indexes\/authors\/\s+200$/mu);
assert.match(redirects, /^\/users\/\s+\/route-indexes\/users\/\s+200$/mu);
assert.match(redirects, /^\/communities\/\s+\/route-indexes\/communities\/\s+200$/mu);
assert.match(redirects, /^\/community\/\s+\/route-indexes\/community\/\s+200$/mu);
assert.match(redirects, /^\/authors\/\*\s+\/entity\/author\/\s+200$/mu);
assert.match(redirects, /^\/users\/\*\s+\/entity\/author\/\s+200$/mu);
assert.match(redirects, /^\/communities\/\*\s+\/entity\/community\/\s+200$/mu);
assert.match(redirects, /^\/community\/\*\s+\/entity\/community\/\s+200$/mu);
assert.match(authorClient, /window\.location\.pathname/u);
assert.match(authorClient, /fetchAuthorArtifact/u);
assert.doesNotMatch(authorClient, /getSnapshotUserByHandle/u);
assert.match(authorClient, /ShareableProfileKind\.Publisher/u);
assert.match(communityClient, /window\.location\.pathname/u);
assert.match(communityClient, /getSnapshotCommunityByRepository/u);
assert.match(communityClient, /ShareableProfileKind\.Community/u);

console.log("Client-rendered direct job route contract is valid.");
