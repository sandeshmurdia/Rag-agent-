import OpenAI from 'openai';
import { config } from '../config';
import { getOrCreateCollection } from '../chroma';
import type { ChatMessage, QueryResponse } from '../types';

class AgentService {
    private openai: OpenAI;
    private static instance: AgentService;

    private constructor() {
        this.openai = new OpenAI({
            apiKey: config.openai.apiKey
        });
    }

    public static getInstance(): AgentService {
        if (!AgentService.instance) {
            AgentService.instance = new AgentService();
        }
        return AgentService.instance;
    }

    private async validateQuery(query: string): Promise<boolean> {
        try {
            const response = await this.openai.chat.completions.create({
                model: config.openai.chatModel,
                messages: [
                    { role: "system", content: "You are a query validator for a product catalog system. Respond with 'true' if the query is asking about product details, specifications, comparisons, recommendations, or product-related analytics. Examples of valid queries:\n- What laptops are available?\n- Show me products under $100\n- Compare gaming mice\n- Which kitchen appliances have the best features?\n- Find products with specific features\n\nRespond with 'false' for unrelated queries." },
                    { role: "user", content: query }
                ],
                temperature: 0
            });

            return response.choices[0].message.content?.toLowerCase().includes('true') ?? false;
        } catch (error) {
            console.error('Error validating query:', error);
            return false;
        }
    }

    async processQuery(query: string, chatHistory: ChatMessage[] = []): Promise<QueryResponse> {
        try {
            const isValid = await this.validateQuery(query);
            
            if (!isValid) {
                return {
                    isValid: false,
                    response: "This question is not related to product information or analytics. Please ask a relevant question.",
                    format: 'text'
                };
            }

            // Query ChromaDB for relevant products
            const collection = await getOrCreateCollection(config.chroma.collection);
            const results = await collection.query({
                queryTexts: [query],
                nResults: 5,
                include: ["metadatas", "documents"]
            });

            let context = '';
            if (results.documents && results.documents[0] && results.documents[0].length > 0) {
                context = `Available product information:\n\n${results.documents[0].join('\n\n')}`;
                if (results.metadatas && results.metadatas[0]) {
                    const metadata = results.metadatas[0].map(m => ({
                        productId: m.productId,
                        category: m.category,
                        price: m.price,
                        features: m.features?.split(',') || []
                    }));
                    context += `\n\nProduct Metadata:\n${JSON.stringify(metadata, null, 2)}`;
                }
            } else {
                context = 'No relevant products found.';
            }

            const messages = [
                { role: "system", content: `You are a product catalog assistant. Your role is to help users find and understand product information from our catalog. When responding:

1. For product searches:
   - Compare relevant features and specifications
   - Highlight key differences
   - Suggest alternatives when appropriate
   - Include prices and categories

2. For recommendations:
   - Consider user requirements
   - Explain your reasoning
   - Highlight key features that match their needs
   - Suggest alternatives in different price ranges

3. For technical questions:
   - Explain specifications in user-friendly terms
   - Compare with industry standards
   - Highlight unique features

4. Format your responses clearly:
   - Use bullet points for features
   - Use tables for comparisons
   - Include prices and categories
   - Highlight key specifications

Always base your responses on the provided product context. If information is missing or unclear, say so.` },
                ...chatHistory,
                { role: "user", content: `Context: ${context}\n\nQuery: ${query}` }
            ] as OpenAI.Chat.ChatCompletionMessageParam[];

            const completion = await this.openai.chat.completions.create({
                model: config.openai.chatModel,
                messages,
                temperature: 0.7
            });

            const response = completion.choices[0].message.content || '';
            
            // Determine response format
            let format: 'text' | 'json' | 'table' | 'graph' = 'text';
            if (response.startsWith('{') || response.startsWith('[')) {
                format = 'json';
            } else if (response.toLowerCase().includes('table')) {
                format = 'table';
            } else if (response.toLowerCase().includes('graph')) {
                format = 'graph';
            }

            return {
                isValid: true,
                response,
                format
            };
        } catch (error) {
            console.error('Error processing query:', error);
            if (error instanceof Error) {
                console.error('Error details:', error.message);
                if ('cause' in error) {
                    console.error('Error cause:', error.cause);
                }
            }
            return {
                isValid: false,
                response: "Sorry, there was an error processing your query. Please try again.",
                format: 'text'
            };
        }
    }
}

export const agent = AgentService.getInstance();