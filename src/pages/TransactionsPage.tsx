import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress, Alert } from '@mui/material';
import { spotTradeAdminService, SpotTrade, WalletTransaction } from '../services/spotTradeAdminService';

const TransactionsPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [spotTrades, setSpotTrades] = useState<SpotTrade[]>([]);

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
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>Transactions</Typography>
      <Card>
        <CardContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Deposits / Withdrawals" />
            <Tab label="Gold Buy / Sell" />
          </Tabs>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : tab === 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell><TableCell>User</TableCell><TableCell>Type</TableCell><TableCell>Amount</TableCell><TableCell>Status</TableCell><TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {walletTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.id}</TableCell>
                    <TableCell>{tx.user_id}</TableCell>
                    <TableCell><Chip size="small" label={tx.transaction_type} /></TableCell>
                    <TableCell>LKR {Math.round(tx.amount).toLocaleString('en-LK')}</TableCell>
                    <TableCell><Chip size="small" label={tx.status} color={tx.status === 'PENDING' ? 'warning' : tx.status === 'REJECTED' || tx.status === 'FAILED' ? 'error' : 'success'} /></TableCell>
                    <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell><TableCell>User</TableCell><TableCell>Type</TableCell><TableCell>Quantity (pawn)</TableCell><TableCell>Price</TableCell><TableCell>Total</TableCell><TableCell>Fee</TableCell><TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {spotTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell>{trade.id}</TableCell>
                    <TableCell>{trade.user_id}</TableCell>
                    <TableCell><Chip size="small" label={trade.order_type} color={trade.order_type === 'BUY' ? 'success' : 'error'} /></TableCell>
                    <TableCell>{trade.quantity.toFixed(4)}</TableCell>
                    <TableCell>LKR {Math.round(trade.price).toLocaleString('en-LK')}</TableCell>
                    <TableCell>LKR {Math.round(trade.total_value).toLocaleString('en-LK')}</TableCell>
                    <TableCell>LKR {Math.round(trade.fee || 0).toLocaleString('en-LK')}</TableCell>
                    <TableCell>{new Date(trade.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionsPage;
