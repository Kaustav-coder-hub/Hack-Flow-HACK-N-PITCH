from flask import Flask, render_template, send_from_directory, jsonify
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

# Firestore setup
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
	cred = credentials.Certificate('HackFlow-Dashboard_serviceAccountKey.json')
	firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/')
def dashboard():
	return render_template('index.html')

# Serve static files (CSS, JS)
@app.route('/static/<path:filename>')
def static_files(filename):
	return send_from_directory(app.static_folder, filename)

# API endpoints for dynamic data
@app.route('/api/participants')
def api_participants():
	docs = db.collection('participants').stream()
	data = [doc.to_dict() for doc in docs]
	return jsonify(data)

@app.route('/api/teams')
def api_teams():
	docs = db.collection('teams').stream()
	data = [doc.to_dict() for doc in docs]
	return jsonify(data)

@app.route('/api/projects')
def api_projects():
	docs = db.collection('projects').stream()
	data = [doc.to_dict() for doc in docs]
	return jsonify(data)

@app.route('/api/mentors')
def api_mentors():
	docs = db.collection('mentors').stream()
	data = [doc.to_dict() for doc in docs]
	return jsonify(data)

@app.route('/api/judges')
def api_judges():
	docs = db.collection('judges').stream()
	data = [doc.to_dict() for doc in docs]
	return jsonify(data)

if __name__ == '__main__':
	app.run(debug=True, host='0.0.0.0', port=5000)
