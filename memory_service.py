import chromadb
from chromadb.utils import embedding_functions
import os
from datetime import datetime

class SportsMemory:
    def __init__(self):
        # Initialize persistent ChromaDB client
        self.client = chromadb.PersistentClient(path="./chroma_db")
        
        # Using default embedding function (sentence-transformers)
        self.embed_fn = embedding_functions.DefaultEmbeddingFunction()
        
        self.collection = self.client.get_or_create_collection(
            name="cricket_intelligence",
            embedding_function=self.embed_fn
        )

    def store_match_fact(self, content, metadata=None):
        """Stores a sports fact or match result into vector memory."""
        doc_id = f"fact_{datetime.now().timestamp()}"
        self.collection.add(
            documents=[content],
            metadatas=[metadata or {"type": "match_fact"}],
            ids=[doc_id]
        )
        return doc_id

    def query_memory(self, query_text, n_results=3):
        """Retrieves relevant historical context from vector memory."""
        try:
            results = self.collection.query(
                query_texts=[query_text],
                n_results=n_results
            )
            return results['documents'][0] if results['documents'] else []
        except Exception as e:
            print(f"Memory Query Error: {e}")
            return []

# Singleton instance
memory_service = SportsMemory()
