## Search & Indexing Overview

KonnectHere provides instant, typo-tolerant job search with an Algolia-first strategy and a PostgreSQL full-text fallback. The system is designed so that search works even if Algolia credentials are not configured.

### Architecture

1. **Job CRUD / Events**
   - Each job create/update/delete operation triggers `syncJobToAlgolia(jobId)` or `removeJobFromAlgolia(jobId)`.
   - `syncJobToAlgolia` keeps the `SearchIndex` table updated (used for Postgres fallback) and pushes records to Algolia when credentials exist.

2. **Search API (`GET /api/search`)**
   - If Algolia credentials are set, queries run against Algolia with facet filters + typo tolerance.
   - Otherwise, PostgreSQL `to_tsvector`/`to_tsquery` powers full-text search + facet aggregation.
   - Responses are normalized: `{ jobs, source, pagination, facets }`.

3. **Instant Search UI**
   - The jobs listing page uses a 250 ms debounce and calls `/api/search` with all filters.
   - Results surface predictive suggestions, clickable facets, salary/remote filters, and a badge showing which engine served the query.

### Algolia Setup

1. Create an Algolia application + index (e.g., `konnecthere_jobs`).
2. Add environment variables: `ALGOLIA_APP_ID`, `ALGOLIA_API_KEY`, `ALGOLIA_INDEX_NAME`.
3. Recommended index settings:
   - `searchableAttributes`: `title`, `description`, `requirements`, `companyName`, `location`
   - `attributesForFaceting`: `facets.location`, `facets.remote`, `facets.employmentType`, `facets.experienceLevel`, `facets.salaryRange`
   - `customRanking`: `desc(createdAt)`
4. Trigger a full reindex: `POST /api/search/reindex` (restricted to `ADMIN` users).

### PostgreSQL Full-Text Fallback

- Uses `to_tsvector('english', title || description || requirements)` inline (no extra columns required).
- Ordered via `ts_rank` while honoring the same filters as Algolia.
- `SearchIndex` remains populated so we can later add GIN indexes if needed.

### Operational Notes

- **Background jobs**: Search syncing currently runs fire-and-forget inside API handlers. Move to a queue (BullMQ/Temporal) for higher throughput.
- **Rate limiting**: Consider CDN- or middleware-level caching/rate limiting for `/api/search` to manage Algolia costs.
- **Monitoring**: Log/alert on Algolia sync failures (Sentry) and track Postgres query latency.
- **Manual reindex**: `POST /api/search/reindex` wipes `SearchIndex`, rebuilds it, and bulk syncs Algolia.

### Testing Checklist

1. With Algolia credentials:
   - CRUD jobs and confirm Algolia dashboard reflects changes.
   - Verify instant suggestions + facets respond in real time.
2. Without Algolia credentials:
   - Remove `ALGOLIA_*` env vars and ensure `/api/search` automatically falls back to Postgres.
   - Confirm UI still renders fast, facets update, and the source badge shows `postgres`.

### Future Enhancements

- Move sync operations to a dedicated worker queue.
- Persist aggregated facet metadata for faster global counts.
- Log search analytics (Algolia Insights or Segment) for product insights.
- Add advanced filters (company size, visa support, salary buckets) once more data is available.
