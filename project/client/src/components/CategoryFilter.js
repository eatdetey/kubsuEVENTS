import React from 'react';

// Horizontal scrollable row of category pills with an "All" reset.
// Controlled component — parent owns the active slug.
const CategoryFilter = ({ categories, activeSlug, onSelect }) => {
  return (
    <div
      className="d-flex flex-nowrap align-items-center mb-3"
      style={{ gap: 8, overflowX: 'auto', paddingBottom: 4 }}
      role="tablist"
    >
      <button
        type="button"
        className={`tag-pill ${!activeSlug ? 'is-active' : ''}`}
        onClick={() => onSelect(null)}
        aria-pressed={!activeSlug}
      >
        Все
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`tag-pill ${activeSlug === c.slug ? 'is-active' : ''}`}
          onClick={() => onSelect(c.slug)}
          aria-pressed={activeSlug === c.slug}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
