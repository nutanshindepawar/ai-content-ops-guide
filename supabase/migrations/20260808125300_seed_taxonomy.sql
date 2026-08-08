-- Seed: 12 phases + first 4 processes each, from the user-supplied taxonomy
-- seed file ("AI Content Ops Phases.pdf"). Phase description/often_overlooked
-- text is copied verbatim from that file. Process-level description/
-- often_overlooked was NOT supplied for any process, so those columns are
-- left null on every process row — the admin UI should offer an "add
-- description" affordance wherever these are null, rather than the app
-- inventing copy.
--
-- Phase 5's process list intentionally uses the seed file's 4 names
-- (Prepare Content Guidelines / Develop Content Angle & Key Message /
-- Create Content Outline / Create Content Brief) rather than the build
-- spec's longer 11-item *example* list for Phase 5, per explicit
-- confirmation that the seed file is the authoritative taxonomy source.

insert into public.phases (number, slug, name, description, often_overlooked) values
(1, 'business-strategy', 'Business Strategy',
 'Content should start with the business goal, not a keyword or content idea. Ask: Why are we creating content?',
 'Deciding what the content needs to achieve: pipeline, product adoption, fundraising, category positioning, customer retention, or brand authority.'),

(2, 'market-customer-intelligence', 'Market & Customer Intelligence',
 'Understand what is happening in the market and what customers actually care about before deciding what to say. Ask: What do the market and customers need?',
 'Continuously tracking competitor moves, customer language, industry shifts, sales objections, product gaps, and emerging conversations, not just doing keyword research.'),

(3, 'content-strategy-planning', 'Content Strategy & Planning',
 'Turn business priorities and market insights into a clear content direction: what content to create, for whom, why, when, and in which format or channel.',
 'Planning around product launches, events, fundraising, seasonal hospitality trends, sales priorities, and content gaps instead of simply filling a monthly calendar. The right format should be chosen based on the business goal, buyer stage, and message, whether that is a blog, LinkedIn post, case study, report, whitepaper, landing page, or video.'),

(4, 'knowledge-capture-research', 'Knowledge Capture & Research',
 'Great B2B content usually comes from knowledge already sitting inside the company, not from AI or Google alone. Ask: What does your company already know?',
 'Extracting expertise from founders, product teams, sales calls, customer conversations, webinars, support teams, and event discussions before starting to write.'),

(5, 'content-design-brief-creation', 'Content Design & Brief Creation',
 'Decide what the content should accomplish and what information it needs before production begins. A good brief covers the audience, purpose, format, key argument, evidence, SME input, CTA, visuals, and distribution plan. Ask: What exactly are we going to create?',
 'Designing the content before writing it.'),

(6, 'content-production', 'Content Production',
 'Turn research and expertise into the right asset: website pages, blogs, LinkedIn posts, reports, whitepapers, case studies, visuals, and other formats. Ask: How do we produce the asset?',
 'Choosing the format based on the job to be done. Not every insight should become a blog, and not every product announcement deserves a LinkedIn post.'),

(7, 'review-qa-compliance', 'Review, QA & Compliance',
 'Content needs more than a grammar check. It needs fact checking, brand consistency, product accuracy, SEO/AEO review, links, claims, sources, and sometimes legal or compliance approval. Ask: Is it accurate, useful, on-brand, and safe?',
 'Creating a consistent QA system so quality doesn''t depend entirely on one senior person catching mistakes at the end.'),

(8, 'repurposing-content-reuse', 'Repurposing & Content Reuse',
 'Strong content should create more than one asset and should be updated. A customer interview, research report, or webinar can become blogs, LinkedIn posts, case studies, sales material, and website content. Ask: How can we get more value from it?',
 'Planning the content asset ecosystem before production, instead of remembering to repurpose something weeks after it is published.'),

(9, 'cms-content-library', 'CMS & Content Library',
 'Content needs a home where teams can find, update, reuse, and manage it. Ask: Where does the knowledge/content live?',
 'Treating old content, research, interviews, images, approved messaging, and previous campaigns as reusable company assets rather than letting them disappear across folders and tools.'),

(10, 'distribution-activation', 'Distribution & Activation',
 'Creating content is only half the job. Decide how each asset reaches the right audience through the website, founder/company LinkedIn, sales teams, email, events, and other relevant channels. Ask: How do we get it to the right audience?',
 'Matching distribution to the business purpose and audience, rather than automatically publishing everything everywhere.'),

(11, 'performance-learning-optimization', 'Performance, Learning & Optimization',
 'Measure whether content actually worked, then use those insights to improve the next cycle. Ask: Did it work?',
 'Looking beyond traffic and likes to signals such as qualified leads, sales usage, conversions, pipeline influence, search visibility, AI citations, and content-assisted revenue.'),

(12, 'knowledge-base-updates', 'Knowledge Base Updates',
 'Every content cycle creates new knowledge: customer questions, winning messages, objections, research, performance insights, and new industry information. Feed these back into the company''s AI and content systems. Ask: What did we learn and how does it improve the next cycle?',
 'Updating the underlying knowledge base. Without this feedback loop, AI keeps producing content from yesterday''s information.');

-- Processes: 4 per phase, from the seed file. description/often_overlooked
-- intentionally left null (not supplied) — see comment at top of file.

insert into public.processes (phase_id, number, slug, name)
select p.id, v.number, v.slug, v.name
from (values
  -- 01. Business Strategy
  ('business-strategy', 1, 'define-business-objectives', 'Define Business Objectives'),
  ('business-strategy', 2, 'define-contents-business-role', 'Define Content''s Business Role'),
  ('business-strategy', 3, 'set-content-priorities', 'Set Content Priorities'),
  ('business-strategy', 4, 'define-success-metrics', 'Define Success Metrics'),

  -- 02. Market & Customer Intelligence
  ('market-customer-intelligence', 1, 'customer-audience-research', 'Customer & Audience Research'),
  ('market-customer-intelligence', 2, 'competitor-intelligence', 'Competitor Intelligence'),
  ('market-customer-intelligence', 3, 'seo-search-research', 'SEO & Search Research'),
  ('market-customer-intelligence', 4, 'customer-questions-objections-pain-points', 'Customer Questions, Objections & Pain Points'),

  -- 03. Content Strategy & Planning
  ('content-strategy-planning', 1, 'define-content-pillars-themes', 'Define Content Pillars & Themes'),
  ('content-strategy-planning', 2, 'identify-content-opportunities-gaps', 'Identify Content Opportunities & Gaps'),
  ('content-strategy-planning', 3, 'select-content-formats-channels', 'Select Content Formats & Channels'),
  ('content-strategy-planning', 4, 'build-content-plan-calendar', 'Build Content Plan & Calendar'),

  -- 04. Knowledge Capture & Research
  ('knowledge-capture-research', 1, 'capture-sme-founder-knowledge', 'Capture SME & Founder Knowledge'),
  ('knowledge-capture-research', 2, 'capture-sales-customer-insights', 'Capture Sales & Customer Insights'),
  ('knowledge-capture-research', 3, 'gather-internal-documents-existing-knowledge', 'Gather Internal Documents & Existing Knowledge'),
  ('knowledge-capture-research', 4, 'conduct-external-research-source-collection', 'Conduct External Research & Source Collection'),

  -- 05. Content Design & Brief Creation (seed file's 4 — authoritative per confirmation)
  ('content-design-brief-creation', 1, 'prepare-content-guidelines', 'Prepare Content Guidelines'),
  ('content-design-brief-creation', 2, 'develop-content-angle-key-message', 'Develop Content Angle & Key Message'),
  ('content-design-brief-creation', 3, 'create-content-outline', 'Create Content Outline'),
  ('content-design-brief-creation', 4, 'create-content-brief', 'Create Content Brief'),

  -- 06. Content Production
  ('content-production', 1, 'blog-website-content', 'Blog & Website Content'),
  ('content-production', 2, 'social-linkedin-content', 'Social & LinkedIn Content'),
  ('content-production', 3, 'reports-whitepapers-case-studies', 'Reports, Whitepapers & Case Studies'),
  ('content-production', 4, 'visual-multimedia-content', 'Visual & Multimedia Content'),

  -- 07. Review, QA & Compliance
  ('review-qa-compliance', 1, 'editorial-brand-review', 'Editorial & Brand Review'),
  ('review-qa-compliance', 2, 'fact-checking-source-verification', 'Fact Checking & Source Verification'),
  ('review-qa-compliance', 3, 'seo-aeo-review', 'SEO & AEO Review'),
  ('review-qa-compliance', 4, 'legal-product-compliance-review', 'Legal, Product & Compliance Review'),

  -- 08. Repurposing & Content Reuse
  ('repurposing-content-reuse', 1, 'identify-repurposing-opportunities', 'Identify Repurposing Opportunities'),
  ('repurposing-content-reuse', 2, 'long-form-to-short-form-content', 'Long-form → Short-form Content'),
  ('repurposing-content-reuse', 3, 'cross-channel-content-adaptation', 'Cross-channel Content Adaptation'),
  ('repurposing-content-reuse', 4, 'update-reuse-existing-content', 'Update & Reuse Existing Content'),

  -- 09. CMS & Content Library
  ('cms-content-library', 1, 'content-organization-tagging', 'Content Organization & Tagging'),
  ('cms-content-library', 2, 'content-storage-retrieval', 'Content Storage & Retrieval'),
  ('cms-content-library', 3, 'content-audits-lifecycle-management', 'Content Audits & Lifecycle Management'),
  ('cms-content-library', 4, 'content-reuse-knowledge-discovery', 'Content Reuse & Knowledge Discovery'),

  -- 10. Distribution & Activation
  ('distribution-activation', 1, 'content-publishing-management', 'Content Publishing & Management'),
  ('distribution-activation', 2, 'website-search-distribution', 'Website & Search Distribution'),
  ('distribution-activation', 3, 'social-founder-distribution', 'Social & Founder Distribution'),
  ('distribution-activation', 4, 'email-sales-event-activation', 'Email, Sales & Event Activation'),

  -- 11. Performance, Learning & Optimization
  ('performance-learning-optimization', 1, 'content-performance-measurement', 'Content Performance Measurement'),
  ('performance-learning-optimization', 2, 'seo-search-visibility-analysis', 'SEO & Search Visibility Analysis'),
  ('performance-learning-optimization', 3, 'business-revenue-impact-analysis', 'Business & Revenue Impact Analysis'),
  ('performance-learning-optimization', 4, 'content-optimization-experimentation', 'Content Optimization & Experimentation'),

  -- 12. Knowledge Base Updates
  ('knowledge-base-updates', 1, 'capture-new-customer-market-insights', 'Capture New Customer & Market Insights'),
  ('knowledge-base-updates', 2, 'update-company-knowledge-base', 'Update Company Knowledge Base'),
  ('knowledge-base-updates', 3, 'update-ai-prompts-agents-workflows', 'Update AI Prompts, Agents & Workflows'),
  ('knowledge-base-updates', 4, 'feed-performance-learnings-back-into-strategy', 'Feed Performance Learnings Back Into Strategy')
) as v(phase_slug, number, slug, name)
join public.phases p on p.slug = v.phase_slug;
