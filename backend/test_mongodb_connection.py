import os
import sys

# Ensure root directory is on python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.config import settings

def test_mongo():
    print("=" * 60)
    print("APEX PLACEMENT PORTAL - MONGODB ATLAS CONNECTION TEST")
    print("=" * 60)
    
    uri = settings.MONGODB_URI or os.getenv("MONGODB_URI", "")
    db_name = settings.MONGODB_DB_NAME or os.getenv("MONGODB_DB_NAME", "placement_portal")
    
    if not uri:
        print("[!] No MONGODB_URI found in .env file or environment.")
        print("[*] To connect to MongoDB Atlas, add your connection string to the .env file:")
        print("    MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority")
        print("\n[OK] System is currently running with zero-config local persistence.")
        print("=" * 60)
        return False
        
    try:
        from pymongo import MongoClient
        print(f"[*] Attempting to connect to MongoDB Atlas...")
        print(f"[*] Target Database: {db_name}")
        
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        # Test connection
        client.admin.command('ping')
        print("[OK] Ping successful! Connected to MongoDB Atlas cluster.")
        
        db = client[db_name]
        collections = db.list_collection_names()
        print(f"[OK] Available collections in '{db_name}': {collections}")
        
        for col_name in ["users", "students", "drives", "applications", "notifications"]:
            count = db[col_name].count_documents({}) if col_name in collections else 0
            print(f"    - {col_name}: {count} documents")
            
        print("=" * 60)
        print("MONGODB ATLAS INTEGRATION VERIFIED & READY!")
        print("=" * 60)
        return True
    except Exception as e:
        print(f"\n[ERROR] MongoDB Atlas Connection Error: {e}")
        print("[!] Please check your Atlas IP Whitelist (0.0.0.0/0) and username/password in .env.")
        print("=" * 60)
        return False

if __name__ == "__main__":
    test_mongo()
