-- #########################################################
-- Media related tables (Media Service)
-- #########################################################
CREATE TABLE media (
  media_id     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  url          VARCHAR(500)    NOT NULL,
  file_type    VARCHAR(50)     DEFAULT NULL,
  alt_text     VARCHAR(255)    DEFAULT NULL,
  uploaded_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (media_id) 
);

-- #########################################################
-- Identity & Auth (IAM Service)
-- #########################################################

CREATE TABLE roles (
  role_id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_name  VARCHAR(50)  NOT NULL,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (role_id),

  UNIQUE KEY uq_roles_role_name (role_name)
);


CREATE TABLE users (
  user_id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_id        INT UNSIGNED    NOT NULL,
  first_name     VARCHAR(100)    NOT NULL,
  last_name      VARCHAR(100)    NOT NULL,
  email          VARCHAR(255)    NOT NULL,
  password_hash  CHAR(60)        NOT NULL,
  phone_number   VARCHAR(20)     DEFAULT NULL,
  deleted_at     TIMESTAMP       DEFAULT NULL,
  created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,
  
  -- Constraints, Keys, and Indexes
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email),

  KEY idx_users_role_id (role_id),

  CONSTRAINT fk_users_role
    FOREIGN KEY (role_id) REFERENCES roles (role_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);


CREATE TABLE addresses (
  address_id   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED NOT NULL,
  street       VARCHAR(255)    NOT NULL,
  city         VARCHAR(100)    NOT NULL,
  province     VARCHAR(100)    NOT NULL,
  country      VARCHAR(100)    NOT NULL,
  postal_code  VARCHAR(20)     NOT NULL,
  is_default   BOOLEAN         NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (address_id),

  KEY idx_addresses_user_id (user_id),

  CONSTRAINT fk_addresses_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE TABLE refresh_tokens (
  token_id     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  jti          CHAR(36)        NOT NULL,
  user_id      BIGINT UNSIGNED NOT NULL,
  token_hash   CHAR(64)        NOT NULL,
  expires_at   TIMESTAMP       NOT NULL,
  replaced_by  BIGINT UNSIGNED DEFAULT NULL,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (token_id),

  UNIQUE KEY uq_refresh_tokens_jti (jti),
  KEY idx_refresh_tokens_user_id (user_id),
  KEY idx_refresh_tokens_replaced_by (replaced_by),
  
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_refresh_tokens_replaced_by
    FOREIGN KEY (replaced_by) REFERENCES refresh_tokens (token_id)
    ON UPDATE CASCADE ON DELETE SET NULL
);


CREATE TABLE token_blocklist (
  blocklist_id  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  jti           CHAR(36)        NOT NULL,
  user_id       BIGINT UNSIGNED NOT NULL,
  expires_at    TIMESTAMP       NOT NULL,
  token_type    VARCHAR(20)     NOT NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (blocklist_id),

  UNIQUE KEY uq_token_blocklist_jti (jti),
  KEY idx_token_blocklist_user_id (user_id),

  CONSTRAINT fk_token_blocklist_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- #########################################################
-- Catalog related tables (Catalog Service)
-- #########################################################

CREATE TABLE brands (
  brand_id     INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name         VARCHAR(100)  NOT NULL,
  description  TEXT          DEFAULT NULL,
  country      VARCHAR(100)  DEFAULT NULL,
  website_url  VARCHAR(255)  DEFAULT NULL,
  logo_url     VARCHAR(255)  DEFAULT NULL,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (brand_id),

  UNIQUE KEY uq_brands_name (name)
);

-- >> Model (Super) table
CREATE TABLE models (
  model_id      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  brand_id      INT UNSIGNED  NOT NULL,
  model_type    VARCHAR(50)   NOT NULL,          
  name          VARCHAR(100)  NOT NULL,
  description   TEXT          DEFAULT NULL,
  release_year  SMALLINT UNSIGNED DEFAULT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (model_id),

  KEY idx_models_brand_id (brand_id),

  CONSTRAINT fk_models_brand
    FOREIGN KEY (brand_id) REFERENCES brands (brand_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);


-- >> Vehicle Model (Sub) table
CREATE TABLE vehicle_models (
  model_id     INT UNSIGNED  NOT NULL,      
  body_shape   VARCHAR(50)   DEFAULT NULL,
  door_count   TINYINT UNSIGNED DEFAULT NULL,
  drivetrain   VARCHAR(20)   DEFAULT NULL,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (model_id),

  CONSTRAINT fk_vehicle_models_model
    FOREIGN KEY (model_id) REFERENCES models (model_id)
    ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE TABLE option_categories (
  category_id  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name         VARCHAR(100)  NOT NULL,
  select_type  ENUM('SINGLE','MULTI') NOT NULL, 

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (category_id),

  UNIQUE KEY uq_option_categories_name (name),

  CONSTRAINT chk_option_categories_select_type
    CHECK (select_type IN ('SINGLE', 'MULTI'))
);


CREATE TABLE option_values (
  option_id    INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  category_id  INT UNSIGNED  NOT NULL,
  name         VARCHAR(100)  NOT NULL,
  price_delta  DECIMAL(10,2) NOT NULL DEFAULT 0.00,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (option_id),

  KEY idx_option_values_category_id (category_id),

  CONSTRAINT fk_option_values_category
    FOREIGN KEY (category_id) REFERENCES option_categories (category_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_option_values_price_delta
    CHECK (price_delta >= 0)
);

-- >> Catalog Items (Super) table
CREATE TABLE catalog_items (
  cid         BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  model_id    INT UNSIGNED     NOT NULL,
  item_type   VARCHAR(50)      NOT NULL,           
  base_price  DECIMAL(12,2)    NOT NULL,
  quantity    INT UNSIGNED     NOT NULL DEFAULT 0,
  is_active   BOOLEAN          NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (cid),

  KEY idx_catalog_items_model_id (model_id),

  CONSTRAINT fk_catalog_items_model
    FOREIGN KEY (model_id) REFERENCES models (model_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);


-- >> Vehicles (Sub) table
CREATE TABLE vehicles (
  cid        BIGINT UNSIGNED  NOT NULL,        
  year       SMALLINT UNSIGNED DEFAULT NULL,
  `condition`  VARCHAR(20)      DEFAULT NULL,     
  mileage    INT UNSIGNED     DEFAULT NULL,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (cid),

  CONSTRAINT chk_vehicles_condition
    CHECK (`condition` IN ('new', 'used')),
  CONSTRAINT fk_vehicles_catalog_item
    FOREIGN KEY (cid) REFERENCES catalog_items (cid)
    ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE TABLE vehicle_history (
  history_id    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cid           BIGINT UNSIGNED NOT NULL,
  has_accidents BOOLEAN         NOT NULL DEFAULT FALSE,
  media_id      BIGINT UNSIGNED DEFAULT NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (history_id),

  KEY idx_vehicle_history_cid (cid),

  CONSTRAINT fk_vehicle_history_vehicle
    FOREIGN KEY (cid) REFERENCES vehicles (cid)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_vehicle_history_media
    FOREIGN KEY (media_id) REFERENCES media (media_id)
    ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE TABLE catalog_options (
  cid        BIGINT UNSIGNED NOT NULL,
  option_id  INT UNSIGNED    NOT NULL,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (cid, option_id),

  KEY idx_catalog_options_option_id (option_id),

  CONSTRAINT fk_catalog_options_catalog_item
    FOREIGN KEY (cid) REFERENCES catalog_items (cid)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_catalog_options_option_value
    FOREIGN KEY (option_id) REFERENCES option_values (option_id)
    ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE TABLE configurations (
  config_id    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cid          BIGINT UNSIGNED NOT NULL,
  total_price  DECIMAL(12,2)   NOT NULL,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (config_id),

  KEY idx_configurations_cid (cid),

  CONSTRAINT fk_configurations_catalog_item
    FOREIGN KEY (cid) REFERENCES catalog_items (cid)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_configurations_total_price
    CHECK (total_price >= 0)
);


CREATE TABLE config_options (
  config_id  BIGINT UNSIGNED NOT NULL,
  option_id  INT UNSIGNED    NOT NULL,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (config_id, option_id),

  KEY idx_config_options_option_id (option_id),
  
  CONSTRAINT fk_config_options_configuration
    FOREIGN KEY (config_id) REFERENCES configurations (config_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_config_options_option_value
    FOREIGN KEY (option_id) REFERENCES option_values (option_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);


CREATE TABLE promos (
  promo_id     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name         VARCHAR(150)    NOT NULL,
  description  TEXT            DEFAULT NULL,
  is_active    BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,
  -- Constraints, Keys, and Indexes
  PRIMARY KEY (promo_id),
  UNIQUE KEY uq_promos_name (name)
);


CREATE TABLE catalog_promos (
  cid              BIGINT UNSIGNED NOT NULL,
  promo_id         BIGINT UNSIGNED NOT NULL,
  discount_amount  DECIMAL(10,2)   NOT NULL,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (cid, promo_id),

  KEY idx_catalog_promos_promo_id (promo_id),
  
  CONSTRAINT fk_catalog_promos_catalog_item
    FOREIGN KEY (cid) REFERENCES catalog_items (cid)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_catalog_promos_promo
    FOREIGN KEY (promo_id) REFERENCES promos (promo_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT chk_catalog_promos_discount_amount
    CHECK (discount_amount >= 0)
);


-- #########################################################
-- Cart related tables (Cart Service)
-- #########################################################

CREATE TABLE carts (
  cart_id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id        BIGINT UNSIGNED DEFAULT NULL,
  session_token  CHAR(36)        DEFAULT NULL,
  expires_at     TIMESTAMP       DEFAULT NULL, -- note: this is for guest carts ONLY
  created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (cart_id),

  KEY idx_carts_user_id (user_id),
  UNIQUE KEY uq_carts_session_token (session_token),

  CONSTRAINT fk_carts_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE TABLE cart_items (
  cart_item_id  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cart_id       BIGINT UNSIGNED NOT NULL,
  cid           BIGINT UNSIGNED NOT NULL,
  config_id     BIGINT UNSIGNED DEFAULT NULL,
  quantity      INT UNSIGNED    NOT NULL DEFAULT 1,
  added_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (cart_item_id),

  KEY idx_cart_items_cart_id (cart_id),
  KEY idx_cart_items_cid (cid),
  KEY idx_cart_items_config_id (config_id),

  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id) REFERENCES carts (cart_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_catalog_item
    FOREIGN KEY (cid) REFERENCES catalog_items (cid)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_cart_items_configuration
    FOREIGN KEY (config_id) REFERENCES configurations (config_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT chk_cart_items_quantity
    CHECK (quantity > 0)
);

-- #########################################################
-- Order related tables (Order Service)
-- #########################################################
CREATE TABLE orders (
  order_id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED DEFAULT NULL,
  guest_email     VARCHAR(255)    DEFAULT NULL,
  order_status    ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')     NOT NULL DEFAULT 'pending',
  payment_status  ENUM('paid', 'failed')     NOT NULL DEFAULT 'failed',
  subtotal        DECIMAL(12,2)   NOT NULL,
  tax             DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  total           DECIMAL(12,2)   NOT NULL,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (order_id),

  KEY idx_orders_user_id (user_id),
  KEY idx_orders_guest_email (guest_email),

  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_orders_payment_status
    CHECK (payment_status IN ('paid', 'failed')),
  CONSTRAINT chk_orders_order_status
    CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  CONSTRAINT chk_orders_subtotal
    CHECK (subtotal >= 0),
  CONSTRAINT chk_orders_tax
    CHECK (tax >= 0),
  CONSTRAINT chk_orders_total
    CHECK (total >= 0)
);


CREATE TABLE order_addresses (
  order_address_id     BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  order_id             BIGINT UNSIGNED  NOT NULL,
  address_type         ENUM('shipping','billing') NOT NULL,
  full_name            VARCHAR(150)     NOT NULL,
  phone_number         VARCHAR(20)      DEFAULT NULL,
  street               VARCHAR(255)     NOT NULL,
  city                 VARCHAR(100)     NOT NULL,
  province             VARCHAR(100)     NOT NULL,
  country              VARCHAR(100)     NOT NULL,
  postal_code          VARCHAR(20)      NOT NULL,
  created_at           TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (order_address_id),

  KEY idx_order_addresses_order_id (order_id),

  CONSTRAINT fk_order_addresses_order
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT chk_order_addresses_address_type
    CHECK (address_type IN ('shipping', 'billing'))
);


CREATE TABLE order_items (
  order_item_id  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id       BIGINT UNSIGNED NOT NULL,
  cid            BIGINT UNSIGNED NOT NULL,
  config_id      BIGINT UNSIGNED DEFAULT NULL,
  quantity       INT UNSIGNED    NOT NULL DEFAULT 1,
  unit_price     DECIMAL(12,2)   NOT NULL,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (order_item_id),

  KEY idx_order_items_order_id (order_id),
  KEY idx_order_items_cid (cid),
  KEY idx_order_items_config_id (config_id),

  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders (order_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_order_items_catalog_item
    FOREIGN KEY (cid) REFERENCES catalog_items (cid)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_order_items_configuration
    FOREIGN KEY (config_id) REFERENCES configurations (config_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_order_items_quantity
    CHECK (quantity > 0),
  CONSTRAINT chk_order_items_unit_price
    CHECK (unit_price >= 0)
);


-- #########################################################
-- Payment related tables (Payment Service)
-- #########################################################
CREATE TABLE payment_attempts (
  attempt_id      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id        BIGINT UNSIGNED NOT NULL,
  user_id         BIGINT UNSIGNED DEFAULT NULL,
  amount          DECIMAL(12,2)   NOT NULL,
  payment_method  ENUM('credit_card', 'debit_card', 'apple_pay')     NOT NULL,
  status          ENUM('success', 'failed')     NOT NULL DEFAULT 'failed',
  attempted_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (attempt_id),

  KEY idx_payment_attempts_order_id (order_id),
  KEY idx_payment_attempts_user_id (user_id),

  CONSTRAINT fk_payment_attempts_order
    FOREIGN KEY (order_id) REFERENCES orders (order_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_payment_attempts_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_payment_attempts_status
    CHECK (status IN ('success', 'failed')),
  CONSTRAINT chk_payment_attempts_amount
    CHECK (amount >= 0),
  CONSTRAINT chk_payment_attempts_payment_method
    CHECK (payment_method IN ('credit_card', 'debit_card', 'apple_pay'))
);

-- #########################################################
-- review related tables (Review Service)
-- #########################################################
CREATE TABLE reviews (
  review_id   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cid         BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  title       VARCHAR(150)    DEFAULT NULL,
  body        TEXT            DEFAULT NULL,
  rating      TINYINT UNSIGNED NOT NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (review_id),

  UNIQUE KEY uq_reviews_cid_user_id (cid, user_id),
  KEY idx_reviews_cid (cid),
  KEY idx_reviews_user_id (user_id),

  CONSTRAINT fk_reviews_catalog_item
    FOREIGN KEY (cid) REFERENCES catalog_items (cid)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT chk_reviews_rating
    CHECK (rating >= 1 AND rating <= 5)
);

-- #########################################################
-- Wishlist related tables (Wishlist Service)
-- #########################################################
CREATE TABLE wishlist (
  user_id   BIGINT UNSIGNED NOT NULL,
  cid       BIGINT UNSIGNED NOT NULL,
  added_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (user_id, cid),

  KEY idx_wishlist_cid (cid),
  
  CONSTRAINT fk_wishlist_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_catalog_item
    FOREIGN KEY (cid) REFERENCES catalog_items (cid)
    ON UPDATE CASCADE ON DELETE CASCADE
);




CREATE TABLE catalog_images (
  image_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cid            BIGINT UNSIGNED NOT NULL,
  media_id       BIGINT UNSIGNED NOT NULL,
  display_order  INT UNSIGNED    NOT NULL DEFAULT 0,
  is_primary     BOOLEAN         NOT NULL DEFAULT FALSE,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (image_id),

  KEY idx_catalog_images_cid (cid),
  KEY idx_catalog_images_media_id (media_id),

  CONSTRAINT fk_catalog_images_catalog_item
    FOREIGN KEY (cid) REFERENCES catalog_items (cid)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_catalog_images_media
    FOREIGN KEY (media_id) REFERENCES media (media_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT chk_catalog_images_display_order
    CHECK (display_order >= 0)
);

-- #########################################################
-- Analytics related tables (Analytics Service)
-- #########################################################
CREATE TABLE event_type (
  event_type_id  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  code           VARCHAR(50)   NOT NULL,
  name           VARCHAR(100)  NOT NULL,
  description    TEXT          DEFAULT NULL,
  is_active      BOOLEAN       NOT NULL DEFAULT TRUE,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (event_type_id),

  UNIQUE KEY uq_event_type_code (code)
);


CREATE TABLE event_logs (
  event_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_type_id  INT UNSIGNED    NOT NULL,
  user_id        BIGINT UNSIGNED DEFAULT NULL,
  cid            BIGINT UNSIGNED DEFAULT NULL,
  meta           JSON            DEFAULT NULL,
  ip_address     VARCHAR(45)     DEFAULT NULL,      
  created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints, Keys, and Indexes
  PRIMARY KEY (event_id),

  KEY idx_event_logs_event_type_id (event_type_id),
  KEY idx_event_logs_user_id (user_id),
  KEY idx_event_logs_cid (cid),
  KEY idx_event_logs_created_at (created_at),

  CONSTRAINT fk_event_logs_event_type
    FOREIGN KEY (event_type_id) REFERENCES event_type (event_type_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_event_logs_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_event_logs_catalog_item
    FOREIGN KEY (cid) REFERENCES catalog_items (cid)
    ON UPDATE CASCADE ON DELETE SET NULL
);
