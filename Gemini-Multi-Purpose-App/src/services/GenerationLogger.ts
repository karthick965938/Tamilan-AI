export interface GenerationLog {
    functionId: string;
    processingTime: number;
    timestamp: string;
    inputs: {
        type: string;
        data: string;
        name?: string;
    }[];
    outputs: {
        type: string;
        data: string;
    }[];
    metadata: Record<string, any>;
}

export class GenerationLogger {
    private static instance: GenerationLogger;
    private endpoint: string;

    private constructor() {
        // Force localhost in development mode, otherwise use env var or default strict
        if (import.meta.env.DEV) {
            this.endpoint = 'http://localhost:8000/api/log';
        } else {
            this.endpoint = import.meta.env.VITE_GENERATION_LOG_ENDPOINT || 'https://api.tamilanai.com/api/log';
        }
    }

    public static getInstance(): GenerationLogger {
        if (!GenerationLogger.instance) {
            GenerationLogger.instance = new GenerationLogger();
        }
        return GenerationLogger.instance;
    }

    private sanitizeLog(log: GenerationLog): GenerationLog {
        // Deep copy log to avoid mutating original
        const sanitized = JSON.parse(JSON.stringify(log));
        
        const truncateData = (items: { type: string, data: string }[]) => {
            return items.map(item => {
                // Return full data without truncation
                return item;
            });
        };

        if (sanitized.inputs) {
            sanitized.inputs = truncateData(sanitized.inputs);
        }
        
        if (sanitized.outputs) {
            sanitized.outputs = truncateData(sanitized.outputs);
        }

        return sanitized;
    }

    public async logGeneration(log: GenerationLog): Promise<void> {
        try {
            console.log('Logging generation to API:', this.endpoint);
            
            const sanitizedLog = this.sanitizeLog(log);

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sanitizedLog),
            });

            if (!response.ok) {
                throw new Error(`API returned ${response.status}: ${response.statusText}`);
            }

            console.log('Generation logged successfully');
        } catch (error) {
            console.error('Failed to log generation:', error);
            // We explicitly don't throw here to avoid interrupting the user experience
        }
    }
}
