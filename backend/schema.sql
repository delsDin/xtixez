-- Création des tables pour le portfolio de Dels Dinla

CREATE TABLE IF NOT EXISTS love_messages (
    id VARCHAR(50) PRIMARY KEY,
    sender VARCHAR(30) NOT NULL,
    text VARCHAR(200) NOT NULL,
    timestamp BIGINT NOT NULL,
    emoji VARCHAR(8) DEFAULT '💖',
    bubble_color TEXT NOT NULL,
    x INT CHECK (x BETWEEN 0 AND 100),
    y INT CHECK (y BETWEEN 0 AND 100),
    scale FLOAT CHECK (scale > 0),
    speed INT CHECK (speed > 0)
);

CREATE TABLE IF NOT EXISTS love_stories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    tag VARCHAR(50) NOT NULL,
    reading_time VARCHAR(50) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    date VARCHAR(50) NOT NULL,
    paragraphs TEXT[] NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(20) CHECK (category IN ('Dev', 'Data', 'Autres')),
    image VARCHAR(255) NOT NULL,
    techs TEXT[] NOT NULL,
    description TEXT NOT NULL,
    details TEXT NOT NULL,
    github VARCHAR(255) DEFAULT '#',
    demo VARCHAR(255) DEFAULT '#'
);

CREATE TABLE IF NOT EXISTS experiences (
    id SERIAL PRIMARY KEY,
    role VARCHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    period VARCHAR(30) NOT NULL,
    description TEXT[] NOT NULL,
    details TEXT NOT NULL,
    technologies TEXT[] NOT NULL,
    achievements TEXT[] NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT NOT NULL,
    icon_name VARCHAR(30) NOT NULL,
    color VARCHAR(100) NOT NULL,
    features TEXT[] NOT NULL,
    advantages TEXT[] NOT NULL,
    use_cases TEXT[] NOT NULL,
    technologies TEXT[] NOT NULL,
    duration VARCHAR(30) NOT NULL,
    deliverables TEXT[] NOT NULL
);

CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(105) NOT NULL,
    role VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    avatar VARCHAR(255) NOT NULL,
    rating INT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    service_id VARCHAR(50) REFERENCES services(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS skills (
    category VARCHAR(30),
    name VARCHAR(50),
    level INT CHECK (level BETWEEN 0 AND 100),
    PRIMARY KEY (category, name)
);

CREATE TABLE IF NOT EXISTS certifications (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    issuer VARCHAR(100) NOT NULL,
    date VARCHAR(50) NOT NULL,
    credential_id VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    skills TEXT[] NOT NULL,
    description TEXT NOT NULL,
    verify_url VARCHAR(255) NOT NULL,
    logo_color VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS queen_replies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    mood VARCHAR(50) NOT NULL,
    created_at BIGINT NOT NULL
);
