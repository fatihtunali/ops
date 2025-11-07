import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  TruckIcon,
  UserIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@context/AuthContext';
import { APP_NAME } from '@utils/constants';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, hasRole } = useAuth();

  // Navigation items based on backend API endpoints and user roles
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      roles: ['admin', 'staff', 'accountant'],
    },
    {
      name: 'Bookings',
      href: '/bookings',
      icon: CalendarIcon,
      roles: ['admin', 'staff', 'accountant'],
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: UserGroupIcon,
      roles: ['admin', 'staff'],
    },
    {
      name: 'Hotels',
      href: '/hotels',
      icon: BuildingOfficeIcon,
      roles: ['admin', 'staff'],
    },
    {
      name: 'Tour Suppliers',
      href: '/tour-suppliers',
      icon: TruckIcon,
      roles: ['admin', 'staff'],
    },
    {
      name: 'Guides',
      href: '/guides',
      icon: UserIcon,
      roles: ['admin', 'staff'],
    },
    {
      name: 'Vehicles',
      href: '/vehicles',
      icon: TruckIcon,
      roles: ['admin', 'staff'],
    },
    {
      name: 'Client Payments',
      href: '/client-payments',
      icon: CurrencyDollarIcon,
      roles: ['admin', 'accountant'],
    },
    {
      name: 'Supplier Payments',
      href: '/supplier-payments',
      icon: BanknotesIcon,
      roles: ['admin', 'accountant'],
    },
    {
      name: 'Expenses',
      href: '/expenses',
      icon: BanknotesIcon,
      roles: ['admin', 'accountant'],
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: ChartBarIcon,
      roles: ['admin', 'accountant'],
    },
    {
      name: 'Vouchers',
      href: '/vouchers',
      icon: DocumentTextIcon,
      roles: ['admin', 'staff'],
    },
    {
      name: 'Users',
      href: '/users',
      icon: Cog6ToothIcon,
      roles: ['admin'],
    },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(user?.role)
  );

  const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + '/');

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-600 to-indigo-700">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-blue-500">
        <Link to="/dashboard" className="flex items-center">
          <span className="text-2xl font-bold text-white">{APP_NAME}</span>
        </Link>
        <button
          type="button"
          className="lg:hidden text-blue-100 hover:text-white"
          onClick={onClose}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => onClose()}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                active
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-blue-200 hover:bg-blue-500 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${active ? 'text-white' : 'text-blue-300'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-blue-500">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.full_name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-secondary-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white">
                  <SidebarContent />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-blue-500">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
