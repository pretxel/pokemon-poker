'use client';

import { useEffect, useRef } from 'react';
import type { SavedStory } from '@/types';
import Icon from './Icon';

interface HistoryDrawerProps {
  open: boolean;
  stories: SavedStory[];
  /** Called after the dialog closes; the caller restores focus. */
  onClose: () => void;
}

export default function HistoryDrawer({ open, stories, onClose }: HistoryDrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const newestFirst = [...stories].reverse();

  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-labelledby="history-title"
      onClose={onClose}
      onClick={(e) => {
        // Clicks on the ::backdrop target the dialog itself but land outside its box.
        if (e.target !== e.currentTarget) return;
        const box = e.currentTarget.getBoundingClientRect();
        const outside = e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom;
        if (outside) ref.current?.close();
      }}
    >
      <div className="drawer__header">
        <h2 id="history-title" className="drawer__title">History</h2>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => ref.current?.close()}>
          <Icon name="close" size={18} /> Close
        </button>
      </div>

      {newestFirst.length === 0 ? (
        <p className="drawer__empty">Finished stories show up here with their estimate.</p>
      ) : (
        <ol className="history" reversed>
          {newestFirst.map((story) => (
            <li key={`${story.savedAt}-${story.name}`} className="history__item">
              <span className="history__name">{story.name}</span>
              {story.average !== null && story.average !== undefined ? (
                <span className="history__avg">avg <strong>{story.average}</strong></span>
              ) : (
                <span className="history__avg">no estimate</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </dialog>
  );
}
