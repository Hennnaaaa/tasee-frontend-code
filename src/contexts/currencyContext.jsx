'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Currency configuration
export const CURRENCIES = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧'
  },
  PKR: {
    code: 'PKR',
    symbol: '₨',
    name: 'Pakistani Rupee',
    flag: '🇵🇰'
  }
};

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState({
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    PKR: 278.50
  });

  // Load saved currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && CURRENCIES[savedCurrency]) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Save currency to localStorage when changed
  useEffect(() => {
    localStorage.setItem('selectedCurrency', selectedCurrency);
  }, [selectedCurrency]);

  // Function to convert price from USD to selected currency
  const convertPrice = (usdPrice) => {
    if (!usdPrice || isNaN(usdPrice)) return 0;
    return (parseFloat(usdPrice) * exchangeRates[selectedCurrency]).toFixed(2);
  };

  // Function to format price with currency symbol
  const formatPrice = (usdPrice) => {
    const convertedPrice = convertPrice(usdPrice);
    const currency = CURRENCIES[selectedCurrency];
    return `${currency.symbol}${convertedPrice}`;
  };

  // Function to update exchange rates (you can connect this to a real API)
  const updateExchangeRates = (rates) => {
    setExchangeRates(rates);
  };

  const value = {
    selectedCurrency,
    setSelectedCurrency,
    currencies: CURRENCIES,
    exchangeRates,
    convertPrice,
    formatPrice,
    updateExchangeRates,
    currentCurrency: CURRENCIES[selectedCurrency]
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};