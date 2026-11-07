-- WorkConnect Supabase Database Schema
-- You can copy and paste this entire script into your Supabase SQL Editor and click "Run"!

-- 1. Create the Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'customer',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the Workers (Artisans) Table
CREATE TABLE IF NOT EXISTS workers (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  skill TEXT NOT NULL,
  location TEXT NOT NULL,
  phone TEXT,
  rating NUMERIC(2, 1) DEFAULT 5.0,
  reviews INTEGER DEFAULT 0,
  image TEXT, -- Stores the uploaded Cloudinary photo URL
  portfolio TEXT[] DEFAULT '{}', -- Stores up to 4 Cloudinary work photos
  verified BOOLEAN DEFAULT FALSE,
  banned BOOLEAN DEFAULT FALSE,
  about TEXT,
  experience TEXT DEFAULT '3+ years',
  hourly_rate TEXT DEFAULT 'Negotiable',
  available_days TEXT[] DEFAULT '{"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"}',
  working_hours TEXT DEFAULT '08:00 - 18:00',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create the Reviews Table (Customers drop reviews for workers)
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  worker_id BIGINT REFERENCES workers(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create the Reports Table (Customers report bad actors / disputes)
CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  worker_id BIGINT REFERENCES workers(id) ON DELETE CASCADE,
  reporter_name TEXT NOT NULL,
  reporter_email TEXT,
  reporter_phone TEXT,
  reason TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create the Chat Conversations Table (Stores chatbot conversation history)
CREATE TABLE IF NOT EXISTS chat_conversations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  language TEXT DEFAULT 'pidgin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Insert Starter Sample Artisans (Nigerian context)
INSERT INTO workers (name, skill, location, phone, rating, reviews, image, verified, about, experience, hourly_rate)
VALUES
  (
    'Ben Okafor',
    'Electrician',
    'Nsukka, Enugu',
    '+234 803 123 4567',
    4.9,
    2,
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=60',
    TRUE,
    'Certified electrical technician specializing in home and commercial wiring, inverter installation, and fault troubleshooting.',
    '7+ years',
    '₦5,000 / visit'
  ),
  (
    'Emeka Eze',
    'Plumber',
    'Enugu Urban',
    '+234 802 987 6543',
    4.8,
    1,
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=60',
    TRUE,
    'Expert in water pipe repairs, borehole setup, bathroom fitting installations, and emergency leak fixes.',
    '5+ years',
    '₦4,500 / visit'
  ),
  (
    'Chinedu Alor',
    'Carpenter',
    'Nsukka, Enugu',
    '+234 814 555 8899',
    4.7,
    1,
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=60',
    TRUE,
    'Fine craftsmanship in custom wooden furniture, roofing, kitchen cabinets, and door installations.',
    '6+ years',
    'Negotiable'
  ),
  (
    'Amaka Johnson',
    'Tailor & Fashion Designer',
    'Enugu Urban',
    '+234 806 333 2211',
    4.9,
    1,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
    TRUE,
    'Specialist in Senator wears, native agbada, bespoke corporate suits, and female traditional bridal outfits.',
    '8+ years',
    'Per style'
  ),
  (
    'Sunday Oladipo',
    'Auto Mechanic',
    'Nsukka, Enugu',
    '+234 809 777 4433',
    4.6,
    1,
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=60',
    TRUE,
    'Toyota, Honda, and Mercedes engine diagnostics, computerized scanning, brake repair, and general auto servicing.',
    '10+ years',
    'Diagnostic fee applies'
  )
ON CONFLICT DO NOTHING;

-- 5. Starter Reviews for seeded workers
INSERT INTO reviews (worker_id, user_name, rating, comment)
VALUES
  (1, 'Chidi O.', 5, 'Very quick and safe NEPA wiring repair. Highly recommended!'),
  (1, 'Nneka U.', 5, 'Clean inverter installation, came on time and explained everything.'),
  (2, 'Ifeanyi K.', 5, 'Solved my compound leaking pipe issue quickly.'),
  (3, 'Obinna M.', 5, 'Built strong solid wood kitchen cabinets for my apartment.')
ON CONFLICT DO NOTHING;

-- 6. Helper migrations
ALTER TABLE workers ADD COLUMN IF NOT EXISTS email TEXT;

