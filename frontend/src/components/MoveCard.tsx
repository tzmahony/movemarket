import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { MoveAnnouncement } from '../types';

interface Props {
  move: MoveAnnouncement;
}

export default function MoveCard({ move }: Props) {
  const isMovingIn = move.move_type.toLowerCase().includes('in');
  const typeBadge = isMovingIn
    ? 'bg-green-100 text-green-700'
    : 'bg-orange-100 text-orange-700';

  const lookingForTags = move.looking_for
    ? move.looking_for.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${typeBadge}`}>
              {isMovingIn ? 'Moving In' : 'Moving Out'}
            </span>
            <span className="text-sm text-gray-400">
              {format(new Date(move.move_date), 'MMM d, yyyy')}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900">
            {move.user?.name || 'Someone'}
          </h3>

          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
            {move.from_city && <span>{move.from_city}</span>}
            {move.from_city && move.to_city && (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            )}
            {move.to_city && <span>{move.to_city}</span>}
          </div>

          {move.message && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{move.message}</p>
          )}

          {lookingForTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {lookingForTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {move.budget_range && (
            <p className="text-xs text-gray-400 mt-2">
              Budget: {move.budget_range}
            </p>
          )}
        </div>

        <Link
          to={`/messages?user=${move.user_id}`}
          className="ml-4 shrink-0 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Contact
        </Link>
      </div>
    </div>
  );
}
