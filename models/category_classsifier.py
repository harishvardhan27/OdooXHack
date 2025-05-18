from transformers import pipeline
from typing import Dict

class CategoryClassifier:
    def __init__(self):
        self.classifier = pipeline(
            "text-classification", 
            model="bert-base-uncased",
            top_k=None
        )
        self.category_map = {
            'LABEL_0': 'sports',
            'LABEL_1': 'music',
            'LABEL_2': 'food',
            'LABEL_3': 'art',
            'LABEL_4': 'education',
            'LABEL_5': 'community'
        }
        
    def predict_category(self, text: str) -> Dict:
        """Predict the most likely category for the input text"""
        results = self.classifier(text)
        if not results or not isinstance(results, list):
            return {'category': 'other', 'confidence': 0}
            
        # Get top result
        top_result = results[0][0]
        return {
            'category': self.category_map.get(top_result['label'], 'other'),
            'confidence': top_result['score']
        }
        
    def predict_categories(self, text: str) -> Dict:
        """Return all possible categories with confidence scores"""
        results = self.classifier(text)
        if not results or not isinstance(results, list):
            return {}
            
        return {
            self.category_map.get(item['label'], 'other'): item['score']
            for item in results[0]
        }