import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import NoteCard from '../../components/Cards/NoteCard';
import { MdAdd } from 'react-icons/md';
import AddEditNotes from './AddEditNotes';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Toast from '../../components/ToastMessage/Toast';
import EmptyCard from '../../components/EmptyCard/EmptyCard';
import NO_Note from '../../assets/Images/no-data-6.svg';
import Add_Note from '../../assets/Images/Add_Note.svg';



const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: 'add',
    data: null, 
  });

  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: '',
    type: 'add',
  });

  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isSearch, setIsSearch] = useState(false);

  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({
      isShown: true,
      data: noteDetails,
      type: 'edit',
    });
  };

  const showToastMessage = (message, type) => { 
    setShowToastMsg({
      isShown: true,
      message,
      type,
    });

    setTimeout(() => {
      setShowToastMsg({ isShown: false, message: '', type: '' });
    }, 3000); // Auto-hide toast after 3 seconds
  };

  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: '',
      type: '',
    });
  };

  // Get user info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/Get-User');
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate('/Login');
      }
    }
  };

  // Get all notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get('/Get-All-Notes');
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log('An unexpected error occurred. Please try again.');
    }
  };

  // Delete Note
  const deleteNote = async (data) => {
    const noteId = data._id;
    
    try {
      const response = await axiosInstance.delete('/Delete-Note/' + noteId);

      if (response.data && !response.data.error) {
        showToastMessage('Note Deleted Successfully', 'delete');
        getAllNotes();
      }
    } catch (error) {
      console.log('An unexpected error occurred. Please try again.');
    }
  };

  // Search Note
  const onSearchNote = async (query) => {
    if (!query){
      handleClearSearch();
      return;
    }
    try {
      const response = await axiosInstance.get('/Search-Note', {
        params: { query }, 
      });
      if (response.data && response.data.notes) {
        setIsSearch(true); 
        setAllNotes(response.data.notes); 
      } else {
        setAllNotes([]);
      }
    } catch (error) {
      console.log('Error during search:', error);
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false); 
    getAllNotes(); 
  };

  // update isPinned
  const updateIsPinned = async (noteData) => {
    const noteId  = noteData._id
    
    try {
      const response = await axiosInstance.put('/Update-Note-Pinned/' + noteId , {
        isPinned : !noteData.isPinned,
      });

      if (response.data && response.data.note){
        showToastMessage("Note Updated Successfully")
        getAllNotes()
      }
    } catch (error){
      console.log(error)
    }
  }

  useEffect(() => {
    getAllNotes();
    getUserInfo();
    return () => {};
  }, []);

  return (
    <>
      <Navbar 
        userInfo={userInfo}
        onSearchNote={onSearchNote}
        handleClearSearch = {handleClearSearch} />

      <div className="container mx-auto">
        {allNotes.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {allNotes.map((item) => (
              <NoteCard
                key={item._id}
                title={item.title}
                date={item.createdOn}
                content={item.content}
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit={() => handleEdit(item)}
                onDelete={() => deleteNote(item)}
                onPinNote={() => updateIsPinned(item)}
              />
            ))}
          </div>
        ) : (
          <EmptyCard
            imgSrc={isSearch ? NO_Note : Add_Note}
            message={
              isSearch 
                ? "Oops! No notes found matching your search." 
                : "Start creating your first note! Click the 'Add' button to jot down your thoughts, ideas, and reminders. Let's get started!"
            }
          />

        )}
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-700 absolute right-10 bottom-10"
        onClick={() => setOpenAddEditModal({ isShown: true, type: 'add', data: null })}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => setOpenAddEditModal({ isShown: false, type: 'add', data: null })}
        style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.2)' } }}
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => setOpenAddEditModal({ isShown: false, type: 'add', data: null })}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>

      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;
