import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { getScoreColor } from '../services/scoringEngine';

export default function SearchBox({ trails, scores, onSelectTrail }) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    // Filter trails based on query
    const filtered = query.trim()
        ? trails.filter((t) =>
            t.name.toLowerCase().includes(query.toLowerCase())
        )
        : trails;

    // Sort filtered results by score descending
    const sortedFiltered = [...filtered].sort((a, b) => {
        const sa = scores[a.id]?.score ?? 0;
        const sb = scores[b.id]?.score ?? 0;
        return sb - sa;
    });

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset highlight when filtered list changes
    useEffect(() => {
        setHighlightIndex(-1);
    }, [query]);

    const handleSelect = (trail) => {
        setQuery('');
        setIsOpen(false);
        if (onSelectTrail) onSelectTrail(trail.id);
    };

    const handleKeyDown = (e) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIndex((prev) =>
                prev < sortedFiltered.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIndex((prev) =>
                prev > 0 ? prev - 1 : sortedFiltered.length - 1
            );
        } else if (e.key === 'Enter' && highlightIndex >= 0) {
            e.preventDefault();
            handleSelect(sortedFiltered[highlightIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    return (
        <div className="search-box" ref={wrapperRef}>
            <div className="search-input-wrapper">
                <Search size={14} className="search-icon" />
                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder="חיפוש..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                />
                {query && (
                    <button
                        className="search-clear"
                        onClick={() => {
                            setQuery('');
                            inputRef.current?.focus();
                        }}
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            {isOpen && sortedFiltered.length > 0 && (
                <div className="search-dropdown">
                    {sortedFiltered.map((trail, idx) => {
                        const scoreData = scores[trail.id];
                        const color = scoreData ? getScoreColor(scoreData.score) : 'gray';
                        return (
                            <div
                                key={trail.id}
                                className={`search-option ${idx === highlightIndex ? 'highlighted' : ''}`}
                                onClick={() => handleSelect(trail)}
                                onMouseEnter={() => setHighlightIndex(idx)}
                            >
                                <span className={`search-option-score ${color}`}>
                                    {scoreData?.score ?? '—'}
                                </span>
                                <span className="search-option-name">{trail.name}</span>
                                <span className="search-option-region">{trail.region}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {isOpen && sortedFiltered.length === 0 && query.trim() && (
                <div className="search-dropdown">
                    <div className="search-option search-no-results">
                        No trails matching "{query}"
                    </div>
                </div>
            )}
        </div>
    );
}
