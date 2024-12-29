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
        };
    }),
);
