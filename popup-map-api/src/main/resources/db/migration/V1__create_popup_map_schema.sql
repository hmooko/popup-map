CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE popup (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    brand_name VARCHAR(120) NOT NULL,
    description TEXT,
    category VARCHAR(30) NOT NULL,
    region VARCHAR(30) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    location GEOGRAPHY(Point, 4326)
        GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography) STORED,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    opening_hours VARCHAR(80) NOT NULL,
    reservation_required BOOLEAN NOT NULL,
    free_admission BOOLEAN NOT NULL,
    entry_fee INTEGER,
    official_url VARCHAR(500),
    reservation_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_popup_period CHECK (start_date <= end_date),
    CONSTRAINT chk_popup_latitude CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT chk_popup_longitude CHECK (longitude >= -180 AND longitude <= 180),
    CONSTRAINT chk_popup_entry_fee CHECK (
        (free_admission = TRUE AND (entry_fee IS NULL OR entry_fee = 0))
        OR (free_admission = FALSE AND (entry_fee IS NULL OR entry_fee >= 0))
    )
);

CREATE TABLE admin_user (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_activity_log (
    id BIGSERIAL PRIMARY KEY,
    admin_user_id BIGINT REFERENCES admin_user(id),
    popup_id BIGINT REFERENCES popup(id) ON DELETE SET NULL,
    action VARCHAR(40) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_popup_region ON popup (region);
CREATE INDEX idx_popup_category ON popup (category);
CREATE INDEX idx_popup_period ON popup (start_date, end_date);
CREATE INDEX idx_popup_visible_end_date ON popup (visible, end_date);
CREATE INDEX idx_popup_location ON popup USING GIST (location);
CREATE UNIQUE INDEX uk_admin_user_email ON admin_user (email);
