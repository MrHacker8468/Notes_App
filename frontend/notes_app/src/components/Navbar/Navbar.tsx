import React, { useState } from 'react';
import ProfileInfo from '../Cards/ProfileInfo';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../SearchBar/SearchBar';

const Navbar = ({ userInfo, onSearchNote, handleClearSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  function onLogout() {
    localStorage.clear();
    navigate('/login'); 
  }

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery); // Pass search query to the parent function
    }
  };

  const onClearSearch = () => {
    setSearchQuery('');
    handleClearSearch();// Clear the search and fetch all notes again
  };

  return (
    <div className='bg-white flex items-center justify-between px-6 py-2 drop-shadow'>
      <h2 className='text-xl font-medium text-black py-2'>Notes</h2>

      <SearchBar 
        value={searchQuery} 
        onChange={({ target }) => setSearchQuery(target.value)} 
        handleSearch={handleSearch} // Trigger search when clicking search button
        onClearSearch={onClearSearch} // Clear search functionality
      />
      
      <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
    </div>
  );
};

export default Navbar;
