CREATE TABLE dim_crop (
    crop_id SERIAL PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL UNIQUE,
    crop_category VARCHAR(100)
);

CREATE TABLE dim_location (
    location_id SERIAL PRIMARY KEY,
    state_name VARCHAR(100) NOT NULL,
    district_name VARCHAR(100) NOT NULL,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    UNIQUE (state_name, district_name)
);

CREATE TABLE dim_season (
    season_id SERIAL PRIMARY KEY,
    season_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE dim_soil_profile (
    soil_profile_id SERIAL PRIMARY KEY,
    soil_type VARCHAR(100) NOT NULL,
    n_value NUMERIC(10, 2) NOT NULL,
    p_value NUMERIC(10, 2) NOT NULL,
    k_value NUMERIC(10, 2) NOT NULL,
    ph_value NUMERIC(4, 2) NOT NULL,
    rainfall_mm NUMERIC(10, 2),
    temperature_c NUMERIC(5, 2),
    humidity_pct NUMERIC(5, 2)
);

CREATE TABLE fact_market_history (
    market_fact_id SERIAL PRIMARY KEY,
    crop_id INT NOT NULL REFERENCES dim_crop(crop_id),
    location_id INT NOT NULL REFERENCES dim_location(location_id),
    season_id INT NOT NULL REFERENCES dim_season(season_id),
    year INT NOT NULL,
    area_hectare NUMERIC(12, 2) NOT NULL,
    production_tonnes NUMERIC(12, 2) NOT NULL,
    yield_tonne_per_hectare NUMERIC(12, 4) NOT NULL,
    avg_market_price NUMERIC(12, 2)
);

CREATE TABLE fact_mandi_price (
    mandi_price_id SERIAL PRIMARY KEY,
    location_id INT REFERENCES dim_location(location_id),
    crop_id INT REFERENCES dim_crop(crop_id),
    market_name VARCHAR(150),
    variety VARCHAR(150),
    grade VARCHAR(100),
    arrival_date DATE NOT NULL,
    min_price NUMERIC(12, 2),
    max_price NUMERIC(12, 2),
    modal_price NUMERIC(12, 2),
    source_name VARCHAR(100) DEFAULT 'data.gov.in mandi API',
    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fact_farm_observation (
    farm_obs_id SERIAL PRIMARY KEY,
    location_id INT NOT NULL REFERENCES dim_location(location_id),
    soil_profile_id INT NOT NULL REFERENCES dim_soil_profile(soil_profile_id),
    observation_ts TIMESTAMP NOT NULL,
    source_type VARCHAR(20) NOT NULL
);

CREATE TABLE ref_crop_ideal_profile (
    crop_id INT PRIMARY KEY REFERENCES dim_crop(crop_id),
    ideal_soil_type VARCHAR(100) NOT NULL,
    ideal_n NUMERIC(10, 2) NOT NULL,
    ideal_p NUMERIC(10, 2) NOT NULL,
    ideal_k NUMERIC(10, 2) NOT NULL,
    ideal_ph NUMERIC(4, 2) NOT NULL,
    ideal_rainfall_mm NUMERIC(10, 2),
    ideal_temperature_c NUMERIC(5, 2),
    ideal_humidity_pct NUMERIC(5, 2),
    n_tolerance_pct NUMERIC(5, 2),
    p_tolerance_pct NUMERIC(5, 2),
    k_tolerance_pct NUMERIC(5, 2),
    ph_tolerance_pct NUMERIC(5, 2)
);
