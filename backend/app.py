from flask import Flask, request, jsonify
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from flask_cors import CORS

app = Flask(__name__)

# Configurer CORS pour autoriser les requêtes de votre frontend
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    data = request.json
    text = data.get('text', '')

    # Analyse du sentiment avec VADER
    analyzer = SentimentIntensityAnalyzer()
    score = analyzer.polarity_scores(text)

    # Obtenir les trois premiers résultats
    first_three = list(score.items())[:3]

    # Trouver la clé avec la valeur maximale
    max_key = max(first_three, key=lambda x: x[1])[0]

    print(f"Dominant Sentiment: {max_key}")

    # Retourner les résultats en JSON
    return jsonify({
        "sentiment_score": score,
        "dominant_sentiment": max_key
    })


if __name__ == '__main__':
    app.run(debug=True)
