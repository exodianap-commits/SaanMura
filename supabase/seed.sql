-- =========================================================================
-- SAANMURA SEED DATA (AUTHENTIC PHILIPPINE COMMODITIES & CIVIC STORES)
-- =========================================================================

-- 1. UNITS
INSERT INTO public.units (id, name, abbreviation) VALUES
('11111111-1111-1111-1111-111111111001', 'Gram', 'g'),
('11111111-1111-1111-1111-111111111002', 'Kilogram', 'kg'),
('11111111-1111-1111-1111-111111111003', 'Milliliter', 'mL'),
('11111111-1111-1111-1111-111111111004', 'Liter', 'L'),
('11111111-1111-1111-1111-111111111005', 'Piece', 'pc'),
('11111111-1111-1111-1111-111111111006', 'Can', 'can'),
('11111111-1111-1111-1111-111111111007', 'Pack', 'pack'),
('11111111-1111-1111-1111-111111111008', 'Dozen', 'doz')
ON CONFLICT (id) DO NOTHING;

-- 2. CATEGORIES
INSERT INTO public.categories (id, name, slug, icon, description, display_order) VALUES
('22222222-2222-2222-2222-222222222001', 'Instant Noodles', 'instant-noodles', '🍜', 'Packaged ramen, pancit canton, and soup noodles', 1),
('22222222-2222-2222-2222-222222222002', 'Canned Goods', 'canned-goods', '🥫', 'Sardines, corned beef, tuna, and canned meat', 2),
('22222222-2222-2222-2222-222222222003', 'Bigas / Rice', 'rice', '🌾', 'Well-milled, regular milled, and premium grains', 3),
('22222222-2222-2222-2222-222222222004', 'Cooking Oil', 'cooking-oil', '🍳', 'Palm oil, coconut oil, vegetable oil pouches and bottles', 4),
('22222222-2222-2222-2222-222222222005', 'Dairy & Eggs', 'dairy-eggs', '🥛', 'Evaporated milk, powdered milk, and fresh chicken eggs', 5),
('22222222-2222-2222-2222-222222222006', 'Condiments', 'condiments', '🧂', 'Soy sauce, vinegar, fish sauce (patis), and table salt', 6),
('22222222-2222-2222-2222-222222222007', 'Fresh Meat', 'fresh-meat', '🥩', 'Pork kasim, liempo, chicken dressed, and beef shank', 7)
ON CONFLICT (id) DO NOTHING;

-- 3. BRANDS
INSERT INTO public.brands (id, name, slug) VALUES
('33333333-3333-3333-3333-333333333001', 'Lucky Me!', 'lucky-me'),
('33333333-3333-3333-3333-333333333002', 'Purefoods', 'purefoods'),
('33333333-3333-3333-3333-333333333003', 'Mega Sardines', 'mega-sardines'),
('33333333-3333-3333-3333-333333333004', 'Datu Puti', 'datu-puti'),
('33333333-3333-3333-3333-333333333005', 'Silver Swan', 'silver-swan'),
('33333333-3333-3333-3333-333333333006', 'Golden Fiesta', 'golden-fiesta'),
('33333333-3333-3333-3333-333333333007', 'Bear Brand', 'bear-brand'),
('33333333-3333-3333-3333-333333333008', 'Century Tuna', 'century-tuna')
ON CONFLICT (id) DO NOTHING;

-- 4. STORES (METRO MANILA SUPERMARKETS & WET MARKETS)
INSERT INTO public.stores (id, name, branch_name, store_type, address, city, province, latitude, longitude, is_verified) VALUES
('44444444-4444-4444-4444-444444444001', 'Puregold', 'Paso de Blas', 'supermarket', 'Paso de Blas Rd, Malinta', 'Valenzuela City', 'Metro Manila', 14.6975000, 120.9850000, true),
('44444444-4444-4444-4444-444444444002', 'SM Supermarket', 'SM Megamall', 'supermarket', 'EDSA cor. Doña Julia Vargas Ave', 'Mandaluyong City', 'Metro Manila', 14.5846000, 121.0567000, true),
('44444444-4444-4444-4444-444444444003', 'SM Hypermarket', 'North EDSA', 'supermarket', 'North Ave cor. EDSA', 'Quezon City', 'Metro Manila', 14.6565000, 121.0289000, true),
('44444444-4444-4444-4444-444444444004', 'Robinsons Supermarket', 'Robinsons Galleria', 'supermarket', 'Ortigas Ave cor. EDSA', 'Quezon City', 'Metro Manila', 14.5905000, 121.0601000, true),
('44444444-4444-4444-4444-444444444005', 'Nepa Q-Mart Public Market', 'Wet Section', 'wet_market', 'Nepa Q-Mart, EDSA Cubao', 'Quezon City', 'Metro Manila', 14.6288000, 121.0505000, true),
('44444444-4444-4444-4444-444444444006', 'Agora Public Market', 'Palengke Center', 'wet_market', 'N. Domingo St', 'San Juan City', 'Metro Manila', 14.6033000, 121.0285000, true),
('44444444-4444-4444-4444-444444444007', 'Balintawak Cloverleaf Market', 'Section B', 'wet_market', 'EDSA Balintawak', 'Quezon City', 'Metro Manila', 14.6578000, 121.0028000, true),
('44444444-4444-4444-4444-444444444008', 'WalterMart', 'Muñoz North EDSA', 'supermarket', 'EDSA cor. Roosevelt Ave', 'Quezon City', 'Metro Manila', 14.6561000, 121.0182000, true)
ON CONFLICT (id) DO NOTHING;

-- 5. PRODUCTS (BASIC COMMODITIES)
INSERT INTO public.products (
    id, name, barcode, description, category_id, brand_id, package_quantity, unit_id, image_url,
    is_active, lowest_verified_price, highest_verified_price, average_verified_price, stores_count, srp_price, last_observed_at
) VALUES
(
    '55555555-5555-5555-5555-555555555001',
    'Lucky Me! Instant Pancit Canton Kalamansi 80g',
    '4800016644818',
    'Philippine favorite stir-fried instant noodles infused with citrus kalamansi flavor.',
    '22222222-2222-2222-2222-222222222001',
    '33333333-3333-3333-3333-333333333001',
    80,
    '11111111-1111-1111-1111-111111111001',
    'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=400&q=80',
    true,
    15.00,
    15.50,
    15.20,
    5,
    15.25,
    timezone('utc'::text, now())
),
(
    '55555555-5555-5555-5555-555555555002',
    'Purefoods Corned Beef 150g',
    '4800016012891',
    'Premium quality 100% pure beef strands seasoned with flavorful spices in easy-open can.',
    '22222222-2222-2222-2222-222222222002',
    '33333333-3333-3333-3333-333333333002',
    150,
    '11111111-1111-1111-1111-111111111001',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
    true,
    39.50,
    42.80,
    41.20,
    6,
    41.50,
    timezone('utc'::text, now())
),
(
    '55555555-5555-5555-5555-555555555003',
    'Mega Sardines in Tomato Sauce 155g',
    '4800049720015',
    'Freshly caught sardines processed within hours, cooked in thick tomato sauce.',
    '22222222-2222-2222-2222-222222222002',
    '33333333-3333-3333-3333-333333333003',
    155,
    '11111111-1111-1111-1111-111111111001',
    'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=400&q=80',
    true,
    22.50,
    24.50,
    23.40,
    4,
    24.00,
    timezone('utc'::text, now())
),
(
    '55555555-5555-5555-5555-555555555004',
    'Datu Puti Vinegar White 1L',
    '4801988110027',
    'Naturally fermented cane vinegar for everyday cooking and dipping.',
    '22222222-2222-2222-2222-222222222006',
    '33333333-3333-3333-3333-333333333004',
    1,
    '11111111-1111-1111-1111-111111111004',
    'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=400&q=80',
    true,
    44.00,
    47.00,
    45.50,
    5,
    46.50,
    timezone('utc'::text, now())
),
(
    '55555555-5555-5555-5555-555555555005',
    'Silver Swan Soy Sauce 1L',
    '4801988120033',
    'Full-bodied soy sauce brewed from high-grade soybeans for adobo and marinades.',
    '22222222-2222-2222-2222-222222222006',
    '33333333-3333-3333-3333-333333333005',
    1,
    '11111111-1111-1111-1111-111111111004',
    'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=400&q=80',
    true,
    48.00,
    51.00,
    49.20,
    4,
    49.00,
    timezone('utc'::text, now())
),
(
    '55555555-5555-5555-5555-555555555006',
    'Sinandomeng Special Rice 5kg',
    '4806511223344',
    'Fluffy, aromatic white grain rice harvested from Nueva Ecija.',
    '22222222-2222-2222-2222-222222222003',
    NULL,
    5,
    '11111111-1111-1111-1111-111111111002',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    true,
    245.00,
    270.00,
    258.00,
    6,
    260.00,
    timezone('utc'::text, now())
),
(
    '55555555-5555-5555-5555-555555555007',
    'Golden Fiesta Cooking Oil 1L Pouch',
    '4801988330104',
    'Refined palm olein cooking oil fortified with Vitamin A.',
    '22222222-2222-2222-2222-222222222004',
    '33333333-3333-3333-3333-333333333006',
    1,
    '11111111-1111-1111-1111-111111111004',
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
    true,
    94.50,
    102.00,
    97.50,
    5,
    98.00,
    timezone('utc'::text, now())
),
(
    '55555555-5555-5555-5555-555555555008',
    'Bear Brand Fortified Powdered Milk 300g',
    '4800361378812',
    'Powdered milk drink with Tibay Resistensya nutrients: Iron, Zinc, and Vitamin C.',
    '22222222-2222-2222-2222-222222222005',
    '33333333-3333-3333-3333-333333333007',
    300,
    '11111111-1111-1111-1111-111111111001',
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    true,
    102.00,
    108.00,
    104.50,
    4,
    105.00,
    timezone('utc'::text, now())
)
ON CONFLICT (id) DO NOTHING;

-- 6. EXTERNAL DTI PRICE SOURCE & REFERENCE
INSERT INTO public.external_price_sources (id, source_name, agency, bulletin_number, publication_date, notes) VALUES
('66666666-6666-6666-6666-666666666001', 'DTI E-Presyo NCR Bulletin', 'Department of Trade and Industry', 'DTI-CPG-2026-Q4-01', '2026-10-15', 'Official DTI Suggested Retail Price for Basic Necessities and Prime Commodities.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.external_reference_prices (id, source_id, product_name, barcode, category, unit, srp_min_price, srp_max_price, prevailing_price, effective_date) VALUES
('77777777-7777-7777-7777-777777777001', '66666666-6666-6666-6666-666666666001', 'Instant Pancit Canton Kalamansi 80g', '4800016644818', 'Instant Noodles', '80g pack', 15.00, 15.25, 15.25, '2026-10-15'),
('77777777-7777-7777-7777-777777777002', '66666666-6666-6666-6666-666666666001', 'Purefoods Corned Beef 150g', '4800016012891', 'Canned Goods', '150g can', 40.50, 41.50, 41.50, '2026-10-15'),
('77777777-7777-7777-7777-777777777003', '66666666-6666-6666-6666-666666666001', 'Mega Sardines in Tomato Sauce 155g', '4800049720015', 'Canned Goods', '155g can', 23.00, 24.00, 24.00, '2026-10-15'),
('77777777-7777-7777-7777-777777777004', '66666666-6666-6666-6666-666666666001', 'Datu Puti Vinegar White 1L', '4801988110027', 'Condiments', '1L bottle', 45.00, 46.50, 46.50, '2026-10-15'),
('77777777-7777-7777-7777-777777777005', '66666666-6666-6666-6666-666666666001', 'Silver Swan Soy Sauce 1L', '4801988120033', 'Condiments', '1L bottle', 47.50, 49.00, 49.00, '2026-10-15'),
('77777777-7777-7777-7777-777777777006', '66666666-6666-6666-6666-666666666001', 'Sinandomeng Special Rice 5kg', '4806511223344', 'Bigas / Rice', '5kg bag', 250.00, 260.00, 255.00, '2026-10-15'),
('77777777-7777-7777-7777-777777777007', '66666666-6666-6666-6666-666666666001', 'Golden Fiesta Cooking Oil 1L Pouch', '4801988330104', 'Cooking Oil', '1L pouch', 95.00, 98.00, 97.00, '2026-10-15'),
('77777777-7777-7777-7777-777777777008', '66666666-6666-6666-6666-666666666001', 'Bear Brand Powdered Milk 300g', '4800361378812', 'Dairy & Eggs', '300g pack', 103.00, 105.00, 105.00, '2026-10-15')
ON CONFLICT (id) DO NOTHING;
