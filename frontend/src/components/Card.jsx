import React from 'react';

const Card = ({ title, description, icon, buttonText = "Open", onClick }) => {
  return (
    <div className="w-64 rounded shadow-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl duration-300 bg-white">
      <div className="w-full h-48 flex items-center justify-center bg-gray-100">
        <img
          src={icon}
          alt={title}
          className="max-w-full max-h-full object-contain" 
        />
      </div>

      <div className="px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

        <p className="text-sm text-gray-600 mt-2">{description}</p>

        <button
          onClick={onClick}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors duration-200"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Card;