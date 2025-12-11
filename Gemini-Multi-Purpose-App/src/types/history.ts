export interface HistoryItem {
    id: string;
    functionId: string;
    timestamp: number;
    processingTime: number;
    inputs: {
        type: 'image' | 'text';
        data: string; // Base64 or text
        name?: string;
    }[];
    outputs: {
        type: 'image' | 'text' | 'json';
        data: string; // Base64 or JSON string
    }[];
    metadata: {
        [key: string]: any;
    };
}

export interface HistoryStorage {
    usage: number;
    quota: number;
    items: number;
}
