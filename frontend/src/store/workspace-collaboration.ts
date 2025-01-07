import * as Y from "yjs";
import { type MonacoBinding } from "y-monaco";
import { type WebsocketProvider } from "y-websocket";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type WorkspaceCollaborationState = {
    yDocs: Map<string, Y.Doc>;
    providers: Map<string, WebsocketProvider>;
    bindings: Map<string, MonacoBinding>;

    getYDoc: (filePath: string) => Y.Doc;

    updateYDoc: (filePath: string, yDoc: Y.Doc) => void;
    updateProvider: (filePath: string, provider: WebsocketProvider) => void;
    updateBinding: (filePath: string, binding: MonacoBinding) => void;

    deleteYDoc: (filePath: string) => void;
    deleteProvider: (filePath: string) => void;
    deleteBinding: (filePath: string) => void;
};

export const useWorkspaceCollaborationStore = create<WorkspaceCollaborationState>()(
    devtools(function (set, get) {
        return {
            yDocs: new Map<string, Y.Doc>(),
            providers: new Map<string, WebsocketProvider>(),
            bindings: new Map<string, MonacoBinding>(),

            getYDoc: (filePath: string) => {
                if (!get().yDocs.has(filePath)) {
                    const yDoc = new Y.Doc({ guid: filePath });

                    const newYDocs = get().yDocs;
                    newYDocs.set(filePath, yDoc);
                    set({ yDocs: newYDocs });
                }
                return get().yDocs.get(filePath)!;
            },

            updateYDoc: (filePath: string, yDoc: Y.Doc) => {
                const newYDocs = get().yDocs;
                newYDocs.set(filePath, yDoc);
                set({ yDocs: newYDocs });
            },
            updateProvider: (filePath: string, provider: WebsocketProvider) => {
                const newProviders = get().providers;
                newProviders.set(filePath, provider);
                set({ providers: newProviders });
            },
            updateBinding: (filePath: string, binding: MonacoBinding) => {
                const newBindings = get().bindings;
                newBindings.set(filePath, binding);
                set({ bindings: newBindings });
            },

            deleteYDoc: (filePath: string) => {
                const newYDocs = get().yDocs;
                newYDocs.delete(filePath);
                set({ yDocs: newYDocs });
            },
            deleteProvider: (filePath: string) => {
                const newProviders = get().providers;
                newProviders.delete(filePath);
                set({ providers: newProviders });
            },
            deleteBinding: (filePath: string) => {
                const newBindings = get().bindings;
                newBindings.delete(filePath);
                set({ bindings: newBindings });
            },
        };
    }),
);
