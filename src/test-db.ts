import { vectorDb } from './services/vectorDb.js';
import { sampleProducts } from './data/products.js';

async function testChromaDB() {
    try {
        // Delete existing collection if it exists
        const client = await vectorDb.getClient();
        try {
            await client.deleteCollection({
                name: "products"
            });
            console.log('Deleted existing collection');
        } catch (error) {
            // Ignore error if collection doesn't exist
        }

        console.log('Initializing ChromaDB...');
        await vectorDb.initialize();

        console.log('Adding sample products...');
        await vectorDb.addProducts(sampleProducts);

        console.log('Testing query...');
        const results = await vectorDb.queryProducts('laptop with 16GB RAM');
        console.log('Query results:', JSON.stringify(results, null, 2));

        console.log('ChromaDB test completed successfully!');
    } catch (error) {
        console.error('Error testing ChromaDB:', error);
    }
}

testChromaDB();