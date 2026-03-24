import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { MoveAnnouncement } from '../types';

interface Props {
  move: MoveAnnouncement;
}

export default function MoveCard({ move }: Props) {
  const isMovingIn = move.move_type.toLowerCase().includes('in');

  const lookingForTags = move.looking_for
    ? move.looking_for.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-sm p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2.5 mb-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              isMovingIn
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
            }`}>
              {isMovingIn ? '↓ Moving in' : '↑ Moving out'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {format(new Date(move.move_date), 'MMM d, yyyy')}
            </span>
          </div>

          {/* Name + route */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
              {(move.user?.name || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-semibold text-slate-900 text-sm">{move.user?.name || 'Someone'}</span>
              {(move.from_city || move.to_city) && (
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  {move.from_city && <span>{move.from_city}</span>}
                  {move.from_city && move.to_city && (
                    <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  )}
                  {move.to_city && <span>{move.to_city}</span>}
                </div>
              )}
            </div>
          </div>

          {move.message && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-3">{move.message}</p>
          )}

          {lookingForTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {lookingForTags.map((tag) => (
                <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full ring-1 ring-indigo-100 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {move.budget_range && (
            <p className="text-xs text-slate-400 font-medium">Budget: {move.budget_range}</p>
          )}
        </div>

        <div className="shrink-0 flex flex-col items-end gap-3">
          {move.image_url && (
            <img src={move.image_url} alt="Move photo" className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200" />
          )}
          <Link
            to={`/messages?user=${move.user_id}`}
            className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm whitespace-nowrap"
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
