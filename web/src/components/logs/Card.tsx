import React from 'react';
import type { User } from '@/types/user';

interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  // Dynamic styling for the status badge
  const statusColors = {
    "present": 'bg-green-100 text-green-800 border-green-200',
    "absent": 'bg-red-100 text-red-800 border-red-200',
    "late": 'bg-amber-100 text-amber-800 border-amber-200',
  };

  return (
    <div className="max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      {/* Top Section: Avatar & Status */}
      <div className="flex items-start justify-between">
        {/* <img
          className="h-16 w-16 rounded-full border-2 border-indigo-500 object-cover p-0.5"
          src={user.avatarUrl}
          alt={`${user.name}'s avatar`}
        /> */}
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[user.status]}`}
        >
          {user.}
        </span>
      </div>

      {/* Middle Section: User Info */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {user.name}
        </h3>
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
          {user.role}
        </p>

        {/* Meta Details */}
        <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{user.email}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{user.department}</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Action Buttons */}
      <div className="mt-6 flex gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
        <button
          onClick={() => onEdit?.(user.id)}
          className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900"
        >
          Edit Profile
        </button>
        <button
          onClick={() => onDelete?.(user.id)}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-red-600 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-red-400"
        >
          Delete
        </button>
      </div>
    </div>
  );
};