'use client';

import { useState } from 'react';
import Icon from './Icon';

interface StoryBarProps {
  story: string | null;
  isHost: boolean;
  onSetStory: (name: string) => Promise<boolean>;
}

export default function StoryBar({ story, isHost, onSetStory }: StoryBarProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const showForm = isHost && (editing || !story);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = draft.trim();
    if (!name) return;
    const ok = await onSetStory(name);
    if (ok) {
      setDraft('');
      setEditing(false);
    }
  }

  function startEditing() {
    setDraft(story ?? '');
    setEditing(true);
  }

  return (
    <div className="story-bar">
      <span className="story-bar__label">Story</span>

      {showForm ? (
        <form className="story-bar__form" onSubmit={handleSubmit}>
          <label htmlFor="story-input" className="visually-hidden">Story name or ticket ID</label>
          <input
            id="story-input"
            className="input"
            placeholder="Story name or ticket, like PROJ-123 Login with SSO"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={80}
            autoComplete="off"
            autoFocus={editing}
            onKeyDown={(e) => { if (e.key === 'Escape' && editing) setEditing(false); }}
          />
          <button type="submit" className="btn" disabled={!draft.trim()}>
            {story ? 'Save story' : 'Set story'}
          </button>
          {editing && (
            <button type="button" className="btn btn--ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
          )}
        </form>
      ) : story ? (
        <>
          <h2 className="story-bar__title">{story}</h2>
          {isHost && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={startEditing}>
              <Icon name="edit" size={16} /> Edit
            </button>
          )}
        </>
      ) : (
        <p className="story-bar__empty">Waiting for the host to pick a story</p>
      )}
    </div>
  );
}
