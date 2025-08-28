import { ChromaClient, Collection } from 'chromadb';
import { OpenAIEmbeddingFunction } from 'chromadb';
import { config } from './config';

let chromaClient: ChromaClient | null = null;
let embeddingFunction: OpenAIEmbeddingFunction | null = null;

function getChromaClient(): ChromaClient {
    if (!chromaClient) {
        chromaClient = new ChromaClient({
            path: config.chroma.url
        });
    }
    return chromaClient;
}

function getEmbeddingFunction(): OpenAIEmbeddingFunction {
    if (!embeddingFunction) {
        embeddingFunction = new OpenAIEmbeddingFunction({
            openai_api_key: config.openai.apiKey,
            openai_model: config.embedding.model
        });
    }
    return embeddingFunction;
}

export async function getOrCreateCollection(collectionName: string): Promise<Collection> {
    const client = getChromaClient();
    const embedFn = getEmbeddingFunction();

    let collection: Collection;

    try {
        // Try to get existing collection
        collection = await client.getCollection({
            name: collectionName,
            embeddingFunction: embedFn
        });
        console.log('Using existing collection:', collectionName);
    } catch (error) {
        // Create new collection if it doesn't exist
        console.log('Creating new collection:', collectionName);
        collection = await client.createCollection({
            name: collectionName,
            embeddingFunction: embedFn,
            metadata: { "hnsw:space": "cosine" }
        });
    }

    return collection;
}

export async function resetCollection(collectionName: string): Promise<Collection> {
    const client = getChromaClient();
    const embedFn = getEmbeddingFunction();
    
    try {
        await client.deleteCollection({ name: collectionName });
        console.log(`Deleted existing collection: ${collectionName}`);
    } catch (error) {
        console.log(`No existing collection to delete: ${collectionName}`);
    }

    // Create new collection with embedding function
    console.log(`Creating new collection: ${collectionName}`);
    return await client.createCollection({
        name: collectionName,
        embeddingFunction: embedFn,
        metadata: { "hnsw:space": "cosine" }
    });
}