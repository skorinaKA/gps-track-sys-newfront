import axios from 'axios';
import { User, DeviceData, DatabaseDeviceData, LoginAndPassword, Role, Status } from '../types';

const API_BASE_URL = 'http://localhost:8088';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Добавляем обработчик ошибок
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 405) {
            console.warn('CORS issue detected. Trying alternative methods...');
        }
        return Promise.reject(error);
    }
);

export const apiService = {
    // Авторизация
    login: async (credentials: LoginAndPassword): Promise<User> => {
        try {
            const response = await api.get<User[]>('/get/users');
            const users = response.data;
            
            const user = users.find(u => 
                u.Login === credentials.login && 
                u.Password === credentials.password
            );
            
            if (!user) {
                throw new Error('Неверный логин или пароль');
            }
            
            return user;
        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Получение пользователей
    getUsers: async (): Promise<User[]> => {
        try {
            const response = await api.get<User[]>('/get/users');
            return response.data;
        } catch (error: any) {
            console.error('Get users error:', error);
            throw error;
        }
    },

    // Создание пользователя
    createUser: async (user: User): Promise<void> => {
        try {
            // Пробуем использовать fetch с простыми заголовками
            const response = await fetch('http://localhost:8088/add/user', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    // 'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
                // mode: 'cors', // Используем CORS режим
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error: any) {
            console.error('Create user error:', error);
            
            // // Пробуем без CORS заголовков
            // try {
            //     const simpleResponse = await fetch('http://localhost:8088/add/user', {
            //         method: 'POST',
            //         headers: {
            //             'Accept': 'application/json',
            //         },
            //         body: JSON.stringify(user),
            //     });

            //     if (!simpleResponse.ok) {
            //         throw new Error(`HTTP error! status: ${simpleResponse.status}`);
            //     }

            //     return await simpleResponse.json();
            // } catch (simpleError) {
            //     console.error('Simple POST also failed:', simpleError);
            //     throw error;
            // }
        }
    },

    // Удаление пользователя
deleteUser: async (login: string): Promise<void> => {
    try {
    // Пробуем использовать fetch с простыми заголовками
    const response = await fetch('http://localhost:8088/delete/user', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            // 'Content-Type': 'application/json',
        },
        body: JSON.stringify(login),
        // mode: 'cors', // Используем CORS режим
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();

    } catch (error: any) {
        console.error('Delete user error:', error);
        
        // // Проверяем, есть ли сообщение об ошибке CORS
        // if (error.message.includes('Failed to fetch') || 
        //     error.message.includes('NetworkError') ||
        //     error.message.includes('CORS')) {
        //     console.warn('CORS error detected, but request might have been sent');
        //     // Пробуем отправить простой запрос без проверки ответа
        //     await sendSimpleDeleteRequest(login);
        //     throw new Error('DELETE_ATTEMPTED_BUT_CORS_ERROR');
        // }
        
        throw error;
    }
},

    // Получение устройств
    getDevices: async (): Promise<DeviceData[]> => {
        try {
            const response = await api.get<DatabaseDeviceData[]>('/get/device');
            
            return response.data.map(dbDevice => {
                const coordinates = dbDevice.Coordinate || [];
                const sortedCoords = coordinates.sort((a, b) => 
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                );

                const curCoords = sortedCoords.length > 0 
                    ? sortedCoords[sortedCoords.length - 1].coordinates 
                    : { latitude: 0, longitude: 0 };

                const previousCoords = sortedCoords.slice(0, -1).map(coord => coord.coordinates);
                
                return {
                    id: dbDevice.Id,
                    curCoords,
                    previousCoords,
                    previousCoordsStatus: sortedCoords.map(() => Status.Active),
                    lastActivity: sortedCoords.length > 0 
                        ? sortedCoords[sortedCoords.length - 1].timestamp 
                        : new Date().toISOString(),
                    status: 'active'
                };
            });
        } catch (error: any) {
            console.error('Get devices error:', error);
            throw error;
        }
    }
};