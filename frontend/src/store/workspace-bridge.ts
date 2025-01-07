import type ReconnectingWebSocket from "reconnecting-websocket";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

type WorkspaceBridgeState = {
    bridgeSocket: ReconnectingWebSocket | null;
    setBridgeSocket: (v: ReconnectingWebSocket) => void;
    closeBridgeSocket: () => void;

    connectionStatus: ConnectionStatus;
    setConnectionStatus: (v: ConnectionStatus) => void;

    bridge2Socket: ReconnectingWebSocket | null;
    setBridge2Socket: (v: ReconnectingWebSocket) => void;
    closeBridge2Socket: () => void;

    connection2Status: ConnectionStatus;
    setConnection2Status: (v: ConnectionStatus) => void;
};

export const useWorkspaceBridgeStore = create<WorkspaceBridgeState>()(
    devtools(function (set) {
        return {
            bridgeSocket: null,
            setBridgeSocket(v) {
                set((_state) => ({ bridgeSocket: v }));
            },
            closeBridgeSocket() {
                set((_state) => ({
                    bridgeSocket: null,
                    connectionStatus: "disconnected",
                }));
            },

            connectionStatus: "disconnected",
            setConnectionStatus(v) {
                set((_state) => ({ connectionStatus: v }));
            },

            bridge2Socket: null,
            setBridge2Socket(v) {
                set((_state) => ({ bridge2Socket: v }));
            },
            closeBridge2Socket() {
                set((_state) => ({
                    bridge2Socket: null,
                    connection2Status: "disconnected",
                }));
            },

            connection2Status: "disconnected",
            setConnection2Status(v) {
                set((_state) => ({ connection2Status: v }));
            },
        };
    }),
);
