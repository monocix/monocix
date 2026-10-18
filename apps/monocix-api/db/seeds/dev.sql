-- Dev seed: a single tenant for local development.
-- Idempotent: safe to run multiple times; existing slug is skipped.
INSERT INTO tenants (id, name, slug, is_active)
VALUES ('11111111-2222-4333-8444-555555555555', 'Demo Tenant', 'demo', TRUE)
ON CONFLICT (slug) DO NOTHING;
