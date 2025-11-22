
import React, { useState, useEffect, useMemo } from 'react';
import { LoanProduct, LoanApplication, LoanApplicationStatus, NotificationType } from '../types.ts';
import { getLoanProducts } from '../services/geminiService.ts';
import { SpinnerIcon, InfoIcon, CheckCircleIcon, CashIcon, XIcon, ChartBarIcon, ArrowRightIcon, PlusCircleIcon } from './Icons.tsx';

interface LoansProps {
    loanApplications: LoanApplication[];
    addLoanApplication: (application: Omit<LoanApplication, 'id' | 'status' | 'submittedDate'>) => void;
    addNotification: (type: NotificationType, title: string, message: string) => void;
}

const ApplicationDetailsModal: React.FC<{ application: LoanApplication; onClose: () => void }> = ({ application, onClose }) => {
    const statusStyles = {
        [LoanApplicationStatus.APPROVED]: 'bg-green-100 text-green-700 border-green-200',
        [LoanApplicationStatus.PENDING]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        [LoanApplicationStatus.REJECTED]: 'bg-red-100 text-red-700 border-red-200',
    };

    const isRejected = application.status === LoanApplicationStatus.REJECTED;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg m-4 animate-fade-in-up border border-white/10" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Application Details</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">ID: {application.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="p-5 bg-white dark:bg-slate-700/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Product</p>
                            <p className="font-bold text-slate-800 dark:text-white text-lg">{application.loanProduct.name}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Status</p>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusStyles[application.status]}`}>{application.status}</span>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Amount</p>
                            <p className="font-bold text-slate-800 dark:text-white font-mono text-lg">{application.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Term</p>
                            <p className="font-bold text-slate-800 dark:text-white">{application.term} months</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Date Submitted</p>
                            <p className="font-medium text-slate-700 dark:text-slate-300">{application.submittedDate.toLocaleDateString()}</p>
                        </div>
                         <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Interest Rate</p>
                            <p className="font-medium text-slate-700 dark:text-slate-300">{application.loanProduct.interestRate.min}% - {application.loanProduct.interestRate.max}% APR</p>
                        </div>
                    </div>
                    
                    {isRejected && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-800 dark:text-red-200 rounded-xl flex items-start space-x-3">
                            <InfoIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
                            <div>
                                <h4 className="font-bold text-sm">Decision Note</h4>
                                <p className="text-sm mt-1 opacity-90">Based on our preliminary review, this application did not meet our current lending criteria. Factors may include credit history or debt-to-income ratio. (Simulation)</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-right">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-md transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const LoanCalculator: React.FC<{ product: LoanProduct; onApply: (amount: number, term: number) => void; onBack: () => void }> = ({ product, onApply, onBack }) => {
    const [amount, setAmount] = useState(5000);
    const [term, setTerm] = useState(36);

    const monthlyPayment = useMemo(() => {
        const principal = amount;
        const rate = (product.interestRate.min + product.interestRate.max) / 2 / 100 / 12;
        const n = term;
        if (rate === 0) return principal / n;
        return (principal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
    }, [amount, term, product.interestRate]);

    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Configure Your Loan</h3>
                <button onClick={onBack} className="text-sm font-semibold text-primary hover:underline">Change Product</button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                    <div>
                        <label className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                            <span>Loan Amount</span>
                            <span className="font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                        </label>
                        <input 
                            type="range" 
                            min="1000" 
                            max="50000" 
                            step="500" 
                            value={amount} 
                            onChange={(e) => setAmount(Number(e.target.value))} 
                            className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary" 
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>$1,000</span>
                            <span>$50,000</span>
                        </div>
                    </div>
                    
                    <div>
                        <label className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                            <span>Loan Term</span>
                            <span className="font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{term} months</span>
                        </label>
                        <input 
                            type="range" 
                            min="12" 
                            max="60" 
                            step="12" 
                            value={term} 
                            onChange={(e) => setTerm(Number(e.target.value))} 
                            className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary" 
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>12 mo</span>
                            <span>60 mo</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center text-center">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Estimated Monthly Payment</p>
                    <p className="text-4xl font-bold text-slate-800 dark:text-white mb-2">{monthlyPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                        <p>Rate: ~{((product.interestRate.min + product.interestRate.max) / 2).toFixed(2)}% APR</p>
                        <p>Total Cost of Loan: {(monthlyPayment * term).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    </div>
                    <button onClick={() => onApply(amount, term)} className="w-full py-3 mt-6 text-white bg-primary hover:bg-primary-600 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                        Apply Now
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProductCard: React.FC<{ product: LoanProduct; onSelect: () => void }> = ({ product, onSelect }) => (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-white/5 p-6 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30">
        <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <CashIcon className="w-7 h-7" />
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full">
                As low as {product.interestRate.min}% APR
            </div>
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{product.name}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 flex-grow leading-relaxed">{product.description}</p>
        
        <div className="space-y-2 my-6 border-t border-slate-100 dark:border-slate-700 pt-4">
            {product.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{benefit}</p>
                </div>
            ))}
        </div>
        
        <button onClick={onSelect} className="w-full py-3 text-sm font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-xl transition-all flex items-center justify-center group-hover:shadow-md">
            Calculate & Apply <ArrowRightIcon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </button>
    </div>
);

const ApplicationRow: React.FC<{ application: LoanApplication; onViewDetails: () => void; }> = ({ application, onViewDetails }) => {
    const statusStyles = {
        [LoanApplicationStatus.APPROVED]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        [LoanApplicationStatus.PENDING]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        [LoanApplicationStatus.REJECTED]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
        <tr className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer" onClick={onViewDetails}>
            <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{application.submittedDate.toLocaleDateString()}</td>
            <td className="p-4 text-sm font-semibold text-slate-800 dark:text-white">{application.loanProduct.name}</td>
            <td className="p-4 text-sm font-mono text-slate-700 dark:text-slate-300">{application.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
            <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{application.term} mo</td>
            <td className="p-4">
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyles[application.status]}`}>
                    {application.status}
                </span>
            </td>
            <td className="p-4 text-right">
                <button className="text-slate-400 hover:text-primary transition-colors">
                    <ArrowRightIcon className="w-5 h-5" />
                </button>
            </td>
        </tr>
    );
};

export const Loans: React.FC<LoansProps> = ({ loanApplications, addLoanApplication, addNotification }) => {
    const [products, setProducts] = useState<LoanProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);
    const [viewingApplication, setViewingApplication] = useState<LoanApplication | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            const { products, isError } = await getLoanProducts();
            if (isError) {
                setIsError(true);
            } else {
                setProducts(products);
            }
            setIsLoading(false);
        };
        fetchProducts();
    }, []);

    const handleApply = (amount: number, term: number) => {
        if (selectedProduct) {
            addLoanApplication({ loanProduct: selectedProduct, amount, term });
            addNotification(
                NotificationType.LOAN,
                'Application Submitted',
                `Your application for a ${selectedProduct.name} has been submitted for review.`
            );
            setSelectedProduct(null);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center p-20"><SpinnerIcon className="w-10 h-10 text-primary animate-spin" /></div>;
    }
    
    return (
        <>
            {viewingApplication && <ApplicationDetailsModal application={viewingApplication} onClose={() => setViewingApplication(null)} />}
            
            <div className="space-y-10 max-w-6xl mx-auto">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Loans & Credit</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Explore flexible financing options designed to help you achieve your goals.</p>
                </div>

                {selectedProduct ? (
                    <LoanCalculator product={selectedProduct} onApply={handleApply} onBack={() => setSelectedProduct(null)} />
                ) : (
                    <div className="space-y-6">
                        {isError ? (
                            <div className="flex items-center space-x-3 text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                                <InfoIcon className="w-6 h-6" />
                                <p>Could not load loan products at this time. Please try again later.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} onSelect={() => setSelectedProduct(product)} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {loanApplications.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-white/10 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Application History</h3>
                            <div className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
                                {loanApplications.length} Applications
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Product</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Term</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                                    {loanApplications.map(app => (
                                        <ApplicationRow key={app.id} application={app} onViewDetails={() => setViewingApplication(app)} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
