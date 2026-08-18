# app/core/logger.py
import logging
import os
import sys

# Create logger
logger = logging.getLogger("ecommerce")
logger.setLevel(logging.INFO)

# Formatter
formatter = logging.Formatter("[%(asctime)s] %(levelname)s - %(message)s")

# Stream handler (console) - Vercel captures this automatically
stream_handler = logging.StreamHandler(sys.stdout)
stream_handler.setFormatter(formatter)
logger.addHandler(stream_handler)

# Add file handler with proper directory handling
try:
    from logging.handlers import RotatingFileHandler
    
    # Determine log directory based on environment
    is_serverless = (
        os.environ.get('VERCEL') == '1' or
        os.environ.get('VERCEL_ENV') is not None or
        os.environ.get('AWS_LAMBDA_RUNTIME_API') is not None
    )
    
    if is_serverless:
        # Use /tmp in serverless environments (writable)
        log_dir = "/tmp/logs"
    else:
        # Use local logs directory in development
        log_dir = "logs"
    
    os.makedirs(log_dir, exist_ok=True)
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, "app.log"), 
        maxBytes=1000000, 
        backupCount=3
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    logger.info(f"File logging enabled at: {log_dir}")
except Exception as e:
    # Gracefully handle any errors
    logger.warning(f"File logging disabled: {str(e)}")

# Prevent duplicate log entries
logger.propagate = False