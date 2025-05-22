-- Create database tables for Eventra application

-- Users table
CREATE TABLE users (
    uuid VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id VARCHAR(50) PRIMARY KEY,
    creator_id VARCHAR(36) NOT NULL REFERENCES users(uuid),
    type VARCHAR(10) NOT NULL CHECK (type IN ('1:1', 'group')),
    name VARCHAR(255) NOT NULL,
    detail TEXT,
    location VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    share_url VARCHAR(255) NOT NULL,
    is_anonymous_allowed BOOLEAN DEFAULT FALSE,
    can_multiple_vote BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event dates table
CREATE TABLE event_dates (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event time slots table
CREATE TABLE event_time_slots (
    id SERIAL PRIMARY KEY,
    event_date_id INTEGER NOT NULL REFERENCES event_dates(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event participants table
CREATE TABLE event_participants (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(uuid),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    is_anonymous BOOLEAN DEFAULT FALSE,
    participant_name VARCHAR(100),
    participant_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Participant availability table
CREATE TABLE participant_availability (
    id SERIAL PRIMARY KEY,
    participant_id INTEGER NOT NULL REFERENCES event_participants(id) ON DELETE CASCADE,
    time_slot_id INTEGER NOT NULL REFERENCES event_time_slots(id) ON DELETE CASCADE,
    vote BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (participant_id, time_slot_id)
);

-- Event schedule table (for finalized events)
CREATE TABLE event_schedule (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    selected_date_id INTEGER REFERENCES event_dates(id),
    selected_time_slot_id INTEGER REFERENCES event_time_slots(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event votes table (for tracking overall votes)
CREATE TABLE event_votes (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    time_slot_id INTEGER NOT NULL REFERENCES event_time_slots(id) ON DELETE CASCADE,
    vote_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, time_slot_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_events_creator_id ON events(creator_id);
CREATE INDEX idx_event_dates_event_id ON event_dates(event_id);
CREATE INDEX idx_event_time_slots_event_date_id ON event_time_slots(event_date_id);
CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX idx_participant_availability_participant_id ON participant_availability(participant_id);
CREATE INDEX idx_participant_availability_time_slot_id ON participant_availability(time_slot_id);
CREATE INDEX idx_event_schedule_event_id ON event_schedule(event_id);
CREATE INDEX idx_event_votes_event_id ON event_votes(event_id); 