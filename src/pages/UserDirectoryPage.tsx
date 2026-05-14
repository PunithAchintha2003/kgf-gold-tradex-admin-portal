import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  CardContent,
  Typography,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  InputAdornment,
  Tooltip,
  Avatar,
} from '@mui/material';
import { Edit, Delete, Search, Refresh, PersonAdd, MoreVert } from '@mui/icons-material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import { adminService, User } from '../services/adminService';
import { GlassCard, GlassInput, GlassModal, GlassTable, GlassButton } from '../components/Glass';
import { UserEditDialog } from '../components/UserEditDialog';
import { CreateUserDialog } from '../components/CreateUserDialog';

export type UserDirectoryMode = 'all' | 'merchants';

export interface UserDirectoryPageProps {
  mode: UserDirectoryMode;
}

export const UserDirectoryPage: React.FC<UserDirectoryPageProps> = ({ mode }) => {
  const isMerchants = mode === 'merchants';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getAllUsers(
        page + 1,
        rowsPerPage,
        search,
        isMerchants ? 'MERCHANT' : undefined
      );
      const normalizedUsers = data.users.map((user: User & { _id?: string }) => ({
        ...user,
        id: user.id || user._id || user.email,
      }));
      setUsers(normalizedUsers);
      setTotal(data.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, isMerchants]);

  useEffect(() => {
    setPage(0);
  }, [mode]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(0);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    const userId = selectedUser.id || (selectedUser as User & { _id?: string })._id;
    if (!userId) {
      setError('User ID is missing. Cannot delete user.');
      setDeleteDialogOpen(false);
      return;
    }
    try {
      await adminService.deleteUser(userId);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      setError('');
      void fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to delete user');
      setDeleteDialogOpen(false);
    }
  };

  const handleEditSave = async (updatedUser: User) => {
    if (!selectedUser) return;
    const userId = selectedUser.id || (selectedUser as User & { _id?: string })._id;
    if (!userId) {
      setError('User ID is missing. Cannot update user.');
      return;
    }
    try {
      await adminService.updateUser(userId, updatedUser);
      setEditDialogOpen(false);
      setSelectedUser(null);
      setError('');
      void fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update user');
    }
  };

  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';

  const title = isMerchants ? 'Merchants' : 'User management';
  const subtitle = isMerchants
    ? 'Manage all merchant accounts in the system.'
    : 'Manage all registered users in the system';
  const searchPlaceholder = isMerchants ? 'Search merchants…' : 'Search users…';
  const addLabel = isMerchants ? 'Add merchant' : 'Add user';
  const emptyMessage = isMerchants ? 'No merchants found' : 'No users found';
  const deleteDialogTitle = isMerchants ? 'Delete merchant' : 'Delete user';

  return (
    <Box>
      <GlassCard variant="subtle" glassHover={false} sx={{ mb: 3, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 0.5,
                background: isDark
                  ? 'linear-gradient(135deg, #F5D300 0%, #FFE55C 100%)'
                  : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? '#cccccc' : '#666' }}>
              {subtitle}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <GlassInput
              size="small"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: isDark ? '#F5D300' : '#E6C200' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Refresh data">
              <IconButton
                onClick={() => void fetchUsers()}
                sx={{
                  background: isDark ? 'rgba(245, 211, 0, 0.1)' : 'rgba(230, 194, 0, 0.1)',
                  '&:hover': {
                    background: isDark ? 'rgba(245, 211, 0, 0.2)' : 'rgba(230, 194, 0, 0.2)',
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            <GlassButton
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #F5D300 0%, #B8A000 100%)'
                  : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
                color: isDark ? '#000' : '#FFF',
                textTransform: 'none',
              }}
            >
              {addLabel}
            </GlassButton>
          </Box>
        </Box>
      </GlassCard>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      <GlassCard variant="elevated" glassHover={false}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress size={60} sx={{ color: isDark ? '#F5D300' : '#E6C200' }} />
            </Box>
          ) : (
            <>
              <GlassTable glassVariant="subtle">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Seller</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Joined</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography sx={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
                          {emptyMessage}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow
                        key={user.id || `user-${user.email}`}
                        sx={{
                          '&:hover': {
                            background: isDark ? 'rgba(245, 211, 0, 0.05)' : 'rgba(230, 194, 0, 0.05)',
                          },
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                background: isDark
                                  ? 'linear-gradient(135deg, #F5D300 0%, #B8A000 100%)'
                                  : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                              }}
                            >
                              {user.name?.[0] || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {user.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: isDark ? '#cccccc' : '#666', fontSize: '0.75rem' }}
                              >
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.phone}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              ...(user.role === 'SUPER_ADMIN'
                                ? {
                                    background: isDark
                                      ? 'linear-gradient(135deg, rgba(245, 211, 0, 0.2) 0%, rgba(245, 211, 0, 0.15) 100%)'
                                      : 'linear-gradient(135deg, rgba(230, 194, 0, 0.15) 0%, rgba(230, 194, 0, 0.1) 100%)',
                                    color: isDark ? '#FFE55C' : '#E6C200',
                                    border: `1px solid ${
                                      isDark ? 'rgba(245, 211, 0, 0.3)' : 'rgba(230, 194, 0, 0.3)'
                                    }`,
                                  }
                                : user.role === 'MERCHANT'
                                  ? {
                                      background: isDark
                                        ? 'linear-gradient(135deg, rgba(38, 212, 180, 0.18) 0%, rgba(38, 212, 180, 0.12) 100%)'
                                        : 'linear-gradient(135deg, rgba(38, 212, 180, 0.14) 0%, rgba(38, 212, 180, 0.08) 100%)',
                                      color: isDark ? '#5eead4' : '#0f766e',
                                      border: `1px solid ${
                                        isDark ? 'rgba(45, 212, 191, 0.35)' : 'rgba(13, 148, 136, 0.28)'
                                      }`,
                                    }
                                  : {}),
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {user.role === 'MERCHANT' ? (
                            <Chip
                              label={user.merchantVerified ? 'Verified' : 'Pending'}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                ...(user.merchantVerified
                                  ? {
                                      background: isDark
                                        ? 'rgba(16, 185, 129, 0.18)'
                                        : 'rgba(16, 185, 129, 0.12)',
                                      color: isDark ? '#34d399' : '#059669',
                                      border: `1px solid ${
                                        isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)'
                                      }`,
                                    }
                                  : {
                                      background: isDark ? 'rgba(245, 158, 11, 0.16)' : 'rgba(245, 158, 11, 0.12)',
                                      color: isDark ? '#fbbf24' : '#b45309',
                                      border: `1px solid ${
                                        isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.25)'
                                      }`,
                                    }),
                              }}
                            />
                          ) : (
                            <Typography variant="caption" sx={{ color: isDark ? '#6b7280' : '#9ca3af' }}>
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              ...(user.isActive
                                ? {
                                    background: isDark
                                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)'
                                      : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                                    color: isDark ? '#10b981' : '#059669',
                                    border: `1px solid ${
                                      isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)'
                                    }`,
                                  }
                                : {
                                    background: isDark
                                      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.15) 100%)'
                                      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
                                    color: isDark ? '#f87171' : '#dc2626',
                                    border: `1px solid ${
                                      isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)'
                                    }`,
                                  }),
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit user">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(user)}
                              sx={{
                                color: isDark ? '#F5D300' : '#E6C200',
                                '&:hover': {
                                  background: isDark ? 'rgba(245, 211, 0, 0.1)' : 'rgba(230, 194, 0, 0.1)',
                                },
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete user">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(user)}
                              sx={{ color: '#ef4444', '&:hover': { background: 'rgba(239, 68, 68, 0.1)' } }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More options">
                            <IconButton size="small">
                              <MoreVert fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </GlassTable>
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                sx={{
                  borderTop: isDark ? '1px solid rgba(245, 211, 0, 0.1)' : '1px solid rgba(230, 194, 0, 0.1)',
                  px: 2,
                }}
              />
            </>
          )}
        </CardContent>
      </GlassCard>

      <UserEditDialog
        open={editDialogOpen}
        user={selectedUser}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleEditSave}
      />

      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          setError('');
          void fetchUsers();
        }}
        forcedRole={isMerchants ? 'MERCHANT' : undefined}
      />

      <GlassModal open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            borderBottom: isDark ? '1px solid rgba(245, 211, 0, 0.1)' : '1px solid rgba(230, 194, 0, 0.1)',
          }}
        >
          {deleteDialogTitle}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography>
            Are you sure you want to delete {isMerchants ? 'merchant' : 'user'} &quot;{selectedUser?.name}&quot;? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleDeleteConfirm()}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#FFF',
              '&:hover': {
                background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </GlassModal>
    </Box>
  );
};
