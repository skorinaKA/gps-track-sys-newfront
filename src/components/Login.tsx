import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, clearError } from '../slices/userSlice';
import { AppDispatch, RootState } from '../store';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Tabs,
  Tab,
  Snackbar,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

// Стили для адаптивности
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 500,
  width: '100%',
  margin: 'auto',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    marginTop: 0,
    padding: theme.spacing(2),
    maxHeight: '100vh',
    borderRadius: 0,
  },
}));

const ScrollableForm = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  paddingRight: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: 6,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.grey[100],
    borderRadius: 3,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[400],
    borderRadius: 3,
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: theme.palette.grey[500],
  },
}));

const Login: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((state: RootState) => state.user);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const [activeTab, setActiveTab] = useState(0);
    const [loginData, setLoginData] = useState({ login: '', password: '' });
    const [registerData, setRegisterData] = useState({
        Name: '',
        Email: '',
        Login: '',
        Password: '',
        ConfirmPassword: ''
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info'
    });
    const [registerErrors, setRegisterErrors] = useState({
        Name: '',
        Email: '',
        Login: '',
        Password: '',
        ConfirmPassword: ''
    });

    // Очищаем ошибки при переключении вкладок
    useEffect(() => {
        if (error) {
            setSnackbar({
                open: true,
                message: error,
                severity: 'error'
            });
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginData.login.trim() || !loginData.password.trim()) {
            setSnackbar({
                open: true,
                message: 'Пожалуйста, заполните все поля',
                severity: 'error'
            });
            return;
        }
        dispatch(loginUser(loginData));
    };

    const validateRegisterForm = (): boolean => {
        const errors = {
            Name: '',
            Email: '',
            Login: '',
            Password: '',
            ConfirmPassword: ''
        };
        let isValid = true;

        if (!registerData.Name.trim()) {
            errors.Name = 'Имя обязательно';
            isValid = false;
        }

        if (!registerData.Email.trim()) {
            errors.Email = 'Email обязателен';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(registerData.Email)) {
            errors.Email = 'Некорректный email';
            isValid = false;
        }

        if (!registerData.Login.trim()) {
            errors.Login = 'Логин обязателен';
            isValid = false;
        }

        if (!registerData.Password.trim()) {
            errors.Password = 'Пароль обязателен';
            isValid = false;
        } else if (registerData.Password.length < 6) {
            errors.Password = 'Минимум 6 символов';
            isValid = false;
        }

        if (registerData.Password !== registerData.ConfirmPassword) {
            errors.ConfirmPassword = 'Пароли не совпадают';
            isValid = false;
        }

        setRegisterErrors(errors);
        return isValid;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateRegisterForm()) {
            return;
        }

        try {
            const userData = {
                ...registerData,
                Role: 2
            };
            
            // Удаляем ConfirmPassword перед отправкой
            const { ConfirmPassword, ...userToSend } = userData as any;
            
            await dispatch(registerUser(userToSend)).unwrap();
            
            // Сброс формы
            setRegisterData({
                Name: '',
                Email: '',
                Login: '',
                Password: '',
                ConfirmPassword: ''
            });
            setRegisterErrors({
                Name: '',
                Email: '',
                Login: '',
                Password: '',
                ConfirmPassword: ''
            });
            
            // Показать уведомление об успехе
            setSnackbar({
                open: true,
                message: 'Пользователь успешно зарегистрирован!',
                severity: 'success'
            });
            
            // Переключиться на вкладку входа через 2 секунды
            setTimeout(() => {
                setActiveTab(0);
            }, 2000);
            
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error || 'Ошибка при регистрации',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        // Сбрасываем ошибки при переключении вкладок
        setRegisterErrors({
            Name: '',
            Email: '',
            Login: '',
            Password: '',
            ConfirmPassword: ''
        });
    };

    return (
        <>
            <Container 
                component="main" 
                maxWidth={isMobile ? false : "sm"}
                sx={{
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isMobile ? 0 : 2,
                }}
            >
                <StyledPaper elevation={3}>
                    <Typography 
                        component="h1" 
                        variant="h4" 
                        align="center" 
                        gutterBottom
                        sx={{ 
                            fontSize: isMobile ? '1.5rem' : '2rem',
                            mb: 2 
                        }}
                    >
                        GPS Tracking System
                    </Typography>
                    
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange} 
                        centered
                        variant="fullWidth"
                        sx={{ mb: 2 }}
                    >
                        <Tab label="Вход" />
                        <Tab label="Регистрация" />
                    </Tabs>

                    {activeTab === 0 ? (
                        <ScrollableForm>
                            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Логин"
                                    variant="outlined"
                                    margin="normal"
                                    value={loginData.login}
                                    onChange={(e) => setLoginData({...loginData, login: e.target.value})}
                                    required
                                    size={isMobile ? "small" : "medium"}
                                />
                                <TextField
                                    fullWidth
                                    label="Пароль"
                                    type="password"
                                    variant="outlined"
                                    margin="normal"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                    required
                                    size={isMobile ? "small" : "medium"}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ 
                                        mt: 3, 
                                        mb: 2,
                                        py: isMobile ? 1 : 1.5
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Войти'}
                                </Button>
                            </Box>
                        </ScrollableForm>
                    ) : (
                        <ScrollableForm>
                            <Box 
                                component="form" 
                                onSubmit={handleRegister} 
                                sx={{ mt: 1 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Имя"
                                    variant="outlined"
                                    margin="normal"
                                    value={registerData.Name}
                                    onChange={(e) => setRegisterData({...registerData, Name: e.target.value})}
                                    error={!!registerErrors.Name}
                                    helperText={registerErrors.Name}
                                    required
                                    size={isMobile ? "small" : "medium"}
                                />
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    variant="outlined"
                                    margin="normal"
                                    value={registerData.Email}
                                    onChange={(e) => setRegisterData({...registerData, Email: e.target.value})}
                                    error={!!registerErrors.Email}
                                    helperText={registerErrors.Email}
                                    required
                                    size={isMobile ? "small" : "medium"}
                                />
                                <TextField
                                    fullWidth
                                    label="Логин"
                                    variant="outlined"
                                    margin="normal"
                                    value={registerData.Login}
                                    onChange={(e) => setRegisterData({...registerData, Login: e.target.value})}
                                    error={!!registerErrors.Login}
                                    helperText={registerErrors.Login}
                                    required
                                    size={isMobile ? "small" : "medium"}
                                />
                                <TextField
                                    fullWidth
                                    label="Пароль"
                                    type="password"
                                    variant="outlined"
                                    margin="normal"
                                    value={registerData.Password}
                                    onChange={(e) => setRegisterData({...registerData, Password: e.target.value})}
                                    error={!!registerErrors.Password}
                                    helperText={registerErrors.Password}
                                    required
                                    size={isMobile ? "small" : "medium"}
                                />
                                <TextField
                                    fullWidth
                                    label="Подтвердите пароль"
                                    type="password"
                                    variant="outlined"
                                    margin="normal"
                                    value={registerData.ConfirmPassword}
                                    onChange={(e) => setRegisterData({...registerData, ConfirmPassword: e.target.value})}
                                    error={!!registerErrors.ConfirmPassword}
                                    helperText={registerErrors.ConfirmPassword}
                                    required
                                    size={isMobile ? "small" : "medium"}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ 
                                        mt: 3, 
                                        mb: 2,
                                        py: isMobile ? 1 : 1.5
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Зарегистрироваться'}
                                </Button>
                            </Box>
                        </ScrollableForm>
                    )}
                </StyledPaper>
            </Container>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Login;