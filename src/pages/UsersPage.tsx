import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import {
  Edit,
  Delete,
  Search,
  Refresh,
} from '@mui/icons-material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import { adminService, User } from '../services/adminService';

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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600,
            color: (theme) => theme.palette.mode === 'dark' ? '#FFFFFF' : '#111827', // Match price predictor exact
          }}
        >
          User Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <IconButton onClick={fetchUsers}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            backgroundColor: (theme) => theme.palette.mode === 'dark' 
              ? 'rgba(239, 68, 68, 0.1)' 
              : 'rgba(239, 68, 68, 0.05)',
            border: (theme) => theme.palette.mode === 'dark' 
              ? '1px solid rgba(239, 68, 68, 0.3)' 
              : '1px solid rgba(239, 68, 68, 0.2)',
            color: (theme) => theme.palette.mode === 'dark' ? '#fca5a5' : '#ef4444',
          }} 
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      <Card
        sx={{
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1a1a1a' : '#f9fafb', // Match price predictor exact
          border: (theme) => theme.palette.mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid #e5e7eb', // Match price predictor exact
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 2px 8px rgba(0, 0, 0, 0.3)'
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600,
                          color: (theme) => theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280', // Match price predictor exact
                          backgroundColor: (theme) => theme.palette.mode === 'dark' 
                            ? 'rgba(26, 26, 26, 0.95)' 
                            : 'rgba(249, 250, 251, 0.95)', // Match price predictor exact
                          backdropFilter: 'blur(8px)', // Match price predictor exact
                          WebkitBackdropFilter: 'blur(8px)',
                          borderBottom: (theme) => theme.palette.mode === 'dark' 
                            ? '1px solid rgba(255, 255, 255, 0.1)' 
                            : '1px solid #e5e7eb', // Match price predictor exact
                        }}
                      >
                        Name
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600,
                          color: (theme) => theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280', // Match price predictor exact
                          backgroundColor: (theme) => theme.palette.mode === 'dark' 
                            ? 'rgba(26, 26, 26, 0.95)' 
                            : 'rgba(249, 250, 251, 0.95)', // Match price predictor exact
                          backdropFilter: 'blur(8px)', // Match price predictor exact
                          WebkitBackdropFilter: 'blur(8px)',
                          borderBottom: (theme) => theme.palette.mode === 'dark' 
                            ? '1px solid rgba(255, 255, 255, 0.1)' 
                            : '1px solid #e5e7eb', // Match price predictor exact
                        }}
                      >
                        Email
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600,
                          color: (theme) => theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280', // Match price predictor exact
                          backgroundColor: (theme) => theme.palette.mode === 'dark' 
                            ? 'rgba(26, 26, 26, 0.95)' 
                            : 'rgba(249, 250, 251, 0.95)', // Match price predictor exact
                          backdropFilter: 'blur(8px)', // Match price predictor exact
                          WebkitBackdropFilter: 'blur(8px)',
                          borderBottom: (theme) => theme.palette.mode === 'dark' 
                            ? '1px solid rgba(255, 255, 255, 0.1)' 
                            : '1px solid #e5e7eb', // Match price predictor exact
                        }}
                      >
                        Phone
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600,
                          color: (theme) => theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280', // Match price predictor exact
                          backgroundColor: (theme) => theme.palette.mode === 'dark' 
                            ? 'rgba(26, 26, 26, 0.95)' 
                            : 'rgba(249, 250, 251, 0.95)', // Match price predictor exact
                          backdropFilter: 'blur(8px)', // Match price predictor exact
                          WebkitBackdropFilter: 'blur(8px)',
                          borderBottom: (theme) => theme.palette.mode === 'dark' 
                            ? '1px solid rgba(255, 255, 255, 0.1)' 
                            : '1px solid #e5e7eb', // Match price predictor exact
                        }}
                      >
                        Role
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600,
                          color: (theme) => theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280', // Match price predictor exact
                          backgroundColor: (theme) => theme.palette.mode === 'dark' 
                            ? 'rgba(26, 26, 26, 0.95)' 
                            : 'rgba(249, 250, 251, 0.95)', // Match price predictor exact
                          backdropFilter: 'blur(8px)', // Match price predictor exact
                          WebkitBackdropFilter: 'blur(8px)',
                          borderBottom: (theme) => theme.palette.mode === 'dark' 
                            ? '1px solid rgba(255, 255, 255, 0.1)' 
                            : '1px solid #e5e7eb', // Match price predictor exact
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600,
                          color: (theme) => theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280', // Match price predictor exact
                          backgroundColor: (theme) => theme.palette.mode === 'dark' 
                            ? 'rgba(26, 26, 26, 0.95)' 
                            : 'rgba(249, 250, 251, 0.95)', // Match price predictor exact
                          backdropFilter: 'blur(8px)', // Match price predictor exact
                          WebkitBackdropFilter: 'blur(8px)',
                          borderBottom: (theme) => theme.palette.mode === 'dark' 
                            ? '1px solid rgba(255, 255, 255, 0.1)' 
                            : '1px solid #e5e7eb', // Match price predictor exact
                        }}
                      >
                        Created At
                      </TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ 
                          fontWeight: 600,
                          color: (theme) => theme.palette.mode === 'dark' ? '#d1d5db' : '#6b7280', // Match price predictor exact
                          backgroundColor: (theme) => theme.palette.mode === 'dark' 
                            ? 'rgba(26, 26, 26, 0.95)' 
                            : 'rgba(249, 250, 251, 0.95)', // Match price predictor exact
                          backdropFilter: 'blur(8px)', // Match price predictor exact
                          WebkitBackdropFilter: 'blur(8px)',
                          borderBottom: (theme) => theme.palette.mode === 'dark' 
                            ? '1px solid rgba(255, 255, 255, 0.1)' 
                            : '1px solid #e5e7eb', // Match price predictor exact
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow key="empty-state">
                        <TableCell colSpan={7} align="center">
                          <Typography 
                            sx={{ 
                              color: (theme) => theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280', // Match price predictor exact
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
                            '& .MuiTableCell-root': {
                              color: (theme) => theme.palette.mode === 'dark' ? '#FFFFFF' : '#111827', // Match price predictor exact
                            },
                          }}
                        >
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.role}
                              size="small"
                              color={user.role === 'SUPER_ADMIN' ? 'primary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              color={user.isActive ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(user)}
                              color="primary"
                              sx={{
                                color: (theme) => theme.palette.mode === 'dark' ? '#F5D300' : '#E6C200',
                                '&:hover': {
                                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                                    ? 'rgba(245, 211, 0, 0.1)' 
                                    : 'rgba(245, 211, 0, 0.05)',
                                },
                              }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(user)}
                              color="error"
                              sx={{
                                color: (theme) => theme.palette.mode === 'dark' ? '#fca5a5' : '#ef4444',
                                '&:hover': {
                                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                                    ? 'rgba(239, 68, 68, 0.1)' 
                                    : 'rgba(239, 68, 68, 0.05)',
                                },
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
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
              />
            </>
          )}
        </CardContent>
      </Card>

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
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#121212' : '#FFFFFF', // Match price predictor sidebar exact
            border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E0E0E0', // Match price predictor exact
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.5)'
              : '0 8px 32px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DialogTitle
          sx={{
            color: (theme) => theme.palette.mode === 'dark' ? '#FFFFFF' : '#111827', // Match price predictor exact
            borderBottom: (theme) => theme.palette.mode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid #E0E0E0',
          }}
        >
          Delete User
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              color: (theme) => theme.palette.mode === 'dark' ? '#FFFFFF' : '#111827', // Match price predictor exact
            }}
          >
            Are you sure you want to delete user "{selectedUser?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: (theme) => theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280', // Match price predictor exact
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained"
            sx={{
              backgroundColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(239, 68, 68, 0.1)' 
                : 'rgba(239, 68, 68, 0.05)',
              border: (theme) => theme.palette.mode === 'dark' 
                ? '1px solid rgba(239, 68, 68, 0.3)' 
                : '1px solid rgba(239, 68, 68, 0.2)',
              color: (theme) => theme.palette.mode === 'dark' ? '#fca5a5' : '#ef4444',
              '&:hover': {
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(239, 68, 68, 0.2)' 
                  : 'rgba(239, 68, 68, 0.1)',
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
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
    
    // Super admins can only change role and isActive
    // No validation needed for name, phone, address as they won't be changed
    setError('');
    onSave({
      ...user,
      // Only send role and isActive - don't send name, phone, address, or email
      role,
      isActive,
    });
  };

  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: isDark ? '#121212' : '#FFFFFF', // Match price predictor sidebar exact
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E0E0E0', // Match price predictor exact
          boxShadow: isDark
            ? '0 8px 32px rgba(0, 0, 0, 0.5)'
            : '0 8px 32px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <DialogTitle
        sx={{
          color: isDark ? '#FFFFFF' : '#111827', // Match price predictor exact
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E0E0E0',
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
              backgroundColor: isDark 
                ? 'rgba(239, 68, 68, 0.1)' 
                : 'rgba(239, 68, 68, 0.05)',
              border: isDark 
                ? '1px solid rgba(239, 68, 68, 0.3)' 
                : '1px solid rgba(239, 68, 68, 0.2)',
              color: isDark ? '#fca5a5' : '#ef4444',
            }} 
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {/* Display-only fields - Super admins cannot edit these */}
          <TextField
            fullWidth
            label="Name"
            value={user?.name || ''}
            disabled
            helperText="Cannot be changed by super admin"
            FormHelperTextProps={{
              sx: {
                color: isDark ? '#9ca3af' : '#6b7280', // Match price predictor exact
              },
            }}
          />
          <TextField
            fullWidth
            label="Email"
            value={user?.email || ''}
            disabled
            helperText="Cannot be changed by super admin"
            FormHelperTextProps={{
              sx: {
                color: isDark ? '#9ca3af' : '#6b7280', // Match price predictor exact
              },
            }}
          />
          <TextField
            fullWidth
            label="Phone"
            value={user?.phone || ''}
            disabled
            helperText="Cannot be changed by super admin"
            FormHelperTextProps={{
              sx: {
                color: isDark ? '#9ca3af' : '#6b7280', // Match price predictor exact
              },
            }}
          />
          <TextField
            fullWidth
            label="Address"
            value={user?.address || ''}
            multiline
            rows={3}
            disabled
            helperText="Cannot be changed by super admin"
            FormHelperTextProps={{
              sx: {
                color: isDark ? '#9ca3af' : '#6b7280', // Match price predictor exact
              },
            }}
          />
          
          {/* Editable fields - Only role and status can be changed */}
          <TextField
            fullWidth
            select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'SUPER_ADMIN' | 'USER')}
          >
            <MenuItem value="USER">USER</MenuItem>
            <MenuItem value="SUPER_ADMIN">SUPER_ADMIN</MenuItem>
          </TextField>
          <Box>
            <Typography 
              variant="body2" 
              gutterBottom
              sx={{
                color: isDark ? '#9ca3af' : '#6b7280', // Match price predictor exact
              }}
            >
              Status
            </Typography>
            <Button
              variant={isActive ? 'contained' : 'outlined'}
              onClick={() => setIsActive(true)}
              sx={{ 
                mr: 1,
                ...(isActive ? {
                  background: isDark
                    ? 'linear-gradient(135deg, #26d4b4 0%, #00BFA5 100%)'
                    : 'linear-gradient(135deg, #00BFA5 0%, #26d4b4 100%)',
                  color: isDark ? '#000000' : '#FFFFFF',
                  '&:hover': {
                    background: isDark
                      ? 'linear-gradient(135deg, #5DF2D9 0%, #26d4b4 100%)'
                      : 'linear-gradient(135deg, #26d4b4 0%, #00BFA5 100%)',
                  },
                } : {
                  borderColor: isDark ? 'rgba(38, 212, 180, 0.3)' : 'rgba(38, 212, 180, 0.2)',
                  color: isDark ? '#26d4b4' : '#00BFA5',
                }),
              }}
            >
              Active
            </Button>
            <Button
              variant={!isActive ? 'contained' : 'outlined'}
              onClick={() => setIsActive(false)}
              sx={{
                ...(!isActive ? {
                  backgroundColor: isDark 
                    ? 'rgba(239, 68, 68, 0.1)' 
                    : 'rgba(239, 68, 68, 0.05)',
                  border: isDark 
                    ? '1px solid rgba(239, 68, 68, 0.3)' 
                    : '1px solid rgba(239, 68, 68, 0.2)',
                  color: isDark ? '#fca5a5' : '#ef4444',
                  '&:hover': {
                    backgroundColor: isDark 
                      ? 'rgba(239, 68, 68, 0.2)' 
                      : 'rgba(239, 68, 68, 0.1)',
                  },
                } : {
                  borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
                  color: isDark ? '#fca5a5' : '#ef4444',
                }),
              }}
            >
              Inactive
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          sx={{
            color: isDark ? '#9ca3af' : '#6b7280', // Match price predictor exact
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          sx={{
            background: isDark
              ? 'linear-gradient(135deg, #F5D300 0%, #E6C200 100%)'
              : 'linear-gradient(135deg, #d4af37 0%, #c28800 100%)',
            color: isDark ? '#000000' : '#FFFFFF',
            '&:hover': {
              background: isDark
                ? 'linear-gradient(135deg, #FFE55C 0%, #F5D300 100%)'
                : 'linear-gradient(135deg, #c28800 0%, #d4af37 100%)',
            },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UsersPage;

