import { 
    AiOutlineHome, 
    AiOutlineMessage, 
    AiOutlineTool, 
    AiOutlineBarChart, 
    AiOutlineTeam, 
    AiOutlineContacts, 
    AiOutlineQuestionCircle, 
    AiOutlineSetting 
  } from 'react-icons/ai';
  import { MdOutlineContactPhone } from 'react-icons/md';
  import SidebarItem from './SidebarItem';
  import Avatar from '../ui/Avatar';
  
  export default function Sidebar() {
    return (
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4">
        {/* Logo/Avatar */}
        <div className="mb-6">
          <Avatar 
            size="md" 
            fallback="P" 
            className="bg-green-500 text-white"
          />
        </div>
  
        {/* Navigation Items */}
        <div className="flex flex-col space-y-1 flex-1">
          <SidebarItem icon={<AiOutlineHome />} />
          <SidebarItem icon={<AiOutlineMessage />} isActive />
          <SidebarItem icon={<AiOutlineTool />} />
          <SidebarItem icon={<AiOutlineBarChart />} />
          <SidebarItem icon={<AiOutlineTeam />} />
          <SidebarItem icon={<MdOutlineContactPhone />} />
          <SidebarItem icon={<AiOutlineContacts />} />
          <SidebarItem icon={<AiOutlineQuestionCircle />} />
        </div>
  
        {/* Bottom Items */}
        <div className="mt-auto">
          <SidebarItem icon={<AiOutlineSetting />} />
        </div>
      </div>
    );
  }