-- Test seed
-- Seed users password: Password1!

SET FOREIGN_KEY_CHECKS = 1;
START TRANSACTION;

-- ============== IAM ==============
INSERT INTO roles (role_id, role_name) VALUES
  (1, 'customer'),
  (2, 'admin');

INSERT INTO users (user_id, role_id, first_name, last_name, email, password_hash, phone_number) VALUES
  (1, 1, 'John',  'Doe',   'john@example.com',  '$2b$10$2D4sd6jtJvlrNiqEwE7QFurnCms4LNemPPQy.UVSVm92g.VCUgXhm', '4165550101'),
  (2, 1, 'Jane',  'Smith', 'jane@example.com',  '$2b$10$2D4sd6jtJvlrNiqEwE7QFurnCms4LNemPPQy.UVSVm92g.VCUgXhm', '4165550102'),
  (3, 2, 'Admin', 'User',  'admin@example.com', '$2b$10$2D4sd6jtJvlrNiqEwE7QFurnCms4LNemPPQy.UVSVm92g.VCUgXhm', NULL);

INSERT INTO addresses (address_id, user_id, street, city, province, country, postal_code, is_default) VALUES
  (1, 1, '12 Maple Ave', 'Toronto',  'ON', 'Canada', 'M4B1B3', TRUE),
  (2, 2, '88 King St',   'Markham',  'ON', 'Canada', 'L3R0B8', TRUE);

INSERT INTO sessions (session_id, user_id, current_access_jti, device_label, ip_address, user_agent) VALUES
  ('11111111-1111-4111-8111-111111111101', 1, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Chrome on Windows', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0) Seed/1.0'),
  ('11111111-1111-4111-8111-111111111102', 1, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Safari on iPhone',  '192.168.1.20', 'Mozilla/5.0 (iPhone) Seed/1.0'),
  ('11111111-1111-4111-8111-111111111103', 3, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'Firefox on Linux',  '10.0.0.5',     'Mozilla/5.0 (X11; Linux) Seed/1.0');

INSERT INTO refresh_tokens (jti, session_id, user_id, token_hash, expires_at) VALUES
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', '11111111-1111-4111-8111-111111111101', 1, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', DATE_ADD(NOW(), INTERVAL 7 DAY)),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', '11111111-1111-4111-8111-111111111102', 1, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', DATE_ADD(NOW(), INTERVAL 7 DAY)),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', '11111111-1111-4111-8111-111111111103', 3, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', DATE_ADD(NOW(), INTERVAL 7 DAY));

-- ============== Media (before vehicle_history & catalog_images) ==============
INSERT INTO media (media_id, url, file_type, alt_text) VALUES
  (1, 'https://cdn.voltdrive.test/model3-front.jpg', 'image/jpeg', 'Model 3 front'),
  (2, 'https://cdn.voltdrive.test/model3-side.jpg',  'image/jpeg', 'Model 3 side'),
  (3, 'https://cdn.voltdrive.test/mache-front.jpg',  'image/jpeg', 'Mach-E front'),
  (4, 'https://cdn.voltdrive.test/bz4x-front.jpg',   'image/jpeg', 'bZ4X front'),
  (5, 'https://cdn.voltdrive.test/history-c2.pdf',   'application/pdf', 'Vehicle history report'),
  (6, 'https://cdn.voltdrive.test/history-c4.pdf',   'application/pdf', 'Vehicle history report');

-- ============== Catalog: brands / models ==============
INSERT INTO brands (brand_id, name, description, country, website_url, logo_url) VALUES
  (1, 'Tesla',  'Electric vehicle manufacturer',    'USA',   'https://www.tesla.com',  NULL),
  (2, 'Ford',   'American automotive manufacturer', 'USA',   'https://www.ford.com',   NULL),
  (3, 'Toyota', 'Japanese automotive manufacturer', 'Japan', 'https://www.toyota.com', NULL);

INSERT INTO models (model_id, brand_id, model_type, name, description, release_year) VALUES
  (1, 1, 'vehicle', 'Model 3',        'Compact electric sedan',         2017),
  (2, 1, 'vehicle', 'Model Y',        'Compact electric SUV',           2020),
  (3, 2, 'vehicle', 'Mustang Mach-E', 'All-electric performance SUV',   2021),
  (4, 3, 'vehicle', 'bZ4X',           'Battery electric crossover SUV', 2022);

INSERT INTO vehicle_models (model_id, body_shape, door_count, drivetrain) VALUES
  (1, 'sedan',     4, 'AWD'),
  (2, 'crossover', 4, 'AWD'),
  (3, 'crossover', 4, 'AWD'),
  (4, 'crossover', 4, 'AWD');

-- ============== Catalog: options taxonomy ==============
INSERT INTO option_categories (category_id, name, select_type) VALUES
  (1, 'Color',    'SINGLE'),
  (2, 'Interior', 'SINGLE'),
  (3, 'Wheels',   'SINGLE');

INSERT INTO option_values (option_id, category_id, name, price_delta) VALUES
  (1, 1, 'Pearl White',     0.00),
  (2, 1, 'Midnight Black',  500.00),
  (3, 2, 'Black Interior',  0.00),
  (4, 2, 'White Interior',  1000.00),
  (5, 3, '18" Aero',        0.00),
  (6, 3, '19" Sport',       1500.00);

-- ============== Catalog: items / vehicles ==============
INSERT INTO catalog_items (cid, model_id, item_type, base_price, quantity, is_active) VALUES
  (1, 1, 'vehicle', 52990.00, 5, TRUE),
  (2, 1, 'vehicle', 48990.00, 3, TRUE),
  (3, 2, 'vehicle', 57990.00, 4, TRUE),
  (4, 3, 'vehicle', 54995.00, 2, TRUE),
  (5, 4, 'vehicle', 44995.00, 6, TRUE);

INSERT INTO vehicles (cid, year, `condition`, mileage) VALUES
  (1, 2025, 'new',  0),
  (2, 2023, 'used', 18420),
  (3, 2025, 'new',  0),
  (4, 2024, 'used', 9200),
  (5, 2025, 'new',  0);

-- history only for used vehicles (cid 2, cid 4)
INSERT INTO vehicle_history (history_id, cid, has_accidents, media_id) VALUES
  (1, 2, FALSE, 5),
  (2, 4, TRUE,  6);

-- which options each item offers
INSERT INTO catalog_options (cid, option_id) VALUES
  (1, 1), (1, 2), (1, 5), (1, 6),
  (3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6);

-- saved configurations (total = base_price + chosen price_deltas)
INSERT INTO configurations (config_id, cid, total_price) VALUES
  (1, 1, 54990.00),   -- 52990 + Midnight Black(500) + 19" Sport(1500)
  (2, 3, 58990.00);   -- 57990 + White Interior(1000)

INSERT INTO config_options (config_id, option_id) VALUES
  (1, 2), (1, 6),
  (2, 4);

-- ============== Catalog: promos ==============
INSERT INTO promos (promo_id, name, description, is_active) VALUES
  (1, 'hot_deal',  'Hot deal pricing on selected vehicles.',                    TRUE),
  (2, 'seasonal',  'Seasonal pricing across the lineup.',                       TRUE),
  (3, 'clearance', 'Clearing previous model-year and discontinued inventory.',  TRUE),
  (4, 'featured',  'Hand-picked featured vehicles for the storefront.',         TRUE);

INSERT INTO catalog_promos (cid, promo_id, discount_amount) VALUES
  (1, 1, 2500.00),   -- hot_deal
  (2, 1, 1800.00),   -- hot_deal
  (5, 2, 1200.00),   -- seasonal
  (2, 3, 6000.00),   -- clearance (used)
  (4, 3, 5500.00),   -- clearance (used)
  (3, 4,    0.00);   -- featured (placement only)

-- ============== Cart ==============
INSERT INTO carts (cart_id, user_id) VALUES
  (1, 1);

INSERT INTO cart_items (cart_item_id, cart_id, cid, config_id, quantity) VALUES
  (1, 1, 1, 1,    1),    -- configured Model 3
  (2, 1, 5, NULL, 2);    -- bZ4X, no config

-- ============== Order ==============
INSERT INTO orders (order_id, user_id, guest_email, order_status, payment_status, subtotal, tax, total) VALUES
  (1, 1, NULL,                'confirmed', 'paid',   58990.00, 7668.70, 66658.70),
  (2, 1, NULL,                'pending',   'failed', 44995.00, 5849.35, 50844.35),
  (3, NULL, 'guest@example.com', 'pending',   'failed', 52990.00, 6888.70, 59878.70);

INSERT INTO order_addresses (order_address_id, order_id, address_type, full_name, phone_number, street, city, province, country, postal_code) VALUES
  (1, 1, 'shipping', 'John Doe',   '4165550101', '12 Maple Ave', 'Toronto', 'ON', 'Canada', 'M4B1B3'),
  (2, 1, 'billing',  'John Doe',   '4165550101', '12 Maple Ave', 'Toronto', 'ON', 'Canada', 'M4B1B3'),
  (3, 2, 'shipping', 'John Doe',   '4165550101', '12 Maple Ave', 'Toronto', 'ON', 'Canada', 'M4B1B3'),
  (4, 2, 'billing',  'John Doe',   '4165550101', '12 Maple Ave', 'Toronto', 'ON', 'Canada', 'M4B1B3'),
  (5, 3, 'shipping', 'Guest Shopper', '4165550199', '40 Bay St', 'Toronto', 'ON', 'Canada', 'M5J2X2'),
  (6, 3, 'billing',  'Guest Shopper', '4165550199', '40 Bay St', 'Toronto', 'ON', 'Canada', 'M5J2X2');

INSERT INTO order_items (order_item_id, order_id, cid, config_id, quantity, unit_price) VALUES
  (1, 1, 3, 2,    1, 58990.00),
  (2, 2, 5, NULL, 1, 44995.00),
  (3, 3, 1, NULL, 1, 52990.00);

-- ============== Payment ==============
INSERT INTO payment_attempts (attempt_id, order_id, user_id, amount, payment_method, status) VALUES
  (1, 1, 1, 66658.70, 'credit_card', 'success'),
  (2, 2, 1, 50844.35, 'credit_card', 'failed'),
  (3, 2, 1, 50844.35, 'debit_card',  'failed'),
  (4, 1, 1, 66658.70, 'apple_pay',   'success');

-- ============== Review ==============
INSERT INTO reviews (review_id, cid, user_id, title, body, rating) VALUES
  (1, 1, 1, 'Great daily driver', 'Smooth and efficient.', 5),
  (2, 3, 2, 'Solid value',        'Good range for the price.', 4);

-- ============== Wishlist ==============
INSERT INTO wishlist (user_id, cid) VALUES
  (1, 4),
  (2, 1);

-- ============== Analytics: event_type ==============
INSERT INTO event_type (event_type_id, code, name, is_active, description) VALUES
  (1,  'hot_deals_view',       'Hot Deals View',       TRUE, 'The user has viewed the hot deals page.'),
  (2,  'vehicle_details_view', 'Vehicle Details View', TRUE, 'The user has viewed the vehicle details page.'),
  (3,  'cart_add',             'Cart Add',             TRUE, 'The user has added an item to the cart.'),
  (4,  'cart_remove',          'Cart Remove',          TRUE, 'The user has removed an item from the cart.'),
  (5,  'purchase',             'Purchase',             TRUE, 'The user has purchased an item.'),
  (6,  'edit_profile',         'Edit Profile',         TRUE, 'The user has edited their profile.'),
  (7,  'delete_account',       'Delete Account',       TRUE, 'The user has deleted their account.'),
  (8,  'publish_review',       'Publish Review',       TRUE, 'The user has published a review.'),
  (9,  'delete_review',        'Delete Review',        TRUE, 'The user has deleted a review.'),
  (10, 'wishlist_add',         'Wishlist Add',         TRUE, 'The user has added an item to the wishlist.'),
  (11, 'wishlist_remove',      'Wishlist Remove',      TRUE, 'The user has removed an item from the wishlist.');

INSERT INTO event_logs (event_id, event_type_id, user_id, cid, meta, ip_address) VALUES
  (1, 2, 1, 1, '{"source":"web"}',           '203.0.113.10'),
  (2, 3, 1, 1, '{"source":"web","qty":1}',   '203.0.113.10'),
  (3, 5, 1, 3, '{"order_id":1}',             '203.0.113.10');

-- ============== Media: catalog_images ==============
INSERT INTO catalog_images (image_id, cid, media_id, display_order, is_primary) VALUES
  (1, 1, 1, 0, TRUE),
  (2, 1, 2, 1, FALSE),
  (3, 3, 3, 0, TRUE),
  (4, 5, 4, 0, TRUE);

COMMIT;