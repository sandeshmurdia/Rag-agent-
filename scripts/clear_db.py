import chromadb
from chromadb.config import Settings

def clear_database():
    print("Connecting to ChromaDB...")
    client = chromadb.HttpClient(
        host="localhost",
        port=8000,
        settings=Settings(anonymized_telemetry=False)
    )

    print("\nGetting all collections...")
    collections = client.list_collections()
    
    if not collections:
        print("No collections found in ChromaDB.")
        return

    print(f"\nFound {len(collections)} collection(s):")
    for collection in collections:
        print(f"- {collection.name}")

    print("\nDeleting collections...")
    success_count = 0
    failure_count = 0

    for collection in collections:
        try:
            print(f"Deleting collection: {collection.name}")
            client.delete_collection(collection.name)
            print(f"✓ Deleted collection: {collection.name}")
            success_count += 1
        except Exception as e:
            print(f"Failed to delete collection {collection.name}: {str(e)}")
            failure_count += 1

    # Final status report
    print("\nDeletion Summary:")
    print(f"- Total collections: {len(collections)}")
    print(f"- Successfully deleted: {success_count}")
    print(f"- Failed to delete: {failure_count}")

    # Verify deletion
    remaining = client.list_collections()
    if not remaining:
        print("\n✨ Successfully cleared all data from ChromaDB!")
    else:
        print("\n⚠️ Warning: Some collections still exist:")
        for collection in remaining:
            print(f"- {collection.name}")
        print("\nYou may need to manually delete these collections or try again.")

if __name__ == "__main__":
    try:
        clear_database()
    except Exception as e:
        print(f"\nError: {str(e)}")
        exit(1)
