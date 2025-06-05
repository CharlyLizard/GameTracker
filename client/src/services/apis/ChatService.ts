import { io, Socket } from "socket.io-client";
import { getAuthData } from "../storage/IndexedDbService";

const SOCKET_URL = "http://localhost:5000";
let socket: Socket | null = null;

// Conectar al socket con autenticación JWT
export async function connectSocket(): Promise<Socket> {
  if (socket && socket.connected) return socket;
  const token = await getAuthData("token");
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    withCredentials: true,
  });
  return socket;
}

// Unirse a una sala de chat (roomId se genera igual que en backend)
export async function joinRoom(friendId: string): Promise<string> {
  const user = await getAuthData("user");
  if (!user) throw new Error("No autenticado");
  const roomId = [user.id, friendId].sort().join("_");
  await connectSocket();
  socket!.emit("joinRoom", { friendId });
  return roomId;
}


// Escuchar mensajes entrantes
export function onReceiveMessage(callback: (msg: any) => void) {
  if (!socket) throw new Error("Socket no conectado");
  socket.on("receiveMessage", callback);
}

// Desconectar socket
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Obtener historial de mensajes por REST
export async function getChatHistory(friendId: string) {
  const token = await getAuthData("token");
  const res = await fetch(`${SOCKET_URL}/api/chat/history/${friendId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener historial");
  const data = await res.json();
  return data.mensajes;
}


export function sendMessage(roomId: string, to: string, message: string, file?: any) {
  if (!socket) throw new Error("Socket no conectado");
  socket.emit("sendMessage", { roomId, to, message, file });
}

// ...existing code...

export function joinGroupRoom(grupoId: string) {
  if (!socket) throw new Error("Socket no conectado");
  socket.emit("joinGroupRoom", { grupoId });
}

export function sendGroupMessage(grupoId: string, message: string, file?: any) {
  if (!socket) throw new Error("Socket no conectado");
  socket.emit("sendGroupMessage", { grupoId, message, file });
}

export function onReceiveGroupMessage(callback: (msg: any) => void) {
  if (!socket) throw new Error("Socket no conectado");
  socket.on("receiveGroupMessage", callback);
}