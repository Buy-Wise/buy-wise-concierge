-- PostgreSQL schema for Buy Wise Decision Intelligence SaaS

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_whatsapp VARCHAR(20),
  language_preference VARCHAR(2) CHECK (language_preference IN ('EN', 'HI', 'TA')) DEFAULT 'EN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  role VARCHAR(10) CHECK (role IN ('user', 'admin')) DEFAULT 'user'
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_tier VARCHAR(20) CHECK (service_tier IN ('BASIC', 'PRO', 'EXPRESS', 'DEAL_WATCH')) NOT NULL,
  product_category VARCHAR(20) CHECK (product_category IN ('PHONE', 'LAPTOP', 'OTHER')) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('PENDING', 'PAID', 'IN_PROGRESS', 'DELIVERED', 'CANCELLED')) DEFAULT 'PENDING',
  amount INTEGER NOT NULL, -- stored in paise
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP
);

CREATE TABLE intake_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  budget_min INTEGER NOT NULL,
  budget_max INTEGER NOT NULL,
  primary_use_case VARCHAR(255),
  preferences TEXT,
  priority_factors TEXT,
  additional_notes TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  generated_prompt TEXT,
  raw_ai_output TEXT,
  formatted_report TEXT,
  pdf_url VARCHAR(255),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP,
  delivery_method VARCHAR(20) CHECK (delivery_method IN ('WHATSAPP', 'EMAIL', 'BOTH'))
);

CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  was_helpful BOOLEAN,
  did_purchase BOOLEAN,
  comments TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  target_price INTEGER NOT NULL,
  current_price INTEGER,
  status VARCHAR(20) CHECK (status IN ('ACTIVE', 'TRIGGERED', 'CANCELLED')) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
