'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  GooglePlacesService,
  PlacePrediction,
} from '@/lib/services/google-places';
import { cn } from '@/lib/utils';

interface AutocompleteInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: PlacePrediction) => void;
  className?: string;
  disabled?: boolean;
}

export function AutocompleteInput({
  placeholder = 'Enter location',
  value,
  onChange,
  onPlaceSelect,
  className,
  disabled = false,
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isInitialized, setIsInitialized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const lastSearchValue = useRef<string>('');

  // Initialize lastSearchValue on first render to prevent search on page reload
  useEffect(() => {
    if (!isInitialized) {
      lastSearchValue.current = value;
      setIsInitialized(true);
      return;
    }
  }, [value, isInitialized]);

  // Debounced search
  useEffect(() => {
    // Skip search on initial render or if value hasn't actually changed
    if (!isInitialized || value === lastSearchValue.current) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (value && value.length >= 2) {
        setIsLoading(true);
        try {
          const results =
            await GooglePlacesService.getAutocompleteSuggestions(value);
          setSuggestions(results);
          setShowSuggestions(true);
          setSelectedIndex(-1);
          lastSearchValue.current = value;
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        lastSearchValue.current = value;
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [value, isInitialized]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: PlacePrediction) => {
    // Update the last search value to prevent re-triggering search
    lastSearchValue.current = suggestion.description;
    onChange(suggestion.description);
    onPlaceSelect(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn('pl-8', className)}
        />
        {isLoading && (
          <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="bg-popover text-popover-foreground absolute z-50 mt-1 w-full rounded-md border p-1 shadow-md"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              className={cn(
                'hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center space-x-2 rounded-sm px-2 py-1.5 text-sm transition-colors outline-none',
                selectedIndex === index && 'bg-accent text-accent-foreground',
              )}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <MapPin className="text-muted-foreground h-3 w-3" />
              <div className="flex-1 text-left">
                <div className="font-medium">
                  {suggestion.structured_formatting.main_text}
                </div>
                <div className="text-muted-foreground text-xs">
                  {suggestion.structured_formatting.secondary_text}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
