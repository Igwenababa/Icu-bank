import React, { useRef, useState } from 'react';
import { UserProfile, View } from '../types';
import { UserCircleIcon, CogIcon, QuestionMarkCircleIcon, LogoutIcon, CameraIcon, SpinnerIcon } from './Icons';

interface ProfileDropdownProps {
  userProfile: UserProfile;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  onUpdateProfilePicture: (url: string) => void;
}

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
    <li>
        <button
            onClick={onClick}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors"
        >
            {icon}
            <span>{label}</span>
        </button>
    </li>
);

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ userProfile, onNavigate, onLogout, onUpdateProfilePicture }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Please select an image smaller than 5MB.");
                return;
            }

            setIsUploading(true);
            const reader = new FileReader();
            reader.onload = () => {
                // Simulate network delay
                setTimeout(() => {
                    onUpdateProfilePicture(reader.result as string);
                    setIsUploading(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                }, 1500);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePictureClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div
            className="absolute top-full right-0 mt-2 w-64 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 animate-fade-in-down overflow-hidden"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
        >
            <div className="p-4 border-b border-slate-200 dark:border-white/10">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    disabled={isUploading}
                />
                <button
                    onClick={handlePictureClick}
                    disabled={isUploading}
                    className="relative group w-20 h-20 mx-auto mb-3"
                    aria-label="Change profile picture"
                >
                    <img src={userProfile.profilePictureUrl} alt="User Profile" className="w-20 h-20 rounded-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        {isUploading ? <SpinnerIcon className="w-8 h-8" /> : <CameraIcon className="w-8 h-8" />}
                    </div>
                </button>
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate text-center">{userProfile.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate text-center">{userProfile.email}</p>
            </div>
            <ul className="p-2" role="none">
                <MenuItem
                    icon={<UserCircleIcon className="w-5 h-5" />}
                    label="My Account"
                    onClick={() => onNavigate('accounts')}
                />
                <MenuItem
                    icon={<CogIcon className="w-5 h-5" />}
                    label="Settings"
                    onClick={() => onNavigate('security')}
                />
                <MenuItem
                    icon={<QuestionMarkCircleIcon className="w-5 h-5" />}
                    label="Help Center"
                    onClick={() => onNavigate('support')}
                />
            </ul>
            <div className="p-2 border-t border-slate-200 dark:border-white/10">
                <MenuItem
                    icon={<LogoutIcon className="w-5 h-5" />}
                    label="Logout"
                    onClick={onLogout}
                />
            </div>
             <style>{`
              @keyframes fade-in-down {
                0% {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .animate-fade-in-down {
                animation: fade-in-down 0.2s ease-out forwards;
              }
            `}</style>
        </div>
    );
};