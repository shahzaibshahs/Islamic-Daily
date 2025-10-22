import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-teal-800 to-teal-900 text-white p-4 sm:p-6 shadow-lg">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-amiri font-bold tracking-wider">
          Islamic AI Assistant
        </h1>
        <p className="text-teal-200 mt-1 text-sm sm:text-base">
          Your guide to Islamic knowledge, duas, and Quranic wisdom.
        </p>
      </div>
    </header>
  );
};

export default Header;
