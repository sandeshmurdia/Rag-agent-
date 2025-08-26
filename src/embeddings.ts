import OpenAI from 'openai';
import { config } from './config';

const openai = new OpenAI({
    apiKey: config.openai.apiKey
});

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
    console.log(`Getting OpenAI embeddings for ${texts.length} texts using ${config.embedding.model}...`);
    
    const embeddings: number[][] = [];
    const batchSize = 100; // OpenAI batch limit
    
    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)} (${batch.length} texts)`);
        
        try {
            const response = await openai.embeddings.create({
                model: config.embedding.model,
                input: batch,
            });
            
            const batchEmbeddings = response.data.map(item => item.embedding);
            embeddings.push(...batchEmbeddings);
            
            console.log(`Successfully generated ${batchEmbeddings.length} embeddings`);
        } catch (error) {
            console.error(`Error generating embeddings for batch ${Math.floor(i / batchSize) + 1}:`, error);
            throw error;
        }
    }
    
    return embeddings;
}

export async function getEmbedding(text: string): Promise<number[]> {
    const embeddings = await getEmbeddings([text]);
    return embeddings[0];
}