INSERT INTO roles (role_name) VALUES 
('admin'),
('customer');

INSERT INTO users (user_id, role_id, first_name, last_name, email, password_hash, phone_number, deleted_at) VALUES
(1, 1, 'Maya', 'Singh', 'maya.singh@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551001', NULL),
(2, 1, 'Daniel', 'Osei', 'daniel.osei@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551002', NULL),
(3, 1, 'Kara', 'Novak', 'kara.novak@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551003', NULL),
(4, 1, 'Jordan', 'Okafor', 'jordan.okafor@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551004', NULL),
(5, 1, 'Lea', 'Tremblay', 'lea.tremblay@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551005', NULL),
(6, 1, 'Soo', 'Park', 'soo.park@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551006', NULL),
(7, 1, 'Tara', 'Ahmadi', 'tara.ahmadi@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551007', NULL),
(8, 1, 'Paul', 'Fontaine', 'paul.fontaine@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551008', NULL),
(9, 1, 'Amy', 'Chen', 'amy.chen@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551009', NULL),
(10, 1, 'Rosa', 'Bianchi', 'rosa.bianchi@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551010', NULL),
(11, 1, 'Noah', 'Patel', 'noah.patel@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551011', NULL),
(12, 1, 'Emma', 'Nguyen', 'emma.nguyen@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551012', NULL),
(13, 1, 'Liam', 'Brooks', 'liam.brooks@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551013', NULL),
(14, 1, 'Olivia', 'Martinez', 'olivia.martinez@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551014', NULL),
(15, 1, 'Ethan', 'Walsh', 'ethan.walsh@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551015', NULL),
(16, 1, 'Ava', 'Kowalski', 'ava.kowalski@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551016', NULL),
(17, 1, 'Mason', 'Ibrahim', 'mason.ibrahim@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551017', NULL),
(18, 1, 'Isabella', 'Rossi', 'isabella.rossi@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551018', NULL),
(19, 1, 'Lucas', 'Kim', 'lucas.kim@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551019', NULL),
(20, 1, 'Mia', 'Santos', 'mia.santos@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551020', NULL),
(21, 1, 'James', 'OConnor', 'james.oconnor@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551021', NULL),
(22, 1, 'Sophia', 'Ali', 'sophia.ali@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551022', NULL),
(23, 1, 'Benjamin', 'Clarke', 'benjamin.clarke@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', '4165551023', NULL),
(24, 2, 'Admin', 'One', 'admin.one@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', NULL, NULL),
(25, 2, 'Admin', 'Two', 'admin.two@example.com', '$2b$10$iPs5TNOJj2yDhB90b.LYQOKgoJqpZJ9AygZKJDVNmNbs/xadpPT.G', NULL, NULL);

INSERT INTO addresses (address_id, user_id, street, city, province, country, postal_code, is_default) VALUES
(1, 2, '12 Maple Ave', 'Toronto', 'ON', 'Canada', 'M4B1B3', TRUE),
(2, 3, '88 King St W', 'Toronto', 'ON', 'Canada', 'M5H1J9', TRUE),
(3, 3, '250 Yonge St', 'Toronto', 'ON', 'Canada', 'M5B2L7', FALSE),
(4, 5, '45 Queen St', 'Ottawa', 'ON', 'Canada', 'K1P1A0', TRUE),
(5, 6, '100 Rideau St', 'Ottawa', 'ON', 'Canada', 'K1N5W8', TRUE),
(6, 6, '77 Metcalfe St', 'Ottawa', 'ON', 'Canada', 'K1P5L6', FALSE),
(7, 8, '500 Burrard St', 'Vancouver', 'BC', 'Canada', 'V6C3R8', TRUE),
(8, 9, '200 Granville St', 'Vancouver', 'BC', 'Canada', 'V6C1S4', TRUE),
(9, 9, '350 Robson St', 'Vancouver', 'BC', 'Canada', 'V6B2B2', FALSE),
(10, 11, '1 Place Ville Marie', 'Montreal', 'QC', 'Canada', 'H3B2B6', TRUE),
(11, 12, '1250 Rene-Levesque Blvd W', 'Montreal', 'QC', 'Canada', 'H3B4W8', TRUE),
(12, 12, '2200 Rue Sainte-Catherine O', 'Montreal', 'QC', 'Canada', 'H3H1M1', FALSE),
(13, 14, '10180 101 St NW', 'Edmonton', 'AB', 'Canada', 'T5J3S4', TRUE),
(14, 15, '888 3 St SE', 'Calgary', 'AB', 'Canada', 'T2G5C3', TRUE),
(15, 15, '1969 Upper Water St', 'Halifax', 'NS', 'Canada', 'B3J3R7', FALSE),
(16, 17, '330 St Mary Ave', 'Winnipeg', 'MB', 'Canada', 'R3C3Z5', TRUE),
(17, 18, '12 Maple Ave', 'Toronto', 'ON', 'Canada', 'M4B1B3', TRUE),
(18, 18, '88 King St W', 'Toronto', 'ON', 'Canada', 'M5H1J9', FALSE),
(19, 20, '250 Yonge St', 'Toronto', 'ON', 'Canada', 'M5B2L7', TRUE),
(20, 21, '45 Queen St', 'Ottawa', 'ON', 'Canada', 'K1P1A0', TRUE),
(21, 21, '100 Rideau St', 'Ottawa', 'ON', 'Canada', 'K1N5W8', FALSE),
(22, 23, '77 Metcalfe St', 'Ottawa', 'ON', 'Canada', 'K1P5L6', TRUE);

INSERT INTO configurations (config_id, cid, total_price, created_at) VALUES
(1, 1, 79090.00, '2026-05-10 15:30:00'),
(2, 3, 65699.00, '2026-05-11 15:30:00'),
(3, 5, 67595.00, '2026-05-12 15:30:00');

INSERT INTO config_options (config_id, option_id) VALUES
(1, 4),
(1, 6),
(1, 8),
(1, 9),
(1, 10),
(2, 12),
(2, 15),
(2, 17),
(3, 20),
(3, 23),
(3, 24),
(3, 25);

INSERT INTO carts (cart_id, user_id, session_token, expires_at, created_at, updated_at) VALUES
(1, 1, NULL, NULL, '2026-07-01 10:00:00', '2026-07-08 14:00:00'),
(2, 14, NULL, NULL, '2026-07-05 09:00:00', '2026-07-09 11:00:00'),
(3, NULL, 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeee3', '2026-07-17 23:59:59', '2026-07-10 08:00:00', '2026-07-10 08:30:00');

INSERT INTO cart_items (cart_item_id, cart_id, cid, config_id, quantity, added_at) VALUES
(1, 1, 1, 1, 1, '2026-07-08 14:00:00'),
(2, 1, 9, NULL, 1, '2026-07-08 14:05:00'),
(3, 2, 7, NULL, 1, '2026-07-09 11:00:00'),
(4, 3, 5, NULL, 1, '2026-07-10 08:30:00');

INSERT INTO orders (order_id, user_id, guest_email, order_status, payment_status, subtotal, tax, total, created_at) VALUES
(1, 1, NULL, 'confirmed', 'paid', 79090.00, 10281.70, 89371.70, '2026-05-12 16:00:00'),
(2, 1, NULL, 'pending', 'failed', 65699.00, 8540.87, 74239.87, '2026-06-03 11:20:00'),
(3, 1, NULL, 'cancelled', 'failed', 67595.00, 8787.35, 76382.35, '2026-06-18 09:10:00');

INSERT INTO order_addresses (order_address_id, order_id, address_type, full_name, phone_number, street, city, province, country, postal_code, created_at) VALUES
(1, 1, 'shipping', 'Maya Singh', '4165551001', '100 Queen St W', 'Toronto', 'ON', 'Canada', 'M5H2N2', '2026-05-12 16:00:00'),
(2, 1, 'billing', 'Maya Singh', '4165551001', '100 Queen St W', 'Toronto', 'ON', 'Canada', 'M5H2N2', '2026-05-12 16:00:00'),
(3, 2, 'shipping', 'Maya Singh', '4165551001', '55 Metcalfe St', 'Ottawa', 'ON', 'Canada', 'K1P6L5', '2026-06-03 11:20:00'),
(4, 2, 'billing', 'Maya Singh', '4165551001', '55 Metcalfe St', 'Ottawa', 'ON', 'Canada', 'K1P6L5', '2026-06-03 11:20:00'),
(5, 3, 'shipping', 'Maya Singh', '4165551001', '200 Granville St', 'Vancouver', 'BC', 'Canada', 'V6C1S4', '2026-06-18 09:10:00'),
(6, 3, 'billing', 'Maya Singh', '4165551001', '88 King St W', 'Toronto', 'ON', 'Canada', 'M5H1J9', '2026-06-18 09:10:00');

INSERT INTO order_items (order_item_id, order_id, cid, config_id, quantity, unit_price) VALUES
(1, 1, 1, 1, 1, 79090.00),
(2, 2, 3, 2, 1, 65699.00),
(3, 3, 5, 3, 1, 67595.00);

INSERT INTO payment_attempts (attempt_id, order_id, user_id, amount, payment_method, status, attempted_at) VALUES
(1, 1, 1, 89371.70, 'credit_card', 'success', '2026-05-12 16:05:00'),
(2, 2, 1, 74239.87, 'credit_card', 'failed', '2026-06-03 11:22:00'),
(3, 2, 1, 74239.87, 'debit_card', 'failed', '2026-06-03 11:25:00');

INSERT INTO reviews (review_id, cid, user_id, title, body, rating) VALUES
(1, 2, 1, 'Love the range', 'Been driving it a few months now, quiet cabin and the charging speed is better than expected.', 4),
(2, 3, 1, 'Worth every dollar', 'Delivery was on time and the car matched the listing exactly. Range holds up well in daily use.', 4),
(3, 3, 2, 'Decent, some quirks', 'Minor cosmetic wear was not mentioned in the listing, otherwise as described.', 3),
(4, 4, 3, 'Love the range', 'Delivery was on time and the car matched the listing exactly. Range holds up well in daily use.', 5),
(5, 4, 1, 'Love the range', 'Smooth pickup, sales team answered every question, no surprises with the paperwork.', 4),
(6, 6, 1, 'Mostly happy', 'Minor cosmetic wear was not mentioned in the listing, otherwise as described.', 4),
(7, 6, 4, 'Good but a few issues', 'Car itself is good, but delivery took longer than the estimate given at checkout.', 3),
(8, 8, 5, 'Smooth buying process', 'Smooth pickup, sales team answered every question, no surprises with the paperwork.', 5),
(9, 8, 2, 'Love the range', 'Been driving it a few months now, quiet cabin and the charging speed is better than expected.', 5),
(10, 9, 5, 'Smooth buying process', 'Smooth pickup, sales team answered every question, no surprises with the paperwork.', 4),
(11, 9, 4, 'Mostly happy', 'Car itself is good, but delivery took longer than the estimate given at checkout.', 3),
(12, 9, 6, 'Worth every dollar', 'Delivery was on time and the car matched the listing exactly. Range holds up well in daily use.', 5),
(13, 10, 7, 'Decent, some quirks', 'Car itself is good, but delivery took longer than the estimate given at checkout.', 3),
(14, 10, 1, 'Love the range', 'Been driving it a few months now, quiet cabin and the charging speed is better than expected.', 4),
(15, 10, 4, 'Worth every dollar', 'Smooth pickup, sales team answered every question, no surprises with the paperwork.', 4),
(16, 12, 8, 'Mostly happy', 'Car itself is good, but delivery took longer than the estimate given at checkout.', 3),
(17, 12, 7, 'Great daily driver', 'Delivery was on time and the car matched the listing exactly. Range holds up well in daily use.', 4),
(18, 13, 1, 'Smooth buying process', 'Delivery was on time and the car matched the listing exactly. Range holds up well in daily use.', 4),
(19, 13, 7, 'Great daily driver', 'Smooth pickup, sales team answered every question, no surprises with the paperwork.', 5),
(20, 14, 6, 'Decent, some quirks', 'Minor cosmetic wear was not mentioned in the listing, otherwise as described.', 4),
(21, 16, 1, 'Great daily driver', 'Smooth pickup, sales team answered every question, no surprises with the paperwork.', 5),
(22, 16, 9, 'Smooth buying process', 'Smooth pickup, sales team answered every question, no surprises with the paperwork.', 4),
(23, 17, 6, 'Worth every dollar', 'Delivery was on time and the car matched the listing exactly. Range holds up well in daily use.', 5),
(24, 18, 1, 'Smooth buying process', 'Smooth pickup, sales team answered every question, no surprises with the paperwork.', 4),
(25, 18, 2, 'Exceeded expectations', 'Been driving it a few months now, quiet cabin and the charging speed is better than expected.', 4),
(26, 19, 5, 'Solid EV', 'Delivery was on time and the car matched the listing exactly. Range holds up well in daily use.', 4),
(27, 19, 1, 'Great daily driver', 'Smooth pickup, sales team answered every question, no surprises with the paperwork.', 4),
(28, 20, 9, 'Good but a few issues', 'Minor cosmetic wear was not mentioned in the listing, otherwise as described.', 3),
(29, 20, 1, 'Good but a few issues', 'Car itself is good, but delivery took longer than the estimate given at checkout.', 3),
(30, 22, 5, 'Love the range', 'Been driving it a few months now, quiet cabin and the charging speed is better than expected.', 4),
(31, 22, 8, 'Great daily driver', 'Smooth pickup, sales team answered every question, no surprises with the paperwork.', 4),
(32, 22, 1, 'Exceeded expectations', 'Delivery was on time and the car matched the listing exactly. Range holds up well in daily use.', 4),
(33, 23, 10, 'Great daily driver', 'Been driving it a few months now, quiet cabin and the charging speed is better than expected.', 5),
(34, 23, 6, 'Worth every dollar', 'Delivery was on time and the car matched the listing exactly. Range holds up well in daily use.', 4),
(35, 23, 1, 'Solid EV', 'Delivery was on time and the car matched the listing exactly. Range holds up well in daily use.', 5),
(36, 25, 4, 'Smooth buying process', 'Delivery was on time and the car matched the listing exactly. Range holds up well in daily use.', 4),
(37, 25, 10, 'Smooth buying process', 'Smooth pickup, sales team answered every question, no surprises with the paperwork.', 4);

INSERT INTO wishlist (user_id, cid, added_at) VALUES
(14, 7, '2026-06-01 12:00:00'),
(14, 22, '2026-06-02 12:00:00'),
(14, 18, '2026-06-03 12:00:00'),
(14, 12, '2026-06-04 12:00:00'),
(15, 12, '2026-06-01 12:00:00'),
(15, 25, '2026-06-02 12:00:00'),
(7, 17, '2026-06-01 12:00:00'),
(7, 6, '2026-06-02 12:00:00'),
(7, 4, '2026-06-03 12:00:00'),
(7, 1, '2026-06-04 12:00:00'),
(23, 1, '2026-06-01 12:00:00'),
(23, 13, '2026-06-02 12:00:00'),
(23, 16, '2026-06-03 12:00:00'),
(17, 20, '2026-06-01 12:00:00'),
(17, 24, '2026-06-02 12:00:00'),
(17, 14, '2026-06-03 12:00:00');

INSERT INTO event_type (event_type_id, code, name, description, is_active) VALUES
(1, 'hot_deals_view', 'Hot Deals View', 'The user has viewed the hot deals page.', TRUE),
(2, 'vehicle_details_view', 'Vehicle Details View', 'The user has viewed the vehicle details page.', TRUE),
(3, 'cart_add', 'Cart Add', 'The user has added an item to the cart.', TRUE),
(4, 'cart_remove', 'Cart Remove', 'The user has removed an item from the cart.', TRUE),
(5, 'purchase', 'Purchase', 'The user has purchased an item.', TRUE),
(6, 'edit_profile', 'Edit Profile', 'The user has edited their profile.', TRUE),
(7, 'delete_account', 'Delete Account', 'The user has deleted their account.', TRUE),
(8, 'publish_review', 'Publish Review', 'The user has published a review.', TRUE),
(9, 'delete_review', 'Delete Review', 'The user has deleted a review.', TRUE),
(10, 'wishlist_add', 'Wishlist Add', 'The user has added an item to the wishlist.', TRUE),
(11, 'wishlist_remove', 'Wishlist Remove', 'The user has removed an item from the wishlist.', TRUE);

INSERT INTO event_logs (event_id, event_type_id, user_id, cid, meta, ip_address, created_at) VALUES
(1, 2, 1, 1, '{"source": "web"}', '203.0.113.10', '2026-05-11 15:00:00'),
(2, 3, 1, 1, '{"qty": 1, "source": "web", "config_id": 1}', '203.0.113.10', '2026-05-12 15:50:00'),
(3, 5, 1, 1, '{"order_id": 1}', '203.0.113.10', '2026-05-12 16:05:00'),
(4, 10, 14, 7, '{"source": "web"}', '203.0.113.44', '2026-06-01 12:00:00'),
(5, 1, 7, NULL, '{"source": "web"}', '203.0.113.55', '2026-06-15 18:00:00'),
(6, 8, 1, 2, '{"rating": 4}', '203.0.113.10', '2026-06-20 12:00:00'),
(7, 4, 14, 22, '{"source": "web"}', '203.0.113.44', '2026-07-02 10:00:00');