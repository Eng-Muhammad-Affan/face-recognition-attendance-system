import insightface
import cv2
import numpy as np
from fastapi import UploadFile
from typing import Optional, List, Union
import logging

logger = logging.getLogger(__name__)

class FaceExtractor:
    def __init__(self):
        # Initialize InsightFace model
        self.model = insightface.app.FaceAnalysis(name='buffalo_m')
        self.model.prepare(ctx_id=0, det_size=(640, 640))
    
    async def extract_faces(self, file: UploadFile) -> List[np.ndarray]:
        """Extract all faces from uploaded image as cropped images"""
        
        # Read the uploaded file
        image_bytes = await file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return []
        
        # Detect faces
        faces = self.model.get(img)
        
        if len(faces) == 0:
            return []
        elif len(faces) > 1:
            # ✅ Raise exception instead of returning string
            raise ValueError("Too many faces detected")
        
        # Extract each face as a cropped image
        cropped_faces = []
        for face in faces:
            # Get bounding box coordinates
            bbox = face.bbox.astype(int)  # [x1, y1, x2, y2]
            x1, y1, x2, y2 = bbox
            
            # Add some padding (optional)
            padding = 10
            x1 = max(0, x1 - padding)
            y1 = max(0, y1 - padding)
            x2 = min(img.shape[1], x2 + padding)
            y2 = min(img.shape[0], y2 + padding)
            
            # Crop the face
            cropped_face = img[y1:y2, x1:x2]
            cropped_faces.append(cropped_face)
        
        return cropped_faces
    
    async def extract_embedding(self, file: UploadFile) -> Optional[np.ndarray]:
        """Extract face embedding (512-dim vector) from uploaded image"""
        
        # Read and decode image
        image_bytes = await file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return None
        
        # Detect faces
        faces = self.model.get(img)
        
        if len(faces) == 0:
            logger.warning("No face detected in image")
            return None
        elif len(faces) > 1:
            raise ValueError("Too many faces detected")
        
        # ✅ Get the embedding (1D vector of shape 512)
        face = faces[0]
        embedding = face.normed_embedding  # numpy array of shape (512,)
        
        logger.info(f"Extracted embedding with shape: {embedding.shape}")
        return embedding
    
    async def extract_single_face(self, file: UploadFile) -> Optional[np.ndarray]:
        """Extract the first detected face only (cropped image)"""
        
        faces = await self.extract_faces(file)
        return faces[0] if faces else None
    
    async def extract_single_face_with_embedding(self, file: UploadFile) -> dict:
        """Extract both cropped face and embedding"""
        
        # Read image once
        image_bytes = await file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return None
        
        # Detect faces
        faces = self.model.get(img)
        
        if len(faces) == 0:
            return None
        elif len(faces) > 1:
            raise ValueError("Too many faces detected")
        
        face = faces[0]
        
        # Get embedding
        embedding = face.normed_embedding
        
        # Get cropped face
        bbox = face.bbox.astype(int)
        x1, y1, x2, y2 = bbox
        padding = 10
        x1 = max(0, x1 - padding)
        y1 = max(0, y1 - padding)
        x2 = min(img.shape[1], x2 + padding)
        y2 = min(img.shape[0], y2 + padding)
        cropped_face = img[y1:y2, x1:x2]
        
        return {
            'embedding': embedding,      # Shape (512,)
            'cropped_face': cropped_face,  # Shape (H, W, 3)
            'bbox': bbox,
        }
    
    def extract_faces_from_bytes(self, image_bytes: bytes) -> List[np.ndarray]:
        """Extract faces from bytes without async"""
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return []
        
        faces = self.model.get(img)
        
        if len(faces) == 0:
            return []
        
        cropped_faces = []
        for face in faces:
            bbox = face.bbox.astype(int)
            x1, y1, x2, y2 = bbox
            
            # Add padding
            padding = 10
            x1 = max(0, x1 - padding)
            y1 = max(0, y1 - padding)
            x2 = min(img.shape[1], x2 + padding)
            y2 = min(img.shape[0], y2 + padding)
            
            cropped_face = img[y1:y2, x1:x2]
            cropped_faces.append(cropped_face)
        
        return cropped_faces
    
    def extract_embedding_from_bytes(self, image_bytes: bytes) -> Optional[np.ndarray]:
        """Extract embedding from bytes without async"""
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return None
        
        faces = self.model.get(img)
        
        if len(faces) == 0:
            return None
        
        face = faces[0]
        return face.normed_embedding