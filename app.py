from collections import Counter, defaultdict
import datetime
from flask import Flask, render_template, send_from_directory, jsonify
import os

# Firestore setup
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('HackFlow-Dashboard_serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__, static_folder='static', template_folder='templates')

# --- Analytics API ---
@app.route('/api/analytics')
def api_analytics():
    # Registration Analytics: registrations per day
    participants = [doc.to_dict() for doc in db.collection('participants').stream()]
    reg_by_day = defaultdict(int)
    track_counter = Counter()
    university_counter = Counter()
    active_participants = 0
    for p in participants:
        date = p.get('registrationDate')
        if date:
            reg_by_day[date] += 1
        track = p.get('track')
        if track:
            track_counter[track] += 1
        university = p.get('university')
        if university:
            university_counter[university] += 1
        if p.get('status') == 'Active':
            active_participants += 1

    # Sort registration dates
    reg_dates = sorted(reg_by_day.keys())
    reg_counts = [reg_by_day[d] for d in reg_dates]

    # Track Popularity
    tracks = list(track_counter.keys())
    track_counts = [track_counter[t] for t in tracks]

    # Teams and Projects
    teams = [doc.to_dict() for doc in db.collection('teams').stream()]
    projects = [doc.to_dict() for doc in db.collection('projects').stream()]
    mentors = [doc.to_dict() for doc in db.collection('mentors').stream()]

    # Engagement Metrics
    avg_team_size = round(sum(len(t.get('members', [])) for t in teams) / max(len(teams), 1), 2)
    submission_rate = round(100 * len(projects) / max(len(teams), 1), 2)
    mentor_utilization = round(100 * sum(1 for m in mentors if m.get('availability') == 'Busy') / max(len(mentors), 1), 2)
    active_part_rate = round(100 * active_participants / max(len(participants), 1), 2)

    # University Distribution
    total_universities = sum(university_counter.values())
    university_dist = [
        {"university": u, "percent": round(100 * c / total_universities, 2)}
        for u, c in university_counter.most_common(10)
    ]

    return jsonify({
        "registrationAnalytics": {
            "labels": reg_dates,
            "counts": reg_counts
        },
        "trackPopularity": {
            "tracks": tracks,
            "counts": track_counts
        },
        "engagementMetrics": {
            "avgTeamSize": avg_team_size,
            "submissionRate": submission_rate,
            "mentorUtilization": mentor_utilization,
            "activeParticipants": active_part_rate,
            "totalTeams": len(teams),
            "totalProjects": len(projects),
            "totalMentors": len(mentors),
        },
        "universityDistribution": university_dist
    })

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

@app.route('/api/tracks')
def api_tracks():
    docs = db.collection('tracks').stream()
    data = [doc.to_dict() for doc in docs]
    return jsonify(data)

@app.route('/api/timeline')
def api_timeline():
    docs = db.collection('timeline').stream()
    data = [doc.to_dict() for doc in docs]
    return jsonify(data)

@app.route('/api/public_activities')
def api_public_activities():
    docs = db.collection('public_activities').stream()
    data = [doc.to_dict() for doc in docs]
    return jsonify(data)

@app.route('/api/faq')
def api_faq():
    docs = db.collection('faq').stream()
    data = [doc.to_dict() for doc in docs]
    return jsonify(data)

@app.route('/api/admin_users')
def api_admin_users():
    docs = db.collection('admin_users').stream()
    data = [doc.to_dict() for doc in docs]
    print('DEBUG /api/admin_users:', data)
    return jsonify(data)

@app.route('/api/public_stats')
def api_public_stats():
    doc = db.collection('public_stats').document('main').get()
    if doc.exists:
        return jsonify(doc.to_dict())
    else:
        return jsonify({}), 404

@app.route('/api/judges')
def api_judges():
    docs = db.collection('judges').stream()
    data = [doc.to_dict() for doc in docs]
    return jsonify(data)

@app.route('/api/hackathon')
def api_hackathon():
    doc = db.collection('hackathon').document('info').get()
    if doc.exists:
        return jsonify(doc.to_dict())
    else:
        return jsonify({}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
