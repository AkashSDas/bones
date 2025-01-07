import {
    ChevronLeftIcon,
    ChevronRightIcon,
    RotateCcwIcon,
    SearchIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { useWorkspaceURL } from "@/hooks/workspace";

export function WebView() {
    const { baseURL } = useWorkspaceURL();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [url, setUrl] = useState(baseURL);
    const [inputUrl, setInputUrl] = useState(url);

    const handleBack = () => {
        const length = iframeRef.current?.contentWindow?.history.length;
        if (length && length > 1) {
            iframeRef.current?.contentWindow?.history.back();
        }
    };

    const handleForward = () => {
        iframeRef.current?.contentWindow?.history.forward();
    };

    const handleRefresh = () => {
        iframeRef.current?.contentWindow?.location.reload();
    };

    const handleUrlChange = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUrl(inputUrl);
    };

    useEffect(
        function () {
            if (baseURL) {
                setUrl(baseURL);
            }
        },
        [baseURL],
    );

    return (
        <div className="flex flex-col h-full bg-grey-950">
            {/* Navigation Bar */}
            <div className="flex items-center gap-2 p-2">
                <Button variant="secondary" size="icon" onClick={handleBack}>
                    <ChevronLeftIcon />
                </Button>
                <Button variant="secondary" size="icon" onClick={handleForward}>
                    <ChevronRightIcon />
                </Button>
                <Button variant="secondary" size="icon" onClick={handleRefresh}>
                    <RotateCcwIcon />
                </Button>

                <form
                    className="flex flex-1 gap-1 url-input-form"
                    onSubmit={handleUrlChange}
                >
                    <Input
                        type="text"
                        value={inputUrl ?? ""}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="Enter a URL"
                        className="!h-9"
                    />
                    <Button variant="secondary" size="icon" type="submit">
                        <SearchIcon />
                    </Button>
                </form>
            </div>

            {/* WebView/IFrame */}
            <div className="flex-1">
                <iframe
                    ref={iframeRef}
                    src={url ?? undefined}
                    title="WebView"
                    className="w-full h-full bg-grey-50"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                />
            </div>
        </div>
    );
}
