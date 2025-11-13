--Users Table
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invitations table
CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    invited_by_user_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individuals table
CREATE TABLE individuals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    birth_date DATE,
    birth_place VARCHAR(255),
    death_date DATE,
    death_place VARCHAR(255),
    is_alive BOOLEAN DEFAULT TRUE,
    bio TEXT,
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relationships table
CREATE TABLE relationships (
    id SERIAL PRIMARY KEY,
    individual_id INTEGER REFERENCES individuals(id) ON DELETE CASCADE,
    related_individual_id INTEGER REFERENCES individuals(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'parent', 'child', 'spouse', 'sibling'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);