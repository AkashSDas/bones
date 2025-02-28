import { ensureDir, expandGlob } from "@std/fs";
import { join } from "@std/path";
import { z } from "zod";

/**
 * Port mapping file prefix
 * @example port-8000-80.conf
 */
const FilePrefix = "port-";

/** Port mapping file extension */
const Extension = ".conf";

/** Whenever nginx config is changed */
const NginxReloadShellCommand = "nginx -s reload";

/** Available exposed ports. This should be in sync with what is used in the Bones backend */
export const PortSchema = z.union([
    z.literal(80),
    z.literal(3000),
    z.literal(3001),
    z.literal(3002),
    z.literal(4200),
    z.literal(5173),
    z.literal(8000),
    z.literal(8080),
]);

type PortMapping = {
    internalPort: number;
    externalPort: number;
};

class PortMappingManager {
    private nginxPath = "/etc/nginx/conf.d/";
    private allExternalPorts: number[];

    constructor() {
        this.allExternalPorts = [80, 3000, 3001, 3002, 4200, 5173, 8000, 8080];
    }

    /** List available external ports */
    async listAvailableExternalPorts(): Promise<number[] | Error> {
        try {
            const currentMapping = await this.listCurrentMapping();
            if (currentMapping instanceof Error) {
                throw currentMapping;
            }

            return this.allExternalPorts.filter(
                (port) => !currentMapping.find((m) => m.externalPort === port),
            );
        } catch (e) {
            return Error(`Failed to list available external ports: ${e}`);
        }
    }

    /** List of the current Nginx internal-external port mappings */
    async listCurrentMapping(): Promise<PortMapping[] | Error> {
        try {
            const mappings: PortMapping[] = [];

            const absolutePath = await this.basePath();
            const files = expandGlob(join(absolutePath, "*"));

            for await (const file of files) {
                const name = file.name;

                if (name.startsWith(FilePrefix) && name.endsWith(Extension)) {
                    // > var a = "port-8000-80.conf"
                    // > a.split(".conf")
                    // [ 'port-8000-80', '' ]
                    // > a.split(".conf")[0]
                    // 'port-8000-80'
                    // > a.split(".conf")[0].split("-")
                    // [ 'port', '8000', '80' ]
                    // > a.split(".conf")[0].split("-").splice(1)
                    // [ '8000', '80' ]

                    const nameWithoutExt = name.split(Extension)[0];

                    if (nameWithoutExt !== undefined) {
                        const parts = nameWithoutExt.split("-").splice(1);

                        if (parts.length === 2) {
                            const internalPort = parseInt(parts[0], 10);
                            const externalPort = parseInt(parts[1], 10);

                            await PortSchema.parseAsync(externalPort);

                            if (!Number.isNaN(internalPort)) {
                                mappings.push({ internalPort, externalPort });
                            }
                        }
                    }
                }
            }

            return mappings;
        } catch (e) {
            return Error(`Failed to list port mappings: ${e}`);
        }
    }

    /** Delete port mapping */
    async delete(
        internalPort: number,
        externalPort: number,
        reloadNginx: boolean = true,
    ): Promise<undefined | Error> {
        try {
            const absolutePath = await this.basePath();
            const basename = `${FilePrefix}${internalPort}-${externalPort}${Extension}`;
            const filePath = join(absolutePath, basename);

            if (externalPort == 80) {
                const encoder = new TextEncoder();
                const data = encoder.encode(this.buildEmptyPort80NginxConfig());
                await Deno.writeFile(filePath, data, { createNew: true });
            } else {
                await Deno.remove(filePath);
            }

            if (reloadNginx) {
                await this.reloadNginx();
            }
        } catch (e) {
            return Error(`Failed to delete port mapping: ${e}`);
        }
    }

    /** Create port mapping */
    async create(
        internalPort: number,
        externalPort: number,
        reloadNginx: boolean = true,
    ): Promise<undefined | Error> {
        try {
            const absolutePath = await this.basePath();
            const basename = `${FilePrefix}${internalPort}-${externalPort}${Extension}`;
            const filePath = join(absolutePath, basename);

            const encoder = new TextEncoder();

            if (externalPort == 80) {
                const data = encoder.encode(
                    this.buildPort80NginxConfig(internalPort),
                );

                await Deno.writeFile(filePath, data, { createNew: true });
            } else {
                const data = encoder.encode(
                    this.buildOtherPortNginxConfig(internalPort, externalPort),
                );

                await Deno.writeFile(filePath, data, { createNew: true });
            }

            if (reloadNginx) {
                await this.reloadNginx();
            }
        } catch (e) {
            return Error(`Failed to create port mapping: ${e}`);
        }
    }

    // ====================================
    // Nginx config
    // ====================================

    /**
     * When port mapping for external port 80 is removed then this will be it's content
     * i.e. we remove the internal-external port mapping and keep mappings for Bridge
     * v1 and v2 as they're running on ports 4000 and 4001 respectively. Bridge v1 and
     * v2 will listening to external port 80 request.
     */
    private buildEmptyPort80NginxConfig(): string {
        return `
        server {
            listen 80;
        
            # Bridge service routing
            location /_bridge {
                rewrite ^/_bridge(.*)$ $1 break;
        
                proxy_pass http://127.0.0.1:4000;
                proxy_http_version 1.1;
        
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
        
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }

            # Bridge service routing
            location /_bridge_v2 {
                rewrite ^/_bridge_v2(.*)$ $1 break;
        
                proxy_pass http://127.0.0.1:4001;
                proxy_http_version 1.1;
        
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
        
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }
        }
        `;
    }

    /**
     * When port mapping for external port 80 is added, we will have to add port mapping
     * and keep the mappings for Bridge v1 and v2 as they're running on ports 4000
     * and 4001 respectively. Bridge v1 and v2 will listening to external port 80 request.
     */
    private buildPort80NginxConfig(internalPort: number): string {
        return `
        server {
            listen 80;
        
            location / {
                error_log /var/log/nginx/port-${internalPort}-80-error.log debug;
                access_log /var/log/nginx/port-${internalPort}-80-access.log combined;
        
                proxy_pass http://127.0.0.1:${internalPort};
                proxy_http_version 1.1;
        
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
        
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
        
                proxy_buffering off;
                proxy_read_timeout 1800;
                proxy_connect_timeout 1800;
            }
        
            # Bridge service routing
            location /_bridge {
                rewrite ^/_bridge(.*)$ $1 break;
        
                proxy_pass http://127.0.0.1:4000;
                proxy_http_version 1.1;
        
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
        
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }

            # Bridge service routing
            location /_bridge_v2 {
                rewrite ^/_bridge_v2(.*)$ $1 break;
        
                proxy_pass http://127.0.0.1:4001;
                proxy_http_version 1.1;
        
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
        
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }
        }
        `;
    }

    /** Build Nginx conf for internal-external port where external port is not 80 */
    private buildOtherPortNginxConfig(
        internalPort: number,
        externalPort: number,
    ): string {
        return `
        server {
            listen ${externalPort};
        
            location / {
                error_log /var/log/nginx/port-${internalPort}-80-error.log debug;
                access_log /var/log/nginx/port-${internalPort}-80-access.log combined;
        
                proxy_pass http://127.0.0.1:${internalPort};
                proxy_http_version 1.1;
        
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
        
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
        
                proxy_buffering off;
                proxy_read_timeout 1800;
                proxy_connect_timeout 1800;
            }
        }
        `;
    }

    // ====================================
    // Utilities
    // ====================================

    private async basePath() {
        const absolutePath = await Deno.realPath(this.nginxPath);
        await ensureDir(absolutePath);
        return absolutePath;
    }

    /** Reload nginx to reflect port mapping changes */
    private async reloadNginx() {
        const cmd = new Deno.Command(NginxReloadShellCommand);
        await cmd.output();
    }
}

/** Manage internal and external port mapping for a Workspace */
export const portMappingManager = new PortMappingManager();
