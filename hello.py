import chromadb

# Connect to the ChromaDB server running at localhost:8000
client = chromadb.HttpClient(host="localhost", port=8000)

# List available collections
collections = client.list_collections()
print("Collections:", [c.name for c in collections])

# Pick a collection
col = client.get_collection("users_embeddings")

# Get all items (increase limit as needed)
items = col.get(limit=1000)
# print("IDs:", items.get("ids"))
# print("Documents:", items.get("documents"))
# print("Metadatas:", items.get("metadatas"))

# Fetch data by chunk ID
chunk_data = col.get(ids=["caa8a8fa-158a-4876-bd0a-a82378e9ab06-1754893761_chunk_75_1754893791434_1754893791515"], include=['documents', 'embeddings'])
print("Chunk data:", chunk_data)

# client.delete_collection("users_embeddings")

