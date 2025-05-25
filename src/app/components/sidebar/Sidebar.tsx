'use client';

import {
  AiOutlineHome,
  AiOutlineMessage,
  AiOutlineTool,
  AiOutlineBarChart,
  AiOutlineTeam,
  AiOutlineContacts,
  AiOutlineQuestionCircle
} from 'react-icons/ai';
import SidebarItem from './SidebarItem';
import UserProfile from './UserProfile';

export default function Sidebar() {
  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4">
      {/* User Profile Avatar at top */}
      <div className="mb-6">
        <UserProfile />
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col space-y-1 flex-1">
        <SidebarItem icon={<AiOutlineHome />} />
        <SidebarItem icon={<AiOutlineMessage />} isActive />
        <SidebarItem icon={<AiOutlineTool />} />
        <SidebarItem icon={<AiOutlineBarChart />} />
        <SidebarItem icon={<AiOutlineTeam />} />
        <SidebarItem icon={<AiOutlineContacts />} />
        <SidebarItem icon={<AiOutlineQuestionCircle />} />
      </div>
    </div>
  );
}