# KonnectHere - 4-Week Milestone Plan

## Week 1 - Repo Scaffold ✅ COMPLETED

### Deliverables
- [x] Next.js app with TypeScript + Tailwind CSS
- [x] NextAuth configuration (Email + LinkedIn/Google OAuth)
- [x] Prisma schema with all required models
- [x] Basic UI pages (job listing, detail, post form, apply flow)
- [x] S3 signed upload for resumes
- [x] Docker configuration
- [x] GitHub Actions CI/CD pipeline

### Acceptance Criteria
✅ Can register user (email + OAuth)  
✅ Can create company (employer)  
✅ Can post a job  
✅ Can upload resume (S3)  
✅ Can apply to job  

### Files Created
- Complete Next.js app structure
- Prisma schema with 10+ models
- API routes for all core operations
- Authentication pages
- Employer and candidate dashboards
- Docker and CI/CD configuration

---

## Week 2 - Search & Indexing

### Deliverables
- [x] Postgres full-text search implementation
- [x] Algolia indexing hooks (server-side)
- [x] Algolia sync on job CRUD events
- [x] Instant search UI with suggestions
- [x] Faceted search (location, role, experience, remote, salary)
- [x] Debounced client-side queries

### Tasks
1. **Postgres Full-Text Search**
   - Add `tsvector` columns to Job model
   - Create GIN indexes
   - Implement search query builder
   - Add search endpoint with filters

2. **Algolia Integration**
   - Install Algolia client
   - Create indexing service
   - Add hooks to job create/update/delete
   - Implement batch indexing

3. **Search UI**
   - Create search component with autocomplete
   - Implement facet filters
   - Add debounced search input
   - Display search results with pagination

### Acceptance Criteria
- Search results return within 100ms in dev
- Facets filter results correctly
- Algolia syncs on job changes
- Fallback to Postgres if Algolia unavailable

### API Endpoints
- `GET /api/search?q=...` - Search with filters
- `POST /api/search/reindex` - Manual reindex (admin)

---

## Week 3 - Integrations & Employer Features

### Deliverables
- [x] LinkedIn Share integration (OAuth + API)
- [x] Manual LinkedIn post generator (fallback)
- [x] Employer dashboard enhancements
- [x] Application management (view, download, shortlist)
- [ ] Email notifications for applications
- [x] Social sharing UI

### Tasks
1. **LinkedIn Integration**
   - LinkedIn OAuth flow for employers
   - Store LinkedIn access tokens
   - Implement job posting API (if available)
   - Create manual share post generator
   - Add share buttons to job pages

2. **Employer Dashboard**
   - Application list with filters
   - Resume download (S3 presigned URLs)
   - Shortlist/reject actions
   - Application status updates
   - Email notifications

3. **Social Sharing**
   - Twitter/X share button
   - Facebook share button
   - LinkedIn share button
   - Generate shareable post content

### Acceptance Criteria
- Employer can push job to LinkedIn (or generate shareable post)
- Can view and manage applications
- Can download resumes securely
- Email notifications sent on new applications

### API Endpoints
- `POST /api/jobs/[id]/share/linkedin` - Share to LinkedIn
- `GET /api/resumes/[id]/download` - Get resume download URL
- `PATCH /api/applications/[id]` - Update application status
- `POST /api/applications/[id]/message` - Send employer message via email

### Notes
- LinkedIn Jobs API requires partnership - provide manual fallback
- Document API requirements and limitations

---

## Week 4 - Resume Parsing & Recommendations

### Deliverables
- [x] Resume parser microservice (Python FastAPI)
- [ ] Auto-fill candidate profile from resume
- [ ] Basic recommendation engine (TF-IDF)
- [ ] Recommendations card on candidate dashboard
- [ ] Job matching algorithm

### Tasks
1. **Resume Parser Service**
   - Implemented in `services/resume-parser` (FastAPI + pdfplumber)
   - Supports POST `/parse` with `{ "file_url": "https://..." }` payload
   - Returns basic PII, skills, experience heuristics
   - To run locally: `pip install -r services/resume-parser/requirements.txt && uvicorn main:app --reload --port 8001`
   - Deploy via lightweight Docker image or container service

2. **Profile Auto-Fill**
   - Call parser service on resume upload
   - Update user profile with parsed data
   - Allow manual override
   - Store raw parsed data

3. **Recommendation Engine**
   - Compute TF-IDF vectors for jobs and profiles
   - Calculate cosine similarity
   - Return top 10 matches
   - Cache recommendations

4. **Candidate Dashboard**
   - Display recommended jobs
   - Show match score
   - Allow filtering by match score
   - "Not interested" feedback

### Acceptance Criteria
- Resume parser extracts key fields accurately
- Profile auto-filled from sample resume
- Recommendations card shows relevant jobs
- Match scores are meaningful

### API Endpoints
- `POST /api/resumes/[id]/parse` - Parse resume
- `GET /api/recommendations` - Get job recommendations
- `POST /api/recommendations/[jobId]/feedback` - Provide feedback

### Microservice
- `POST /parse` - Parse resume PDF
- Returns: `{ name, email, phone, skills[], title, experience, education, raw }`

---

## Ongoing Tasks

### Monitoring & Analytics
- [ ] Set up Sentry for error tracking
- [ ] Integrate Segment/GA4 for analytics
- [ ] Set up Prometheus/Grafana for infra metrics
- [ ] Add performance monitoring

### Billing (Stripe)
- [ ] Stripe integration
- [ ] Paid job listings
- [ ] Subscription plans for employers
- [ ] Payment webhooks
- [ ] Billing dashboard

### Security Enhancements
- [ ] Rate limiting on APIs
- [ ] OWASP security review
- [ ] Dependency scanning (Dependabot)
- [ ] Security headers
- [ ] CSRF protection

### GDPR Compliance
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Data export functionality
- [ ] Account deletion
- [ ] Cookie consent

### Testing
- [ ] Unit tests for API routes
- [ ] E2E tests (Playwright/Cypress)
- [ ] Test coverage > 80%
- [ ] Security testing

---

## GitHub Issues Template

### Issue Template: Feature
```markdown
## Description
Brief description of the feature

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Notes
Any technical considerations

## Related
Links to related issues/PRs
```

### Issue Template: Bug
```markdown
## Description
What happened?

## Steps to Reproduce
1. Step 1
2. Step 2

## Expected Behavior
What should happen?

## Environment
- Node version
- Browser
- OS
```

---

## PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass
- [ ] Linter passes
```

---

## Code Review Checklist

- [ ] Code follows project conventions
- [ ] No security vulnerabilities
- [ ] Error handling is appropriate
- [ ] Database queries are optimized
- [ ] API responses are properly formatted
- [ ] Environment variables are documented
- [ ] No hardcoded secrets
- [ ] Tests are included
- [ ] Documentation is updated
- [ ] Migration scripts are included (if DB changes)


