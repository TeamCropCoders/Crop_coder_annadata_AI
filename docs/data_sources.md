# Raw Data Sources

## Soil and NPK Data
Use soil type only as a fallback proxy. For real compatibility scoring, prefer actual soil-test values from a farmer, lab, or Soil Health Card record.

Recommended sources:

- Soil Health Card Portal: https://soilhealth.dac.gov.in
- Soil Health Card FAQ explaining N, P, K, pH, EC, OC, and micronutrient parameters: https://support.soilhealth.dac.gov.in/kb/faq.php?id=38%3Fid%3D38&lang=en-US
- NIC Soil Health Card Portal overview: https://www.nic.gov.in/project/soil-health-card-portal/
- ICAR-NBSS&LUP soil resource maps and soil survey reference: https://icar-nbsslup.org.in/
- ICAR note on national soil resource maps and agro-ecological regions: https://www.icar.gov.in/en/landmark-technologies-1

Current demo approach:

```text
soil_type -> fallback NPK/pH baseline
```

Production approach:

```text
actual farmer soil test / SHC record -> N, P, K, pH -> compatibility score
```

## District-Season Weather Data
Recommended sources:

- Data.gov.in Daily District-wise Rainfall Data: https://www.data.gov.in/resource/daily-district-wise-rainfall-data
- Queryable rainfall API resource id: `6c05cd1b-ed59-40c2-bc31-e314f39c6971`
- Data.gov.in Rainfall catalog: https://ap.data.gov.in/catalog/rainfall
- NASA POWER Daily API for temperature, humidity, and precipitation by latitude/longitude: https://power.larc.nasa.gov/docs/services/api/temporal/daily/
- NASA POWER Monthly/Annual API for season-level climate features: https://power.larc.nasa.gov/docs/services/api/temporal/monthly/

Current demo approach:

```text
district + season -> fallback rainfall/temperature/humidity baseline
```

Production approach:

```text
district centroid lat/long -> NASA POWER API -> rainfall, temperature, humidity
```

## Crop Production and Yield Data
Recommended source:

- Data.gov.in district-wise, season-wise crop production statistics: https://www.data.gov.in/catalog/district-wise-season-wise-crop-production-statistics-0
- Resource page: https://www.data.gov.in/resource/district-wise-season-wise-crop-production-statistics-1997

Note: this production resource is best handled as a downloaded raw file in the current project, then normalized locally with `scripts/preprocess_production.py`.

Local preprocessing:

```bash
python scripts/preprocess_production.py
```

Outputs:

- `data/clean/production_features.csv`
- `data/clean/latest_yield_features.csv`

The API now uses `latest_yield_features.csv` to prioritize crops that actually have historical district-season production data.

## Mandi Price Data
Recommended source:

- Data.gov.in Current Daily Price of Various Commodities from Various Markets: https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi

Local fetch:

```bash
python scripts/fetch_mandi_prices.py --commodity Potato --state "Uttar Pradesh" --district Agra --period monthly
```

The script and API both use stored CSV snapshots when the live API is unavailable or rate-limited.
