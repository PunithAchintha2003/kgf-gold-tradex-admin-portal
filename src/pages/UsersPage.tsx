import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  CardContent,
  Typography,
  Table,
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
  MenuItem,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Edit,
  Delete,
  Search,
  Refresh,
  PersonAdd,
  MoreVert,
} from '@mui/icons-material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import { adminService, User } from '../services/adminService';
import { GlassCard, GlassInput, GlassModal, GlassTable, GlassButton } from '../components/Glass';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getAllUsers(page + 1, rowsPerPage, search);
      // Normalize user data to ensure id field exists (handle _id from MongoDB)
      const normalizedUsers = data.users.map((user: User & { _id?: string }) => ({
        ...user,
        id: user.id || user._id || user.email, // Fallback to email if no id
      }));
      setUsers(normalizedUsers);
      setTotal(data.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search and reset to page 0
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
      fetchUsers();
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
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update user');
    }
  };

  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  
  return (
    <Box>
      {/* Header Section */}
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
                WebkitBackdropFilter: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              User Management
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? '#cccccc' : '#666' }}>
              Manage all registered users in the system
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <GlassInput
              size="small"
              placeholder="Search users..."
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
                onClick={fetchUsers}
                sx={{
                  background: isDark
                    ? 'rgba(245, 211, 0, 0.1)'
                    : 'rgba(230, 194, 0, 0.1)',
                  '&:hover': {
                    background: isDark
                      ? 'rgba(245, 211, 0, 0.2)'
                      : 'rgba(230, 194, 0, 0.2)',
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
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #F5D300 0%, #B8A000 100%)'
                  : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
                color: isDark ? '#000' : '#FFF',
              }}
            >
              Add User
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
              <CircularProgress
                size={60}
                sx={{
                  color: isDark ? '#F5D300' : '#E6C200',
                }}
              />
            </Box>
          ) : (
            <>
              <GlassTable variant="subtle">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      User
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Contact
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Role
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Joined
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography
                          sx={{
                            color: isDark ? '#9ca3af' : '#6b7280',
                            fontSize: '0.875rem',
                          }}
                        >
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow
                        key={user.id || `user-${user.email}`}
                        sx={{
                          '&:hover': {
                            background: isDark
                              ? 'rgba(245, 211, 0, 0.05)'
                              : 'rgba(230, 194, 0, 0.05)',
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
                                sx={{
                                  color: isDark ? '#cccccc' : '#666',
                                  fontSize: '0.75rem',
                                }}
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
                                : {}),
                            }}
                          />
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
                                  background: isDark
                                    ? 'rgba(245, 211, 0, 0.1)'
                                    : 'rgba(230, 194, 0, 0.1)',
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
                              sx={{
                                color: '#ef4444',
                                '&:hover': {
                                  background: 'rgba(239, 68, 68, 0.1)',
                                },
                              }}
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
                  borderTop: isDark
                    ? '1px solid rgba(245, 211, 0, 0.1)'
                    : '1px solid rgba(230, 194, 0, 0.1)',
                  px: 2,
                }}
              />
            </>
          )}
        </CardContent>
      </GlassCard>

      {/* Edit Dialog */}
      <EditUserDialog
        open={editDialogOpen}
        user={selectedUser}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleEditSave}
      />

      {/* Delete Dialog */}
      <GlassModal
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            borderBottom: isDark
              ? '1px solid rgba(245, 211, 0, 0.1)'
              : '1px solid rgba(230, 194, 0, 0.1)',
          }}
        >
          Delete User
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography>
            Are you sure you want to delete user "{selectedUser?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: isDark ? '#9ca3af' : '#6b7280',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
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

interface EditUserDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ open, user, onClose, onSave }) => {
  const [role, setRole] = useState<'SUPER_ADMIN' | 'USER'>('USER');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setIsActive(user.isActive);
      setError('');
    } else {
      setRole('USER');
      setIsActive(true);
      setError('');
    }
  }, [user]);

  const handleSave = () => {
    if (!user) return;
    setError('');
    onSave({
      ...user,
      role,
      isActive,
    });
  };

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          borderBottom: isDark
            ? '1px solid rgba(245, 211, 0, 0.1)'
            : '1px solid rgba(230, 194, 0, 0.1)',
        }}
      >
        Edit User
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              mt: 2,
              borderRadius: '10px',
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <GlassInput
            fullWidth
            label="Name"
            value={user?.name || ''}
            disabled
            helperText="Cannot be changed by super admin"
          />
          <GlassInput
            fullWidth
            label="Email"
            value={user?.email || ''}
            disabled
            helperText="Cannot be changed by super admin"
          />
          <GlassInput
            fullWidth
            label="Phone"
            value={user?.phone || ''}
            disabled
            helperText="Cannot be changed by super admin"
          />
          <GlassInput
            fullWidth
            label="Address"
            value={user?.address || ''}
            multiline
            rows={3}
            disabled
            helperText="Cannot be changed by super admin"
          />
          <GlassInput
            fullWidth
            select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'SUPER_ADMIN' | 'USER')}
          >
            <MenuItem value="USER">USER</MenuItem>
            <MenuItem value="SUPER_ADMIN">SUPER_ADMIN</MenuItem>
          </GlassInput>
          <Box>
            <Typography
              variant="body2"
              gutterBottom
              sx={{
                color: isDark ? '#9ca3af' : '#6b7280',
                mb: 1.5,
              }}
            >
              Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <GlassButton
                variant={isActive ? 'contained' : 'outlined'}
                onClick={() => setIsActive(true)}
                sx={{
                  flex: 1,
                  ...(isActive
                    ? {
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#FFF',
                      }
                    : {
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        color: '#10b981',
                      }),
                }}
              >
                Active
              </GlassButton>
              <GlassButton
                variant={!isActive ? 'contained' : 'outlined'}
                onClick={() => setIsActive(false)}
                sx={{
                  flex: 1,
                  ...(!isActive
                    ? {
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: '#FFF',
                      }
                    : {
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                      }),
                }}
              >
                Inactive
              </GlassButton>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={onClose}
          sx={{
            color: isDark ? '#9ca3af' : '#6b7280',
          }}
        >
          Cancel
        </Button>
        <GlassButton
          onClick={handleSave}
          variant="contained"
          sx={{
            background: isDark
              ? 'linear-gradient(135deg, #F5D300 0%, #B8A000 100%)'
              : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
            color: isDark ? '#000' : '#FFF',
          }}
        >
          Save Changes
        </GlassButton>
      </DialogActions>
    </GlassModal>
  );
};

export default UsersPage;

