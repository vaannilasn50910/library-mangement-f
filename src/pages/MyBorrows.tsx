import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

interface Borrow {
  id: string;
  book: {
    title: string;
    author: string;
  };
  borrow_date: string;
  due_date: string;
  return_date: string | null;
}

export default function MyBorrows() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBorrows();
  }, []);

  async function fetchBorrows() {
    const { data, error } = await supabase
      .from('borrows')
      .select(`
        id,
        borrow_date,
        due_date,
        return_date,
        book:books (
          title,
          author
        )
      `)
      .order('borrow_date', { ascending: false });

    if (error) {
      console.error('Error fetching borrows:', error);
    } else {
      setBorrows(data || []);
    }
    setLoading(false);
  }

  async function returnBook(borrowId: string) {
    const { error } = await supabase
      .from('borrows')
      .update({ return_date: new Date().toISOString() })
      .eq('id', borrowId);

    if (error) {
      console.error('Error returning book:', error);
    } else {
      fetchBorrows(); // Refresh the borrows list
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
      <h1 className="text-3xl font-bold mb-8">My Borrowed Books</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Book
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Borrowed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {borrows.map((borrow) => (
              <tr key={borrow.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{borrow.book.title}</div>
                  <div className="text-sm text-gray-500">{borrow.book.author}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {format(new Date(borrow.borrow_date), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {format(new Date(borrow.due_date), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    borrow.return_date
                      ? 'bg-green-100 text-green-800'
                      : new Date(borrow.due_date) < new Date()
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {borrow.return_date
                      ? 'Returned'
                      : new Date(borrow.due_date) < new Date()
                      ? 'Overdue'
                      : 'Borrowed'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {!borrow.return_date && (
                    <button
                      onClick={() => returnBook(borrow.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}