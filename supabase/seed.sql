INSERT INTO hospitals (
  name,
  address,
  city,
  lga,
  phone,
  email,
  specialties,
  ownership,
  location,
  description_md,
  visiting_hours
)
VALUES

(
  'National Hospital Abuja',
  'Plot 132 Central Business District',
  'Abuja',
  'Municipal Area Council',
  '+2348012345678',
  'info@nationalhospital.gov.ng',
  ARRAY['emergency', 'surgery', 'cardiology', 'neurology', 'oncology'],
  'public',
  ST_MakePoint(7.4898, 9.0579)::GEOGRAPHY,
  '## About National Hospital Abuja\nNational Hospital Abuja is one of the leading tertiary healthcare institutions in Nigeria, providing specialist care, emergency services, and medical training.',
  'Daily: 9am–11am, 3pm–5pm'
),

(
  'University of Abuja Teaching Hospital',
  'Gwagwalada',
  'Abuja',
  'Gwagwalada',
  '+2348011111111',
  'info@uath.gov.ng',
  ARRAY['emergency', 'surgery', 'pediatric', 'maternity', 'cardiology'],
  'public',
  ST_MakePoint(7.0850, 8.9390)::GEOGRAPHY,
  '## About UATH\nThe University of Abuja Teaching Hospital serves as a major referral centre and teaching institution for healthcare professionals.',
  'Mon–Fri: 10am–12pm, 4pm–6pm'
),

(
  'Nizamiye Hospital',
  'Plot 1129 Cadastral Zone B19, Guzape',
  'Abuja',
  'Municipal Area Council',
  '+2348022222222',
  'info@nizamiyehospital.com',
  ARRAY['cardiology', 'oncology', 'surgery', 'radiology', 'emergency'],
  'private',
  ST_MakePoint(7.4825, 9.0265)::GEOGRAPHY,
  '## About Nizamiye Hospital\nNizamiye Hospital is a modern private hospital offering advanced diagnostic and specialist medical services.',
  'Mon–Sat: 8am–6pm'
),

(
  'Asokoro District Hospital',
  'Asokoro',
  'Abuja',
  'Municipal Area Council',
  '+2348033333333',
  'info@asokorodistricthospital.ng',
  ARRAY['emergency', 'maternity', 'pediatric', 'surgery'],
  'public',
  ST_MakePoint(7.5310, 9.0430)::GEOGRAPHY,
  '## About Asokoro District Hospital\nA major district hospital providing affordable healthcare services to residents of Abuja.',
  'Daily: 10am–1pm'
),

(
  'Garki Hospital Abuja',
  'Area 8, Garki',
  'Abuja',
  'Municipal Area Council',
  '+2348044444444',
  'info@garkihospital.com',
  ARRAY['emergency', 'cardiology', 'orthopedics', 'maternity'],
  'public',
  ST_MakePoint(7.4680, 9.0270)::GEOGRAPHY,
  '## About Garki Hospital\nGarki Hospital is a well-equipped healthcare facility known for specialist services and emergency care.',
  'Mon–Fri: 9am–12pm, 4pm–6pm'
),

(
  'Maitama District Hospital',
  'Maitama',
  'Abuja',
  'Municipal Area Council',
  '+2348055555555',
  'info@maitamahospital.ng',
  ARRAY['emergency', 'surgery', 'pediatric', 'cardiology'],
  'public',
  ST_MakePoint(7.5065, 9.0838)::GEOGRAPHY,
  '## About Maitama District Hospital\nA government healthcare institution providing primary and specialist healthcare services.',
  'Daily: 10am–2pm'
),

(
  'Cedarcrest Hospital',
  'Plot 1248, Muhammadu Buhari Way',
  'Abuja',
  'Municipal Area Council',
  '+2348066666666',
  'info@cedarcresthospitals.com',
  ARRAY['cardiology', 'surgery', 'neurology', 'emergency'],
  'private',
  ST_MakePoint(7.4390, 9.0760)::GEOGRAPHY,
  '## About Cedarcrest Hospital\nCedarcrest Hospital is a leading private healthcare provider offering advanced medical and surgical care.',
  'Mon–Sat: 8am–8pm'
),

(
  'Wuse General Hospital',
  'Wuse Zone 5',
  'Abuja',
  'Municipal Area Council',
  '+2348077777777',
  'info@wusegeneralhospital.ng',
  ARRAY['emergency', 'maternity', 'pediatric', 'dental'],
  'public',
  ST_MakePoint(7.4545, 9.0768)::GEOGRAPHY,
  '## About Wuse General Hospital\nWuse General Hospital provides comprehensive healthcare services for residents within the Federal Capital Territory.',
  'Daily: 9am–1pm'
),

(
  'Alliance Hospital',
  'Plot 2425 Herbert Macaulay Way',
  'Abuja',
  'Municipal Area Council',
  '+2348088888888',
  'info@alliancehospital.com',
  ARRAY['emergency', 'cardiology', 'surgery', 'maternity'],
  'private',
  ST_MakePoint(7.4240, 9.0610)::GEOGRAPHY,
  '## About Alliance Hospital\nAlliance Hospital is a multi-specialty private healthcare institution providing quality medical care.',
  'Mon–Sat: 8am–7pm'
),

(
  'Gwarinpa General Hospital',
  'Gwarinpa',
  'Abuja',
  'Bwari',
  '+2348099999999',
  'info@gwarinpahospital.ng',
  ARRAY['emergency', 'maternity', 'pediatric', 'surgery'],
  'public',
  ST_MakePoint(7.3980, 9.1060)::GEOGRAPHY,
  '## About Gwarinpa General Hospital\nGwarinpa General Hospital serves one of the largest residential districts in Abuja with accessible healthcare services.',
  'Daily: 10am–2pm'
);