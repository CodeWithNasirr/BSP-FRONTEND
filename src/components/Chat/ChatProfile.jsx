import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';

const ChatProfile = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Profile Header */}
      <div className="p-4 flex items-center justify-between bg-gray-900">
        <h4 className="text-lg font-semibold">Chat Profile</h4>
      </div>

      {/* Profile Content */}
      <div className="flex-1 flex flex-col items-center justify-start p-4">
        <div className="rounded-full bg-gray-600 p-4">
          <UserCircleIcon className="h-20 w-20 text-gray-300" />
        </div>
        <hr className="w-4/5 my-4 border-gray-600" />
      </div>
    </div>
  );
};

export default ChatProfile;