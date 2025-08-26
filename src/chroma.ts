import { ChromaClient, Collection } from 'chromadb';
import { config } from './config';
import { getEmbeddings } from './embeddings';

let client: ChromaClient | null = null;

export async function getClient(): Promise<ChromaClient> {
    if (!client) {
        client = new ChromaClient({
            path: config.chroma.url
        });
    }
    return client;
}

export interface Document {
    id: string;
    text: string;
    metadata: Record<string, any>;
    embedding?: number[];
}

export async function getOrCreateCollection(name: string): Promise<Collection> {
    const client = await getClient();
    
    try {
        // Try to get existing collection
        const collection = await client.getCollection({
            name,
            embeddingFunction: {
                generate: async (texts: string[]) => {
                    return await getEmbeddings(texts);
                }
            }
        });
        console.log('Using existing collection:', name);
        return collection;
    } catch (error) {
        // Collection doesn't exist, create it
        const collection = await client.createCollection({
            name,
            metadata: { 
                description: "Product information and specifications",
                created_at: new Date().toISOString()
            },
            embeddingFunction: {
                generate: async (texts: string[]) => {
                    return await getEmbeddings(texts);
                }
            }
        });
        console.log('Created new collection:', name);
        return collection;
    }
}

export async function upsertDocuments(collection: Collection, documents: Document[]): Promise<void> {
    const ids = documents.map(doc => doc.id);
    const texts = documents.map(doc => doc.text);
    const metadatas = documents.map(doc => doc.metadata);
    const embeddings = documents.map(doc => doc.embedding).filter(Boolean);

    console.log(`Upserting ${documents.length} documents into collection...`);

    if (embeddings.length === documents.length) {
        // Use pre-computed embeddings
        await collection.upsert({
            ids,
            embeddings,
            metadatas,
            documents: texts
        });
    } else {
        // Let ChromaDB generate embeddings
        await collection.upsert({
            ids,
            metadatas,
            documents: texts
        });
    }

    console.log('Successfully upserted', documents.length, 'documents');
}