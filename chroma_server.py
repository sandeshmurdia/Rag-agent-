import chromadb
import uvicorn

# Create a client with persistence
client = chromadb.PersistentClient(path="./data/chromadb")

# The server will be started on http://localhost:8000
if __name__ == "__main__":
    uvicorn.run(
        "chromadb.app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )