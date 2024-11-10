// @ts-nocheck

"use client";

import { useSearchParams } from 'next/navigation'; // Import useSearchParams from next/navigation
import { useState, useEffect } from 'react';
import ReactMarkdown from "react-markdown";

const RecipePage = () => {
  const searchParams = useSearchParams();
  const text = searchParams.get('text'); // Get the 'text' query parameter
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    if (text) {
      // Safely match and extract the recipe data
      const match = text.match(/"recipe":\s*"([^"]+)"/);

      if (match) {
        setRecipe(match[1]);  // Set the extracted recipe to state
      } else {
        setRecipe("Recipe not found");
      }
    }
  }, [text]);

  return (
    <div className="min-h-screen max-h-screen flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-300 via-purple-400 to-purple-600 p-8 rounded-2xl shadow-2xl w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-center text-black mb-6">Recipe Page</h1>
        <div className="text-lg text-black font-semibold">
          <ReactMarkdown children={recipe || "Loading recipe..."} />
        </div>
      </div>
    </div>
  );
};

export default RecipePage;
