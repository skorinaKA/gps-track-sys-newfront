import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchDevices, selectDevice, clearSelectedDevice } from '../slices/deviceSlice';
import { DeviceData } from '../types';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Button,
    Box,
    Chip,
    IconButton,
    Tooltip,
    TextField,
    InputAdornment,
    TablePagination,
    CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';

const DevicePanel: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { devices, loading, selectedDevice } = useSelector((state: RootState) => state.devices);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filteredDevices, setFilteredDevices] = useState<DeviceData[]>([]);

    useEffect(() => {
        dispatch(fetchDevices());
    }, [dispatch]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredDevices(devices);
        } else {
            const filtered = devices.filter(device =>
                device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                device.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredDevices(filtered);
        }
        setPage(0); // Сбрасываем страницу при поиске
    }, [devices, searchTerm]);

    const handleShowRoute = (deviceId: string) => {
        dispatch(selectDevice(deviceId));
        // Переключимся на карту только если пользователь имеет доступ к этой вкладке
        const switchTabEvent = new CustomEvent('switch-tab', { 
            detail: 0, // 0 - индекс вкладки "Карта"
            bubbles: true 
        });
        window.dispatchEvent(switchTabEvent);
    };

    const handleRefresh = () => {
        dispatch(fetchDevices());
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'warning';
            case 'offline':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatCoordinates = (coords: { latitude: number; longitude: number }) => {
        return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    // Рассчитываем данные для текущей страницы
    const paginatedDevices = filteredDevices.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
            {/* Заголовок и кнопки */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexShrink: 0 }}>
                <Typography variant="h4" component="h1">
                    Управление устройствами
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        Обновить
                    </Button>
                    {selectedDevice && (
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => dispatch(clearSelectedDevice())}
                        >
                            Скрыть маршрут
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Поиск */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0 }}>
                <TextField
                    placeholder="Поиск по ID или статусу..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ flexGrow: 1 }}
                />
                <Tooltip title="Фильтры">
                    <IconButton>
                        <FilterListIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Таблица устройств */}
            <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {loading && devices.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                ) : filteredDevices.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography color="textSecondary">
                            {searchTerm ? 'Устройства не найдены' : 'Нет доступных устройств'}
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                            <Table stickyHeader size="medium">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID устройства</TableCell>
                                        <TableCell>Текущие координаты</TableCell>
                                        <TableCell>Предыдущие точки</TableCell>
                                        <TableCell>Статус</TableCell>
                                        <TableCell>Последняя активность</TableCell>
                                        <TableCell>Действия</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedDevices.map((device) => (
                                        <TableRow
                                            key={device.id}
                                            hover
                                            selected={selectedDevice?.id === device.id}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {device.id}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatCoordinates(device.curCoords)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={`${device.previousCoords.length} точек`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={device.status}
                                                    color={getStatusColor(device.status) as any}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(device.lastActivity)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Показать на карте">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleShowRoute(device.id)}
                                                        color="primary"
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
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
                            count={filteredDevices.length}
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

            {/* Статистика */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <Typography variant="body2" color="textSecondary">
                    Всего устройств: {devices.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Активных: {devices.filter(d => d.status.toLowerCase() === 'active').length}
                </Typography>
            </Box>
        </Box>
    );
};

export default DevicePanel;