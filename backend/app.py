from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import datetime
import json
import random
import re

app = Flask(__name__)
CORS(app)

DATABASE = 'nuit_chercheurs.db'

def get_db():
    """Connexion à la base de données"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialise la base de données avec des données d'exemple"""
    conn = get_db()
    c = conn.cursor()
    
    # Créer les tables
    c.execute('''DROP TABLE IF EXISTS feedback''')
    c.execute('''CREATE TABLE feedback
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  activity TEXT NOT NULL,
                  comment TEXT,
                  rating INTEGER NOT NULL,
                  sentiment TEXT NOT NULL,
                  timestamp DATETIME NOT NULL,
                  qr_code TEXT)''')
    
    # Données d'exemple pour la démo
    sample_data = [
        ('Robotique', 'Excellent atelier, très interactif! Les robots étaient impressionnants.', 9, 'positive', datetime.datetime.now().isoformat(), 'QR001'),
        ('Astronomie', 'Présentation claire et passionnante sur les exoplanètes.', 8, 'positive', datetime.datetime.now().isoformat(), 'QR002'),
        ('Biotechnologie', 'Un peu complexe mais très enrichissant.', 6, 'neutral', datetime.datetime.now().isoformat(), 'QR003'),
        ('IA & Machine Learning', 'Excellente démonstration de ChatGPT!', 9, 'positive', datetime.datetime.now().isoformat(), 'QR004'),
        ('Robotique', 'Les enfants ont adoré programmer le robot.', 10, 'positive', datetime.datetime.now().isoformat(), 'QR001'),
        ('Astronomie', 'Télescope fascinant, on a vu Saturne!', 8, 'positive', datetime.datetime.now().isoformat(), 'QR002'),
        ('Biotechnologie', 'Expérience avec l\'ADN très intéressante.', 7, 'positive', datetime.datetime.now().isoformat(), 'QR003'),
    ]
    
    c.executemany('INSERT INTO feedback (activity, comment, rating, sentiment, timestamp, qr_code) VALUES (?, ?, ?, ?, ?, ?)', sample_data)
    conn.commit()
    conn.close()
    print("✅ Base de données initialisée avec des données d'exemple")

def analyze_sentiment_french(text, rating):
    """Analyse des sentiments adaptée au français"""
    if not text:
        text = ""
    
    positive_words = ['excellent', 'génial', 'super', 'fantastique', 'parfait', 'impressionnant', 
                     'intéressant', 'passionnant', 'merveilleux', 'extraordinaire', 'bien', 
                     'bonne', 'bon', 'cool', 'top', 'formidable', 'adoré', 'fascinant']
    
    negative_words = ['mauvais', 'nul', 'ennuyeux', 'décevant', 'difficile', 'complexe', 
                     'confus', 'incompréhensible', 'fade', 'pas terrible', 'décevant']
    
    neutral_words = ['correct', 'moyen', 'standard', 'ordinaire', 'quelconque']
    
    text_lower = text.lower()
    
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    # Combinaison texte + note
    if positive_count > negative_count or rating >= 8:
        return 'positive'
    elif negative_count > positive_count or rating <= 4:
        return 'negative'
    else:
        return 'neutral'

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """Endpoint pour soumettre un retour d'activité"""
    try:
        data = request.json
        
        activity = data.get('activity', '')
        comment = data.get('comment', '')
        rating = data.get('rating', 5)
        qr_code = data.get('qr_code', '')
        
        # Analyse des sentiments
        sentiment = analyze_sentiment_french(comment, rating)
        
        # Sauvegarde en base
        conn = get_db()
        c = conn.cursor()
        
        c.execute('''INSERT INTO feedback 
                     (activity, comment, rating, sentiment, timestamp, qr_code)
                     VALUES (?, ?, ?, ?, ?, ?)''',
                  (activity, comment, rating, sentiment, 
                   datetime.datetime.now().isoformat(), qr_code))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'sentiment': sentiment,
            'message': 'Retour enregistré avec succès'
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    """Endpoint pour récupérer les données du dashboard"""
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Statistiques générales
        c.execute('SELECT COUNT(*) FROM feedback')
        total_feedback = c.fetchone()[0]
        
        # Calcul de la satisfaction moyenne
        c.execute('SELECT AVG(rating) FROM feedback')
        avg_rating = c.fetchone()[0] or 8.5
        satisfaction_rate = round(avg_rating * 10, 1)  # Convertir sur 100
        
        # Répartition des sentiments
        c.execute('''SELECT sentiment, COUNT(*) 
                     FROM feedback 
                     GROUP BY sentiment''')
        sentiment_data = c.fetchall()
        
        sentiment_stats = {'positive': 0, 'neutral': 0, 'negative': 0}
        for row in sentiment_data:
            sentiment_stats[row[0]] = row[1]
        
        # Calcul des pourcentages
        total_sentiments = sum(sentiment_stats.values())
        if total_sentiments > 0:
            sentiment_percentages = {
                k: round((v / total_sentiments) * 100, 1) 
                for k, v in sentiment_stats.items()
            }
        else:
            sentiment_percentages = {'positive': 65, 'neutral': 25, 'negative': 10}
        
        # Activités les plus appréciées
        c.execute('''SELECT activity, 
                            COUNT(*) as participants,
                            AVG(rating) as avg_satisfaction
                     FROM feedback 
                     GROUP BY activity 
                     ORDER BY avg_satisfaction DESC''')
        
        top_activities = []
        for row in c.fetchall():
            top_activities.append({
                'name': row[0],
                'participants': row[1],
                'satisfaction': round(row[2], 1)
            })
        
        # Retours récents
        c.execute('''SELECT activity, comment, sentiment, timestamp 
                     FROM feedback 
                     WHERE comment IS NOT NULL AND comment != ''
                     ORDER BY timestamp DESC 
                     LIMIT 10''')
        
        recent_feedback = []
        for row in c.fetchall():
            try:
                timestamp = datetime.datetime.fromisoformat(row[3])
                time_str = timestamp.strftime('%H:%M')
            except:
                time_str = '00:00'
                
            recent_feedback.append({
                'id': len(recent_feedback) + 1,
                'activity': row[0],
                'comment': row[1],
                'sentiment': row[2],
                'time': time_str
            })
        
        conn.close()
        
        return jsonify({
            'totalParticipants': total_feedback + 50,  # Base de participants
            'satisfactionRate': satisfaction_rate,
            'sentiment': sentiment_percentages,
            'topActivities': top_activities,
            'recentFeedback': recent_feedback[:5]  # Limiter à 5 retours récents
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/simulate', methods=['POST'])
def simulate_feedback():
    """Endpoint pour simuler des retours en temps réel (pour la démo)"""
    try:
        activities = ['Robotique', 'Astronomie', 'Biotechnologie', 'IA & Machine Learning']
        comments = [
            'Absolument fantastique! Les robots étaient impressionnants.',
            'Présentation très claire sur les exoplanètes.',
            'Un peu complexe mais très enrichissant pour la science.',
            'Excellente démonstration de l\'intelligence artificielle!',
            'Les enfants ont adoré programmer le robot.',
            'Télescope fascinant, on a pu voir les anneaux de Saturne!',
            'Expérience avec l\'ADN très intéressante.',
            'Super atelier, très interactif et pédagogique.',
            'Démonstration époustouflante de la robotique moderne.',
            'Astronomie expliquée de façon passionnante.'
        ]
        
        activity = random.choice(activities)
        comment = random.choice(comments)
        rating = random.randint(7, 10)  # Notes plutôt positives
        qr_code = f'QR{random.randint(1,4):03d}'
        
        # Utiliser l'endpoint de soumission existant
        feedback_data = {
            'activity': activity,
            'comment': comment,
            'rating': rating,
            'qr_code': qr_code
        }
        
        # Sauvegarde directe
        sentiment = analyze_sentiment_french(comment, rating)
        conn = get_db()
        c = conn.cursor()
        
        c.execute('''INSERT INTO feedback 
                     (activity, comment, rating, sentiment, timestamp, qr_code)
                     VALUES (?, ?, ?, ?, ?, ?)''',
                  (activity, comment, rating, sentiment, 
                   datetime.datetime.now().isoformat(), qr_code))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'simulated': True,
            'data': feedback_data,
            'sentiment': sentiment
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/activities', methods=['GET'])
def get_activities():
    """Liste des activités disponibles"""
    activities = [
        {'id': 'QR001', 'name': 'Robotique', 'description': 'Programmation et démonstration de robots'},
        {'id': 'QR002', 'name': 'Astronomie', 'description': 'Observation des étoiles et planètes'},
        {'id': 'QR003', 'name': 'Biotechnologie', 'description': 'Expériences avec l\'ADN et les cellules'},
        {'id': 'QR004', 'name': 'IA & Machine Learning', 'description': 'Intelligence artificielle et apprentissage automatique'}
    ]
    
    return jsonify({'activities': activities})

@app.route('/api/stats', methods=['GET'])
def get_detailed_stats():
    """Statistiques détaillées pour les analyses"""
    try:
        conn = get_db()
        c = conn.cursor()
        
        # Stats par heure (simulation)
        hourly_stats = []
        for hour in range(10, 16):  # 10h à 15h
            c.execute('''SELECT COUNT(*), AVG(rating) 
                         FROM feedback 
                         WHERE CAST(substr(timestamp, 12, 2) AS INTEGER) = ?''', (hour,))
            result = c.fetchone()
            
            hourly_stats.append({
                'hour': f'{hour:02d}:00',
                'participants': result[0] if result[0] else 0,
                'satisfaction': round(result[1] * 10, 1) if result[1] else 85
            })
        
        # Recommandations basées sur les données
        recommendations = []
        c.execute('''SELECT activity, AVG(rating), COUNT(*) 
                     FROM feedback 
                     GROUP BY activity 
                     ORDER BY AVG(rating) DESC''')
        
        for row in c.fetchall():
            activity, avg_rating, count = row
            if avg_rating >= 9:
                recommendations.append(f"L'atelier {activity} performe excellemment - envisager d'augmenter la capacité")
            elif avg_rating < 6:
                recommendations.append(f"{activity} nécessite peut-être une approche plus accessible")
        
        if not recommendations:
            recommendations = [
                "Le sentiment général est très positif - maintenir cette dynamique",
                "Envisager d'ajouter plus d'activités interactives",
                "Excellente participation des visiteurs"
            ]
        
        conn.close()
        
        return jsonify({
            'hourlyStats': hourly_stats,
            'recommendations': recommendations
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/', methods=['GET'])
def home():
    """Page d'accueil de l'API"""
    return jsonify({
        'message': 'API Nuit des Chercheurs 2025 - Analyse des sentiments en temps réel',
        'version': '1.0.0',
        'endpoints': {
            'dashboard': '/api/dashboard',
            'feedback': '/api/feedback (POST)',
            'simulate': '/api/simulate (POST)',
            'activities': '/api/activities',
            'stats': '/api/stats'
        },
        'status': 'active'
    })

if __name__ == '__main__':
    print("🚀 Initialisation de l'API Nuit des Chercheurs 2025...")
    init_db()
    print("📊 Dashboard: http://localhost:5000/api/dashboard")
    print("📝 Feedback: POST http://localhost:5000/api/feedback")
    print("🔄 Simulation: POST http://localhost:5000/api/simulate")
    print("🎯 Prêt pour la compétition!")
    app.run(debug=True, host='0.0.0.0', port=5000)