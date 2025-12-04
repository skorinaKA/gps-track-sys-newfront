export type CoordsPair = {
    latitude: number;
    longitude: number;
}

export enum Status {
    Active = "active",
    Inactive = "inactive",
    Offline = "offline"
}

export enum Role {
    Admin = 1,
    User = 2,
    Unloaded = 3,
    HasErrors = 4,
    LoggedOut = 5
}

export type DeviceData = {
    id: string;
    curCoords: CoordsPair;
    previousCoords: CoordsPair[];
    previousCoordsStatus: Status[];
    lastActivity: string;
    status: string;
}

export type User = {
    Login: string;
    Password: string;
    Role: Role;
    // Phone: string;
    Name: string;
    Email: string;
}

export type LoginAndPassword = {
    login: string;
    password: string;
}

export type UserTableItem = {
    name: string;
    login: string;
    gmail: string;
    // phoneNumber: string;
    role: string;
}

export type DeviceTableItem = {
    id: string;
    curCoords: string;
    prevCoords: string;
    status: string;
}

export type MarkerPos = {
    deviceNum: number;
    pastMarkerPos: number;
}

export type DatabaseDeviceData = {
    Id: string;
    Name: string;
    Description: string;
    Coordinate: DatabaseCoords[];
}

export type DatabaseCoords = {
    id: number;
    device_id: string;
    coordinates: CoordsPair;
    timestamp: string;
}