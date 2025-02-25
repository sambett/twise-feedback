# api/analyze.py
from http.server import BaseHTTPRequestHandler
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import json

def analyze_text(text):
    analyzer = SentimentIntensityAnalyzer()
    scores = analyzer.polarity_scores(text)
    
    # Determine dominant sentiment
    if scores['compound'] >= 0.05:
        dominant = "pos"
    elif scores['compound'] <= -0.05:
        dominant = "neg"
    else:
        dominant = "neu"
    
    return {
        "sentiment_score": scores,
        "dominant_sentiment": dominant
    }

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        text = data.get('text', '')
        
        result = analyze_text(text)
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())
        
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()