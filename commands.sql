CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  author TEXT,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  likes INTEGER DEFAULT 0
);

INSERT INTO blogs (author, url, title, likes) VALUES 
  ('Dan Abramov', 'https://example.com/on-let-vs-const', 'On let vs const', 0),
  ('Laurenz Albe', 'https://example.com/gaps-in-sequences', 'Gaps in sequences in PostgreSQL', 0);

