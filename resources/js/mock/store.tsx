import * as React from 'react';
import { COUNTRIES, VERIFICATION_SERVICES, Country, VerificationService } from './data';

export interface ActiveNumber {
    id: string;
    number: string;
    countryCode: string;
    countryName: string;
    countryFlag: string;
    serviceId: string;
    serviceName: string;
    price: number;
    currency: 'NGN' | 'USD';
    status: 'waiting' | 'sms_received' | 'expired';
    smsCode?: string;
    smsMessage?: string;
    expiresAt: number; // timestamp ms
    createdAt: number; // timestamp ms
}

export interface WalletTransaction {
    id: string;
    type: 'deposit' | 'purchase' | 'refund' | 'cancellation';
    amount: number;
    currency: 'NGN' | 'USD';
    description: string;
    status: 'completed' | 'pending' | 'failed';
    date: string;
}

export interface Order {
    id: string;
    number: string;
    countryName: string;
    countryFlag: string;
    serviceName: string;
    price: number;
    currency: 'NGN' | 'USD';
    status: 'completed' | 'cancelled' | 'active';
    date: string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    read: boolean;
    date: string;
}

export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    currency: 'NGN' | 'USD';
}

interface MockStoreContextType {
    user: UserProfile;
    walletNgn: number;
    walletUsd: number;
    activeNumbers: ActiveNumber[];
    transactions: WalletTransaction[];
    orders: Order[];
    notifications: Notification[];
    updateProfile: (profile: Partial<UserProfile>) => void;
    buyNumber: (countryCode: string, serviceId: string) => Promise<ActiveNumber>;
    cancelNumber: (id: string) => void;
    fundWallet: (amount: number, currency: 'NGN' | 'USD', bankName?: string) => Promise<void>;
    markNotificationRead: (id: string) => void;
    markAllNotificationsRead: () => void;
    clearStore: () => void;
}

const MockStoreContext = React.createContext<MockStoreContextType | undefined>(undefined);

export const useMockStore = () => {
    const context = React.useContext(MockStoreContext);
    if (!context) {
        throw new Error('useMockStore must be used within a MockStoreProvider');
    }
    return context;
};

export const MockStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = React.useState<UserProfile>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('cipher-user');
            if (saved) return JSON.parse(saved);
        }
        return {
            name: 'Clifford',
            email: 'clifford@example.com',
            phone: '+234 812 345 6789',
            currency: 'NGN'
        };
    });

    const [balanceNgn, setBalanceNgn] = React.useState<number>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('cipher-balance-ngn');
            if (saved) return Number(saved);
        }
        return 128450;
    });

    const walletNgn = balanceNgn;
    const walletUsd = balanceNgn / 1500;

    const [activeNumbers, setActiveNumbers] = React.useState<ActiveNumber[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('cipher-active-numbers');
            if (saved) return JSON.parse(saved);
        }
        return [];
    });

    const [transactions, setTransactions] = React.useState<WalletTransaction[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('cipher-transactions');
            if (saved) return JSON.parse(saved);
        }
        return [
            {
                id: 'TXN-902482',
                type: 'deposit',
                amount: 50000,
                currency: 'NGN',
                description: 'Wallet Funding via Manual Transfer',
                status: 'completed',
                date: new Date(Date.now() - 3600000 * 24).toISOString()
            },
            {
                id: 'TXN-829104',
                type: 'purchase',
                amount: 1500,
                currency: 'NGN',
                description: 'WhatsApp Number Purchase (+1 202 555 0192)',
                status: 'completed',
                date: new Date(Date.now() - 3600000 * 20).toISOString()
            }
        ];
    });

    const [orders, setOrders] = React.useState<Order[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('cipher-orders');
            if (saved) return JSON.parse(saved);
        }
        return [
            {
                id: 'ORD-109482',
                number: '+1 (202) 555-0192',
                countryName: 'United States',
                countryFlag: '🇺🇸',
                serviceName: 'WhatsApp',
                price: 1500,
                currency: 'NGN',
                status: 'completed',
                date: new Date(Date.now() - 3600000 * 20).toISOString()
            }
        ];
    });

    const [notifications, setNotifications] = React.useState<Notification[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('cipher-notifications');
            if (saved) return JSON.parse(saved);
        }
        return [
            {
                id: 'NOT-1',
                title: 'Welcome to Cipher!',
                message: 'Explore our global digital number marketplace and connect with top social networks.',
                read: false,
                date: new Date(Date.now() - 3600000 * 25).toISOString()
            },
            {
                id: 'NOT-2',
                title: 'Wallet Funded Successfully',
                message: 'Your wallet has been credited with NGN 50,000.',
                read: true,
                date: new Date(Date.now() - 3600000 * 24).toISOString()
            }
        ];
    });

    // Save states to localStorage whenever they change
    React.useEffect(() => {
        localStorage.setItem('cipher-user', JSON.stringify(user));
    }, [user]);

    React.useEffect(() => {
        localStorage.setItem('cipher-balance-ngn', balanceNgn.toString());
    }, [balanceNgn]);

    React.useEffect(() => {
        localStorage.setItem('cipher-active-numbers', JSON.stringify(activeNumbers));
    }, [activeNumbers]);

    React.useEffect(() => {
        localStorage.setItem('cipher-transactions', JSON.stringify(transactions));
    }, [transactions]);

    React.useEffect(() => {
        localStorage.setItem('cipher-orders', JSON.stringify(orders));
    }, [orders]);

    React.useEffect(() => {
        localStorage.setItem('cipher-notifications', JSON.stringify(notifications));
    }, [notifications]);

    // Active numbers expiry scheduler loop
    React.useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            let changed = false;
            
            const updated = activeNumbers.map((num) => {
                if (num.status === 'waiting' && now >= num.expiresAt) {
                    changed = true;
                    // Trigger refund for expired numbers if no SMS arrived (standard Cipher behavior)
                    const refundAmountNgn = num.currency === 'NGN' ? num.price : num.price * 1500;
                    setBalanceNgn((prev) => prev + refundAmountNgn);
                    
                    // Log transaction refund
                    const refundTxn: WalletTransaction = {
                        id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
                        type: 'refund',
                        amount: num.price,
                        currency: num.currency,
                        description: `Refund for Expired Number (${num.number})`,
                        status: 'completed',
                        date: new Date().toISOString()
                    };
                    setTransactions((prev) => [refundTxn, ...prev]);

                    // Add Notification
                    const refundNotif: Notification = {
                        id: `NOT-${Math.random()}`,
                        title: 'Number Expired - Refunded',
                        message: `No SMS was received for ${num.number}. The amount of ${num.currency === 'NGN' ? '₦' : '$'}${num.price.toLocaleString()} was refunded to your wallet.`,
                        read: false,
                        date: new Date().toISOString()
                    };
                    setNotifications((prev) => [refundNotif, ...prev]);

                    return { ...num, status: 'expired' } as ActiveNumber;
                }
                return num;
            });

            if (changed) {
                // Filter out expired numbers from the ACTIVE panel display, or let them remain as history.
                // We'll keep them in activeNumbers list but flag them as expired.
                setActiveNumbers(updated);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [activeNumbers]);

    // Background timer to simulate SMS arrival
    React.useEffect(() => {
        const waitingNumbers = activeNumbers.filter(n => n.status === 'waiting');
        if (waitingNumbers.length === 0) return;

        const timers = waitingNumbers.map((num) => {
            // Determine time remaining. If it was just bought, schedule SMS in 12 seconds.
            const elapsed = Date.now() - num.createdAt;
            const delay = Math.max(0, 12000 - elapsed); // 12 seconds wait

            return setTimeout(() => {
                // Generate validation SMS code
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                const msg = `[Cipher] Your ${num.serviceName} verification code is: ${code}. Valid for 5 minutes.`;

                // Update active numbers list
                setActiveNumbers((prev) =>
                    prev.map((n) =>
                        n.id === num.id
                            ? { ...n, status: 'sms_received', smsCode: code, smsMessage: msg }
                            : n
                    )
                );

                // Update orders status to completed
                setOrders((prev) =>
                    prev.map((o) =>
                        o.number === num.number ? { ...o, status: 'completed' } : o
                    )
                );

                // Add in-app Notification
                const newNotification: Notification = {
                    id: `NOT-${Math.random()}`,
                    title: `Verification SMS Received`,
                    message: `Verification code for ${num.serviceName} number ${num.number} is: ${code}`,
                    read: false,
                    date: new Date().toISOString()
                };
                setNotifications((prev) => [newNotification, ...prev]);
            }, delay);
        });

        return () => {
            timers.forEach(t => clearTimeout(t));
        };
    }, [activeNumbers]);

    const updateProfile = (profile: Partial<UserProfile>) => {
        setUser((prev) => ({ ...prev, ...profile }));
    };

    const buyNumber = async (countryCode: string, serviceId: string): Promise<ActiveNumber> => {
        const country = COUNTRIES.find((c) => c.code === countryCode);
        const service = VERIFICATION_SERVICES.find((s) => s.id === serviceId);

        if (!country || !service) {
            throw new Error('Invalid country or service selected.');
        }

        const priceNgn = service.priceNgn;
        const price = user.currency === 'NGN' ? service.priceNgn : service.priceUsd;

        if (balanceNgn < priceNgn) {
            throw new Error(`Insufficient funds in wallet. Price is ${user.currency === 'NGN' ? '₦' : '$'}${price}.`);
        }

        // Deduct balance
        setBalanceNgn((prev) => prev - priceNgn);

        // Generate dynamic number
        const randomMid = Math.floor(100 + Math.random() * 900);
        const randomEnd = Math.floor(1000 + Math.random() * 9000);
        const formatNumber = `${country.dialCode} (${randomMid}) 555-${randomEnd}`;

        const activeId = `NUM-${Math.floor(100000 + Math.random() * 900000)}`;
        const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

        const newNumber: ActiveNumber = {
            id: activeId,
            number: formatNumber,
            countryCode: country.code,
            countryName: country.name,
            countryFlag: country.flag,
            serviceId: service.id,
            serviceName: service.name,
            price,
            currency: user.currency,
            status: 'waiting',
            expiresAt: Date.now() + 600000, // 10 minutes from now
            createdAt: Date.now()
        };

        const newTxn: WalletTransaction = {
            id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
            type: 'purchase',
            amount: price,
            currency: user.currency,
            description: `${service.name} Number Purchase (${formatNumber})`,
            status: 'completed',
            date: new Date().toISOString()
        };

        const newOrder: Order = {
            id: orderId,
            number: formatNumber,
            countryName: country.name,
            countryFlag: country.flag,
            serviceName: service.name,
            price,
            currency: user.currency,
            status: 'active',
            date: new Date().toISOString()
        };

        // Update states
        setActiveNumbers((prev) => [newNumber, ...prev]);
        setTransactions((prev) => [newTxn, ...prev]);
        setOrders((prev) => [newOrder, ...prev]);

        return newNumber;
    };

    const cancelNumber = (id: string) => {
        const target = activeNumbers.find((n) => n.id === id);
        if (!target) return;

        // Refund user only if it was waiting for SMS
        if (target.status === 'waiting') {
            const refundAmountNgn = target.currency === 'NGN' ? target.price : target.price * 1500;
            setBalanceNgn((prev) => prev + refundAmountNgn);

            // Transaction refund audit
            const cancelTxn: WalletTransaction = {
                id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
                type: 'cancellation',
                amount: target.price,
                currency: target.currency,
                description: `Cancellation Refund: ${target.serviceName} (${target.number})`,
                status: 'completed',
                date: new Date().toISOString()
            };

            setTransactions((prev) => [cancelTxn, ...prev]);

            // Set order status as cancelled
            setOrders((prev) =>
                prev.map((o) =>
                    o.number === target.number ? { ...o, status: 'cancelled' } : o
                )
            );

            // Add notification
            const newNotif: Notification = {
                id: `NOT-${Math.random()}`,
                title: 'Number Cancelled & Refunded',
                message: `You cancelled the number ${target.number}. ${target.currency === 'NGN' ? '₦' : '$'}${target.price.toLocaleString()} has been credited back to your wallet.`,
                read: false,
                date: new Date().toISOString()
            };
            setNotifications((prev) => [newNotif, ...prev]);
        }

        // Remove from active list
        setActiveNumbers((prev) => prev.filter((n) => n.id !== id));
    };

    const fundWallet = async (amount: number, currency: 'NGN' | 'USD', bankName?: string): Promise<void> => {
        const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
        
        // Add pending transaction
        const pendingTxn: WalletTransaction = {
            id: txnId,
            type: 'deposit',
            amount,
            currency,
            description: `Wallet Funding via Bank Transfer (${bankName || 'Unknown Bank'})`,
            status: 'pending',
            date: new Date().toISOString()
        };

        setTransactions((prev) => [pendingTxn, ...prev]);

        // Simulating manual review approval after 4 seconds
        setTimeout(() => {
            // Update transaction to completed
            setTransactions((prev) =>
                prev.map((t) => (t.id === txnId ? { ...t, status: 'completed' } : t))
            );

            // Credit balance
            const depositAmountNgn = currency === 'NGN' ? amount : amount * 1500;
            setBalanceNgn((prev) => prev + depositAmountNgn);

            // Create notification
            const completeNotif: Notification = {
                id: `NOT-${Math.random()}`,
                title: 'Wallet Credit Completed',
                message: `Your manual funding of ${currency === 'NGN' ? '₦' : '$'}${amount.toLocaleString()} has been verified and credited.`,
                read: false,
                date: new Date().toISOString()
            };
            setNotifications((prev) => [completeNotif, ...prev]);
        }, 4000);
    };

    const markNotificationRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllNotificationsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const clearStore = () => {
        localStorage.removeItem('cipher-user');
        localStorage.removeItem('cipher-balance-ngn');
        localStorage.removeItem('cipher-active-numbers');
        localStorage.removeItem('cipher-transactions');
        localStorage.removeItem('cipher-orders');
        localStorage.removeItem('cipher-notifications');
        
        // Reset defaults
        setUser({
            name: 'Clifford',
            email: 'clifford@example.com',
            phone: '+234 812 345 6789',
            currency: 'NGN'
        });
        setBalanceNgn(128450);
        setActiveNumbers([]);
        setTransactions([
            {
                id: 'TXN-902482',
                type: 'deposit',
                amount: 50000,
                currency: 'NGN',
                description: 'Wallet Funding via Manual Transfer',
                status: 'completed',
                date: new Date(Date.now() - 3600000 * 24).toISOString()
            }
        ]);
        setOrders([]);
        setNotifications([
            {
                id: 'NOT-1',
                title: 'Welcome to Cipher!',
                message: 'Explore our global digital number marketplace and connect with top social networks.',
                read: false,
                date: new Date(Date.now()).toISOString()
            }
        ]);
    };

    return (
        <MockStoreContext.Provider
            value={{
                user,
                walletNgn,
                walletUsd,
                activeNumbers,
                transactions,
                orders,
                notifications,
                updateProfile,
                buyNumber,
                cancelNumber,
                fundWallet,
                markNotificationRead,
                markAllNotificationsRead,
                clearStore
            }}
        >
            {children}
        </MockStoreContext.Provider>
    );
};
