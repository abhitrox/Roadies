import React, { useState, useEffect, useRef } from 'react';

function SearchAutocomplete({ onSelectDestination }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Fetch suggestions from OpenStreetMap Nominatim
  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    console.log('🔍 Fetching suggestions for:', searchQuery);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=15&addressdetails=1`
      );
      const data = await response.json();

      console.log('📍 API Response:', data);

      if (data && Array.isArray(data) && data.length > 0) {
        // Filter and format results to show all types of places
        const formattedSuggestions = data.map((result) => {
          // Get display name and break it down
          const displayName = result.display_name;
          const parts = displayName.split(',');
          
          // Primary name (first part)
          const primaryName = parts[0]?.trim() || displayName;
          
          // Secondary info (area/city info)
          const secondaryInfo = parts.slice(1, 3).join(',').trim();

          return {
            name: primaryName,
            fullName: displayName,
            address: secondaryInfo,
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            type: result.type,
            class: result.class,
            icon: getIconForType(result.type, result.class),
          };
        });

        console.log('✅ Formatted suggestions:', formattedSuggestions);
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } else {
        console.log('⚠️ No results found');
        setSuggestions([]);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Get icon based on place type and class
  const getIconForType = (type, placeClass) => {
    const iconMap = {
      street: '🛣️',
      residential: '🏘️',
      village: '🏞️',
      town: '🏙️',
      city: '🌆',
      county: '📍',
      state: '📌',
      amenity: '🏢',
      cafe: '☕',
      restaurant: '🍽️',
      shop: '🛒',
      hotel: '🏨',
      hospital: '🏥',
      school: '🎓',
      bank: '🏦',
      park: '🌳',
      pharmacy: '💊',
      parking: '🅿️',
      bus_station: '🚌',
      train_station: '🚂',
      airport: '✈️',
      place: '📍',
      building: '🏢',
      office: '🏢',
      leisure: '🎪',
      sport: '⚽',
      transport: '🚗',
      historic: '🏛️',
      religious: '⛪',
      tourism: '🎫',
      natural: '🌲',
      waterway: '💧',
      highway: '🛣️',
      railway: '🚂',
    };
    return iconMap[placeClass] || iconMap[type] || '📍';
  };

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear previous timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.trim()) {
      setShowSuggestions(true);
      // Set new timeout for debounced search (300ms delay)
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSelectSuggestion = (suggestion) => {
    console.log('🎯 Selecting suggestion:', suggestion.name);
    setQuery(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
    
    onSelectDestination({
      name: suggestion.name,
      lat: suggestion.lat,
      lng: suggestion.lng,
      fullAddress: suggestion.fullName,
      type: suggestion.type,
    });

    console.log('✅ Selected:', suggestion.name, `(${suggestion.lat}, ${suggestion.lng})`);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          handleSelectSuggestion(suggestions[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const items = suggestionsRef.current.querySelectorAll('[data-suggestion-item]');
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [selectedIndex]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full z-50">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-3 text-lg z-10">🔍</div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            console.log('Input focused, query:', query);
            if (query && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder="Where are you going?"
          className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition relative z-10"
        />
        
        {/* Loading spinner */}
        {loading && query && (
          <div className="absolute right-3 top-3 z-10">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Clear button */}
        {query && !loading && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-lg font-bold transition z-10"
          >
            ✕
          </button>
        )}
      </div>

      {/* Suggestions Dropdown Container */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 w-full mt-0 z-50">
          {/* Loading state */}
          {loading && query && (
            <div className="bg-white border-2 border-gray-300 border-t-0 rounded-b-xl shadow-xl p-4 w-full">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-600">
                  Searching for "{query}"...
                </p>
              </div>
            </div>
          )}

          {/* Results found */}
          {!loading && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="bg-white border-2 border-gray-300 border-t-0 rounded-b-xl shadow-xl max-h-96 overflow-y-auto w-full"
            >
              {/* Results count */}
              <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-semibold text-gray-600 z-10">
                {suggestions.length} results found
              </div>

              {/* Suggestions list */}
              {suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.lat}-${suggestion.lng}-${index}`}
                  data-suggestion-item
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={`px-4 py-3 cursor-pointer transition flex items-start gap-3 border-l-4 ${
                    index === selectedIndex
                      ? 'bg-blue-100 border-l-blue-500'
                      : 'hover:bg-gray-50 border-l-transparent'
                  }`}
                >
                  {/* Icon */}
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {suggestion.icon}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {suggestion.name}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {suggestion.address || suggestion.fullName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">
                      {suggestion.type}
                    </p>
                  </div>

                  {/* Right arrow indicator */}
                  {index === selectedIndex && (
                    <span className="text-blue-500 flex-shrink-0">→</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No results message */}
          {!loading && query && suggestions.length === 0 && (
            <div className="bg-white border-2 border-gray-300 border-t-0 rounded-b-xl shadow-xl p-4 w-full">
              <p className="text-sm text-gray-500 text-center">
                No places found for <span className="font-semibold">"{query}"</span>
              </p>
              <p className="text-xs text-gray-400 text-center mt-1">
                Try a different search term
              </p>
            </div>
          )}

          {/* Empty state - when input is focused but empty */}
          {!loading && !query && suggestions.length === 0 && (
            <div className="bg-white border-2 border-gray-300 border-t-0 rounded-b-xl shadow-xl p-4 w-full">
              <p className="text-sm text-gray-500 text-center">
                Start typing to search for places
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchAutocomplete;