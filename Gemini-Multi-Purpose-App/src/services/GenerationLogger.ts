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
        this.endpoint = import.meta.env.VITE_GENERATION_LOG_ENDPOINT || 'http://localhost:8000/api/log';
    }

    public static getInstance(): GenerationLogger {
        if (!GenerationLogger.instance) {
            GenerationLogger.instance = new GenerationLogger();
        }
        return GenerationLogger.instance;
    }

    public async logGeneration(log: GenerationLog): Promise<void> {
        try {
            console.log('Logging generation to API:', this.endpoint);

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(log),
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
