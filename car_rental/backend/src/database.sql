CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    auth_provider VARCHAR(50) DEFAULT 'local',
    auth_provider_id VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(30),
    country VARCHAR(2),
    identification_type VARCHAR(30),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id),
    make VARCHAR(100),
    model VARCHAR(100),
    year INT,
    registration_number VARCHAR(100),
    vehicle_type VARCHAR(50),
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    seating_capacity INT,
    color VARCHAR(50),
    mileage INT,
    country VARCHAR(2),
    city VARCHAR(100),
    approval_status VARCHAR(20) DEFAULT 'PENDING',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_vehicle_search
ON vehicles(make, model, city, country);

CREATE TABLE vehicle_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    media_type VARCHAR(10),
    purpose VARCHAR(20),
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE vehicle_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    available_from DATE NOT NULL,
    available_to DATE NOT NULL,
    daily_price NUMERIC(10,2) NOT NULL,
    currency CHAR(3) NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    CHECK (available_from < available_to),
    CHECK (currency ~ '^[A-Z]{3}$')
);

ALTER TABLE vehicle_availability
ADD CONSTRAINT prevent_overlapping_availability
EXCLUDE USING gist (
    vehicle_id WITH =,
    daterange(available_from, available_to, '[]') WITH &&
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id),
    vehicle_id UUID REFERENCES vehicles(id),
    pickup_datetime TIMESTAMPTZ NOT NULL,
    return_datetime TIMESTAMPTZ NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    currency CHAR(3) NOT NULL,
    status VARCHAR(20) DEFAULT 'REQUESTED',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pre_journey_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    mileage_before INT,
    mileage_after INT,
    notes_before TEXT,
    notes_after TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
