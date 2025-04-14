-- Lisää total-kenttä achievements-tauluun
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS total INTEGER NOT NULL DEFAULT 1;

-- Päivitä olemassa olevien saavutusten total-arvot
UPDATE achievements SET total = 1 WHERE id = '1';
UPDATE achievements SET total = 5 WHERE id = '2';
UPDATE achievements SET total = 3 WHERE id = '3';
UPDATE achievements SET total = 14 WHERE id = '4';
UPDATE achievements SET total = 5 WHERE id = '5';
UPDATE achievements SET total = 1000 WHERE id = '6';
UPDATE achievements SET total = 5000 WHERE id = '7';
UPDATE achievements SET total = 10000 WHERE id = '8';
UPDATE achievements SET total = 25000 WHERE id = '9';
UPDATE achievements SET total = 50000 WHERE id = '10';
UPDATE achievements SET total = 10 WHERE id = '11';
UPDATE achievements SET total = 50 WHERE id = '12';
UPDATE achievements SET total = 100 WHERE id = '13';
UPDATE achievements SET total = 500 WHERE id = '14';
UPDATE achievements SET total = 500 WHERE id = '15';
UPDATE achievements SET total = 7 WHERE id = '16';
UPDATE achievements SET total = 30 WHERE id = '17';
UPDATE achievements SET total = 90 WHERE id = '18';
UPDATE achievements SET total = 50 WHERE id = '19';
UPDATE achievements SET total = 20 WHERE id = '20';
UPDATE achievements SET total = 30 WHERE id = '21';
UPDATE achievements SET total = 5 WHERE id = '22';
UPDATE achievements SET total = 5 WHERE id = '23';
UPDATE achievements SET total = 5 WHERE id = '24';
UPDATE achievements SET total = 5 WHERE id = '25';
UPDATE achievements SET total = 10 WHERE id = '26';
UPDATE achievements SET total = 3 WHERE id = '27';
UPDATE achievements SET total = 1 WHERE id = '28';
UPDATE achievements SET total = 7 WHERE id = '29';
UPDATE achievements SET total = 14 WHERE id = '30'; 