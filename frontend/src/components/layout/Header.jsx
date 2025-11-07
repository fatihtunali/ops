import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-blue-500 shadow-lg">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden text-blue-100 hover:text-white"
          onClick={onMenuClick}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Page title or breadcrumbs can go here */}
        <div className="flex-1 lg:ml-0 ml-4">
          <h1 className="text-lg font-semibold text-white">
            Welcome, {user?.full_name}
          </h1>
        </div>

        {/* Right side items */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            type="button"
            className="relative p-1 text-blue-100 hover:text-white rounded-full hover:bg-blue-700"
          >
            <BellIcon className="w-6 h-6" />
            {/* Notification badge */}
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-blue-600"></span>
          </button>

          {/* User dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 rounded-lg px-3 py-2 hover:bg-blue-700">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{user?.full_name}</p>
                <p className="text-xs text-blue-100 capitalize">{user?.role}</p>
              </div>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-3 border-b border-secondary-200">
                  <p className="text-sm font-medium text-secondary-900">{user?.full_name}</p>
                  <p className="text-xs text-secondary-600 mt-0.5">{user?.email}</p>
                </div>

                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-secondary-50' : ''
                        } flex w-full items-center px-4 py-2 text-sm text-secondary-700`}
                      >
                        <UserCircleIcon className="w-5 h-5 mr-3 text-secondary-500" />
                        My Profile
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-secondary-50' : ''
                        } flex w-full items-center px-4 py-2 text-sm text-secondary-700`}
                      >
                        <Cog6ToothIcon className="w-5 h-5 mr-3 text-secondary-500" />
                        Settings
                      </button>
                    )}
                  </Menu.Item>
                </div>

                <div className="py-1 border-t border-secondary-200">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-danger-50' : ''
                        } flex w-full items-center px-4 py-2 text-sm text-danger-600`}
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                        Logout
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;
