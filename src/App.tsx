import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { initWebVitals, trackPageView } from './services/metrics';
import { RootState, AppDispatch } from './store';
import { logout } from './slices/userSlice';
import Login from './components/Login';
import Map from './components/Map';
import AdminPanel from './components/AdminPanel';
import DevicePanel from './components/DevicePanel';
import { Role } from './types';
import { GlobalStyles } from './styles/GlobalStyles';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DevicesIcon from '@mui/icons-material/Devices';
import PeopleIcon from '@mui/icons-material/People';
import MapIcon from '@mui/icons-material/Map';

const MainContainer = styled('div')({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column'
});

const ContentContainer = styled('div')({
  flex: 1,
  overflow: 'auto',
  display: 'flex',
});

const App: React.FC = () => {
    useEffect(() => {
        initWebVitals();
        trackPageView(window.location.pathname);
    }, []);
    const dispatch = useDispatch<AppDispatch>();
    const { currentUser } = useSelector((state: RootState) => state.user);
    const { devices } = useSelector((state: RootState) => state.devices);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        // Сбрасываем активную вкладку при смене пользователя
        setActiveTab(0);
    }, [currentUser]);

    useEffect(() => {
        // Обработчик для переключения вкладок из других компонентов
        const handleTabSwitch = (event: CustomEvent) => {
            const newTab = event.detail;
            // Проверяем, что новая вкладка доступна для текущего пользователя
            if (currentUser?.Role === Role.Admin || newTab < 2) {
                setActiveTab(newTab);
            }
        };

        window.addEventListener('switch-tab', handleTabSwitch as EventListener);
        
        return () => {
            window.removeEventListener('switch-tab', handleTabSwitch as EventListener);
        };
    }, [currentUser]);

    const handleLogout = () => {
        dispatch(logout());
        // При выходе сбрасываем активную вкладку
        setActiveTab(0);
    };

    // Получаем доступные вкладки в зависимости от роли
    const getTabs = () => {
        const tabs = [
            { 
                label: 'Карта', 
                component: <Map />,
                icon: <MapIcon />,
                value: 0,
                available: true
            },
            { 
                label: 'Устройства', 
                component: <DevicePanel />,
                icon: <DevicesIcon />,
                value: 1,
                available: true
            },
        ];

        // Добавляем вкладку админа только для администраторов
        if (currentUser?.Role === Role.Admin) {
            tabs.push({ 
                label: 'Админ-панель', 
                component: <AdminPanel />,
                icon: <PeopleIcon />,
                value: 2,
                available: true
            });
        }

        return tabs;
    };

    // Проверяем, доступна ли текущая активная вкладка
    const isTabAvailable = (tabIndex: number) => {
        const tabs = getTabs();
        return tabIndex < tabs.length;
    };

    // Если активная вкладка недоступна, сбрасываем на первую доступную
    useEffect(() => {
        if (!isTabAvailable(activeTab)) {
            setActiveTab(0);
        }
    }, [currentUser, activeTab]);

    if (!currentUser) {
        return (
            <>
                <GlobalStyles />
                <Login />
            </>
        );
    }

    const tabs = getTabs();

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        if (newValue < tabs.length) {
            setActiveTab(newValue);
        }
    };

    // Получаем текущий компонент для рендеринга
    const getCurrentComponent = () => {
        const tab = tabs[activeTab];
        if (!tab) {
            // Если вкладка не найдена, показываем первую доступную
            return tabs[0]?.component || <Map />;
        }
        return tab.component;
    };

    return (
        <>
            <GlobalStyles />
            <MainContainer>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            GPS Tracking System
                        </Typography>
                        <Typography variant="body2" sx={{ mr: 2 }}>
                            {currentUser.Name}
                        </Typography>
                        <Button 
                            color="inherit" 
                            onClick={handleLogout}
                            variant="outlined"
                            size="small"
                        >
                            Выйти
                        </Button>
                    </Toolbar>
                    <Tabs 
                        value={activeTab < tabs.length ? activeTab : 0}
                        onChange={handleTabChange}
                        textColor="inherit"
                        indicatorColor="secondary"
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {tabs.map((tab) => (
                            <Tab 
                                key={tab.value} 
                                label={tab.label}
                                icon={tab.icon}
                                iconPosition="start"
                                sx={{ minHeight: 60 }}
                            />
                        ))}
                    </Tabs>
                </AppBar>

                <ContentContainer>
                    {getCurrentComponent()}
                </ContentContainer>
            </MainContainer>
        </>
    );
};

export default App;