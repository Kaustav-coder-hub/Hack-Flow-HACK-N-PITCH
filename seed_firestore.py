import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate('HackFlow-Dashboard_serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# --- Sample Data (from app.js logic) ---

def generate_participants():
    names = [
        "Arjun Sharma", "Priya Patel", "Rohit Kumar", "Sneha Das", "Karthik Menon", "Ananya Ghosh", "Vikram Rao", "Meera Joshi",
        "Rahul Singh", "Pooja Reddy", "Amit Gupta", "Kavya Iyer", "Sanjay Nair", "Divya Sharma", "Ravi Krishnan", "Neha Agarwal",
        "Aditya Kumar", "Shreya Patel", "Manish Yadav", "Ritika Singh", "Harsh Varma", "Sakshi Jain", "Deepak Rao", "Isha Gupta",
        "Nikhil Sharma", "Tanya Malhotra", "Varun Khanna", "Priyanka Das", "Kunal Agarwal", "Ankita Verma", "Rohan Mehta", "Simran Kaur",
        "Abhishek Singh", "Pallavi Reddy", "Gaurav Kumar", "Swati Nair", "Ajay Patel", "Nidhi Sharma", "Vishal Gupta", "Rashmi Iyer",
        "Suresh Kumar", "Lakshmi Devi", "Manoj Singh", "Sunita Rao", "Rajesh Verma", "Kiran Patel", "Vinod Kumar", "Geeta Sharma"
    ]
    skills = [
        ["Python", "TensorFlow", "React"], ["JavaScript", "Node.js", "MongoDB"], ["Java", "Spring Boot", "AWS"],
        ["Python", "Flask", "PostgreSQL"], ["React", "TypeScript", "GraphQL"], ["Solidity", "Web3.js", "Ethereum"],
        ["C++", "OpenCV", "PyTorch"], ["Vue.js", "Nuxt.js", "Firebase"], ["Go", "Docker", "Kubernetes"],
        ["Swift", "iOS", "Core ML"], ["Kotlin", "Android", "Room"], ["PHP", "Laravel", "MySQL"],
        ["Ruby", "Rails", "Redis"], ["Rust", "WebAssembly", "Actix"], ["C#", ".NET", "Azure"]
    ]
    universities = ["IIT Kharagpur", "Jadavpur University", "NIT Durgapur", "Calcutta University", "IIT Bombay", "IIT Delhi"]
    tracks = ["Generative AI", "Agentic AI", "Web3", "Cybersecurity"]
    experiences = ["Beginner", "Intermediate", "Advanced"]
    participants = []
    for index, name in enumerate(names[:48]):
        participants.append({
            "id": index + 1,
            "name": name,
            "email": name.lower().replace(' ', '.') + "@email.com",
            "skills": skills[index % len(skills)],
            "track": tracks[index % len(tracks)],
            "teamId": (index // 3) + 1 if index < 46 else None,
            "experience": experiences[index % len(experiences)],
            "university": universities[index % len(universities)]
        })
    return participants

def generate_teams():
    team_names = [
        "AI Innovators", "BlockChain Builders", "Cyber Guardians", "Tech Titans", "Code Crusaders", "Data Dragons",
        "Neural Networks", "Quantum Coders", "Smart Contracts", "Security Squad", "ML Masters", "Web Warriors",
        "Crypto Kings", "AI Architects", "Bug Hunters", "Cloud Ninjas", "Algorithm Aces", "Hack Heroes",
        "Binary Beasts", "Digital Dynamos", "Code Crafters", "Tech Transformers", "Innovation Inc", "Pixel Pirates",
        "Byte Bandits", "Logic Lords", "System Saviors", "Data Detectives", "Security Sentinels", "AI Avengers",
        "Blockchain Battalion", "Cyber Champions", "Tech Trailblazers", "Code Commandos", "Digital Disciples",
        "Algorithm Army", "Innovation Squad", "Pixel Pioneers", "Byte Builders", "Logic Legends", "System Stars",
        "Data Dynamos", "Security Specialists", "AI Alliance", "Blockchain Brotherhood", "Cyber Collective"
    ]
    project_names = [
        "CodeGenius - AI-Powered Code Generator", "EcoChain - Sustainable Supply Chain", "SecureNet - Network Vulnerability Scanner",
        "MindMeld - AI Collaboration Platform", "CryptoGuard - Decentralized Identity", "ThreatHunter - ML Security Analysis",
        "SmartContract Auditor", "AI-Powered Chatbot Framework", "Blockchain Voting System", "Cybersecurity Dashboard",
        "Automated Code Review Tool", "Decentralized File Storage", "AI Image Recognition System", "Smart Home Security",
        "Predictive Analytics Platform", "NFT Marketplace", "AI Music Composer", "Blockchain Supply Tracker",
        "Vulnerability Assessment Tool", "Machine Learning Model Optimizer", "Crypto Trading Bot", "AI Health Diagnostics",
        "Smart City Management", "Decentralized Social Network", "AI-Powered Recruitment", "Blockchain Insurance",
        "Cyber Threat Intelligence", "Automated Testing Framework", "AI Language Translator", "Smart Contract Platform",
        "Security Incident Response", "ML Data Pipeline", "Crypto Wallet Security", "AI-Powered Education",
        "Blockchain Healthcare", "Cybersecurity Training", "Automated Deployment Tool", "AI-Powered Analytics",
        "Decentralized Messaging", "Smart Contract Debugger", "Security Monitoring System", "ML Model Registry",
        "Crypto Payment Gateway", "AI-Powered CRM", "Blockchain Identity", "Cybersecurity Framework", "Automated Code Generation"
    ]
    tracks = ["Generative AI", "Agentic AI", "Web3", "Cybersecurity"]
    statuses = ["Submitted", "In Progress", "Planning"]
    participants = generate_participants()
    teams = []
    for index in range(46):
        start_index = index * 3
        members = [p["name"] for p in participants[start_index:start_index+3]]
        teams.append({
            "id": index + 1,
            "name": team_names[index],
            "track": tracks[index % len(tracks)],
            "members": members,
            "projectName": project_names[index],
            "submissionStatus": "Submitted" if index < 23 else statuses[(index - 23) % 2 + 1],
            "progress": 100 if index < 23 else (20 + (index * 3) % 80),
            "githubUrl": f"github.com/team{index + 1}/{project_names[index].split(' - ')[0].lower().replace(' ', '').replace('-', '').replace('<', '').replace('>', '')}"
        })
    return teams

def generate_projects():
    teams = generate_teams()
    descriptions = [
        "An intelligent code generation platform using GPT models to assist developers",
        "Blockchain-based supply chain tracking for sustainable products",
        "Advanced network vulnerability scanner with machine learning capabilities",
        "AI-powered collaboration platform for remote teams",
        "Decentralized identity management system using blockchain technology",
        "Machine learning-based security threat analysis and prevention",
        "Automated smart contract auditing tool with vulnerability detection",
        "Advanced chatbot framework with natural language understanding",
        "Secure and transparent blockchain-based voting system",
        "Comprehensive cybersecurity monitoring and response dashboard",
        "AI-powered automated code review and quality assessment tool",
        "Decentralized file storage system with encryption and redundancy",
        "Real-time image recognition and classification system",
        "IoT-based smart home security and automation platform",
        "Advanced predictive analytics platform for business intelligence",
        "User-friendly NFT marketplace with creator tools",
        "AI-powered music composition and generation system",
        "End-to-end blockchain supply chain tracking solution",
        "Comprehensive vulnerability assessment and penetration testing tool",
        "Machine learning model optimization and performance tuning platform",
        "Automated cryptocurrency trading bot with risk management",
        "AI-powered medical diagnosis and health monitoring system",
        "Smart city management platform with IoT integration"
    ]
    projects = []
    for index, team in enumerate(teams[:23]):
        projects.append({
            "id": index + 1,
            "teamName": team["name"],
            "projectName": team["projectName"],
            "track": team["track"],
            "description": descriptions[index],
            "submissionDate": f"2025-11-08 {14 + (index % 4)}:{str((index * 7) % 60).zfill(2)}",
            "githubUrl": team["githubUrl"],
            "demoUrl": f"demo.{team['projectName'].split(' - ')[0].lower().replace(' ', '').replace('-', '').replace('<', '').replace('>', '')}.com",
            "judgeScores": {
                "innovation": 7 + (index % 3),
                "technical": 7 + ((index + 1) % 3),
                "impact": 7 + ((index + 2) % 3),
                "presentation": 7 + ((index + 3) % 3)
            }
        })
    return projects

mentors = [
    {"id": 1, "name": "Dr. Amit Verma", "expertise": ["AI/ML", "Deep Learning"], "company": "Google", "availability": "Available", "teamsAssigned": 3},
    {"id": 2, "name": "Sarah Johnson", "expertise": ["Blockchain", "Smart Contracts"], "company": "Ethereum Foundation", "availability": "Busy", "teamsAssigned": 2},
    {"id": 3, "name": "Rajesh Gupta", "expertise": ["Cybersecurity", "Penetration Testing"], "company": "Cisco", "availability": "Available", "teamsAssigned": 4},
    {"id": 4, "name": "Dr. Priya Singh", "expertise": ["Machine Learning", "NLP"], "company": "Microsoft", "availability": "Available", "teamsAssigned": 2},
    {"id": 5, "name": "Alex Chen", "expertise": ["Web3", "DeFi"], "company": "Coinbase", "availability": "Available", "teamsAssigned": 1},
    {"id": 6, "name": "Maria Rodriguez", "expertise": ["Cloud Security", "DevSecOps"], "company": "Amazon", "availability": "Busy", "teamsAssigned": 3},
    {"id": 7, "name": "Dr. John Smith", "expertise": ["AI Ethics", "Responsible AI"], "company": "OpenAI", "availability": "Available", "teamsAssigned": 2},
    {"id": 8, "name": "Lisa Wong", "expertise": ["Frontend", "UX Design"], "company": "Meta", "availability": "Available", "teamsAssigned": 1},
    {"id": 9, "name": "David Kumar", "expertise": ["Backend", "Microservices"], "company": "Netflix", "availability": "Available", "teamsAssigned": 2},
    {"id": 10, "name": "Anna Petrov", "expertise": ["Data Science", "Analytics"], "company": "Spotify", "availability": "Available", "teamsAssigned": 1},
    {"id": 11, "name": "Michael Brown", "expertise": ["IoT Security", "Hardware"], "company": "Intel", "availability": "Busy", "teamsAssigned": 2},
    {"id": 12, "name": "Sophie Turner", "expertise": ["Mobile Development", "Cross-platform"], "company": "Uber", "availability": "Available", "teamsAssigned": 1}
]

judges = [
    {"id": 1, "name": "Prof. Indira Nath", "expertise": ["AI Research"], "organization": "IIT Bombay", "tracksAssigned": ["Generative AI", "Agentic AI"]},
    {"id": 2, "name": "Vikash Agarwal", "expertise": ["Blockchain Technology"], "organization": "ConsenSys", "tracksAssigned": ["Web3"]},
    {"id": 3, "name": "Ravi Krishnan", "expertise": ["Information Security"], "organization": "Infosys", "tracksAssigned": ["Cybersecurity"]}
]

def add_collection(collection_name, data_list):
    for data in data_list:
        db.collection(collection_name).add(data)
    print(f"Added {len(data_list)} documents to '{collection_name}' collection.")

add_collection('participants', generate_participants())
add_collection('teams', generate_teams())
add_collection('projects', generate_projects())
add_collection('mentors', mentors)
add_collection('judges', judges)

print("Firestore seeding complete.")