from sqlalchemy import text

def enable_pgvector_extension(engine):
    with engine.connect() as conn:
        # Check if extension exists
        result = conn.execute(text("SELECT 1 FROM pg_extension WHERE extname = 'vector'"))
        exists = result.scalar() is not None
        
        if not exists:
            conn.execute(text("CREATE EXTENSION vector"))
            conn.commit()
            print("✅ pgvector extension enabled")
        else:
            print("✅ pgvector extension already exists")

