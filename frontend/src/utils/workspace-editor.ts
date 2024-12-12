export function detectMonacoLanguage(fileName: string): string {
    // Normalize the filename to lowercase for case-insensitive matching
    const normalizedFileName = fileName.toLowerCase();

    // Language mapping based on file extensions
    const languageMap: { [key: string]: string } = {
        // TypeScript and JavaScript
        ".ts": "typescript",
        ".tsx": "typescript",
        ".js": "javascript",
        ".jsx": "javascript",
        ".mjs": "javascript",
        ".cjs": "javascript",

        // Web Technologies
        ".html": "html",
        ".htm": "html",
        ".css": "css",
        ".scss": "scss",
        ".sass": "scss",
        ".less": "less",
        ".json": "json",
        ".jsonc": "json",

        // Python
        ".py": "python",
        ".pyw": "python",

        // Rust
        ".rs": "rust",

        // Go
        ".go": "go",

        // Markdown
        ".md": "markdown",
        ".markdown": "markdown",

        // System and Configuration
        ".yaml": "yaml",
        ".yml": "yaml",
        ".toml": "toml",
        ".ini": "ini",
        ".conf": "ini",

        // Backend Languages
        ".java": "java",
        ".kt": "kotlin",
        ".kts": "kotlin",
        ".c": "c",
        ".cpp": "cpp",
        ".h": "cpp",
        ".cs": "csharp",

        // Shell and Scripting
        ".sh": "shell",
        ".bash": "shell",
        ".zsh": "shell",
        ".ps1": "powershell",

        // Configuration and Build
        ".dockerfile": "dockerfile",
        ".proto": "protobuf",

        // Data Files
        ".xml": "xml",
        ".sql": "sql",
    };

    // Find the matching language by file extension
    const extension = normalizedFileName.slice(normalizedFileName.lastIndexOf("."));

    // Return the detected language or default to 'plaintext'
    return languageMap[extension] ?? "plaintext";
}

// Example usage
export function getEditorLanguage(fileName: string): string {
    return detectMonacoLanguage(fileName);
}

// Optional: Type-safe language validator
export function isValidMonacoLanguage(language: string): boolean {
    const validLanguages = [
        "typescript",
        "javascript",
        "html",
        "css",
        "json",
        "python",
        "rust",
        "go",
        "markdown",
        "yaml",
        "toml",
        "ini",
        "java",
        "kotlin",
        "c",
        "cpp",
        "csharp",
        "shell",
        "powershell",
        "dockerfile",
        "protobuf",
        "xml",
        "sql",
        "plaintext",
    ];

    return validLanguages.includes(language);
}
