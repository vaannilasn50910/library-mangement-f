/*
  # Library Management System Schema

  1. New Tables
    - `books`
      - `id` (uuid, primary key)
      - `title` (text)
      - `author` (text)
      - `isbn` (text)
      - `quantity` (integer)
      - `available` (integer)
      - `created_at` (timestamp)
    - `borrows`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `book_id` (uuid, foreign key)
      - `borrow_date` (timestamp)
      - `due_date` (timestamp)
      - `return_date` (timestamp, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  isbn text UNIQUE NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  available integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create borrows table
CREATE TABLE IF NOT EXISTS borrows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  book_id uuid REFERENCES books NOT NULL,
  borrow_date timestamptz DEFAULT now(),
  due_date timestamptz NOT NULL,
  return_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrows ENABLE ROW LEVEL SECURITY;

-- Policies for books
CREATE POLICY "Anyone can view books"
  ON books
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify books"
  ON books
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' LIKE '%@admin.com');

-- Policies for borrows
CREATE POLICY "Users can view their own borrows"
  ON borrows
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own borrows"
  ON borrows
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);