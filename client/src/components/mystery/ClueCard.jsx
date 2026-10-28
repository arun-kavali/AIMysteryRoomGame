import React from 'react';
import { Link } from 'react-router-dom';
import { FileSearch, CheckCircle2, Lock, ArrowRight, Sparkles } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function ClueCard({
  clue,
  caseId,
  onDiscover,
  isDiscovering = false
}) {
  const { id, clueNumber, title, description, discovered, points = 5 } = clue;

  return (
    <div
      className={`
        bg-white rounded-card border transition-all duration-200 p-5 flex flex-col justify-between
        ${discovered ? 'border-border shadow-card hover:shadow-card-hover' : 'border-dashed border-slate-200 bg-slate-50/40'}
      `}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-secondary tracking-wide uppercase">
            Clue {clueNumber || id}
          </span>
          <div className="flex items-center gap-1.5">
            {discovered ? (
              <Badge variant="success" size="sm" icon={CheckCircle2}>
                Discovered
              </Badge>
            ) : (
              <Badge variant="default" size="sm" icon={Lock}>
                Undiscovered
              </Badge>
            )}
            <Badge variant="primary" size="sm">
              +{points} pts
            </Badge>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-navy-900 mb-2 flex items-center gap-2">
          <FileSearch className={`w-4 h-4 ${discovered ? 'text-primary' : 'text-slate-400'}`} />
          {title}
        </h4>

        {/* Description or Locked Teaser */}
        <p className="text-sm text-secondary leading-relaxed mb-4">
          {discovered ? (
            description
          ) : (
            <span className="italic text-slate-400">
              This evidence has not been examined yet. Discover this clue to reveal its findings and earn investigation points.
            </span>
          )}
        </p>
      </div>

      {/* Action footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {discovered ? (
          <Link to={`/case/${caseId}/clues/${id}`} className="w-full">
            <Button variant="secondary" size="sm" fullWidth icon={ArrowRight}>
              View Clue Details
            </Button>
          </Link>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              isLoading={isDiscovering}
              onClick={() => onDiscover && onDiscover(id)}
              icon={Sparkles}
            >
              Discover Clue
            </Button>
            <Link to={`/case/${caseId}/clues/${id}`}>
              <Button variant="secondary" size="sm">
                Examine
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

