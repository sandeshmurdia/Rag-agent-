import OpenAI from 'openai';
import { config } from '../config';
import { ChatMessage } from '../types';
import { getOrCreateCollection } from '../chroma';

interface QueryResponse {
    response: string;
}

export class Agent {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: config.openai.apiKey
        });
    }

    async processQuery(query: string, chatHistory: ChatMessage[] = []): Promise<QueryResponse> {
        if (!query.trim()) {
            throw new Error('Query cannot be empty');
        }

        try {
            const collection = await getOrCreateCollection(config.chroma.collection);
            const results = await collection.query({
                queryTexts: [query],
                nResults: 5
            });

            // Format the context from search results
            let context = '';
            if (results.documents[0]) {
                context = results.documents[0].join('\n\n');
            }

            // Prepare messages for the chat completion
            const messages = [
                {
                    role: "system",
                    content: `You are a product catalog assistant. Use the following product information to answer questions. 
                    If you don't find relevant information in the context, say so. Don't make up information.
                    
                    Context:
                    ${context}`
                },
                ...chatHistory.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                { role: "user", content: query }
            ] as OpenAI.Chat.ChatCompletionMessageParam[];

            // Get completion from OpenAI
            const completion = await this.openai.chat.completions.create({
                model: config.openai.chatModel || 'gpt-3.5-turbo',
                messages,
                temperature: 0.7,
            });

            return {
                response: completion.choices[0]?.message?.content || 'No response generated'
            };

        } catch (error) {
            console.error('Error in processQuery:', error);
            throw new Error('Failed to process query');
        }
    }
}