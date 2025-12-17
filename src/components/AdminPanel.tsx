import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchUsers, registerUser, deleteUser } from '../slices/userSlice';
import { User, Role } from '../types';
import {
    Container,
    Paper,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    IconButton,
    Tooltip,
    Snackbar,
    Alert,
    CircularProgress,
    TablePagination,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { WavingHand } from '@mui/icons-material';

const AdminPanel: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { users, currentUser, loading, error } = useSelector((state: RootState) => state.user);
    
    const [open, setOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [notification, setNotification] = useState<{open: boolean, message: string, severity: 'success' | 'info' | 'warning' | 'error'}>({
        open: false,
        message: '',
        severity: 'info'
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [newUser, setNewUser] = useState<Partial<User>>({
        Login: '',
        Password: '',
        Name: '',
        Email: '',
        Role: Role.User
    });

    useEffect(() => {
        if (currentUser?.Role === Role.Admin) {
            dispatch(fetchUsers());
        }
    }, [dispatch, currentUser]);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(registerUser(newUser as User)).unwrap();
            setOpen(false);
            setNewUser({
                Login: '',
                Password: '',
                Name: '',
                Email: '',
                Role: Role.User
            });
            setNotification({
                open: true,
                message: 'Пользователь успешно создан!',
                severity: 'success'
            });
        } catch (error: any) {
            setNotification({
                open: true,
                message: error || 'Ошибка при создании пользователя',
                severity: 'error'
            });
        }
    };

    const handleDeleteUser = async (login: string) => {
        if (!window.confirm(`Вы уверены, что хотите удалить пользователя "${login}"?`)) {
            return;
        }

        setDeleteLoading(login);
        
        try {
            // Вызываем удаление
            await dispatch(deleteUser(login)).unwrap();
            
            // Если успешно, обновляем список
            setNotification({
                open: true,
                message: `Пользователь ${login} успешно удален`,
                severity: 'success'
            });
            
            // Обновляем список пользователей через 500 мс
            setTimeout(() => {
                dispatch(fetchUsers());
            }, 500);
            
        } catch (error: any) {
            console.log('Delete error in component:', error);
            
            // Если это CORS ошибка
            if (error.includes('CORS_ERROR') || error.includes('DELETE_ATTEMPTED')) {
                setNotification({
                    open: true,
                    message: `Запрос на удаление отправлен. Проверьте сервер и обновите список через несколько секунд.`,
                    severity: 'warning'
                });
                
                // Пробуем обновить список пользователей через 2 секунды
                setTimeout(() => {
                    dispatch(fetchUsers());
                }, 2000);
                
                // Показываем дополнительное уведомление
                setTimeout(() => {
                    setNotification({
                        open: true,
                        message: 'Обновляю список пользователей...',
                        severity: 'info'
                    });
                }, 1500);
                
            } else {
                setNotification({
                    open: true,
                    message: `Ошибка при удалении: ${error}`,
                    severity: 'error'
                });
            }
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    if (currentUser?.Role !== Role.Admin) {
        return (
            <Container sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h4" color="error">
                    Доступ запрещен
                </Typography>
            </Container>
        );
    }

    // Рассчитываем данные для текущей страницы
    const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
                {/* Заголовок и кнопки */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexShrink: 0 }}>
                    <Typography variant="h4">
                        Панель администратора
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button 
                            variant="outlined" 
                            startIcon={<RefreshIcon />}
                            onClick={() => dispatch(fetchUsers())}
                            disabled={loading}
                        >
                            Обновить список
                        </Button>
                        <Button 
                            variant="contained" 
                            startIcon={<AddIcon />}
                            onClick={() => setOpen(true)}
                        >
                            Добавить пользователя
                        </Button>
                    </Box>
                </Box>

                {/* Диалог добавления пользователя */}
                <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Добавить пользователя</DialogTitle>
                    <form onSubmit={handleAddUser}>
                        <DialogContent>
                            <TextField
                                fullWidth
                                label="Логин"
                                value={newUser.Login}
                                onChange={(e) => setNewUser({...newUser, Login: e.target.value})}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Пароль"
                                type="password"
                                value={newUser.Password}
                                onChange={(e) => setNewUser({...newUser, Password: e.target.value})}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Имя"
                                value={newUser.Name}
                                onChange={(e) => setNewUser({...newUser, Name: e.target.value})}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={newUser.Email}
                                onChange={(e) => setNewUser({...newUser, Email: e.target.value})}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                select
                                label="Роль"
                                value={newUser.Role}
                                onChange={(e) => setNewUser({...newUser, Role: e.target.value})}
                                margin="normal"
                            >
                                <MenuItem value={Role.User}>Пользователь</MenuItem>
                                <MenuItem value={Role.Admin}>Администратор</MenuItem>
                            </TextField>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpen(false)}>Отмена</Button>
                            <Button 
                                type="submit" 
                                variant="contained"
                                disabled={loading}
                            >
                                {loading ? 'Создание...' : 'Создать'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                {/* Таблица пользователей */}
                <Paper 
                    sx={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                >
                    {loading && users.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Имя</TableCell>
                                            <TableCell>Логин</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Роль</TableCell>
                                            <TableCell>Действия</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedUsers.map((user) => (
                                            <TableRow 
                                                key={user.Login}
                                                hover
                                            >
                                                <TableCell>{user.Name}</TableCell>
                                                <TableCell>{user.Login}</TableCell>
                                                <TableCell>{user.Email}</TableCell>
                                                <TableCell>
                                                    <Box 
                                                        sx={{ 
                                                            display: 'inline-block',
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: 1,
                                                            backgroundColor: user.Role === Role.Admin ? 'primary.light' : 'grey.200',
                                                            color: user.Role === Role.Admin ? 'primary.contrastText' : 'text.primary'
                                                        }}
                                                    >
                                                        {user.Role === Role.Admin?"Администратор":"Пользователь"}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title="Удалить пользователя">
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDeleteUser(user.Login)}
                                                                disabled={user.Login === currentUser?.Login || deleteLoading === user.Login}
                                                            >
                                                                {deleteLoading === user.Login ? (
                                                                    <CircularProgress size={20} />
                                                                ) : (
                                                                    <DeleteIcon />
                                                                )}
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    {user.Login === currentUser?.Login && (
                                                        <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                                                            (текущий)
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            
                            {/* Пагинация */}
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={users.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Строк на странице:"
                                labelDisplayedRows={({ from, to, count }) => 
                                    `${from}-${to} из ${count}`
                                }
                            />
                        </>
                    )}
                </Paper>
            </Box>

            {/* Уведомления */}
            <Snackbar 
                open={notification.open} 
                autoHideDuration={6000} 
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseNotification} 
                    severity={notification.severity}
                    variant="filled"
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default AdminPanel;