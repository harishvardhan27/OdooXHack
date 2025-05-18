from transformers import pipeline

class DescriptionGenerator:
    def __init__(self):
        self.generator = pipeline(
            "text2text-generation",
            model="t5-small",
            max_length=130,
            min_length=30
        )
        
    def generate_description(self, prompt: str) -> str:
        """Generate an event description from a short prompt"""
        if len(prompt) < 10:
            return "Please provide more details about your event."
            
        result = self.generator(
            f"generate an event description: {prompt}",
            do_sample=False
        )
        
        return result[0]['generated_text']
        
    def enhance_description(self, description: str) -> str:
        """Enhance an existing event description"""
        if len(description) < 20:
            return self.generate_description(description)
            
        result = self.generator(
            f"improve this event description: {description}",
            do_sample=False
        )
        
        return result[0]['generated_text']