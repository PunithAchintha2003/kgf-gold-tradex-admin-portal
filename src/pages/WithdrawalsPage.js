import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Table, TableHead, TableBody, TableRow, TableCell, Chip, Button, CircularProgress, Alert, Stack } from '@mui/material';
import { spotTradeAdminService } from '../services/spotTradeAdminService';
const WithdrawalsPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);
    const fetchPending = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await spotTradeAdminService.getWalletTransactions(200, 0, 'PENDING', 'WITHDRAWAL');
            setItems(res.transactions);
        }
        catch (e) {
            setError(e?.response?.data?.detail || 'Failed to load pending withdrawals');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDecision = async (id, approve) => {
        try {
            await spotTradeAdminService.decideWithdrawal(id, approve);
            await fetchPending();
        }
        catch (e) {
            setError(e?.response?.data?.detail || 'Failed to process request');
        }
    };
    useEffect(() => {
        void fetchPending();
    }, []);
    return (_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", sx: { mb: 3, fontWeight: 600 }, children: "Withdrawal Approvals" }), _jsx(Card, { children: _jsxs(CardContent, { children: [error && _jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), loading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', p: 4 }, children: _jsx(CircularProgress, {}) })) : (_jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "ID" }), _jsx(TableCell, { children: "User" }), _jsx(TableCell, { children: "Amount" }), _jsx(TableCell, { children: "Fee" }), _jsx(TableCell, { children: "Total Deducted" }), _jsx(TableCell, { children: "Bank" }), _jsx(TableCell, { children: "Account No" }), _jsx(TableCell, { children: "Account Name" }), _jsx(TableCell, { children: "Status" }), _jsx(TableCell, { children: "Actions" })] }) }), _jsx(TableBody, { children: items.map((tx) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: tx.id }), _jsx(TableCell, { children: tx.user_id }), _jsxs(TableCell, { children: ["LKR ", Math.round(tx.amount).toLocaleString('en-LK')] }), _jsxs(TableCell, { children: ["LKR ", Math.round(tx.fee || 0).toLocaleString('en-LK')] }), _jsxs(TableCell, { children: ["LKR ", Math.round(tx.amount + (tx.fee || 0)).toLocaleString('en-LK')] }), _jsx(TableCell, { children: tx.bank_name }), _jsx(TableCell, { children: tx.bank_account_number }), _jsx(TableCell, { children: tx.bank_account_name }), _jsx(TableCell, { children: _jsx(Chip, { size: "small", label: tx.status, color: "warning" }) }), _jsx(TableCell, { children: _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Button, { size: "small", variant: "contained", color: "success", onClick: () => handleDecision(tx.id, true), children: "Approve" }), _jsx(Button, { size: "small", variant: "contained", color: "error", onClick: () => handleDecision(tx.id, false), children: "Reject" })] }) })] }, tx.id))) })] }))] }) })] }));
};
export default WithdrawalsPage;
