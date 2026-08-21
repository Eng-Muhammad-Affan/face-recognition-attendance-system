import insightface
import cv2
import numpy as np
from fastapi import UploadFile
from typing import Optional, Tuple
import logging
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

class FaceService:
    def __init__(self):
        """Initialize InsightFace model for face detection and recognition"""
        logger.info("Initializing FaceService with buffalo_m model")
        self.model = insightface.app.FaceAnalysis(name='buffalo_m')
        self.model.prepare(ctx_id=0, det_size=(640, 640))
        logger.info("FaceService initialized successfully")
    
    # ============ CORE PRIVATE METHODS (Internal Use Only) ============
    
    def _decode_image(self, file: UploadFile) -> Optional[np.ndarray]:
        """Decode uploaded file to OpenCV image format."""
        image_bytes = file.file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            logger.error("Failed to decode image")
            return None
        
        logger.info(f"Image decoded successfully. Shape: {img.shape}")
        return img
    
    def _get_single_face(self, img: np.ndarray) -> Tuple[np.ndarray, dict]:
        """Detect exactly one face in the image."""
        logger.info("Detecting faces in image...")
        faces = self.model.get(img)
        logger.info(f"Number of faces detected: {len(faces)}")
        
        if len(faces) == 0:
            logger.error("No face detected in the image")
            raise ValueError("No face detected in the image")
        
        if len(faces) > 1:
            logger.error(f"Multiple faces detected: {len(faces)}")
            raise ValueError(f"Multiple faces detected ({len(faces)} faces). Please provide an image with exactly one face.")
        
        face = faces[0]
        
        # CRITICAL LOGS - Check if embedding exists
        logger.info(f"Face detected with score: {face.det_score if hasattr(face, 'det_score') else 'N/A'}")
        logger.info(f"Has normed_embedding: {hasattr(face, 'normed_embedding')}")
        
        if hasattr(face, 'normed_embedding'):
            logger.info(f"Embedding shape: {face.normed_embedding.shape}")
            logger.info(f"Embedding dtype: {face.normed_embedding.dtype}")
            logger.info(f"Embedding sample (first 5): {face.normed_embedding[:5]}")
            logger.info(f"Embedding min/max: {face.normed_embedding.min():.4f}/{face.normed_embedding.max():.4f}")
        else:
            logger.error("NO EMBEDDING FOUND! Model might not be extracting embeddings!")
        
        face_info = {
            'bbox': face.bbox.astype(int),
            'landmarks': face.landmark_2d_106 if hasattr(face, 'landmark_2d_106') else None,
            'detection_score': face.det_score if hasattr(face, 'det_score') else None
        }
        
        return face, face_info
    
    # ============ PUBLIC METHODS ============
    
    async def detect_face(self, file: UploadFile) -> dict:
        """Detect exactly one face in the uploaded image."""
        logger.info("Starting face detection...")
        img = self._decode_image(file)
        if img is None:
            raise ValueError("Invalid image file")
        
        face, face_info = self._get_single_face(img)
        cropped_face = self._crop_face(img, face_info['bbox'])
        
        logger.info("Face detection completed successfully")
        return {
            'cropped_face': cropped_face,
            'bbox': face_info['bbox'],
            'landmarks': face_info['landmarks'],
            'detection_score': face_info['detection_score']
        }
    
    async def extract_embedding(self, file: UploadFile) -> np.ndarray:
        """Extract face embedding from uploaded image."""
        logger.info("Starting embedding extraction...")
        
        # Reset file pointer before reading
        await file.seek(0)
        
        img = self._decode_image(file)
        if img is None:
            raise ValueError("Invalid image file")
        
        face, _ = self._get_single_face(img)
        
        # CRITICAL CHECK
        if not hasattr(face, 'normed_embedding'):
            logger.error("CRITICAL: No normed_embedding attribute on face object!")
            raise ValueError("Failed to extract face embedding")
        
        embedding = face.normed_embedding
        
        # Detailed embedding logs
        logger.info(f"Extracted embedding shape: {embedding.shape}")
        logger.info(f"Extracted embedding dtype: {embedding.dtype}")
        logger.info(f"Embedding norm: {np.linalg.norm(embedding):.4f}")
        logger.info(f"Embedding sample (first 10): {embedding[:10]}")
        logger.info(f"Embedding has NaN: {np.isnan(embedding).any()}")
        logger.info(f"Embedding has Inf: {np.isinf(embedding).any()}")
        
        return embedding
    
    def compare_embeddings(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Calculate cosine similarity between two embeddings."""
        logger.info("Comparing embeddings...")
        
        # Log input shapes
        logger.info(f"Embedding1 shape: {embedding1.shape}, ndim: {embedding1.ndim}")
        logger.info(f"Embedding2 shape: {embedding2.shape}, ndim: {embedding2.ndim}")
        
        # Both embeddings should be 1D (512,) from InsightFace
        # No need to reshape if they're already 1D
        
        # Calculate norms
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        logger.info(f"Norm1: {norm1:.6f}, Norm2: {norm2:.6f}")
        
        if norm1 == 0 or norm2 == 0:
            logger.error(f"Zero vector detected!")
            return 0.0
        
        # For 1D arrays, dot product gives a scalar
        if embedding1.ndim == 1 and embedding2.ndim == 1:
            similarity = np.dot(embedding1, embedding2) / (norm1 * norm2)
            logger.info(f"1D similarity: {similarity:.6f}")
            return float(similarity)
        
        # For 2D arrays, use sklearn
        if embedding1.ndim == 1:
            embedding1 = embedding1.reshape(1, -1)
        if embedding2.ndim == 1:
            embedding2 = embedding2.reshape(1, -1)
        
        similarity = cosine_similarity(embedding1, embedding2)
        result = float(similarity[0][0])
        logger.info(f"2D similarity: {result:.6f}")
        
        return result
    
    def _crop_face(self, img: np.ndarray, bbox: np.ndarray, padding: int = 10) -> np.ndarray:
        """Crop face from image using bounding box."""
        x1, y1, x2, y2 = bbox
        h, w = img.shape[:2]
        x1 = max(0, x1 - padding)
        y1 = max(0, y1 - padding)
        x2 = min(w, x2 + padding)
        y2 = min(h, y2 + padding)
        return img[y1:y2, x1:x2]
    
    def get_embedding_for_storage(self, embedding: np.ndarray) -> list:
        """Convert embedding to format suitable for database storage."""
        embedding_list = embedding.tolist()
        logger.info(f"Converting embedding to storage. Length: {len(embedding_list)}")
        logger.info(f"Storage sample (first 5): {embedding_list[:5]}")
        return embedding_list
    
    def get_embedding_from_storage(self, stored_embedding: list) -> np.ndarray:
        """Convert stored embedding back to numpy array."""
        logger.info(f"Retrieving embedding from storage. Length: {len(stored_embedding)}")
        embedding = np.array(stored_embedding)
        logger.info(f"Retrieved embedding shape: {embedding.shape}, dtype: {embedding.dtype}")
        logger.info(f"Retrieved embedding sample (first 5): {embedding[:5]}")
        logger.info(f"Retrieved embedding norm: {np.linalg.norm(embedding):.4f}")
        return embedding