import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Table, TableHead, TableBody, TableRow, TableCell, Chip, Button, CircularProgress, Alert, Stack } from '@mui/material';
import { spotTradeAdminService, WalletTransaction } from '../services/spotTradeAdminService';

const WithdrawalsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<WalletTransaction[]>([]);

  const fetchPending = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await spotTradeAdminService.getWalletTransactions(200, 0, 'PENDING', 'WITHDRAWAL');
      setItems(res.transactions);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to load pending withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id: number, approve: boolean) => {
    try {
      await spotTradeAdminService.decideWithdrawal(id, approve);
      await fetchPending();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to process request');
    }
  };

  useEffect(() => {
    void fetchPending();
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>Withdrawal Approvals</Typography>
      <Card>
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell><TableCell>User</TableCell><TableCell>Amount</TableCell><TableCell>Fee</TableCell><TableCell>Total Deducted</TableCell><TableCell>Bank</TableCell><TableCell>Account No</TableCell><TableCell>Account Name</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.id}</TableCell>
                    <TableCell>{tx.user_id}</TableCell>
                    <TableCell>LKR {Math.round(tx.amount).toLocaleString('en-LK')}</TableCell>
                    <TableCell>LKR {Math.round(tx.fee || 0).toLocaleString('en-LK')}</TableCell>
                    <TableCell>LKR {Math.round(tx.amount + (tx.fee || 0)).toLocaleString('en-LK')}</TableCell>
                    <TableCell>{tx.bank_name}</TableCell>
                    <TableCell>{tx.bank_account_number}</TableCell>
                    <TableCell>{tx.bank_account_name}</TableCell>
                    <TableCell><Chip size="small" label={tx.status} color="warning" /></TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="contained" color="success" onClick={() => handleDecision(tx.id, true)}>Approve</Button>
                        <Button size="small" variant="contained" color="error" onClick={() => handleDecision(tx.id, false)}>Reject</Button>
                      </Stack>
                    </TableCell>
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

export default WithdrawalsPage;
