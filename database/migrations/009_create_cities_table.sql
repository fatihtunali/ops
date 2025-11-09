-- Create cities table for Turkish cities
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cities_name ON cities(name);

-- Insert all 81 Turkish cities
INSERT INTO cities (name, region) VALUES
-- Marmara Region
('Istanbul', 'Marmara'),
('Kocaeli', 'Marmara'),
('Sakarya', 'Marmara'),
('Edirne', 'Marmara'),
('Kirklareli', 'Marmara'),
('Tekirdag', 'Marmara'),
('Canakkale', 'Marmara'),
('Balikesir', 'Marmara'),
('Bursa', 'Marmara'),
('Yalova', 'Marmara'),
('Bilecik', 'Marmara'),

-- Aegean Region
('Izmir', 'Aegean'),
('Aydin', 'Aegean'),
('Denizli', 'Aegean'),
('Mugla', 'Aegean'),
('Manisa', 'Aegean'),
('Afyonkarahisar', 'Aegean'),
('Kutahya', 'Aegean'),
('Usak', 'Aegean'),

-- Mediterranean Region
('Antalya', 'Mediterranean'),
('Adana', 'Mediterranean'),
('Mersin', 'Mediterranean'),
('Hatay', 'Mediterranean'),
('Kahramanmaras', 'Mediterranean'),
('Osmaniye', 'Mediterranean'),
('Isparta', 'Mediterranean'),
('Burdur', 'Mediterranean'),

-- Central Anatolia Region
('Ankara', 'Central Anatolia'),
('Konya', 'Central Anatolia'),
('Kayseri', 'Central Anatolia'),
('Eskisehir', 'Central Anatolia'),
('Sivas', 'Central Anatolia'),
('Yozgat', 'Central Anatolia'),
('Kirsehir', 'Central Anatolia'),
('Aksaray', 'Central Anatolia'),
('Nigde', 'Central Anatolia'),
('Nevsehir', 'Central Anatolia'),
('Karaman', 'Central Anatolia'),
('Cankiri', 'Central Anatolia'),
('Kirikkale', 'Central Anatolia'),

-- Black Sea Region
('Samsun', 'Black Sea'),
('Trabzon', 'Black Sea'),
('Ordu', 'Black Sea'),
('Rize', 'Black Sea'),
('Giresun', 'Black Sea'),
('Artvin', 'Black Sea'),
('Gumushane', 'Black Sea'),
('Tokat', 'Black Sea'),
('Amasya', 'Black Sea'),
('Zonguldak', 'Black Sea'),
('Karabuk', 'Black Sea'),
('Bartin', 'Black Sea'),
('Kastamonu', 'Black Sea'),
('Sinop', 'Black Sea'),
('Bolu', 'Black Sea'),
('Duzce', 'Black Sea'),

-- Eastern Anatolia Region
('Erzurum', 'Eastern Anatolia'),
('Erzincan', 'Eastern Anatolia'),
('Agri', 'Eastern Anatolia'),
('Kars', 'Eastern Anatolia'),
('Igdir', 'Eastern Anatolia'),
('Ardahan', 'Eastern Anatolia'),
('Malatya', 'Eastern Anatolia'),
('Elazig', 'Eastern Anatolia'),
('Tunceli', 'Eastern Anatolia'),
('Bingol', 'Eastern Anatolia'),
('Mus', 'Eastern Anatolia'),
('Bitlis', 'Eastern Anatolia'),
('Van', 'Eastern Anatolia'),
('Hakkari', 'Eastern Anatolia'),

-- Southeastern Anatolia Region
('Gaziantep', 'Southeastern Anatolia'),
('Sanliurfa', 'Southeastern Anatolia'),
('Diyarbakir', 'Southeastern Anatolia'),
('Mardin', 'Southeastern Anatolia'),
('Batman', 'Southeastern Anatolia'),
('Sirnak', 'Southeastern Anatolia'),
('Siirt', 'Southeastern Anatolia'),
('Kilis', 'Southeastern Anatolia'),
('Adiyaman', 'Southeastern Anatolia');

-- Add foreign key constraint to vehicle_rates table
ALTER TABLE vehicle_rates
ADD CONSTRAINT fk_vehicle_rates_city
FOREIGN KEY (city) REFERENCES cities(name)
ON UPDATE CASCADE
ON DELETE RESTRICT;

COMMENT ON TABLE cities IS 'List of all Turkish cities for standardized city selection';
COMMENT ON COLUMN cities.region IS 'Geographical region of Turkey (Marmara, Aegean, Mediterranean, Central Anatolia, Black Sea, Eastern Anatolia, Southeastern Anatolia)';
