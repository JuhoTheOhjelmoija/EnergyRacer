-- Poista vanhat saavutukset
DELETE FROM user_achievements;
DELETE FROM achievements;

-- Lisää uudet saavutukset
INSERT INTO achievements (id, title, description, icon, total) VALUES
('1', 'First Timer', 'Add your first caffeine entry', 'zap', 1),
('2', 'Morning Ritual', 'Have 5 caffeine entries before 8 AM', 'sunrise', 5),
('3', 'Night Owl', 'Have 3 caffeine entries after 8 PM', 'moon', 3),
('4', 'Consistent Consumer', 'Track caffeine for 14 consecutive days', 'calendar', 14),
('5', 'Variety Seeker', 'Try 5 different types of drinks', 'coffee', 5),
('6', 'Caffeine Apprentice', 'Consume 1000mg of caffeine', 'battery', 1000),
('7', 'Caffeine Enthusiast', 'Consume 5000mg of caffeine', 'zap', 5000),
('8', 'Caffeine Addict', 'Consume 10000mg of caffeine', 'flame', 10000),
('9', 'Caffeine Master', 'Consume 25000mg of caffeine', 'trophy', 25000),
('10', 'Caffeine Legend', 'Consume 50000mg of caffeine', 'crown', 50000),
('11', 'Entry Milestone: 10', 'Add 10 caffeine entries', 'list', 10),
('12', 'Entry Milestone: 50', 'Add 50 caffeine entries', 'list', 50),
('13', 'Entry Milestone: 100', 'Add 100 caffeine entries', 'list', 100),
('14', 'Entry Milestone: 500', 'Add 500 caffeine entries', 'list', 500),
('15', 'Energy Bomb', 'Consume 500mg of caffeine in a single day', 'battery', 500),
('16', 'Weekly Streak', 'Track caffeine for 7 consecutive days', 'calendar', 7),
('17', 'Monthly Streak', 'Track caffeine for 30 consecutive days', 'calendar', 30),
('18', 'Quarterly Streak', 'Track caffeine for 90 consecutive days', 'calendar', 90),
('19', 'Coffee Connoisseur', 'Add 50 coffee entries', 'coffee', 50),
('20', 'Energy Drink Enthusiast', 'Add 20 energy drink entries', 'zap', 20),
('21', 'Tea Aficionado', 'Add 30 tea entries', 'coffee', 30),
('22', 'Espresso Express', 'Add 5 espresso entries', 'coffee', 5),
('23', 'Early Bird', 'Have 5 caffeine entries before 6 AM', 'sunrise', 5),
('24', 'Weekend Warrior', 'Add 5 caffeine entries on weekends', 'calendar', 5),
('25', 'Global Explorer', 'Try 5 different types of drinks', 'globe', 5),
('26', 'Caffeine Scholar', 'Read 10 caffeine-related articles', 'book', 10),
('27', 'Social Sipper', 'Share 3 caffeine entries on social media', 'share', 3),
('28', 'Leaderboard Legend', 'Reach top 10 in the leaderboard', 'trophy', 1),
('29', 'Perfect Balance', 'Maintain the same daily caffeine intake for 7 days', 'scale', 7),
('30', 'Caffeine Scientist', 'Track your mood with caffeine for 14 days', 'flask', 14); 