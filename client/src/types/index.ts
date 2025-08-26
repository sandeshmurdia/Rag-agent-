export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface QueryResponse {
    isValid: boolean;
    response: string;
    format: 'text' | 'json' | 'table' | 'graph';
}

export interface Product {
    id: number;
    title: string;
    description: string;
    category: string;
    price: number;
    features: string[];
    specifications: Record<string, any>;
}
