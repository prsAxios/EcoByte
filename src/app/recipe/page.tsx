// @ts-nocheck
"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const RecipePage = () => {
  const searchParams = useSearchParams();
  const text = searchParams.get('text');
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    if (text) {
      const match = text.match(/"recipe":\s*"([^"]+)"/);
      if (match) {
        const formattedRecipe = match[1].replace(/\\n/g, '\n');
        setRecipe(formattedRecipe);
      } else {
        setRecipe("Recipe not found");
      }
    }
  }, [text]);

  return (
    <div className="rounded-xl  min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 p-8">
      <div className="bg-white bg-opacity-80 p-10 rounded-3xl shadow-2xl max-w-3xl w-full transition-all duration-500 transform hover:scale-105 hover:bg-opacity-90">
        <h1 className="py-5 text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600 mb-8">
          Recipe Page
        </h1>
        
        <div className="text-lg text-gray-800 font-semibold whitespace-pre-line p-6 bg-white bg-opacity-90 rounded-xl shadow-lg transition-all duration-300 hover:bg-opacity-100 hover:shadow-2xl">
          {recipe || "Loading recipe..."}
        </div>

        <div className="flex justify-center mt-8">
          <button className="px-6 py-2 text-lg font-bold text-white rounded-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300 transform hover:scale-110 hover:from-purple-600 hover:to-pink-500 focus:outline-none shadow-lg">
            View More Recipes
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipePage;
