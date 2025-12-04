import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginAndPassword, Role } from '../types';
import { apiService } from '../services/api';

interface UserState {
    currentUser: User | null;
    users: User[];
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    currentUser: null,
    users: [],
    loading: false,
    error: null,
};

export const loginUser = createAsyncThunk(
    'user/login',
    async (credentials: LoginAndPassword, { rejectWithValue }) => {
        try {
            return await apiService.login(credentials);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchUsers = createAsyncThunk(
    'user/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            return await apiService.getUsers();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const registerUser = createAsyncThunk(
    'user/register',
    async (userData: User, { rejectWithValue }) => {
        try {
            await apiService.createUser(userData);
            return userData;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteUser = createAsyncThunk(
    'user/deleteUser',
    async (login: string, { rejectWithValue }) => {
        try {
            await apiService.deleteUser(login);
            return login;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logout: (state) => {
            state.currentUser = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.currentUser = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
                state.users = action.payload;
            })
            .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.users.push(action.payload);
            })
            .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
                state.users = state.users.filter(user => user.Login !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { logout, clearError } = userSlice.actions;
export default userSlice.reducer;