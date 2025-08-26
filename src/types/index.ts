export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    [key: string]: any;
}

export interface ProductChunk {
    id: string;
    text: string;
    metadata: {
        productId: string;
        [key: string]: any;
    };
}