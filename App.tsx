
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { SendMoneyFlow } from './components/SendMoneyFlow.tsx';
import { Recipients } from './components/Recipients.tsx';
import { 
    Transaction, 
    Recipient, 
    TransactionStatus, 
    Card, 
    CardTransaction, 
    Notification, 
    NotificationType, 
    LoanApplication, 
    LoanApplicationStatus, 
    Account, 
    VerificationLevel, 
    CryptoHolding, 
    SubscriptionService, 
    AppleCardDetails, 
    AppleCardTransaction, 
    TravelPlan, 
    TravelPlanStatus, 
    SecuritySettings, 
    TrustedDevice, 
    UserProfile, 
    PlatformSettings, 
    View, 
    Task, 
    FlightBooking, 
    UtilityBill, 
    AirtimePurchase, 
    PushNotification, 
    PushNotificationSettings, 
    SavedSession, 
    VirtualCard, 
    Donation, 
    PrivacySettings, 
    Country, 
    AdvancedTransferLimits, 
    TaskCategory, 
    SpendingLimit, 
    SpendingCategory,
    AccountType,
    AdvisorResponse
} from './types.ts';
import { 
    INITIAL_RECIPIENTS, 
    INITIAL_TRANSACTIONS, 
    INITIAL_CARDS, 
    INITIAL_CARD_TRANSACTIONS, 
    INITIAL_ADVANCED_TRANSFER_LIMITS, 
    INITIAL_ACCOUNTS, 
    getInitialCryptoAssets, 
    INITIAL_CRYPTO_HOLDINGS, 
    CRYPTO_TRADE_FEE_PERCENT, 
    INITIAL_SUBSCRIPTIONS, 
    INITIAL_APPLE_CARD_DETAILS, 
    INITIAL_APPLE_CARD_TRANSACTIONS, 
    INITIAL_TRAVEL_PLANS, 
    INITIAL_SECURITY_SETTINGS, 
    INITIAL_TRUSTED_DEVICES, 
    USER_PROFILE, 
    INITIAL_PLATFORM_SETTINGS, 
    INITIAL_TASKS, 
    INITIAL_FLIGHT_BOOKINGS, 
    INITIAL_UTILITY_BILLS, 
    getUtilityBillers, 
    getAirtimeProviders, 
    INITIAL_AIRTIME_PURCHASES, 
    INITIAL_PUSH_SETTINGS, 
    INITIAL_VIRTUAL_CARDS, 
    INITIAL_WALLET_DETAILS 
} from './constants.ts';
import * as Icons from './components/Icons.tsx';
import { Welcome } from './components/Welcome.tsx';
import { ActivityLog } from './components/ActivityLog.tsx';
import { Security } from './components/Security.tsx';
import { CardManagement } from './components/CardManagement.tsx';
import { Insurance } from './components/Insurance.tsx';
import { Loans } from './components/Loans.tsx';
import { Support } from './components/Support.tsx';
import { DynamicIslandSimulator } from './components/DynamicIslandSimulator.tsx';
import { Accounts } from './components/Accounts.tsx';
import { CryptoDashboard } from './components/CryptoDashboard.tsx';
import { ServicesDashboard } from './components/ServicesDashboard.tsx';
import { TravelCheckIn } from './components/TravelCheckIn.tsx';
import { PlatformFeatures } from './components/PlatformFeatures.tsx';
import { FinancialTasks } from './components/FinancialTasks.tsx';
import { Flights } from './components/Flights.tsx';
import { Utilities } from './components/Utilities.tsx';
import { Integrations } from './components/Integrations.tsx';
import { FinancialAdvisor } from './components/FinancialAdvisor.tsx';
import { Investments } from './components/Investments.tsx';
import { AtmLocator } from './components/AtmLocator.tsx';
import { Quickteller } from './components/Quickteller.tsx';
import { QrScanner } from './components/QrScanner.tsx';
import { PrivacyCenter } from './components/PrivacyCenter.tsx';
import { WireTransfer } from './components/WireTransfer.tsx';
import { About } from './components/About.tsx';
import { Contact } from './components/Contact.tsx';
import { DigitalWallet } from './components/DigitalWallet.tsx';
import { Ratings } from './components/Ratings.tsx';
import { GlobalAid } from './components/GlobalAid.tsx';
import { GlobalBankingNetwork } from './components/GlobalBankingNetwork.tsx';

import { LanguageSelector } from './components/LanguageSelector.tsx';

import { getFinancialAnalysis } from './services/geminiService.ts';
import { 
    sendTransactionalEmail, 
    sendSmsNotification, 
    generateTransactionReceiptEmail, 
    generateTransactionReceiptSms 
} from './services/notificationService.ts';

import { InactivityModal } from './components/InactivityModal.tsx';
import { ChangePasswordModal } from './components/ChangePasswordModal.tsx';
import { PushNotificationToast } from './components/PushNotificationToast.tsx';
import { AdvancedFirstPage } from './components/AdvancedFirstPage.tsx';
import { OpeningSequence } from './components/OpeningSequence.tsx';
import { PostLoginSecurityCheck } from './components/PostLoginSecurityCheck.tsx';
import { AccountCreationFlow } from './components/AccountCreationFlow.tsx';
import { ResumeSessionModal } from './components/ResumeSessionModal.tsx';
import { ContactSupportModal } from './components/ContactSupportModal.tsx';
import { LinkBankAccountModal } from './components/LinkBankAccountModal.tsx';
import { LogoutConfirmationModal } from './components/LogoutConfirmationModal.tsx';
import { LoggedOut } from './components/LoggedOut.tsx';
import { ProfileSignIn } from './components/ProfileSignIn.tsx';
import { Footer } from './components/Footer.tsx';
import { LegalModal } from './components/LegalModal.tsx';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [showSendMoneyFlow, setShowSendMoneyFlow] = useState(false);
  const [showWireTransfer, setShowWireTransfer] = useState(false);
  const [wireTransferData, setWireTransferData] = useState<any>(null);
  const [sendMoneyInitialTab, setSendMoneyInitialTab] = useState<'send' | 'split' | 'deposit' | undefined>(undefined);
  const [transactionToRepeat, setTransactionToRepeat] = useState<Transaction | null>(null);

  // Currency State
  const [displayCurrency, setDisplayCurrency] = useState<string>('USD');

  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [recipients, setRecipients] = useState<Recipient[]>(INITIAL_RECIPIENTS);
  
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [virtualCards, setVirtualCards] = useState<VirtualCard[]>(INITIAL_VIRTUAL_CARDS);
  const [cardTransactions] = useState<CardTransaction[]>(INITIAL_CARD_TRANSACTIONS);

  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [cryptoAssets, setCryptoAssets] = useState(() => getInitialCryptoAssets(Icons));
  const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHolding[]>(INITIAL_CRYPTO_HOLDINGS);
  const [subscriptions, setSubscriptions] = useState<SubscriptionService[]>(INITIAL_SUBSCRIPTIONS);
  const [appleCardDetails, setAppleCardDetails] = useState<AppleCardDetails>(INITIAL_APPLE_CARD_DETAILS);
  const [appleCardTransactions, setAppleCardTransactions] = useState<AppleCardTransaction[]>(INITIAL_APPLE_CARD_TRANSACTIONS);
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>(INITIAL_TRAVEL_PLANS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [flightBookings, setFlightBookings] = useState<FlightBooking[]>(INITIAL_FLIGHT_BOOKINGS);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>(INITIAL_UTILITY_BILLS);
  const [utilityBillers] = useState(() => getUtilityBillers(Icons));
  const [airtimeProviders] = useState(() => getAirtimeProviders(Icons));
  const [airtimePurchases, setAirtimePurchases] = useState<AirtimePurchase[]>(INITIAL_AIRTIME_PURCHASES);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [linkedServices, setLinkedServices] = useState<Record<string, string>>({ PayPal: 'randy.m.c@...com' });
  const [walletDetails] = useState(INITIAL_WALLET_DETAILS);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pushNotification, setPushNotification] = useState<PushNotification | null>(null);

  // Settings
  const [advancedTransferLimits, setAdvancedTransferLimits] = useState(INITIAL_ADVANCED_TRANSFER_LIMITS);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(INITIAL_SECURITY_SETTINGS);
  const [pushNotificationSettings, setPushNotificationSettings] = useState<PushNotificationSettings>(INITIAL_PUSH_SETTINGS);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
      ads: true,
      sharing: false,
      email: { transactions: true, security: true, promotions: false },
      sms: { transactions: true, security: true, promotions: false },
  });
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>(INITIAL_TRUSTED_DEVICES);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(INITIAL_PLATFORM_SETTINGS);
  const [userProfile, setUserProfile] = useState<UserProfile>(USER_PROFILE);

  const [verificationLevel, setVerificationLevel] = useState<VerificationLevel>(VerificationLevel.LEVEL_1);
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);

  // Login & Session State
  const [loginState, setLoginState] = useState<'logged_out'|'intro'|'welcome'|'profile_signin'|'security_check'|'opening_sequence'|'logged_in'|'account_creation'>('intro');
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showContactSupportModal, setShowContactSupportModal] = useState(false);
  const [supportInitialTxId, setSupportInitialTxId] = useState<string | undefined>(undefined);
  const [showLinkAccountModal, setShowLinkAccountModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // AI Advisor State
  const [financialAnalysis, setFinancialAnalysis] = useState<AdvisorResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);

  // Session resume state
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
  const [showResumeSessionModal, setShowResumeSessionModal] = useState(false);
  
  // Legal Modal
  const [legalModalContent, setLegalModalContent] = useState<{ title: string; content: string } | null>(null);

  // Simulate Geolocated Currency Preference
  useEffect(() => {
      const savedCurrency = localStorage.getItem('icu_currency_pref');
      if (savedCurrency) {
          setDisplayCurrency(savedCurrency);
      }
  }, []);

  const addNotification = useCallback((type: NotificationType, title: string, message: string, linkTo?: View) => {
    const newNotification: Notification = {
      id: `notif_${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      linkTo,
    };
    setNotifications(prev => [newNotification, ...prev]);

    // Also trigger a push notification simulation
    if ((type === NotificationType.TRANSACTION && pushNotificationSettings.transactions) ||
        (type === NotificationType.SECURITY && pushNotificationSettings.security)) {
        setPushNotification({ id: `push_${Date.now()}`, type, title, message });
    }
  }, [pushNotificationSettings]);

  const onUpdateAccountNickname = (accountId: string, nickname: string) => {
    setAccounts(prev => prev.map(acc => acc.id === accountId ? {...acc, nickname} : acc));
  };
  
  const onUpdateProfilePicture = (url: string) => {
      setUserProfile(prev => ({...prev, profilePictureUrl: url}));
  };

  const totalNetWorth = useMemo(() => {
    const accountTotal = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const cryptoTotal = cryptoHoldings.reduce((sum, holding) => {
      const asset = cryptoAssets.find(a => a.id === holding.assetId);
      return sum + (asset ? holding.amount * asset.price : 0);
    }, 0);
    return accountTotal + cryptoTotal;
  }, [accounts, cryptoHoldings, cryptoAssets]);
  
  const onBuyCrypto = (assetId: string, usdAmount: number, assetPrice: number): boolean => {
    const checking = accounts.find(a => a.type === AccountType.CHECKING);
    if (!checking || checking.balance < usdAmount) return false;

    const cryptoAmount = usdAmount / assetPrice;
    
    setAccounts(prev => prev.map(a => a.id === checking.id ? { ...a, balance: a.balance - usdAmount } : a));
    
    setCryptoHoldings(prev => {
        const existing = prev.find(h => h.assetId === assetId);
        if (existing) {
            const totalAmount = existing.amount + cryptoAmount;
            const totalCost = (existing.avgBuyPrice * existing.amount) + usdAmount;
            return prev.map(h => h.assetId === assetId ? { ...h, amount: totalAmount, avgBuyPrice: totalCost / totalAmount } : h);
        }
        return [...prev, { assetId, amount: cryptoAmount, avgBuyPrice: assetPrice }];
    });
    return true;
  };
  
  const onSellCrypto = (assetId: string, cryptoAmount: number, assetPrice: number): boolean => {
      const holding = cryptoHoldings.find(h => h.assetId === assetId);
      if (!holding || holding.amount < cryptoAmount) return false;

      const usdAmount = cryptoAmount * assetPrice;

      setAccounts(prev => prev.map(a => a.type === AccountType.CHECKING ? { ...a, balance: a.balance + usdAmount * (1 - CRYPTO_TRADE_FEE_PERCENT) } : a));
      setCryptoHoldings(prev => prev.map(h => h.assetId === assetId ? { ...h, amount: h.amount - cryptoAmount } : h).filter(h => h.amount > 0.000001));
      return true;
  };

  // Handlers for settings/etc
  const onMarkNotificationsAsRead = () => setNotifications(prev => prev.map(n => ({...n, read: true})));
  const onUpdateSecuritySettings = (newSettings: Partial<SecuritySettings>) => setSecuritySettings(prev => ({ ...prev, ...newSettings }));
  const onUpdatePrivacySettings = (update: Partial<PrivacySettings>) => setPrivacySettings(prev => ({...prev, ...update}));
  const onUpdateAdvancedLimits = (newLimits: AdvancedTransferLimits) => setAdvancedTransferLimits(newLimits);
  const onUpdateCardControls = (cardId: string, updatedControls: Partial<Card['controls']>) => setCards(prev => prev.map(c => c.id === cardId ? {...c, controls: {...c.controls, ...updatedControls}} : c));
  const onVerificationComplete = (level: VerificationLevel) => setVerificationLevel(level);
  const onRevokeDevice = (deviceId: string) => setTrustedDevices(prev => prev.filter(d => d.id !== deviceId));
  const onUpdatePushNotificationSettings = (newSettings: Partial<PushNotificationSettings>) => setPushNotificationSettings(prev => ({...prev, ...newSettings}));
  const onUpdatePlatformSettings = useCallback((newSettings: Partial<PlatformSettings>) => {
      setPlatformSettings(prev => ({...prev, ...newSettings}));
  }, []);
  
  const addRecipient = (data: any) => {
      const newRecipient: Recipient = {
          id: `rec_${Date.now()}`,
          fullName: data.fullName,
          nickname: data.nickname,
          phone: data.phone,
          bankName: data.bankName,
          accountNumber: `•••• ${data.accountNumber.slice(-4)}`,
          country: data.country,
          deliveryOptions: { bankDeposit: true, cardDeposit: true, cashPickup: data.cashPickupEnabled },
          realDetails: { accountNumber: data.accountNumber, swiftBic: data.swiftBic },
          streetAddress: data.streetAddress,
          city: data.city,
          stateProvince: data.stateProvince,
          postalCode: data.postalCode,
      };
      setRecipients(prev => [...prev, newRecipient]);
      addNotification(NotificationType.ACCOUNT, 'Recipient Added', `${data.fullName} added.`);
  };

  const onUpdateRecipient = (id: string, data: any) => {
      setRecipients(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
      addNotification(NotificationType.ACCOUNT, 'Recipient Updated', `${data.fullName} updated.`);
  };

  const onAddCard = (cardData: Omit<Card, 'id' | 'controls'>) => {
      const newCard: Card = {
          ...cardData,
          id: `card_${Date.now()}`,
          controls: { isFrozen: false, onlinePurchases: true, internationalTransactions: true, transactionLimits: { perTransaction: null, daily: null }, blockedCategories: [] },
      };
      setCards(prev => [...prev, newCard]);
  };

  const onAddVirtualCard = (data: any) => {
      const newVC: VirtualCard = {
          ...data,
          id: `vc_${Date.now()}`,
          lastFour: '9999',
          fullNumber: '4111 2222 3333 9999',
          expiryDate: '12/30',
          cvc: '123',
          spentThisMonth: 0,
          lockedToMerchant: null,
          isFrozen: false
      };
      setVirtualCards(prev => [...prev, newVC]);
  };

  const onUpdateVirtualCard = (cardId: string, updates: any) => {
      setVirtualCards(prev => prev.map(vc => vc.id === cardId ? {...vc, ...updates} : vc));
  };

  const onAddFunds = async (amount: number, lastFour: string) => {
      const checking = accounts.find(a => a.type === AccountType.CHECKING);
      if(checking) {
          setAccounts(prev => prev.map(a => a.id === checking.id ? {...a, balance: a.balance + amount} : a));
          addNotification(NotificationType.TRANSACTION, 'Funds Added', `$${amount} added from card ending in ${lastFour}`);
      }
  };

  const addLoanApplication = (app: any) => {
      const newApp: LoanApplication = { ...app, id: `loan_${Date.now()}`, status: LoanApplicationStatus.PENDING, submittedDate: new Date() };
      setLoanApplications(prev => [...prev, newApp]);
  };

  const addTravelPlan = (country: Country, startDate: Date, endDate: Date) => {
      const newPlan: TravelPlan = { id: `trip_${Date.now()}`, country, startDate, endDate, status: TravelPlanStatus.UPCOMING };
      setTravelPlans(prev => [...prev, newPlan]);
  };

  const addTask = (text: string, dueDate?: Date, category?: TaskCategory) => {
      setTasks(prev => [...prev, { id: `task_${Date.now()}`, text, completed: false, dueDate, category }]);
  };

  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? {...t, completed: !t.completed} : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const onBookFlight = (booking: any, sourceAccountId: string) => {
      const account = accounts.find(a => a.id === sourceAccountId);
      if(account && account.balance >= booking.totalPrice) {
          setAccounts(prev => prev.map(a => a.id === sourceAccountId ? {...a, balance: a.balance - booking.totalPrice} : a));
          setFlightBookings(prev => [...prev, { ...booking, id: `fb_${Date.now()}`, bookingDate: new Date(), status: 'Confirmed' }]);
          addNotification(NotificationType.TRAVEL, 'Flight Booked', `Flight to ${booking.flight.to.city} confirmed.`);
          return true;
      }
      return false;
  };

  const onPayBill = (billId: string, sourceAccountId: string) => {
      const bill = utilityBills.find(b => b.id === billId);
      const account = accounts.find(a => a.id === sourceAccountId);
      if(bill && account && account.balance >= bill.amount) {
          setAccounts(prev => prev.map(a => a.id === sourceAccountId ? {...a, balance: a.balance - bill.amount} : a));
          setUtilityBills(prev => prev.map(b => b.id === billId ? {...b, isPaid: true} : b));
          addNotification(NotificationType.TRANSACTION, 'Bill Paid', `Bill for $${bill.amount} paid.`);
          return true;
      }
      return false;
  };

  const onPurchaseAirtime = (providerId: string, phoneNumber: string, amount: number, accountId: string) => {
      const account = accounts.find(a => a.id === accountId);
      if(account && account.balance >= amount) {
          setAccounts(prev => prev.map(a => a.id === accountId ? {...a, balance: a.balance - amount} : a));
          setAirtimePurchases(prev => [{ id: `ap_${Date.now()}`, providerId, phoneNumber, amount, purchaseDate: new Date() }, ...prev]);
          addNotification(NotificationType.TRANSACTION, 'Airtime Purchased', `$${amount} airtime sent to ${phoneNumber}.`);
          return true;
      }
      return false;
  };

  const onLinkService = (serviceName: string, identifier: string) => {
      setLinkedServices(prev => ({...prev, [serviceName]: identifier}));
      addNotification(NotificationType.SECURITY, 'Service Linked', `${serviceName} linked successfully.`);
  };

  const onDonate = (causeId: string, amount: number, accountId: string) => {
      const account = accounts.find(a => a.id === accountId);
      if(account && account.balance >= amount) {
          setAccounts(prev => prev.map(a => a.id === accountId ? {...a, balance: a.balance - amount} : a));
          setDonations(prev => [...prev, { id: `don_${Date.now()}`, causeId, amount, date: new Date() }]);
          addNotification(NotificationType.TRANSACTION, 'Donation Successful', `You donated $${amount}. Thank you!`);
          return true;
      }
      return false;
  };

  const onPaySubscription = (subId: string) => {
      const sub = subscriptions.find(s => s.id === subId);
      const account = accounts.find(a => a.balance >= (sub?.amount || 0));
      if(sub && account) {
          setAccounts(prev => prev.map(a => a.id === account.id ? {...a, balance: a.balance - sub.amount} : a));
          setSubscriptions(prev => prev.map(s => s.id === subId ? {...s, isPaid: true} : s));
          addNotification(NotificationType.TRANSACTION, 'Subscription Paid', `${sub.provider} subscription paid.`);
          return true;
      }
      return false;
  };

  const onUpdateSpendingLimits = (limits: SpendingLimit[]) => {
      setAppleCardDetails(prev => ({...prev, spendingLimits: limits}));
  };

  const onUpdateTransactionCategory = (id: string, category: SpendingCategory) => {
      setAppleCardTransactions(prev => prev.map(t => t.id === id ? {...t, category} : t));
  };

  const onSendWire = async (data: any) => {
      // Mock wire send
      const account = accounts.find(a => a.id === data.accountId);
      if(account && account.balance >= (data.sendAmount + data.fee)) {
          const newTx: Transaction = {
              id: `wire_${Date.now()}`,
              accountId: data.accountId,
              recipient: data.recipient,
              sendAmount: data.sendAmount,
              receiveAmount: data.receiveAmount,
              receiveCurrency: data.receiveCurrency,
              fee: data.fee,
              exchangeRate: data.exchangeRate,
              status: TransactionStatus.SUBMITTED,
              estimatedArrival: new Date(Date.now() + 86400000 * 2),
              statusTimestamps: { [TransactionStatus.SUBMITTED]: new Date() },
              description: data.description,
              type: 'debit',
              transferMethod: 'wire',
              purpose: data.purpose
          };
          setTransactions(prev => [newTx, ...prev]);
          setAccounts(prev => prev.map(a => a.id === data.accountId ? {...a, balance: a.balance - (data.sendAmount + data.fee)} : a));
          return newTx;
      }
      return null;
  };

  const runFinancialAnalysis = async () => {
      setIsAnalyzing(true);
      setAnalysisError(false);
      const financialData = JSON.stringify({ accounts: accounts.map(a => ({ type: a.type, balance: a.balance })), transactions: transactions.slice(0, 5) });
      const { analysis, isError } = await getFinancialAnalysis(financialData);
      if (isError) {
          setAnalysisError(true);
      } else {
          setFinancialAnalysis(analysis);
      }
      setIsAnalyzing(false);
  };

  const createTransaction = async (transactionDetails: Omit<Transaction, 'id' | 'status' | 'estimatedArrival' | 'statusTimestamps' | 'type'>): Promise<Transaction | null> => {
      const newTransaction: Transaction = {
          ...transactionDetails,
          id: `txn_${Date.now()}`,
          status: TransactionStatus.SUBMITTED,
          type: 'debit',
          estimatedArrival: new Date(Date.now() + 86400000 * 3), // 3 days from now
          statusTimestamps: {
              [TransactionStatus.SUBMITTED]: new Date(),
          },
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setAccounts(prev => prev.map(a => a.id === newTransaction.accountId ? {...a, balance: a.balance - (newTransaction.sendAmount + newTransaction.fee)} : a));
      
      addNotification(
          NotificationType.TRANSACTION,
          'Transfer Submitted',
          `Your transfer of ${transactionDetails.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} to ${transactionDetails.recipient.fullName} has been submitted.`,
          'history'
      );
      
      const {subject, body} = generateTransactionReceiptEmail(newTransaction, userProfile.name);
      if (privacySettings.email.transactions) sendTransactionalEmail(userProfile.email, subject, body);
      if (privacySettings.sms.transactions) sendSmsNotification(userProfile.phone || '', generateTransactionReceiptSms(newTransaction));
      
      return newTransaction;
  };

  const onAuthorizeTransaction = (transactionId: string, method: 'code' | 'fee') => {
      setTransactions(prev => prev.map(tx => {
          if (tx.id === transactionId && tx.status === TransactionStatus.FLAGGED_AWAITING_CLEARANCE) {
              return {
                  ...tx,
                  status: TransactionStatus.CLEARANCE_GRANTED,
                  statusTimestamps: {
                      ...tx.statusTimestamps,
                      [TransactionStatus.CLEARANCE_GRANTED]: new Date(),
                  },
                  clearanceFeePaid: method === 'fee',
              };
          }
          return tx;
      }));
  };
  
  const openLegalModal = (title: string, content: string) => {
      setLegalModalContent({ title, content });
  };

  if (loginState === 'intro') {
      return <AdvancedFirstPage onComplete={() => setLoginState('welcome')} onOpenAccount={() => setLoginState('account_creation')} />;
  }
  if (loginState === 'welcome') {
      return <Welcome onLogin={() => setLoginState('profile_signin')} onStartCreateAccount={() => setLoginState('account_creation')} />;
  }
  if (loginState === 'account_creation') {
      return <AccountCreationFlow onBackToLogin={() => setLoginState('welcome')} onCreateAccountSuccess={() => setLoginState('welcome')} />;
  }
  if (loginState === 'profile_signin') {
      return <ProfileSignIn user={userProfile} onEnterDashboard={() => setLoginState('security_check')} />;
  }
  if (loginState === 'security_check') {
      return <PostLoginSecurityCheck onComplete={() => setLoginState('opening_sequence')} />;
  }
  if (loginState === 'opening_sequence') {
      return <OpeningSequence onComplete={() => setLoginState('logged_in')} />;
  }
  if (loginState === 'logged_out') {
      return <LoggedOut user={userProfile} onLogin={() => setLoginState('profile_signin')} onSwitchUser={() => setLoginState('welcome')} />;
  }

  return (
    <div className={`min-h-screen ${platformSettings.themeMode === 'dark' ? 'dark bg-slate-900' : 'bg-slate-50'} font-sans transition-colors duration-300`}>
        
        {showInactivityModal && <InactivityModal onStayLoggedIn={() => setShowInactivityModal(false)} onLogout={() => setLoginState('logged_out')} countdownStart={60} />}
        {pushNotification && <PushNotificationToast notification={pushNotification} onClose={() => setPushNotification(null)} />}
        {showChangePasswordModal && <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} onSuccess={() => { setShowChangePasswordModal(false); addNotification(NotificationType.SECURITY, 'Password Changed', 'Your password was updated successfully.'); }} />}
        {showLogoutModal && <LogoutConfirmationModal onClose={() => setShowLogoutModal(false)} onConfirm={() => { setShowLogoutModal(false); setLoginState('logged_out'); }} />}
        {showContactSupportModal && <ContactSupportModal onClose={() => setShowContactSupportModal(false)} onSubmit={async (data) => { await new Promise(r => setTimeout(r, 1000)); addNotification(NotificationType.SUPPORT, 'Ticket Created', `Support ticket created for ${data.topic}.`); }} transactions={transactions} initialTransactionId={supportInitialTxId} />}
        {showLinkAccountModal && <LinkBankAccountModal onClose={() => setShowLinkAccountModal(false)} onLinkSuccess={(bank, name, lastFour) => { setAccounts(prev => [...prev, { id: `acc_${Date.now()}`, type: AccountType.EXTERNAL_LINKED, nickname: name, accountNumber: `•••• ${lastFour}`, fullAccountNumber: `xxxxxx${lastFour}`, balance: 0, features: ['External'], status: 'Active' }]); setShowLinkAccountModal(false); addNotification(NotificationType.ACCOUNT, 'Account Linked', `${bank} account linked successfully.`); }} />}
        {showResumeSessionModal && savedSession && <ResumeSessionModal session={savedSession} onResume={() => { setActiveView(savedSession.view); setShowResumeSessionModal(false); }} onStartFresh={() => { setSavedSession(null); setShowResumeSessionModal(false); }} />}
        {legalModalContent && <LegalModal title={legalModalContent.title} content={legalModalContent.content} onClose={() => setLegalModalContent(null)} />}

        <Header 
            onMenuToggle={() => setIsMenuOpen(prev => !prev)} 
            isMenuOpen={isMenuOpen}
            activeView={activeView}
            setActiveView={setActiveView}
            onLogout={() => setShowLogoutModal(true)}
            notifications={notifications}
            onMarkNotificationsAsRead={onMarkNotificationsAsRead}
            onNotificationClick={setActiveView}
            userProfile={userProfile}
            onOpenLanguageSelector={() => setIsLanguageSelectorOpen(true)}
            onUpdateProfilePicture={onUpdateProfilePicture}
            onOpenSendMoneyFlow={(tab) => { setSendMoneyInitialTab(tab); setShowSendMoneyFlow(true); }}
            onOpenWireTransfer={() => setShowWireTransfer(true)}
            displayCurrency={displayCurrency}
            setDisplayCurrency={setDisplayCurrency}
        />

        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
            {activeView === 'dashboard' && (
                <Dashboard 
                    accounts={accounts}
                    transactions={transactions}
                    recipients={recipients}
                    createTransaction={createTransaction}
                    setActiveView={setActiveView}
                    travelPlans={travelPlans}
                    totalNetWorth={totalNetWorth}
                    portfolioChange24h={1.2}
                    userProfile={userProfile}
                    displayCurrency={displayCurrency}
                />
            )}
            {activeView === 'accounts' && <Accounts accounts={accounts} transactions={transactions} verificationLevel={verificationLevel} onUpdateAccountNickname={onUpdateAccountNickname} displayCurrency={displayCurrency} />}
            {activeView === 'wallet' && <DigitalWallet wallet={walletDetails} />}
            {activeView === 'send' && <SendMoneyFlow recipients={recipients} accounts={accounts} createTransaction={createTransaction} transactions={transactions} securitySettings={securitySettings} hapticsEnabled={platformSettings.hapticsEnabled} onAuthorizeTransaction={onAuthorizeTransaction} setActiveView={setActiveView} onClose={() => { setShowSendMoneyFlow(false); setTransactionToRepeat(null); }} onLinkAccount={() => setShowLinkAccountModal(true)} onDepositCheck={(details) => { addNotification(NotificationType.TRANSACTION, 'Check Deposited', `Check for $${details.amount} deposited.`); }} onSplitTransaction={() => true} initialTab={sendMoneyInitialTab} transactionToRepeat={transactionToRepeat} userProfile={userProfile} onContactSupport={() => setShowContactSupportModal(true)} />}
            {activeView === 'wire' && <WireTransfer accounts={accounts} recipients={recipients} onSendWire={onSendWire} onClose={() => { setShowWireTransfer(false); setWireTransferData(null); }} initialData={wireTransferData} advancedTransferLimits={advancedTransferLimits} addRecipient={addRecipient} />}
            {activeView === 'cards' && <CardManagement cards={cards} virtualCards={virtualCards} onUpdateVirtualCard={onUpdateVirtualCard} cardTransactions={cardTransactions} onUpdateCardControls={onUpdateCardControls} onAddCard={onAddCard} onAddVirtualCard={onAddVirtualCard} accountBalance={totalNetWorth} onAddFunds={onAddFunds} />}
            {activeView === 'history' && <ActivityLog transactions={transactions} onUpdateTransactions={() => {}} onRepeatTransaction={(tx) => { setTransactionToRepeat(tx); setShowSendMoneyFlow(true); }} onAuthorizeTransaction={onAuthorizeTransaction} accounts={accounts} onContactSupport={(id) => { setSupportInitialTxId(id); setShowContactSupportModal(true); }} />}
            {activeView === 'recipients' && <Recipients recipients={recipients} addRecipient={addRecipient} onUpdateRecipient={onUpdateRecipient} />}
            {activeView === 'tasks' && <FinancialTasks tasks={tasks} addTask={addTask} toggleTask={toggleTask} deleteTask={deleteTask} />}
            {activeView === 'integrations' && <Integrations linkedServices={linkedServices} onLinkService={onLinkService} />}
            {activeView === 'network' && <GlobalBankingNetwork onOpenWireTransfer={(data) => { setWireTransferData(data); setShowWireTransfer(true); }} setActiveView={setActiveView} />}
            {activeView === 'invest' && <Investments />}
            {activeView === 'crypto' && <CryptoDashboard cryptoAssets={cryptoAssets} setCryptoAssets={setCryptoAssets} holdings={cryptoHoldings} onBuy={onBuyCrypto} onSell={onSellCrypto} />}
            {activeView === 'loans' && <Loans loanApplications={loanApplications} addLoanApplication={addLoanApplication} addNotification={addNotification} />}
            {activeView === 'insurance' && <Insurance addNotification={addNotification} />}
            {activeView === 'quickteller' && <Quickteller airtimeProviders={airtimeProviders} purchases={airtimePurchases} accounts={accounts} onPurchase={onPurchaseAirtime} setActiveView={setActiveView} />}
            {activeView === 'qrScanner' && <QrScanner hapticsEnabled={platformSettings.hapticsEnabled} />}
            {activeView === 'flights' && <Flights bookings={flightBookings} onBookFlight={onBookFlight} accounts={accounts} setActiveView={setActiveView} />}
            {activeView === 'utilities' && <Utilities bills={utilityBills} billers={utilityBillers} onPayBill={onPayBill} accounts={accounts} setActiveView={setActiveView} />}
            {activeView === 'services' && <ServicesDashboard subscriptions={subscriptions} appleCardDetails={appleCardDetails} appleCardTransactions={appleCardTransactions} onPaySubscription={onPaySubscription} onUpdateSpendingLimits={onUpdateSpendingLimits} onUpdateTransactionCategory={onUpdateTransactionCategory} />}
            {activeView === 'checkin' && <TravelCheckIn travelPlans={travelPlans} addTravelPlan={addTravelPlan} />}
            {activeView === 'atmLocator' && <AtmLocator />}
            {activeView === 'globalAid' && <GlobalAid donations={donations} onDonate={onDonate} accounts={accounts} />}
            {activeView === 'advisor' && <FinancialAdvisor analysis={financialAnalysis} isAnalyzing={isAnalyzing} analysisError={analysisError} runFinancialAnalysis={runFinancialAnalysis} setActiveView={setActiveView} />}
            {activeView === 'support' && <Support />}
            {activeView === 'security' && <Security advancedTransferLimits={advancedTransferLimits} onUpdateAdvancedLimits={onUpdateAdvancedLimits} cards={cards} onUpdateCardControls={onUpdateCardControls} verificationLevel={verificationLevel} onVerificationComplete={onVerificationComplete} securitySettings={securitySettings} onUpdateSecuritySettings={onUpdateSecuritySettings} trustedDevices={trustedDevices} onRevokeDevice={onRevokeDevice} onChangePassword={() => setShowChangePasswordModal(true)} transactions={transactions} pushNotificationSettings={pushNotificationSettings} onUpdatePushNotificationSettings={onUpdatePushNotificationSettings} userProfile={userProfile} onUpdateProfilePicture={onUpdateProfilePicture} privacySettings={privacySettings} onUpdatePrivacySettings={onUpdatePrivacySettings} />}
            {activeView === 'privacy' && <PrivacyCenter settings={privacySettings} onUpdateSettings={onUpdatePrivacySettings} />}
            {activeView === 'platform' && <PlatformFeatures settings={platformSettings} onUpdateSettings={onUpdatePlatformSettings} />}
            {activeView === 'about' && <About />}
            {activeView === 'contact' && <Contact setActiveView={setActiveView} />}
            {activeView === 'ratings' && <Ratings />}
        </main>

        {showSendMoneyFlow && (
            <SendMoneyFlow 
                recipients={recipients} 
                accounts={accounts} 
                createTransaction={createTransaction} 
                transactions={transactions} 
                securitySettings={securitySettings} 
                hapticsEnabled={platformSettings.hapticsEnabled} 
                onAuthorizeTransaction={onAuthorizeTransaction} 
                setActiveView={setActiveView} 
                onClose={() => { setShowSendMoneyFlow(false); setTransactionToRepeat(null); }} 
                onLinkAccount={() => setShowLinkAccountModal(true)} 
                onDepositCheck={(details) => { addNotification(NotificationType.TRANSACTION, 'Check Deposited', `Check for $${details.amount} deposited.`); }} 
                onSplitTransaction={() => true} 
                initialTab={sendMoneyInitialTab}
                transactionToRepeat={transactionToRepeat}
                userProfile={userProfile}
                onContactSupport={() => setShowContactSupportModal(true)}
            />
        )}

        {showWireTransfer && (
            <WireTransfer 
                accounts={accounts} 
                recipients={recipients} 
                onSendWire={onSendWire} 
                onClose={() => { setShowWireTransfer(false); setWireTransferData(null); }}
                initialData={wireTransferData}
                advancedTransferLimits={advancedTransferLimits}
                addRecipient={addRecipient}
            />
        )}

        {isLanguageSelectorOpen && <LanguageSelector onClose={() => setIsLanguageSelectorOpen(false)} />}
        
        <DynamicIslandSimulator transaction={transactions.find(t => t.status === TransactionStatus.IN_TRANSIT || t.status === TransactionStatus.CONVERTING) || null} />

        <Footer 
            setActiveView={setActiveView}
            onOpenSendMoneyFlow={(tab) => { setSendMoneyInitialTab(tab); setShowSendMoneyFlow(true); }}
            openLegalModal={openLegalModal}
        />
    </div>
  );
};
