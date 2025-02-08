from flask import Flask, request, jsonify
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    data = request.json
    text = data.get('text', '')
    analyzer = SentimentIntensityAnalyzer()
    score = analyzer.polarity_scores(text)
    first_three = list(score.items())[:3]
    max_key = max(first_three, key=lambda x: x[1])[0]
    return jsonify({"sentiment_score": score, "dominant_sentiment": max_key})

if __name__ == '__main__':
    app.run(debug=True)
