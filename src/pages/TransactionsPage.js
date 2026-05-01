import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress, Alert } from '@mui/material';
import { spotTradeAdminService } from '../services/spotTradeAdminService';
const TransactionsPage = () => {
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [walletTransactions, setWalletTransactions] = useState([]);
    const [spotTrades, setSpotTrades] = useState([]);
    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [walletRes, tradeRes] = await Promise.all([
                spotTradeAdminService.getWalletTransactions(200, 0),
                spotTradeAdminService.getSpotTrades(200, 0),
            ]);
            setWalletTransactions(walletRes.transactions);
            setSpotTrades(tradeRes.trades);
        }
        catch (e) {
            setError(e?.response?.data?.detail || 'Failed to load transactions');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        void fetchData();
    }, []);
    return (_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", sx: { mb: 3, fontWeight: 600 }, children: "Transactions" }), _jsx(Card, { children: _jsxs(CardContent, { children: [_jsxs(Tabs, { value: tab, onChange: (_, v) => setTab(v), sx: { mb: 2 }, children: [_jsx(Tab, { label: "Deposits / Withdrawals" }), _jsx(Tab, { label: "Gold Buy / Sell" })] }), error && _jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), loading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', p: 4 }, children: _jsx(CircularProgress, {}) })) : tab === 0 ? (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "ID" }), _jsx(TableCell, { children: "User" }), _jsx(TableCell, { children: "Type" }), _jsx(TableCell, { children: "Amount" }), _jsx(TableCell, { children: "Status" }), _jsx(TableCell, { children: "Created" })] }) }), _jsx(TableBody, { children: walletTransactions.map((tx) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: tx.id }), _jsx(TableCell, { children: tx.user_id }), _jsx(TableCell, { children: _jsx(Chip, { size: "small", label: tx.transaction_type }) }), _jsxs(TableCell, { children: ["LKR ", Math.round(tx.amount).toLocaleString('en-LK')] }), _jsx(TableCell, { children: _jsx(Chip, { size: "small", label: tx.status, color: tx.status === 'PENDING' ? 'warning' : tx.status === 'REJECTED' || tx.status === 'FAILED' ? 'error' : 'success' }) }), _jsx(TableCell, { children: new Date(tx.created_at).toLocaleString() })] }, tx.id))) })] })) : (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "ID" }), _jsx(TableCell, { children: "User" }), _jsx(TableCell, { children: "Type" }), _jsx(TableCell, { children: "Quantity (pawn)" }), _jsx(TableCell, { children: "Price" }), _jsx(TableCell, { children: "Total" }), _jsx(TableCell, { children: "Created" })] }) }), _jsx(TableBody, { children: spotTrades.map((trade) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: trade.id }), _jsx(TableCell, { children: trade.user_id }), _jsx(TableCell, { children: _jsx(Chip, { size: "small", label: trade.order_type, color: trade.order_type === 'BUY' ? 'success' : 'error' }) }), _jsx(TableCell, { children: trade.quantity.toFixed(4) }), _jsxs(TableCell, { children: ["LKR ", Math.round(trade.price).toLocaleString('en-LK')] }), _jsxs(TableCell, { children: ["LKR ", Math.round(trade.total_value).toLocaleString('en-LK')] }), _jsx(TableCell, { children: new Date(trade.created_at).toLocaleString() })] }, trade.id))) })] }))] }) })] }));
};
export default TransactionsPage;
