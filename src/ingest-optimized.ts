import { promises as fs } from 'fs';
import { config } from './config';
import { getEmbeddings } from './embeddings';
import { getOrCreateCollection, upsertDocuments, Document } from './chroma';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  features: string[];
  specifications: Record<string, string | number>;
}

interface ProductChunk {
  id: string;
  text: string;
  metadata: {
    productId: number;
    category: string;
    price: number;
    features: string[];
    specifications: Record<string, string | number>;
    processedAt: string;
  };
}

// ============================================================================
// CHUNKING FUNCTIONS
// ============================================================================

/**
 * Create chunks from optimized events
 */
function createChunksFromProducts(
  products: Product[],
  maxChunkSize: number = 1000
): ProductChunk[] {
  console.log(`Creating chunks from ${products.length} products...`);
  
  // For product data, we'll create one chunk per product since each product
  // is a self-contained unit that shouldn't be split
  const chunks: ProductChunk[] = products.map((product, index) => {
    return createChunkFromProduct(product, index);
  });
  
  console.log(`Created ${chunks.length} chunks from products`);
  return chunks;
}

/**
 * Create text representation of an event
 */
function createProductText(product: Product): string {
  const parts: string[] = [];
  
  // Add basic product information
  parts.push(`Title: ${product.title}`);
  parts.push(`Description: ${product.description}`);
  parts.push(`Category: ${product.category}`);
  parts.push(`Price: $${product.price}`);
  
  // Add features
  if (product.features && product.features.length > 0) {
    parts.push(`Features: ${product.features.join(', ')}`);
  }
  
  // Add specifications
  if (product.specifications) {
    const specs = Object.entries(product.specifications)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    parts.push(`Specifications: ${specs}`);
  }
  
  return parts.join('\n');
}

/**
 * Create a chunk from a group of events
 */
function createChunkFromProduct(
  product: Product,
  chunkIndex: number
): ProductChunk {
  // Create chunk text
  const chunkText = createProductText(product);
  
  // Create chunk ID
  const chunkId = `product_${product.id}_chunk_${chunkIndex}`;
  
  // Create metadata
  const metadata = {
    productId: product.id,
    category: product.category,
    price: product.price,
    features: product.features,
    specifications: product.specifications,
    processedAt: new Date().toISOString(),
  };
  
  return {
    id: chunkId,
    text: chunkText,
    metadata
  };
}

// ============================================================================
// MAIN INGESTION FUNCTION
// ============================================================================

/**
 * Ingest optimized rrwebEvents file
 */
async function ingestProductsFile(filePath: string): Promise<void> {
  try {
    console.log(`\n🚀 Starting ingestion of products file: ${filePath}`);
    
    // Read and parse the products file
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const fileSize = Buffer.byteLength(fileContent, 'utf8');
    console.log(`File size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
    
    const data = JSON.parse(fileContent);
    
    if (!data.optimizedEvents || !Array.isArray(data.optimizedEvents)) {
      throw new Error('Invalid file format: optimizedEvents array not found');
    }
    
    const products: Product[] = data.optimizedEvents;
    console.log(`Total products: ${products.length}`);
    console.log(`Optimized at: ${data.optimizedAt}`);
    
    // Create chunks from products
    const chunks = createChunksFromProducts(products);
    
    if (chunks.length === 0) {
      throw new Error('No chunks created from products');
    }
    
    console.log(`Created ${chunks.length} chunks`);
    
    // Get embeddings for chunks
    const chunkTexts = chunks.map(chunk => chunk.text);
    const embeddings = await getEmbeddings(chunkTexts);
    
    if (embeddings.length !== chunks.length) {
      throw new Error(`Embedding count mismatch: ${embeddings.length} vs ${chunks.length} chunks`);
    }
    
    // Prepare documents for ChromaDB
    const documents: Document[] = chunks.map((chunk, index) => ({
      id: chunk.id,
      text: chunk.text,
      metadata: {
        productId: chunk.metadata.productId,
        category: chunk.metadata.category,
        price: chunk.metadata.price,
        features: chunk.metadata.features.join(','),
        specifications: JSON.stringify(chunk.metadata.specifications),
        source: filePath,
        embeddingProvider: config.embedding.provider,
        embeddingModel: config.embedding.model,
        processedAt: chunk.metadata.processedAt,
      },
      embedding: embeddings[index],
    }));
    
    // Get or create collection and upsert documents
    console.log(`Connecting to ChromaDB collection: ${config.chroma.collection}`);
    const collection = await getOrCreateCollection(config.chroma.collection);
    
    await upsertDocuments(collection, documents);
    
    // Print final statistics
    console.log('\n=== Products File Ingestion Complete ===');
    console.log(`File: ${filePath}`);
    console.log(`File size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Products processed: ${products.length}`);
    console.log(`Chunks created: ${chunks.length}`);
    console.log(`Collection: ${config.chroma.collection}`);
    console.log(`Embedding provider: ${config.embedding.provider}`);
    console.log(`Embedding model: ${config.embedding.model}`);
    
    // Print chunk statistics
    const avgTokens = chunks.reduce((sum: number, chunk) => sum + Math.ceil(chunk.text.length / 4), 0) / chunks.length;
    console.log(`Average tokens per chunk: ${avgTokens.toFixed(0)}`);
    
    console.log('========================\n');
    
  } catch (error) {
    console.error('Ingestion failed:', error);
    process.exit(1);
  }
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: npm run ingest-products <path-to-products.json>');
    console.error('Example: npm run ingest-products ./products.json');
    process.exit(1);
  }
  
  const filePath = args[0];
  if (!filePath.endsWith('.json')) {
    console.error('Error: File must be a JSON file');
    process.exit(1);
  }
  
  await ingestProductsFile(filePath);
}

// Run if called directly
if (require.main === module) {
  main();
}

export { ingestProductsFile, createChunksFromProducts };
