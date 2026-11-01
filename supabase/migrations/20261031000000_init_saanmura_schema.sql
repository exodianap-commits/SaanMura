-- =========================================================================
-- SAANMURA (PRICEWATCH PH) COMPLETE DATABASE SCHEMA & SECURITY POLICIES
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Types & Enums
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('contributor', 'verifier', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contributor_tier_enum AS ENUM ('tier_1_scout', 'tier_2_palengke_verifier', 'tier_3_inspector');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE submission_status_enum AS ENUM ('pending', 'approved', 'rejected', 'needs_clarification');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE store_type_enum AS ENUM ('supermarket', 'wet_market', 'grocery', 'convenience', 'wholesale');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    philsys_id TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    phone_number TEXT,
    avatar_url TEXT,
    role user_role_enum NOT NULL DEFAULT 'contributor',
    tier contributor_tier_enum NOT NULL DEFAULT 'tier_1_scout',
    trust_score NUMERIC(5,2) NOT NULL DEFAULT 95.00,
    xp_points INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. USER ROLES AUDIT TABLE
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role_enum NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    granted_by UUID REFERENCES public.profiles(id)
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. BRANDS TABLE
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. UNITS TABLE
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    abbreviation TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    barcode TEXT NOT NULL UNIQUE,
    description TEXT,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    package_quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE RESTRICT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    lowest_verified_price NUMERIC(10,2),
    highest_verified_price NUMERIC(10,2),
    average_verified_price NUMERIC(10,2),
    stores_count INTEGER NOT NULL DEFAULT 0,
    last_observed_at TIMESTAMPTZ,
    srp_price NUMERIC(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Full text search and barcode indexes
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin(to_tsvector('english', name));

-- 7. STORES TABLE
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    branch_name TEXT,
    store_type store_type_enum NOT NULL DEFAULT 'supermarket',
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    latitude NUMERIC(10,7) NOT NULL,
    longitude NUMERIC(10,7) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(name, branch_name, city)
);

CREATE INDEX IF NOT EXISTS idx_stores_city ON public.stores(city);
CREATE INDEX IF NOT EXISTS idx_stores_coords ON public.stores(latitude, longitude);

-- 8. PRODUCT SUBMISSIONS TABLE (New products submitted by contributors)
CREATE TABLE IF NOT EXISTS public.product_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contributor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    barcode TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id),
    brand_id UUID REFERENCES public.brands(id),
    package_quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit_id UUID NOT NULL REFERENCES public.units(id),
    image_url TEXT,
    description TEXT,
    initial_store_id UUID NOT NULL REFERENCES public.stores(id),
    initial_price NUMERIC(10,2) NOT NULL,
    observation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    receipt_image_url TEXT,
    remarks TEXT,
    status submission_status_enum NOT NULL DEFAULT 'pending',
    verifier_id UUID REFERENCES public.profiles(id),
    verifier_remarks TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_product_submissions_status ON public.product_submissions(status);
CREATE INDEX IF NOT EXISTS idx_product_submissions_contributor ON public.product_submissions(contributor_id);

-- 9. PRICE SUBMISSIONS TABLE (Observed price changes for existing products)
CREATE TABLE IF NOT EXISTS public.price_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
    contributor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    observed_price NUMERIC(10,2) NOT NULL,
    previous_verified_price NUMERIC(10,2),
    price_difference NUMERIC(10,2),
    percentage_change NUMERIC(6,2),
    observation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    evidence_image_url TEXT,
    receipt_image_url TEXT,
    remarks TEXT,
    status submission_status_enum NOT NULL DEFAULT 'pending',
    verifier_id UUID REFERENCES public.profiles(id),
    verifier_remarks TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_price_submissions_status ON public.price_submissions(status);
CREATE INDEX IF NOT EXISTS idx_price_submissions_product ON public.price_submissions(product_id);
CREATE INDEX IF NOT EXISTS idx_price_submissions_contributor ON public.price_submissions(contributor_id);

-- 10. VERIFIED PRICE OBSERVATIONS TABLE (Append-only historical record)
CREATE TABLE IF NOT EXISTS public.verified_price_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
    price NUMERIC(10,2) NOT NULL,
    observation_date DATE NOT NULL,
    contributor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    contributor_display_name TEXT NOT NULL,
    verifier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    verifier_display_name TEXT NOT NULL,
    evidence_image_url TEXT,
    submission_id UUID REFERENCES public.price_submissions(id) ON DELETE SET NULL,
    is_carried_forward BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_vpo_product_store ON public.verified_price_observations(product_id, store_id, observation_date DESC);
CREATE INDEX IF NOT EXISTS idx_vpo_contributor ON public.verified_price_observations(contributor_id);

-- 11. STORE CHANGE SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.store_change_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    contributor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    suggested_name TEXT NOT NULL,
    suggested_branch TEXT,
    suggested_store_type store_type_enum NOT NULL DEFAULT 'supermarket',
    suggested_address TEXT NOT NULL,
    suggested_city TEXT NOT NULL,
    suggested_province TEXT NOT NULL,
    suggested_latitude NUMERIC(10,7) NOT NULL,
    suggested_longitude NUMERIC(10,7) NOT NULL,
    remarks TEXT,
    status submission_status_enum NOT NULL DEFAULT 'pending',
    verifier_id UUID REFERENCES public.profiles(id),
    verifier_remarks TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. TAGS & PRODUCT TAG RELATIONS
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.product_tag_relations (
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY(product_id, tag_id)
);

-- 13. EXTERNAL PRICE REFERENCES (DTI / DA SRP)
CREATE TABLE IF NOT EXISTS public.external_price_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name TEXT NOT NULL,
    agency TEXT NOT NULL,
    bulletin_number TEXT,
    publication_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.external_reference_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.external_price_sources(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    barcode TEXT,
    category TEXT NOT NULL,
    brand TEXT,
    specification TEXT,
    unit TEXT NOT NULL,
    srp_min_price NUMERIC(10,2) NOT NULL,
    srp_max_price NUMERIC(10,2) NOT NULL,
    prevailing_price NUMERIC(10,2),
    effective_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    reference_id UUID,
    reference_type TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);

-- 15. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id),
    actor_role user_role_enum NOT NULL DEFAULT 'contributor',
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_price_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_change_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_price_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_reference_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can read profiles (or public display names)
CREATE POLICY "Profiles readable by all users" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Categories, Brands, Units, Tags: Readable by everyone
CREATE POLICY "Categories readable by all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Brands readable by all" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Units readable by all" ON public.units FOR SELECT USING (true);

-- Products: Everyone can read active products; verifiers/admins can insert/update
CREATE POLICY "Active products readable by all" ON public.products
    FOR SELECT USING (is_active = true OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('verifier', 'admin')));

CREATE POLICY "Verifiers and Admins can update products" ON public.products
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('verifier', 'admin')));

-- Stores: Everyone can read verified stores
CREATE POLICY "Stores readable by all" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Verifiers and Admins can manage stores" ON public.stores
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('verifier', 'admin')));

-- Product Submissions: Contributors view their own; Verifiers & Admins view all
CREATE POLICY "Contributors view own product submissions" ON public.product_submissions
    FOR SELECT USING (auth.uid() = contributor_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('verifier', 'admin')));

CREATE POLICY "Contributors can create product submissions" ON public.product_submissions
    FOR INSERT WITH CHECK (auth.uid() = contributor_id);

CREATE POLICY "Verifiers can update product submissions" ON public.product_submissions
    FOR UPDATE USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('verifier', 'admin')));

-- Price Submissions:
CREATE POLICY "Contributors view own price submissions" ON public.price_submissions
    FOR SELECT USING (auth.uid() = contributor_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('verifier', 'admin')));

CREATE POLICY "Contributors can submit observed prices" ON public.price_submissions
    FOR INSERT WITH CHECK (auth.uid() = contributor_id);

CREATE POLICY "Verifiers can update price submissions" ON public.price_submissions
    FOR UPDATE USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('verifier', 'admin')));

-- Verified Price Observations: Append-only, readable by everyone
CREATE POLICY "Verified observations readable by all" ON public.verified_price_observations
    FOR SELECT USING (true);

-- Store Change Submissions:
CREATE POLICY "View store change submissions" ON public.store_change_submissions
    FOR SELECT USING (auth.uid() = contributor_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('verifier', 'admin')));

CREATE POLICY "Insert store change submissions" ON public.store_change_submissions
    FOR INSERT WITH CHECK (auth.uid() = contributor_id);

CREATE POLICY "Verifiers manage store submissions" ON public.store_change_submissions
    FOR UPDATE USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('verifier', 'admin')));

-- Notifications: Users can only read and update their own notifications
CREATE POLICY "Users read own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- External Reference Prices: Readable by all
CREATE POLICY "External reference prices readable by all" ON public.external_reference_prices
    FOR SELECT USING (true);

-- Audit Logs: Verifiers and Admins only
CREATE POLICY "Audit logs visible to verifiers and admins" ON public.audit_logs
    FOR SELECT USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('verifier', 'admin')));

-- =========================================================================
-- SECURE TRANSACTIONAL APPROVAL FUNCTIONS (RPC)
-- =========================================================================

-- Function 1: Approve Price Submission
CREATE OR REPLACE FUNCTION public.approve_price_submission(
    p_submission_id UUID,
    p_verifier_id UUID,
    p_remarks TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sub RECORD;
    v_contributor RECORD;
    v_verifier RECORD;
    v_product RECORD;
    v_new_lowest NUMERIC(10,2);
    v_stores_count INTEGER;
BEGIN
    -- 1. Fetch submission with row lock
    SELECT * INTO v_sub FROM public.price_submissions WHERE id = p_submission_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Price submission % not found', p_submission_id;
    END IF;

    IF v_sub.status != 'pending' AND v_sub.status != 'needs_clarification' THEN
        RAISE EXCEPTION 'Submission has already been processed (status: %)', v_sub.status;
    END IF;

    -- 2. Anti-Self Approval Check
    IF v_sub.contributor_id = p_verifier_id THEN
        RAISE EXCEPTION 'Civic Protocol Violation: Contributors cannot self-approve their own submissions.';
    END IF;

    -- 3. Fetch Contributor & Verifier profiles
    SELECT display_name, trust_score, xp_points INTO v_contributor FROM public.profiles WHERE id = v_sub.contributor_id;
    SELECT display_name, role INTO v_verifier FROM public.profiles WHERE id = p_verifier_id;

    IF v_verifier.role NOT IN ('verifier', 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: User is not an accredited verifier or administrator.';
    END IF;

    -- 4. Insert into verified_price_observations
    INSERT INTO public.verified_price_observations (
        product_id,
        store_id,
        price,
        observation_date,
        contributor_id,
        contributor_display_name,
        verifier_id,
        verifier_display_name,
        evidence_image_url,
        submission_id,
        is_carried_forward,
        verified_at
    ) VALUES (
        v_sub.product_id,
        v_sub.store_id,
        v_sub.observed_price,
        v_sub.observation_date,
        v_sub.contributor_id,
        v_contributor.display_name,
        p_verifier_id,
        v_verifier.display_name,
        v_sub.evidence_image_url,
        p_submission_id,
        false,
        timezone('utc'::text, now())
    );

    -- 5. Update price_submissions table
    UPDATE public.price_submissions
    SET status = 'approved',
        verifier_id = p_verifier_id,
        verifier_remarks = p_remarks,
        verified_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_submission_id;

    -- 6. Recalculate product aggregates
    SELECT MIN(price), COUNT(DISTINCT store_id)
    INTO v_new_lowest, v_stores_count
    FROM public.verified_price_observations
    WHERE product_id = v_sub.product_id;

    UPDATE public.products
    SET lowest_verified_price = v_new_lowest,
        stores_count = v_stores_count,
        last_observed_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE id = v_sub.product_id;

    -- 7. Award XP to contributor (+25 XP)
    UPDATE public.profiles
    SET xp_points = xp_points + 25,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_sub.contributor_id;

    -- 8. Create notification for contributor
    SELECT name INTO v_product FROM public.products WHERE id = v_sub.product_id;

    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        reference_id,
        reference_type
    ) VALUES (
        v_sub.contributor_id,
        'Price Observation Approved! ✓',
        format('Your observed price of ₱%s for %s has been verified by %s and is now live.', v_sub.observed_price, v_product.name, v_verifier.display_name),
        'submission_approved',
        p_submission_id,
        'price_submission'
    );

    -- 9. Audit log
    INSERT INTO public.audit_logs (
        actor_id,
        actor_role,
        action,
        entity_type,
        entity_id,
        new_values
    ) VALUES (
        p_verifier_id,
        v_verifier.role,
        'APPROVE_PRICE_SUBMISSION',
        'price_submissions',
        p_submission_id::text,
        jsonb_build_object(
            'observed_price', v_sub.observed_price,
            'product_id', v_sub.product_id,
            'contributor_id', v_sub.contributor_id,
            'verifier_remarks', p_remarks
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Price observation approved successfully',
        'submission_id', p_submission_id
    );
END;
$$;

-- Function 2: Reject Price Submission
CREATE OR REPLACE FUNCTION public.reject_price_submission(
    p_submission_id UUID,
    p_verifier_id UUID,
    p_remarks TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sub RECORD;
    v_verifier RECORD;
    v_product RECORD;
BEGIN
    IF p_remarks IS NULL OR length(trim(p_remarks)) < 3 THEN
        RAISE EXCEPTION 'A clear rejection reason must be provided.';
    END IF;

    SELECT * INTO v_sub FROM public.price_submissions WHERE id = p_submission_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Price submission % not found', p_submission_id;
    END IF;

    SELECT display_name, role INTO v_verifier FROM public.profiles WHERE id = p_verifier_id;
    IF v_verifier.role NOT IN ('verifier', 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: User is not an accredited verifier or administrator.';
    END IF;

    UPDATE public.price_submissions
    SET status = 'rejected',
        verifier_id = p_verifier_id,
        verifier_remarks = p_remarks,
        verified_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_submission_id;

    SELECT name INTO v_product FROM public.products WHERE id = v_sub.product_id;

    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        reference_id,
        reference_type
    ) VALUES (
        v_sub.contributor_id,
        'Price Submission Rejected',
        format('Your submission for %s was not approved: %s', v_product.name, p_remarks),
        'submission_rejected',
        p_submission_id,
        'price_submission'
    );

    INSERT INTO public.audit_logs (
        actor_id,
        actor_role,
        action,
        entity_type,
        entity_id,
        new_values
    ) VALUES (
        p_verifier_id,
        v_verifier.role,
        'REJECT_PRICE_SUBMISSION',
        'price_submissions',
        p_submission_id::text,
        jsonb_build_object('reason', p_remarks)
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Price submission rejected',
        'submission_id', p_submission_id
    );
END;
$$;

-- Function 3: Request Clarification for Price Submission
CREATE OR REPLACE FUNCTION public.request_price_clarification(
    p_submission_id UUID,
    p_verifier_id UUID,
    p_remarks TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sub RECORD;
    v_verifier RECORD;
    v_product RECORD;
BEGIN
    IF p_remarks IS NULL OR length(trim(p_remarks)) < 3 THEN
        RAISE EXCEPTION 'Clarification instructions must be provided.';
    END IF;

    SELECT * INTO v_sub FROM public.price_submissions WHERE id = p_submission_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Price submission % not found', p_submission_id;
    END IF;

    SELECT display_name, role INTO v_verifier FROM public.profiles WHERE id = p_verifier_id;

    UPDATE public.price_submissions
    SET status = 'needs_clarification',
        verifier_id = p_verifier_id,
        verifier_remarks = p_remarks,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_submission_id;

    SELECT name INTO v_product FROM public.products WHERE id = v_sub.product_id;

    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        reference_id,
        reference_type
    ) VALUES (
        v_sub.contributor_id,
        'Clarification Requested on Submission',
        format('Verifier requested details for %s: %s', v_product.name, p_remarks),
        'clarification_needed',
        p_submission_id,
        'price_submission'
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Clarification requested',
        'submission_id', p_submission_id
    );
END;
$$;

-- Function 4: Approve Product Registration Submission
CREATE OR REPLACE FUNCTION public.approve_product_submission(
    p_submission_id UUID,
    p_verifier_id UUID,
    p_remarks TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sub RECORD;
    v_verifier RECORD;
    v_contributor RECORD;
    v_new_product_id UUID;
BEGIN
    SELECT * INTO v_sub FROM public.product_submissions WHERE id = p_submission_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product submission % not found', p_submission_id;
    END IF;

    IF v_sub.status != 'pending' THEN
        RAISE EXCEPTION 'Submission already processed (status: %)', v_sub.status;
    END IF;

    IF v_sub.contributor_id = p_verifier_id THEN
        RAISE EXCEPTION 'Civic Protocol Violation: Contributors cannot self-approve product creations.';
    END IF;

    SELECT display_name, role INTO v_verifier FROM public.profiles WHERE id = p_verifier_id;
    SELECT display_name INTO v_contributor FROM public.profiles WHERE id = v_sub.contributor_id;

    -- Create new product
    INSERT INTO public.products (
        name,
        barcode,
        description,
        category_id,
        brand_id,
        package_quantity,
        unit_id,
        image_url,
        is_active,
        lowest_verified_price,
        highest_verified_price,
        average_verified_price,
        stores_count,
        last_observed_at
    ) VALUES (
        v_sub.name,
        v_sub.barcode,
        v_sub.description,
        v_sub.category_id,
        v_sub.brand_id,
        v_sub.package_quantity,
        v_sub.unit_id,
        v_sub.image_url,
        true,
        v_sub.initial_price,
        v_sub.initial_price,
        v_sub.initial_price,
        1,
        timezone('utc'::text, now())
    )
    RETURNING id INTO v_new_product_id;

    -- Create initial verified price observation
    INSERT INTO public.verified_price_observations (
        product_id,
        store_id,
        price,
        observation_date,
        contributor_id,
        contributor_display_name,
        verifier_id,
        verifier_display_name,
        evidence_image_url,
        verified_at
    ) VALUES (
        v_new_product_id,
        v_sub.initial_store_id,
        v_sub.initial_price,
        v_sub.observation_date,
        v_sub.contributor_id,
        v_contributor.display_name,
        p_verifier_id,
        v_verifier.display_name,
        v_sub.receipt_image_url,
        timezone('utc'::text, now())
    );

    -- Mark submission approved
    UPDATE public.product_submissions
    SET status = 'approved',
        verifier_id = p_verifier_id,
        verifier_remarks = p_remarks,
        verified_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_submission_id;

    -- Award +50 XP
    UPDATE public.profiles
    SET xp_points = xp_points + 50
    WHERE id = v_sub.contributor_id;

    -- Notification
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        reference_id,
        reference_type
    ) VALUES (
        v_sub.contributor_id,
        'New Product Registration Approved! 🌾',
        format('%s is now officially part of the SaanMura catalog.', v_sub.name),
        'submission_approved',
        v_new_product_id,
        'product'
    );

    RETURN jsonb_build_object(
        'success', true,
        'product_id', v_new_product_id,
        'submission_id', p_submission_id
    );
END;
$$;
