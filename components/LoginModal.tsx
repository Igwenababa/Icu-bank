import React, { useState, useEffect, useCallback } from 'react';
// FIX: Added missing icons.
import { ICreditUnionLogo, FingerprintIcon, SpinnerIcon, ShieldCheckIcon, DevicePhoneMobileIcon, EnvelopeIcon, CheckCircleIcon, FaceIdIcon } from './Icons.tsx';
import { 
    sendSmsNotification, 
    sendTransactionalEmail, 
    generateOtpEmail, 
    generateOtpSms 
} from '../services/notificationService.ts';

interface LoginModalProps {
  onClose: () => void;
  onLogin: () => void;
}

type LoginStep = 'credentials' | 'securityCheck' | 'preMfaWarning' | 'mfa';
type ModalMode = 'login' | 'reset' | 'reset_confirmation';

const USER_EMAIL = "mrikimc@gmail.com";
const USER_NAME = "Herbert Lawrence";

// This component is incomplete and appears to be unused.
// Adding a minimal implementation to resolve syntax errors.
export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
    return null;
};