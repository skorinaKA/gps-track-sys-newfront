import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DeviceData } from '../types';
import { apiService } from '../services/api';

interface DeviceState {
    devices: DeviceData[];
    loading: boolean;
    error: string | null;
    selectedDevice: DeviceData | null;
}

const initialState: DeviceState = {
    devices: [],
    loading: false,
    error: null,
    selectedDevice: null,
};

export const fetchDevices = createAsyncThunk(
    'devices/fetchDevices',
    async (_, { rejectWithValue }) => {
        try {
            return await apiService.getDevices();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const deviceSlice = createSlice({
    name: 'devices',
    initialState,
    reducers: {
        selectDevice: (state, action: PayloadAction<string>) => {
            state.selectedDevice = state.devices.find(device => device.id === action.payload) || null;
        },
        clearSelectedDevice: (state) => {
            state.selectedDevice = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDevices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDevices.fulfilled, (state, action: PayloadAction<DeviceData[]>) => {
                state.loading = false;
                state.devices = action.payload;
            })
            .addCase(fetchDevices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { selectDevice, clearSelectedDevice } = deviceSlice.actions;
export default deviceSlice.reducer;