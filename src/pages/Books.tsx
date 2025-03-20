import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  available: number;
}

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('title');

    if (error) {
      console.error('Error fetching books:', error);
    } else {
      setBooks(data || []);
    }
    setLoading(false);
  }

  async function borrowBook(bookId: string) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2 weeks from now

    const { error } = await supabase
      .from('borrows')
      .insert([
        {
          book_id: bookId,
          due_date: dueDate.toISOString(),
        }
      ]);

    if (error) {
      console.error('Error borrowing book:', error);
    } else {
      fetchBooks(); // Refresh the books list
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Books</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div key={book.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{book.title}</h3>
            <p className="text-gray-600 mb-2">by {book.author}</p>
            <p className="text-sm text-gray-500 mb-4">ISBN: {book.isbn}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                Available: {book.available}
              </span>
              <button
                onClick={() => borrowBook(book.id)}
                disabled={book.available === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Borrow
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}