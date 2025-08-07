"use client";

import { useState, useEffect, useRef } from "react";
import type { Product } from "../order/page";

interface SearchAutocompleteProps {
  products: Product[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  className?: string;
}

export default function SearchAutocomplete({
  products,
  searchTerm,
  onSearchChange,
  className = ""
}: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter products for suggestions
  const suggestions = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categories?.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())) ||
    product.types?.some(type => type.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 5); // Limit to 5 suggestions

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
            onSearchChange(suggestions[highlightedIndex].name);
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, highlightedIndex, suggestions, onSearchChange]);

  // Handle input focus
  const handleFocus = () => {
    if (searchTerm.length > 0 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
    setHighlightedIndex(-1);
    
    if (value.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (productName: string) => {
    onSearchChange(productName);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && event.target && event.target instanceof Node && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder="🔍 Rechercher un produit..."
          className="w-full border px-3 py-2 rounded bg-white text-sm pr-10"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
        />
        
        {searchTerm && (
          <button
            onClick={() => {
              onSearchChange("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Effacer la recherche"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {suggestions.map((product, index) => (
            <li
              key={product.id}
              onClick={() => handleSuggestionClick(product.name)}
              className={`px-3 py-2 cursor-pointer text-sm ${
                index === highlightedIndex
                  ? "bg-[#f3ede7] text-[#1c140d]"
                  : "hover:bg-gray-50"
              }`}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="font-medium text-[#1c140d]">{product.name}</div>
                  {product.categories && product.categories.length > 0 && (
                    <div className="text-xs text-gray-500">
                      {product.categories.join(", ")}
                    </div>
                  )}
                </div>
                <div className="text-xs text-[#1c140d] font-medium">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(product.price)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}