-- Sample data for Eventra application

-- Sample users
INSERT INTO users (uuid, email, password, name, surname) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'john.doe@example.com', '$2a$10$rKN3XrYUPS0w7bK9YhTGAOoFwTgGSf.9WBRI3xzLFQy4Y0SSLYpAO', 'John', 'Doe'),
('550e8400-e29b-41d4-a716-446655440001', 'jane.smith@example.com', '$2a$10$rKN3XrYUPS0w7bK9YhTGAOoFwTgGSf.9WBRI3xzLFQy4Y0SSLYpAO', 'Jane', 'Smith'),
('550e8400-e29b-41d4-a716-446655440002', 'alice.johnson@example.com', '$2a$10$rKN3XrYUPS0w7bK9YhTGAOoFwTgGSf.9WBRI3xzLFQy4Y0SSLYpAO', 'Alice', 'Johnson');

-- Sample events
INSERT INTO events (id, creator_id, type, name, detail, location, status, share_url, is_anonymous_allowed, can_multiple_vote) VALUES
('eventra-550e8400-abc12', '550e8400-e29b-41d4-a716-446655440000', '1:1', 'Project Kickoff Meeting', 'Initial meeting to discuss project scope and timeline', 'Conference Room A', 'pending', 'http://localhost:3000/event/share/eventra-550e8400-abc12', TRUE, FALSE),
('eventra-550e8400-def34', '550e8400-e29b-41d4-a716-446655440001', 'group', 'Team Building Event', 'Monthly team building activity', 'Office Lounge', 'pending', 'http://localhost:3000/event/share/eventra-550e8400-def34', FALSE, TRUE);

-- Sample event dates
INSERT INTO event_dates (event_id, date) VALUES
('eventra-550e8400-abc12', '2023-06-15'),
('eventra-550e8400-abc12', '2023-06-16'),
('eventra-550e8400-def34', '2023-06-20');

-- Get the IDs of the inserted dates
DO $$
DECLARE
    date1_id INTEGER;
    date2_id INTEGER;
    date3_id INTEGER;
BEGIN
    SELECT id INTO date1_id FROM event_dates WHERE event_id = 'eventra-550e8400-abc12' AND date = '2023-06-15';
    SELECT id INTO date2_id FROM event_dates WHERE event_id = 'eventra-550e8400-abc12' AND date = '2023-06-16';
    SELECT id INTO date3_id FROM event_dates WHERE event_id = 'eventra-550e8400-def34' AND date = '2023-06-20';

    -- Sample time slots
    INSERT INTO event_time_slots (event_date_id, start_time, end_time) VALUES
    (date1_id, '09:00:00', '10:00:00'),
    (date1_id, '14:00:00', '15:00:00'),
    (date2_id, '11:00:00', '12:00:00'),
    (date3_id, '13:00:00', '15:00:00'),
    (date3_id, '16:00:00', '17:00:00');
END $$;

-- Sample event participants
INSERT INTO event_participants (event_id, user_id, status, is_anonymous, participant_name, participant_email) VALUES
('eventra-550e8400-abc12', '550e8400-e29b-41d4-a716-446655440001', 'accepted', FALSE, 'Jane Smith', 'jane.smith@example.com'),
('eventra-550e8400-abc12', '550e8400-e29b-41d4-a716-446655440002', 'pending', FALSE, 'Alice Johnson', 'alice.johnson@example.com'),
('eventra-550e8400-def34', '550e8400-e29b-41d4-a716-446655440000', 'accepted', FALSE, 'John Doe', 'john.doe@example.com'),
('eventra-550e8400-def34', NULL, 'pending', TRUE, 'Anonymous', NULL);

-- Get the IDs of the inserted participants and time slots
DO $$
DECLARE
    participant1_id INTEGER;
    participant2_id INTEGER;
    participant3_id INTEGER;
    participant4_id INTEGER;
    slot1_id INTEGER;
    slot2_id INTEGER;
    slot3_id INTEGER;
    slot4_id INTEGER;
    slot5_id INTEGER;
BEGIN
    SELECT id INTO participant1_id FROM event_participants WHERE event_id = 'eventra-550e8400-abc12' AND participant_email = 'jane.smith@example.com';
    SELECT id INTO participant2_id FROM event_participants WHERE event_id = 'eventra-550e8400-abc12' AND participant_email = 'alice.johnson@example.com';
    SELECT id INTO participant3_id FROM event_participants WHERE event_id = 'eventra-550e8400-def34' AND participant_email = 'john.doe@example.com';
    SELECT id INTO participant4_id FROM event_participants WHERE event_id = 'eventra-550e8400-def34' AND is_anonymous = TRUE;

    SELECT id INTO slot1_id FROM event_time_slots WHERE event_date_id IN (SELECT id FROM event_dates WHERE event_id = 'eventra-550e8400-abc12' AND date = '2023-06-15') AND start_time = '09:00:00';
    SELECT id INTO slot2_id FROM event_time_slots WHERE event_date_id IN (SELECT id FROM event_dates WHERE event_id = 'eventra-550e8400-abc12' AND date = '2023-06-15') AND start_time = '14:00:00';
    SELECT id INTO slot3_id FROM event_time_slots WHERE event_date_id IN (SELECT id FROM event_dates WHERE event_id = 'eventra-550e8400-abc12' AND date = '2023-06-16') AND start_time = '11:00:00';
    SELECT id INTO slot4_id FROM event_time_slots WHERE event_date_id IN (SELECT id FROM event_dates WHERE event_id = 'eventra-550e8400-def34' AND date = '2023-06-20') AND start_time = '13:00:00';
    SELECT id INTO slot5_id FROM event_time_slots WHERE event_date_id IN (SELECT id FROM event_dates WHERE event_id = 'eventra-550e8400-def34' AND date = '2023-06-20') AND start_time = '16:00:00';

    -- Sample participant availability
    INSERT INTO participant_availability (participant_id, time_slot_id, vote) VALUES
    (participant1_id, slot1_id, TRUE),
    (participant1_id, slot3_id, TRUE),
    (participant2_id, slot2_id, TRUE),
    (participant3_id, slot4_id, TRUE),
    (participant4_id, slot5_id, TRUE);
    
    -- Sample event votes
    INSERT INTO event_votes (event_id, time_slot_id, vote_count) VALUES
    ('eventra-550e8400-abc12', slot1_id, 1),
    ('eventra-550e8400-abc12', slot2_id, 1),
    ('eventra-550e8400-abc12', slot3_id, 1),
    ('eventra-550e8400-def34', slot4_id, 1),
    ('eventra-550e8400-def34', slot5_id, 1);
END $$; 