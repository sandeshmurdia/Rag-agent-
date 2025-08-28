import { ChromaClient } from 'chromadb';
import { config } from '../src/config';

interface ChromaCollection {
    name: string;
    metadata?: Record<string, any>;
}

async function clearChromaDB() {
    try {
        console.log('Connecting to ChromaDB...');
        const client = new ChromaClient({
            path: config.chroma.url
        });

        console.log('Getting all collections...');
        // Get collections and ensure we have the correct type
        const collections: ChromaCollection[] = await client.listCollections();
        
        if (collections.length === 0) {
            console.log('No collections found in ChromaDB.');
            return;
        }

        // Filter out any collections with undefined names
        const validCollections = collections.filter(col => col.name);

        console.log(`Found ${validCollections.length} collection(s):`);
        for (const collection of validCollections) {
            console.log(`- ${collection.name}`);
        }

        console.log('\nDeleting collections...');
        let successCount = 0;
        let failureCount = 0;

        for (const collection of validCollections) {
            try {
                console.log(`Deleting collection: ${collection.name}`);
                await client.deleteCollection({
                    name: collection.name
                });
                console.log(`✓ Deleted collection: ${collection.name}`);
                successCount++;
            } catch (error) {
                console.error(`Failed to delete collection ${collection.name}:`, error);
                failureCount++;
            }
        }

        // Final status report
        console.log('\nDeletion Summary:');
        console.log(`- Total collections: ${validCollections.length}`);
        console.log(`- Successfully deleted: ${successCount}`);
        console.log(`- Failed to delete: ${failureCount}`);

        // Verify deletion
        const remainingCollections = await client.listCollections();
        if (remainingCollections.length === 0) {
            console.log('\n✨ Successfully cleared all data from ChromaDB!');
        } else {
            console.log('\n⚠️ Warning: Some collections still exist:');
            for (const collection of remainingCollections) {
                if (collection.name) {
                    console.log(`- ${collection.name}`);
                }
            }
            console.log('\nYou may need to manually delete these collections or try again.');
        }
    } catch (error) {
        console.error('Error clearing ChromaDB:', error);
        process.exit(1);
    }
}

// Run the script
clearChromaDB();