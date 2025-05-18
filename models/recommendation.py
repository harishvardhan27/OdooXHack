import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class EventRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.event_matrix = None
        self.event_ids = []
        
    def train(self, events):
        """Train the recommender with event data"""
        texts = [f"{e['title']} {e['category']} {e['description']}" for e in events]
        self.event_matrix = self.vectorizer.fit_transform(texts)
        self.event_ids = [e['id'] for e in events]
        
    def recommend(self, user_profile, top_n=5):
        """
        Recommend events based on user profile
        user_profile: string containing user's interests/preferences
        """
        if not self.event_matrix:
            return []
            
        user_vec = self.vectorizer.transform([user_profile])
        similarities = cosine_similarity(user_vec, self.event_matrix).flatten()
        top_indices = np.argsort(similarities)[-top_n:][::-1]
        
        return [self.event_ids[i] for i in top_indices]
        
    def save_model(self, filepath):
        """Save trained model to file"""
        with open(filepath, 'wb') as f:
            pickle.dump({
                'vectorizer': self.vectorizer,
                'event_matrix': self.event_matrix,
                'event_ids': self.event_ids
            }, f)
            
    def load_model(self, filepath):
        """Load trained model from file"""
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
            self.vectorizer = data['vectorizer']
            self.event_matrix = data['event_matrix']
            self.event_ids = data['event_ids']