import datetime

# 50 Detailed Realistic Student Profiles
STUDENTS_SEED = [
    {
        "id": "STU001",
        "name": "Rahul Sharma",
        "email": "rahul.sharma@apex.edu",
        "phone": "+91 98765 43210",
        "branch": "Computer Science & Engineering",
        "cgpa": 8.9,
        "backlogs": 0,
        "graduation_year": 2026,
        "technical_skills": ["Python", "C++", "Data Structures", "Algorithms", "Django", "PostgreSQL", "React", "Docker"],
        "preferred_skills": ["Kubernetes", "AWS", "FastAPI"],
        "certifications": ["AWS Certified Cloud Practitioner", "HackerRank 6-Star Problem Solving"],
        "projects": [
            {"title": "Distributed Task Queue", "tech": ["Python", "Redis", "Docker"], "description": "High-throughput asynchronous job processing system with fault tolerance."},
            {"title": "E-Commerce Microservices", "tech": ["React", "FastAPI", "PostgreSQL"], "description": "Full-stack platform handling 500+ concurrent user checkouts."}
        ],
        "resume_url": "/resumes/STU001_Rahul_Sharma.pdf",
        "aptitude_score": 88,
        "coding_score": 92,
        "communication_score": 82,
        "previous_drives": ["Microsoft (Shortlisted R2)", "TCS (Offered)"],
        "placement_status": "Seeking Dream Offer",
        "readiness": {
            "overall": 88,
            "roles": {"Software Engineer": 91, "Data Analyst": 84, "Cloud Engineer": 86},
            "breakdown": {"Technical": 92, "DSA": 94, "Aptitude": 88, "Communication": 82, "Resume": 90}
        },
        "attendance_confirmed": True
    },
    {
        "id": "STU002",
        "name": "Priya Nair",
        "email": "priya.nair@apex.edu",
        "phone": "+91 98765 43211",
        "branch": "Information Technology",
        "cgpa": 9.4,
        "backlogs": 0,
        "graduation_year": 2026,
        "technical_skills": ["Java", "Spring Boot", "Data Structures", "SQL", "Microservices", "Kafka", "React"],
        "preferred_skills": ["GCP", "Kubernetes", "Redis"],
        "certifications": ["Oracle Certified Java SE Developer", "Google Cloud Associate"],
        "projects": [
            {"title": "FinTech Banking Ledger", "tech": ["Java", "Spring Boot", "Kafka"], "description": "Double-entry event-sourced financial ledger with real-time audit logs."},
            {"title": "Smart Campus Portal", "tech": ["React", "Spring Boot", "MySQL"], "description": "Campus event registration system with 5,000+ active student users."}
        ],
        "resume_url": "/resumes/STU002_Priya_Nair.pdf",
        "aptitude_score": 94,
        "coding_score": 95,
        "communication_score": 88,
        "previous_drives": ["Amazon (Shortlisted R3)", "Infosys (Offered)"],
        "placement_status": "Seeking Dream Offer",
        "readiness": {
            "overall": 93,
            "roles": {"Software Engineer": 95, "Data Analyst": 86, "Cloud Engineer": 90},
            "breakdown": {"Technical": 95, "DSA": 96, "Aptitude": 94, "Communication": 88, "Resume": 92}
        },
        "attendance_confirmed": True
    },
    {
        "id": "STU003",
        "name": "Amit Patel",
        "email": "amit.patel@apex.edu",
        "phone": "+91 98765 43212",
        "branch": "Electronics & Communication Engineering",
        "cgpa": 7.4,
        "backlogs": 0,
        "graduation_year": 2026,
        "technical_skills": ["C++", "Embedded C", "Python", "Verilog", "Microcontrollers", "Data Structures"],
        "preferred_skills": ["Linux Kernel", "RTOS", "IoT"],
        "certifications": ["Embedded Systems by ARM", "Coursera Python for Everybody"],
        "projects": [
            {"title": "IoT Smart Agriculture Monitor", "tech": ["ESP32", "Python", "MQTT"], "description": "Soil moisture & climate telemetry node with solar power optimization."},
            {"title": "FPGA Digital Signal Filter", "tech": ["Verilog", "MATLAB"], "description": "Low-pass FIR filter pipeline running on Xilinx Artix-7 FPGA."}
        ],
        "resume_url": "/resumes/STU003_Amit_Patel.pdf",
        "aptitude_score": 76,
        "coding_score": 68,
        "communication_score": 72,
        "previous_drives": ["Wipro (Eligible)"],
        "placement_status": "Unplaced",
        "readiness": {
            "overall": 72,
            "roles": {"Software Engineer": 68, "Data Analyst": 70, "Cloud Engineer": 65, "Hardware/Embedded": 84},
            "breakdown": {"Technical": 74, "DSA": 65, "Aptitude": 76, "Communication": 72, "Resume": 75}
        },
        "attendance_confirmed": False
    },
    {
        "id": "STU004",
        "name": "Sneha Roy",
        "email": "sneha.roy@apex.edu",
        "phone": "+91 98765 43213",
        "branch": "Artificial Intelligence & Data Science",
        "cgpa": 8.7,
        "backlogs": 0,
        "graduation_year": 2026,
        "technical_skills": ["Python", "PyTorch", "Scikit-Learn", "SQL", "Pandas", "NLP", "FastAPI", "Tableau"],
        "preferred_skills": ["Transformers", "LangChain", "Vector DBs", "MLflow"],
        "certifications": ["DeepLearning.AI TensorFlow Developer", "Microsoft Certified: Azure AI Fundamentals"],
        "projects": [
            {"title": "Clinical Summarization LLM", "tech": ["Python", "HuggingFace", "FastAPI"], "description": "RAG pipeline extracting clinical entities and summarising medical transcripts."},
            {"title": "Customer Churn Prediction Engine", "tech": ["XGBoost", "Streamlit", "SQL"], "description": "Predictive analytics dashboard achieving 89% AUC on telecom dataset."}
        ],
        "resume_url": "/resumes/STU004_Sneha_Roy.pdf",
        "aptitude_score": 89,
        "coding_score": 86,
        "communication_score": 90,
        "previous_drives": ["Deloitte (Shortlisted R2)"],
        "placement_status": "Unplaced",
        "readiness": {
            "overall": 89,
            "roles": {"Software Engineer": 82, "Data Analyst": 94, "Cloud Engineer": 80, "AI/ML Engineer": 93},
            "breakdown": {"Technical": 90, "DSA": 82, "Aptitude": 89, "Communication": 90, "Resume": 92}
        },
        "attendance_confirmed": True
    },
    {
        "id": "STU005",
        "name": "Vikram Sengupta",
        "email": "vikram.sengupta@apex.edu",
        "phone": "+91 98765 43214",
        "branch": "Computer Science & Engineering",
        "cgpa": 6.8,
        "backlogs": 1,
        "graduation_year": 2026,
        "technical_skills": ["JavaScript", "Node.js", "Express", "MongoDB", "HTML5/CSS3", "Git"],
        "preferred_skills": ["React", "Tailwind CSS"],
        "certifications": ["FreeCodeCamp Full Stack Developer"],
        "projects": [
            {"title": "College Club Forum", "tech": ["Node.js", "Express", "MongoDB"], "description": "Discussion board with user authentication and markdown posts."}
        ],
        "resume_url": "/resumes/STU005_Vikram_Sengupta.pdf",
        "aptitude_score": 62,
        "coding_score": 58,
        "communication_score": 65,
        "previous_drives": [],
        "placement_status": "Unplaced",
        "readiness": {
            "overall": 62,
            "roles": {"Software Engineer": 60, "Data Analyst": 55, "Cloud Engineer": 50},
            "breakdown": {"Technical": 60, "DSA": 52, "Aptitude": 62, "Communication": 65, "Resume": 66}
        },
        "attendance_confirmed": False
    }
]

# Generate realistic records for STU006 through STU050
BRANCHES = ["Computer Science & Engineering", "Information Technology", "Artificial Intelligence & Data Science", "Electronics & Communication Engineering", "Mechanical Engineering"]
FIRST_NAMES = ["Ananya", "Rohan", "Divya", "Karthik", "Pooja", "Arjun", "Kavya", "Siddharth", "Meera", "Varun", 
               "Nisha", "Aditya", "Ritu", "Harish", "Tanvi", "Nikhil", "Shreya", "Manish", "Swati", "Deepak",
               "Anjali", "Gaurav", "Simran", "Akash", "Bhavna", "Tarun", "Rashmi", "Kunal", "Pallavi", "Vivek",
               "Ishita", "Mayank", "Neha", "Pranav", "Sunita", "Sanjay", "Aarti", "Ashish", "Chhavi", "Girish",
               "Lavanya", "Mohit", "Nandini", "Rupesh", "Sonal"]
LAST_NAMES = ["Verma", "Gupta", "Deshmukh", "Iyer", "Rao", "Joshi", "Bose", "Reddy", "Menon", "Chopra",
              "Kapoor", "Kulkarni", "Das", "Bhat", "Mehta", "Malhotra", "Saxena", "Choudhury", "Bhattacharya", "Trivedi"]

import random
random.seed(42)

for i in range(6, 51):
    sid = f"STU{i:03d}"
    fname = FIRST_NAMES[(i - 6) % len(FIRST_NAMES)]
    lname = LAST_NAMES[(i * 3) % len(LAST_NAMES)]
    full_name = f"{fname} {lname}"
    branch = BRANCHES[(i + 2) % len(BRANCHES)]
    cgpa = round(random.uniform(6.4, 9.8), 2)
    backlogs = 0 if cgpa > 7.2 or random.random() > 0.3 else random.choice([1, 2])
    
    # Skills mix
    base_skills = ["Python", "Java", "C++", "Data Structures", "SQL", "Algorithms", "Git"]
    extra_skills = random.sample(["React", "Node.js", "Docker", "AWS", "FastAPI", "Spring Boot", "PyTorch", "Kubernetes", "Kafka", "PostgreSQL", "MongoDB", "Linux", "Tableau", "Microservices", "NLP", "Verilog", "MATLAB", "AutoCAD", "SolidWorks"], k=random.randint(2, 5))
    skills = list(set(base_skills[:random.randint(3, 6)] + extra_skills))
    
    aptitude = random.randint(58, 96)
    coding = random.randint(50, 98)
    communication = random.randint(55, 95)
    
    overall_readiness = round((coding * 0.4 + aptitude * 0.25 + communication * 0.2 + (cgpa * 10) * 0.15), 1)
    
    STUDENTS_SEED.append({
        "id": sid,
        "name": full_name,
        "email": f"{fname.lower()}.{lname.lower()}{i}@apex.edu",
        "phone": f"+91 98765 {43200 + i}",
        "branch": branch,
        "cgpa": cgpa,
        "backlogs": backlogs,
        "graduation_year": 2026,
        "technical_skills": skills[:6],
        "preferred_skills": skills[6:],
        "certifications": [random.choice(["AWS Certified Practitioner", "HackerRank 5-Star Problem Solving", "Azure Fundamentals", "Oracle Java SE 11", "Google Data Analytics Certificate"])],
        "projects": [
            {"title": f"{skills[0]} System Pipeline", "tech": skills[:3], "description": f"Automated engineering project demonstrating {skills[0]} and {skills[1]} implementation."},
            {"title": f"Real-Time {skills[1]} Web Application", "tech": skills[1:4], "description": "Cloud-deployed interactive web utility with active database backend."}
        ],
        "resume_url": f"/resumes/{sid}_{fname}_{lname}.pdf",
        "aptitude_score": aptitude,
        "coding_score": coding,
        "communication_score": communication,
        "previous_drives": random.sample(["Cognizant", "Infosys", "Wipro", "TCS", "Accenture"], k=random.randint(0, 2)),
        "placement_status": "Unplaced" if cgpa < 8.0 else ("Seeking Dream Offer" if random.random() > 0.5 else "Shortlisted"),
        "readiness": {
            "overall": overall_readiness,
            "roles": {
                "Software Engineer": round(coding * 0.6 + aptitude * 0.2 + communication * 0.2, 1),
                "Data Analyst": round(aptitude * 0.4 + (coding * 0.4) + communication * 0.2, 1),
                "Cloud Engineer": round(overall_readiness * 0.95, 1)
            },
            "breakdown": {
                "Technical": coding,
                "DSA": max(45, coding - random.randint(0, 10)),
                "Aptitude": aptitude,
                "Communication": communication,
                "Resume": random.randint(70, 95)
            }
        },
        "attendance_confirmed": random.choice([True, True, True, False])
    })


# 10 Specialized Interview Panels
PANELS_SEED = [
    {
        "id": "PANEL_01",
        "name": "Panel 1 - Core CS & Algorithms",
        "company": "Google",
        "interviewers": ["Dr. Anirudh Kulkarni (Staff Eng)", "Meenakshi Sundaram (Senior SWE)"],
        "expertise": ["Data Structures", "Algorithms", "System Design", "C++", "Python"],
        "interview_type": "Technical Round 1",
        "assigned_room": "ROOM_101",
        "max_capacity": 18,
        "current_load": 14,
        "status": "Active",
        "available_slots": ["09:00 - 09:45", "10:00 - 10:45", "11:00 - 11:45", "13:00 - 13:45", "14:00 - 14:45", "15:00 - 15:45"]
    },
    {
        "id": "PANEL_02",
        "name": "Panel 2 - Fullstack & Distributed Systems",
        "company": "Google",
        "interviewers": ["Rajesh Varma (Tech Lead)", "Sarah Jenkins (Senior Frontend Eng)"],
        "expertise": ["React", "Node.js", "Microservices", "REST APIs", "SQL", "Cloud"],
        "interview_type": "Technical Round 2",
        "assigned_room": "ROOM_102",
        "max_capacity": 18,
        "current_load": 18,
        "status": "Critical",  # Seed exception trigger target
        "available_slots": ["09:00 - 09:45", "10:00 - 10:45", "11:00 - 11:45", "13:00 - 13:45", "14:00 - 14:45"]
    },
    {
        "id": "PANEL_03",
        "name": "Panel 3 - AI, ML & Data Engineering",
        "company": "Google",
        "interviewers": ["Dr. Siddharth Sen (AI Research Lead)", "Neha Kapoor (Data Architect)"],
        "expertise": ["PyTorch", "Python", "NLP", "Machine Learning", "Data Pipelines", "SQL"],
        "interview_type": "Technical Round 1",
        "assigned_room": "ROOM_103",
        "max_capacity": 16,
        "current_load": 10,
        "status": "Active",
        "available_slots": ["09:30 - 10:15", "10:30 - 11:15", "11:30 - 12:15", "14:00 - 14:45", "15:00 - 15:45", "16:00 - 16:45"]
    },
    {
        "id": "PANEL_04",
        "name": "Panel 4 - Backend & Cloud Infrastructure",
        "company": "Google",
        "interviewers": ["Vikramaditya Bose (Principal Cloud Architect)", "Tanvi Mathur (DevOps Specialist)"],
        "expertise": ["Java", "Spring Boot", "AWS", "Docker", "Kubernetes", "Microservices", "Databases"],
        "interview_type": "Technical Round 2",
        "assigned_room": "ROOM_104",
        "max_capacity": 20,
        "current_load": 8,
        "status": "Available",
        "available_slots": ["09:00 - 09:45", "10:00 - 10:45", "11:00 - 11:45", "13:00 - 13:45", "14:00 - 14:45", "15:00 - 15:45", "16:00 - 16:45"]
    },
    {
        "id": "PANEL_05",
        "name": "Panel 5 - Advanced DSA & Problem Solving",
        "company": "Google",
        "interviewers": ["Gaurav Singhal (Senior SWE)", "Aparna Nambiar (Algorithms Evaluator)"],
        "expertise": ["Dynamic Programming", "Graphs", "C++", "Java", "Python", "Data Structures"],
        "interview_type": "Technical Round 1",
        "assigned_room": "ROOM_105",
        "max_capacity": 20,
        "current_load": 6,
        "status": "Available",
        "available_slots": ["09:00 - 09:45", "10:00 - 10:45", "11:00 - 11:45", "13:00 - 13:45", "14:00 - 14:45", "15:00 - 15:45", "16:00 - 16:45"]
    },
    {
        "id": "PANEL_06",
        "name": "Panel 6 - Microsoft Cloud & Azure Systems",
        "company": "Microsoft",
        "interviewers": ["Arvind Narayanan (Director of Azure Ops)", "Kavita Pillai (Senior PM)"],
        "expertise": ["Azure", "C#", ".NET", "Cloud Architecture", "Distributed Systems"],
        "interview_type": "Technical Round 1",
        "assigned_room": "ROOM_201",
        "max_capacity": 16,
        "current_load": 12,
        "status": "Active",
        "available_slots": ["10:00 - 10:45", "11:00 - 11:45", "13:30 - 14:15", "14:30 - 15:15"]
    },
    {
        "id": "PANEL_07",
        "name": "Panel 7 - Enterprise Java & Microservices",
        "company": "TCS",
        "interviewers": ["Ramesh Chandra (Delivery Head)", "Deepa Mohan (Tech Lead)"],
        "expertise": ["Java", "Spring Boot", "SQL", "REST APIs", "Agile"],
        "interview_type": "Technical Round 1",
        "assigned_room": "ROOM_202",
        "max_capacity": 25,
        "current_load": 18,
        "status": "Active",
        "available_slots": ["09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30", "11:00 - 11:30", "11:30 - 12:00", "14:00 - 14:30"]
    },
    {
        "id": "PANEL_08",
        "name": "Panel 8 - Behavioral & Leadership Assessment",
        "company": "Google",
        "interviewers": ["Sunil Nair (Senior HR Director)", "Karen D'Souza (Global Talent Partner)"],
        "expertise": ["Behavioral", "Culture Fit", "Leadership Principles", "Communication", "Problem Ownership"],
        "interview_type": "HR & Fitment Round",
        "assigned_room": "ROOM_203",
        "max_capacity": 22,
        "current_load": 12,
        "status": "Active",
        "available_slots": ["10:00 - 10:30", "10:30 - 11:00", "11:30 - 12:00", "13:30 - 14:00", "14:00 - 14:30", "15:00 - 15:30"]
    },
    {
        "id": "PANEL_09",
        "name": "Panel 9 - Data Science & Analytics",
        "company": "Accenture",
        "interviewers": ["Manish Tiwari (Analytics Manager)", "Shweta Roy (Senior Data Scientist)"],
        "expertise": ["Python", "SQL", "Tableau", "Statistics", "PowerBI", "Machine Learning"],
        "interview_type": "Technical Round 1",
        "assigned_room": "ROOM_204",
        "max_capacity": 18,
        "current_load": 9,
        "status": "Active",
        "available_slots": ["09:30 - 10:15", "10:30 - 11:15", "11:30 - 12:15", "14:00 - 14:45"]
    },
    {
        "id": "PANEL_10",
        "name": "Panel 10 - Infosys Specialist Solutions",
        "company": "Infosys",
        "interviewers": ["Kishore Kumar (Principal Consultant)", "Bhavana Shah (Architect)"],
        "expertise": ["Competitive Programming", "Algorithms", "Java", "Python", "Full Stack"],
        "interview_type": "Specialist Programmer Round",
        "assigned_room": "ROOM_LAB1",
        "max_capacity": 20,
        "current_load": 15,
        "status": "Active",
        "available_slots": ["09:00 - 09:45", "10:00 - 10:45", "11:00 - 11:45", "14:00 - 14:45", "15:00 - 15:45"]
    }
]

# 10 High-Tech Interview Rooms / Test Venues
ROOMS_SEED = [
    {
        "id": "ROOM_101",
        "name": "Interview Room 101 (Block A - Floor 1)",
        "capacity": 6,
        "location": "Block A, Room 101",
        "equipment": ["HD Display Monitor", "Webcam & Polycom Mic", "Dual High-Speed LAN", "Whiteboard"],
        "assigned_company": "Google",
        "assigned_panel": "PANEL_01",
        "available_time": "08:30 - 18:30",
        "status": "Occupied"
    },
    {
        "id": "ROOM_102",
        "name": "Interview Room 102 (Block A - Floor 1)",
        "capacity": 6,
        "location": "Block A, Room 102",
        "equipment": ["HD Display Monitor", "Video Conferencing Bar", "High-Speed WiFi & LAN", "Magnetic Whiteboard"],
        "assigned_company": "Google",
        "assigned_panel": "PANEL_02",
        "available_time": "08:30 - 18:30",
        "status": "Occupied"
    },
    {
        "id": "ROOM_103",
        "name": "Interview Room 103 (Block A - Floor 1)",
        "capacity": 6,
        "location": "Block A, Room 103",
        "equipment": ["Smart Interactive Board", "Polycom Conference Phone", "Dedicated Fiber Line"],
        "assigned_company": "Google",
        "assigned_panel": "PANEL_03",
        "available_time": "08:30 - 18:30",
        "status": "Occupied"
    },
    {
        "id": "ROOM_104",
        "name": "Interview Room 104 (Block A - Floor 1)",
        "capacity": 8,
        "location": "Block A, Room 104",
        "equipment": ["4K Display", "Video Conferencing Unit", "Dual Whiteboards"],
        "assigned_company": "Google",
        "assigned_panel": "PANEL_04",
        "available_time": "08:30 - 18:30",
        "status": "Occupied"
    },
    {
        "id": "ROOM_105",
        "name": "Interview Room 105 (Block A - Floor 1)",
        "capacity": 8,
        "location": "Block A, Room 105",
        "equipment": ["4K Display", "Jabra Speakerphone", "Whiteboard"],
        "assigned_company": "Google",
        "assigned_panel": "PANEL_05",
        "available_time": "08:30 - 18:30",
        "status": "Occupied"
    },
    {
        "id": "ROOM_201",
        "name": "Executive Room 201 (Block B - Floor 2)",
        "capacity": 10,
        "location": "Block B, Room 201",
        "equipment": ["Projector & AV System", "Cisco Webex Kit", "Dedicated UPS"],
        "assigned_company": "Microsoft",
        "assigned_panel": "PANEL_06",
        "available_time": "09:00 - 18:00",
        "status": "Occupied"
    },
    {
        "id": "ROOM_202",
        "name": "Interview Room 202 (Block B - Floor 2)",
        "capacity": 6,
        "location": "Block B, Room 202",
        "equipment": ["Monitor", "Video Bar", "High-Speed WiFi"],
        "assigned_company": "TCS",
        "assigned_panel": "PANEL_07",
        "available_time": "09:00 - 17:30",
        "status": "Occupied"
    },
    {
        "id": "ROOM_203",
        "name": "Leadership Room 203 (Block B - Floor 2)",
        "capacity": 8,
        "location": "Block B, Room 203",
        "equipment": ["Acoustic Soundproofing", "HD Display", "Conference Speaker"],
        "assigned_company": "Google",
        "assigned_panel": "PANEL_08",
        "available_time": "09:00 - 18:00",
        "status": "Occupied"
    },
    {
        "id": "ROOM_204",
        "name": "Analytics Hall 204 (Block B - Floor 2)",
        "capacity": 12,
        "location": "Block B, Room 204",
        "equipment": ["Dual Displays", "Surround Microphones", "High-Speed Switch"],
        "assigned_company": "Accenture",
        "assigned_panel": "PANEL_09",
        "available_time": "09:00 - 18:00",
        "status": "Occupied"
    },
    {
        "id": "ROOM_LAB1",
        "name": "Computer Coding Lab 1 (Block C - Ground Floor)",
        "capacity": 80,
        "location": "Block C, Lab 1",
        "equipment": ["80 Workstations with Core i7 & 16GB RAM", "Safe Exam Browser Installed", "Gigabit Network", "Centralized UPS 50kVA"],
        "assigned_company": "Infosys",
        "assigned_panel": "PANEL_10",
        "available_time": "08:00 - 20:00",
        "status": "Occupied"
    }
]

# 5 Companies with rich structured & unstructured JDs
COMPANIES_SEED = [
    {
        "id": "COMP_GOOGLE",
        "name": "Google India",
        "tier": "Tier-1 (Dream Company)",
        "logo": "https://www.google.com/favicon.ico",
        "location": "Bengaluru / Hyderabad",
        "website": "https://careers.google.com",
        "roles": [
            {
                "id": "ROLE_GOOGLE_SWE",
                "title": "Software Development Engineer - I (SDE-1)",
                "ctc": "₹ 32.5 LPA (Fixed: ₹ 18 LPA + Stocks: ₹ 11 LPA + Bonus: ₹ 3.5 LPA)",
                "min_cgpa": 7.5,
                "max_backlogs": 0,
                "allowed_branches": ["Computer Science & Engineering", "Information Technology", "Artificial Intelligence & Data Science", "Electronics & Communication Engineering"],
                "graduation_year": 2026,
                "required_skills": ["Data Structures", "Algorithms", "C++", "Java", "Python", "Problem Solving"],
                "preferred_skills": ["Distributed Systems", "Cloud", "Operating Systems", "Computer Networks", "Docker"],
                "rounds": [
                    {"round_num": 1, "name": "Online Coding Assessment", "type": "Coding Test", "duration_mins": 90, "venue": "ROOM_LAB1"},
                    {"round_num": 2, "name": "Technical Interview 1 (DSA & Complexity)", "type": "Technical Interview", "duration_mins": 45, "venue": "Block A Interview Rooms"},
                    {"round_num": 3, "name": "Technical Interview 2 (System Design & Code Quality)", "type": "Technical Interview", "duration_mins": 45, "venue": "Block A Interview Rooms"},
                    {"round_num": 4, "name": "Googliness & Leadership Fitment", "type": "HR Interview", "duration_mins": 30, "venue": "ROOM_203"}
                ],
                "documents_required": ["Updated Resume", "College ID", "Official Transcript", "Govt ID"],
                "raw_jd": """Google is hiring Software Development Engineers (SDE-1) for 2026 graduates.
Requirements:
- Bachelor's in CS, IT, AI&DS or ECE with min 7.5 CGPA and zero active backlogs.
- Exceptional mastery of Data Structures, Algorithms, Complexity Analysis, C++, Java, or Python.
- Solid understanding of OOP, Operating Systems, Database Management, and Network fundamentals.
- Prior project experience in distributed backend, microservices, or cloud infrastructure is a strong plus.
- Selection Workflow: Online Assessment (90 mins) -> 2 Technical Rounds (45 mins each) -> 1 Googliness & Leadership round (30 mins)."""
            }
        ]
    },
    {
        "id": "COMP_MSFT",
        "name": "Microsoft",
        "tier": "Tier-1 (Dream Company)",
        "logo": "https://www.microsoft.com/favicon.ico",
        "location": "Hyderabad / Noida / Bengaluru",
        "website": "https://careers.microsoft.com",
        "roles": [
            {
                "id": "ROLE_MSFT_CLOUD",
                "title": "Cloud Solutions & Software Engineer",
                "ctc": "₹ 28.0 LPA",
                "min_cgpa": 7.5,
                "max_backlogs": 0,
                "allowed_branches": ["Computer Science & Engineering", "Information Technology", "Electronics & Communication Engineering", "Artificial Intelligence & Data Science"],
                "graduation_year": 2026,
                "required_skills": ["Data Structures", "C#", "C++", "Java", "Python", "Cloud Fundamentals"],
                "preferred_skills": ["Azure", "Kubernetes", "Microservices", "REST APIs", "SQL"],
                "rounds": [
                    {"round_num": 1, "name": "Codility Online Challenge", "type": "Coding Test", "duration_mins": 90, "venue": "ROOM_LAB1"},
                    {"round_num": 2, "name": "Technical Round - Cloud & DSA", "type": "Technical Interview", "duration_mins": 45, "venue": "ROOM_201"},
                    {"round_num": 3, "name": "Architectural & Behavioral Round", "type": "HR & Leadership", "duration_mins": 45, "venue": "ROOM_201"}
                ],
                "documents_required": ["Resume", "College ID Card", "Mark sheets"],
                "raw_jd": """Microsoft University Hiring 2026. Looking for engineers passionate about Azure cloud, distributed systems, and cutting-edge software.
Eligible: CSE, IT, ECE, AI&DS with CGPA >= 7.5 and 0 backlogs.
Strong knowledge of Data Structures, Algorithms, Cloud Architecture, C#, C++, Java or Python."""
            }
        ]
    },
    {
        "id": "COMP_TCS",
        "name": "Tata Consultancy Services (TCS)",
        "tier": "Tier-2 (Core & Digital)",
        "logo": "https://www.tcs.com/favicon.ico",
        "location": "Pan India",
        "website": "https://www.tcs.com/careers",
        "roles": [
            {
                "id": "ROLE_TCS_DIGITAL",
                "title": "TCS Digital / Prime Engineer",
                "ctc": "₹ 9.0 LPA - ₹ 11.5 LPA",
                "min_cgpa": 7.0,
                "max_backlogs": 1,
                "allowed_branches": ["Computer Science & Engineering", "Information Technology", "Artificial Intelligence & Data Science", "Electronics & Communication Engineering", "Mechanical Engineering"],
                "graduation_year": 2026,
                "required_skills": ["Java", "Python", "SQL", "Data Structures", "Aptitude"],
                "preferred_skills": ["Cloud", "AI/ML", "React", "Spring Boot"],
                "rounds": [
                    {"round_num": 1, "name": "TCS NQT Advanced Test", "type": "Aptitude & Coding", "duration_mins": 120, "venue": "Online Assessment Centre"},
                    {"round_num": 2, "name": "Technical & Managerial Interview", "type": "Technical Interview", "duration_mins": 30, "venue": "ROOM_202"},
                    {"round_num": 3, "name": "HR Round", "type": "HR Interview", "duration_mins": 20, "venue": "ROOM_202"}
                ],
                "documents_required": ["TCS Application Form", "All Sem Marksheets", "College ID"],
                "raw_jd": """TCS Digital Hiring drive for 2026 Batch.
Min CGPA: 7.0 throughout academics with max 1 active backlog permitted.
Open to CSE, IT, ECE, MECH, AI&DS. Candidates must qualify TCS NQT Advanced section covering Advanced Quantitative, Reasoning, and Coding in Python/Java/C++."""
            }
        ]
    },
    {
        "id": "COMP_INFOSYS",
        "name": "Infosys",
        "tier": "Tier-2 (Specialist & DSE)",
        "logo": "https://www.infosys.com/favicon.ico",
        "location": "Mysuru / Bengaluru / Pune",
        "website": "https://www.infosys.com",
        "roles": [
            {
                "id": "ROLE_INFY_SP",
                "title": "Specialist Programmer (SP)",
                "ctc": "₹ 9.5 LPA",
                "min_cgpa": 6.8,
                "max_backlogs": 1,
                "allowed_branches": ["Computer Science & Engineering", "Information Technology", "Artificial Intelligence & Data Science", "Electronics & Communication Engineering"],
                "graduation_year": 2026,
                "required_skills": ["Advanced Algorithms", "Dynamic Programming", "Java", "Python", "Data Structures"],
                "preferred_skills": ["Full Stack", "System Design"],
                "rounds": [
                    {"round_num": 1, "name": "InfyTQ / HackWithInfy Final Round", "type": "Advanced Coding", "duration_mins": 180, "venue": "ROOM_LAB1"},
                    {"round_num": 2, "name": "Specialist Technical Interview", "type": "Technical Interview", "duration_mins": 45, "venue": "ROOM_LAB1"}
                ],
                "documents_required": ["Resume", "ID Proof", "Marksheets"],
                "raw_jd": """Infosys Specialist Programmer role. High-end competitive programming focus.
Requirements: CGPA >= 6.8, max 1 backlog. Deep algorithmic mastery, graph algorithms, dynamic programming, segment trees."""
            }
        ]
    },
    {
        "id": "COMP_ACCENTURE",
        "name": "Accenture",
        "tier": "Tier-2 (Consulting & Advanced Associate)",
        "logo": "https://www.accenture.com/favicon.ico",
        "location": "Bengaluru / Hyderabad / Gurgaon",
        "website": "https://www.accenture.com",
        "roles": [
            {
                "id": "ROLE_ACCN_AASE",
                "title": "Advanced Application Engineering Analyst",
                "ctc": "₹ 6.5 LPA - ₹ 8.5 LPA",
                "min_cgpa": 6.5,
                "max_backlogs": 1,
                "allowed_branches": ["Computer Science & Engineering", "Information Technology", "Artificial Intelligence & Data Science", "Electronics & Communication Engineering", "Mechanical Engineering"],
                "graduation_year": 2026,
                "required_skills": ["Python", "SQL", "Analytical Reasoning", "Problem Solving", "Web Technologies"],
                "preferred_skills": ["Cloud", "Analytics", "DevOps"],
                "rounds": [
                    {"round_num": 1, "name": "Cognitive & Technical Assessment", "type": "Aptitude Test", "duration_mins": 90, "venue": "Online Assessment Centre"},
                    {"round_num": 2, "name": "Coding Assessment", "type": "Coding Test", "duration_mins": 45, "venue": "Online Assessment Centre"},
                    {"round_num": 3, "name": "Technical & Fitment Interview", "type": "Technical & HR", "duration_mins": 30, "venue": "ROOM_204"}
                ],
                "documents_required": ["Accenture Admit Card", "Resume", "College ID"],
                "raw_jd": """Accenture is recruiting Advanced Application Engineering Analysts.
Eligible: All engineering streams with CGPA >= 6.5 and max 1 active backlog. Focus on algorithmic problem solving, modern fullstack or cloud engineering."""
            }
        ]
    }
]

# Placement Drives (Active, Upcoming, Completed, and Draft)
DRIVES_SEED = [
    {
        "id": "DRIVE_GOOGLE_2026",
        "company_id": "COMP_GOOGLE",
        "company_name": "Google India",
        "role_id": "ROLE_GOOGLE_SWE",
        "role_title": "Software Development Engineer - I (SDE-1)",
        "ctc": "₹ 32.5 LPA",
        "package": "₹ 32.5 LPA",
        "location": "Bengaluru / Hyderabad",
        "description": "Join Google's Core Engineering team building global distributed platforms, cloud architecture, and high-scale consumer products. Looking for strong fundamentals in DSA, system design, and coding excellence.",
        "application_start_date": "2026-08-01",
        "application_deadline": "2026-08-28",
        "drive_date": "2026-08-29",
        "date": "2026-08-29",
        "status": "Active",
        "drive_status": "ACTIVE",
        "stage": "Round 2 Technical Interviews",
        "total_applied": 48,
        "eligible_count": 34,
        "shortlisted_count": 22,
        "scheduled_count": 22,
        "interviewed_count": 14,
        "offers_released": 0,
        "assigned_panels": ["PANEL_01", "PANEL_02", "PANEL_03", "PANEL_04", "PANEL_05", "PANEL_08"],
        "assigned_rooms": ["ROOM_101", "ROOM_102", "ROOM_103", "ROOM_104", "ROOM_105", "ROOM_203"],
        "risk_level": "High",
        "risk_summary": "Panel 2 reached maximum load capacity; 18 students require emergency re-slotting.",
        "selection_process": "Online Assessment -> Technical Interview 1 (DSA) -> Technical Interview 2 (System Design) -> Googliness & Leadership",
        "instructions": "Candidate must carry college ID, 2 copies of updated resume, and valid government ID.",
        "requirements": {
            "min_cgpa": 7.5,
            "max_backlogs": 0,
            "branches": ["Computer Science & Engineering", "Information Technology", "Artificial Intelligence & Data Science", "Electronics & Communication Engineering"],
            "graduation_year": 2026,
            "required_skills": ["Data Structures", "Algorithms", "C++", "Java", "Python"],
            "preferred_skills": ["System Design", "Cloud", "Distributed Systems"]
        }
    },
    {
        "id": "DRIVE_MSFT_2026",
        "company_id": "COMP_MSFT",
        "company_name": "Microsoft",
        "role_id": "ROLE_MSFT_CLOUD",
        "role_title": "Cloud Solutions & Software Engineer",
        "ctc": "₹ 28.0 LPA",
        "package": "₹ 28.0 LPA",
        "location": "Bengaluru / Hyderabad / Noida",
        "description": "Build next-generation Azure Cloud Infrastructure, developer productivity tools, and AI copilot services. Requires proficiency in algorithms, cloud patterns, and microservices.",
        "application_start_date": "2026-08-05",
        "application_deadline": "2026-08-27",
        "drive_date": "2026-08-30",
        "date": "2026-08-30",
        "status": "Active",
        "drive_status": "ACTIVE",
        "stage": "Round 1 Technical Coding & Cloud",
        "total_applied": 46,
        "eligible_count": 32,
        "shortlisted_count": 20,
        "scheduled_count": 20,
        "interviewed_count": 0,
        "offers_released": 0,
        "assigned_panels": ["PANEL_06"],
        "assigned_rooms": ["ROOM_201"],
        "risk_level": "Medium",
        "risk_summary": "3 candidate schedules overlap with Google R2 slots; priority resolution recommended.",
        "selection_process": "Codility Coding Round -> Technical Interview 1 -> Technical Interview 2 -> AA (As Appropriate) Director Round",
        "instructions": "Laptops with stable internet connection required for the Codility online assessment round.",
        "requirements": {
            "min_cgpa": 7.5,
            "max_backlogs": 0,
            "branches": ["Computer Science & Engineering", "Information Technology", "Electronics & Communication Engineering", "Artificial Intelligence & Data Science"],
            "graduation_year": 2026,
            "required_skills": ["Data Structures", "C#", "C++", "Java", "Python", "Cloud Fundamentals"],
            "preferred_skills": ["Azure", "Kubernetes", "Microservices"]
        }
    },
    {
        "id": "DRIVE_TCS_2026",
        "company_id": "COMP_TCS",
        "company_name": "Tata Consultancy Services (TCS)",
        "role_id": "ROLE_TCS_DIGITAL",
        "role_title": "TCS Digital / Prime Engineer",
        "ctc": "₹ 9.0 LPA - ₹ 11.5 LPA",
        "package": "₹ 11.5 LPA",
        "location": "Pan India / Chennai / Pune",
        "description": "TCS Digital & Prime hiring for cutting-edge digital enterprise transformations, cloud architecture, and modern product engineering.",
        "application_start_date": "2026-08-10",
        "application_deadline": "2026-09-02",
        "drive_date": "2026-09-05",
        "date": "2026-09-05",
        "status": "Active",
        "drive_status": "ACTIVE",
        "stage": "Registration & Application Phase",
        "total_applied": 50,
        "eligible_count": 44,
        "shortlisted_count": 0,
        "scheduled_count": 0,
        "interviewed_count": 0,
        "offers_released": 0,
        "assigned_panels": ["PANEL_07"],
        "assigned_rooms": ["ROOM_202"],
        "risk_level": "Low",
        "risk_summary": "Registration phase active.",
        "selection_process": "TCS NQT Advanced Test -> Technical Interview -> MR Interview -> HR Interview",
        "instructions": "Maintain formal attire. Keep your TCS iON portal credentials ready.",
        "requirements": {
            "min_cgpa": 7.0,
            "max_backlogs": 1,
            "branches": ["Computer Science & Engineering", "Information Technology", "Artificial Intelligence & Data Science", "Electronics & Communication Engineering", "Mechanical Engineering"],
            "graduation_year": 2026,
            "required_skills": ["Java", "Python", "SQL", "Data Structures", "Aptitude"],
            "preferred_skills": ["Cloud", "AI/ML", "React"]
        }
    },
    {
        "id": "DRIVE_AMAZON_2026",
        "company_id": "COMP_AMAZON",
        "company_name": "Amazon India",
        "role_id": "ROLE_AMAZON_SDE",
        "role_title": "Software Development Engineer - I",
        "ctc": "₹ 34.0 LPA",
        "package": "₹ 34.0 LPA",
        "location": "Bengaluru / Chennai / Hyderabad",
        "description": "Design and implement scalable distributed software solutions for Amazon Web Services (AWS) and Retail e-Commerce platforms. High emphasis on Leadership Principles and DSA.",
        "application_start_date": "2026-08-15",
        "application_deadline": "2026-08-31",
        "drive_date": "2026-09-08",
        "date": "2026-09-08",
        "status": "Active",
        "drive_status": "ACTIVE",
        "stage": "Online Assessment Phase",
        "total_applied": 42,
        "eligible_count": 30,
        "shortlisted_count": 18,
        "scheduled_count": 18,
        "interviewed_count": 0,
        "offers_released": 0,
        "assigned_panels": ["PANEL_03"],
        "assigned_rooms": ["ROOM_103"],
        "risk_level": "Low",
        "risk_summary": "Applications currently open for campus batch 2026.",
        "selection_process": "Amazon OA (2 Coding Questions + Work Style Simulation) -> Technical Round 1 -> Technical Round 2 -> Bar Raiser Round",
        "instructions": "Be thoroughly prepared with Amazon 16 Leadership Principles with concrete project examples.",
        "requirements": {
            "min_cgpa": 8.0,
            "max_backlogs": 0,
            "branches": ["Computer Science & Engineering", "Information Technology", "Artificial Intelligence & Data Science"],
            "graduation_year": 2026,
            "required_skills": ["Data Structures", "Algorithms", "Java", "C++", "Object-Oriented Design"],
            "preferred_skills": ["AWS", "Distributed Systems"]
        }
    },
    {
        "id": "DRIVE_DELOITTE_2026",
        "company_id": "COMP_DELOITTE",
        "company_name": "Deloitte USI",
        "role_id": "ROLE_DELOITTE_ANALYST",
        "role_title": "Consulting Analyst - Technology",
        "ctc": "₹ 12.5 LPA",
        "package": "₹ 12.5 LPA",
        "location": "Hyderabad / Bengaluru / Mumbai",
        "description": "Deloitte Consulting Technology Practice hiring analysts for Enterprise Cloud, Data Modernization, Cyber Risk, and AI Transformation projects.",
        "application_start_date": "2026-09-10",
        "application_deadline": "2026-09-25",
        "drive_date": "2026-09-28",
        "date": "2026-09-28",
        "status": "Upcoming",
        "drive_status": "UPCOMING",
        "stage": "Pre-Placement Talk Announced",
        "total_applied": 0,
        "eligible_count": 45,
        "shortlisted_count": 0,
        "scheduled_count": 0,
        "interviewed_count": 0,
        "offers_released": 0,
        "assigned_panels": [],
        "assigned_rooms": [],
        "risk_level": "Low",
        "risk_summary": "Drive announced. Registrations open on 10 Sept 2026.",
        "selection_process": "Versant English & Aptitude Test -> Technical Assessment -> Case Study Round -> Partner Interview",
        "instructions": "Attend mandatory pre-placement talk in College Auditorium on 09 Sept 2026.",
        "requirements": {
            "min_cgpa": 6.8,
            "max_backlogs": 0,
            "branches": ["Computer Science & Engineering", "Information Technology", "Artificial Intelligence & Data Science", "Electronics & Communication Engineering"],
            "graduation_year": 2026,
            "required_skills": ["Python", "SQL", "Data Analysis", "Communication", "Problem Solving"],
            "preferred_skills": ["PowerBI", "Tableau", "Cloud Fundamentals"]
        }
    },
    {
        "id": "DRIVE_ORACLE_2026",
        "company_id": "COMP_ORACLE",
        "company_name": "Oracle India",
        "role_id": "ROLE_ORACLE_SERVER",
        "role_title": "Server Technologies Member of Technical Staff",
        "ctc": "₹ 24.0 LPA",
        "package": "₹ 24.0 LPA",
        "location": "Bengaluru / Hyderabad",
        "description": "Join Oracle's flagship Database & OCI Core Infrastructure engineering team. Work on kernel tuning, autonomous database, and enterprise storage engines.",
        "application_start_date": "2026-09-15",
        "application_deadline": "2026-10-01",
        "drive_date": "2026-10-05",
        "date": "2026-10-05",
        "status": "Upcoming",
        "drive_status": "UPCOMING",
        "stage": "Drive Announced",
        "total_applied": 0,
        "eligible_count": 35,
        "shortlisted_count": 0,
        "scheduled_count": 0,
        "interviewed_count": 0,
        "offers_released": 0,
        "assigned_panels": [],
        "assigned_rooms": [],
        "risk_level": "Low",
        "risk_summary": "Upcoming drive for Tier-1 OCI engineering.",
        "selection_process": "Online Aptitude & Coding -> Technical Round 1 -> Technical Round 2 -> Techno-Managerial Round",
        "instructions": "Strong foundation in Operating Systems, Database Internals, and C/C++/Java is required.",
        "requirements": {
            "min_cgpa": 7.8,
            "max_backlogs": 0,
            "branches": ["Computer Science & Engineering", "Information Technology", "Artificial Intelligence & Data Science"],
            "graduation_year": 2026,
            "required_skills": ["C++", "Java", "Operating Systems", "DBMS", "Data Structures"],
            "preferred_skills": ["Linux Internals", "Distributed Computing"]
        }
    },
    {
        "id": "DRIVE_INFOSYS_2026",
        "company_id": "COMP_INFOSYS",
        "company_name": "Infosys Ltd",
        "role_id": "ROLE_INFOSYS_SP",
        "role_title": "Specialist Programmer & Digital Specialist Engineer",
        "ctc": "₹ 9.5 LPA",
        "package": "₹ 9.5 LPA",
        "location": "Bengaluru / Mysuru / Pune",
        "description": "High-impact developer roles at Infosys Digital Labs building next-gen banking, retail, and supply chain enterprise platforms.",
        "application_start_date": "2026-07-01",
        "application_deadline": "2026-07-20",
        "drive_date": "2026-07-25",
        "date": "2026-07-25",
        "status": "Completed",
        "drive_status": "COMPLETED",
        "stage": "Drive Completed & Offers Released",
        "total_applied": 50,
        "eligible_count": 42,
        "shortlisted_count": 28,
        "scheduled_count": 28,
        "interviewed_count": 28,
        "offers_released": 14,
        "assigned_panels": ["PANEL_01", "PANEL_02"],
        "assigned_rooms": ["ROOM_101", "ROOM_102"],
        "risk_level": "Low",
        "risk_summary": "Placement drive concluded. Offer letters distributed.",
        "selection_process": "InfyTQ Competitive Coding Test -> Technical Interview -> HR Fitment",
        "instructions": "Drive completed. Offer letters dispatched to candidate college emails.",
        "requirements": {
            "min_cgpa": 6.5,
            "max_backlogs": 0,
            "branches": ["Computer Science & Engineering", "Information Technology", "Artificial Intelligence & Data Science", "Electronics & Communication Engineering", "Mechanical Engineering"],
            "graduation_year": 2026,
            "required_skills": ["Java", "Python", "Data Structures", "SQL"],
            "preferred_skills": ["Fullstack", "Cloud"]
        }
    }
]

# College Placement Policies Knowledge Base
POLICIES_SEED = [
    {
        "id": "POL_001",
        "code": "AIT-PL-01",
        "category": "Offer Acceptance & Dream Company Policy",
        "title": "Dream Company & Multiple Offer Guidelines",
        "text": """1. A student placed in a Tier-2 company (CTC < ₹ 12 LPA) is permitted to participate in Tier-1 'Dream Companies' (CTC >= ₹ 15 LPA).
2. Once a student receives an offer from a Dream Company (Tier-1), they are strictly considered Placed and will be automatically delisted from all further placement drives.
3. Maximum of 2 offers is permitted per student, provided the second offer is categorized as a Dream / Super-Dream offer with at least 1.5x CTC increment.
4. Acceptance of an offer must be communicated within 48 hours of official offer release."""
    },
    {
        "id": "POL_002",
        "code": "AIT-PL-02",
        "category": "Academic Eligibility & Backlogs",
        "title": "Academic Eligibility & Backlog Verification Rules",
        "text": """1. Minimum CGPA criteria set by the recruiting company must be met strictly with no rounding off (e.g. 7.49 cannot be considered 7.50).
2. Students with active backlogs may only apply for companies whose JD explicitly allows backlogs (Max 1 or 2).
3. If a student clears their backlog before the scheduled interview date, they may submit proof to the TPO for manual eligibility re-evaluation.
4. Minimum 75% attendance in pre-placement training modules is mandatory for drive registration."""
    },
    {
        "id": "POL_003",
        "code": "AIT-PL-03",
        "category": "Student Code of Conduct & Debarment",
        "title": "No-Show, Debarment & Disciplinary Actions",
        "text": """1. Non-attendance at a confirmed interview slot without 12 hours prior TPO notification leads to immediate debarment from the next 3 campus placement drives.
2. Direct unsolicited contact with company HR or interviewers without TPO clearance will result in complete cancellation of placement registration for the semester.
3. Falsification of CGPA, skills, or certifications in the resume is grounds for immediate debarment and referral to the Academic Disciplinary Committee."""
    },
    {
        "id": "POL_004",
        "code": "AIT-PL-04",
        "category": "Conflict Resolution & Opportunity Protection",
        "title": "Overlapping Drive Conflict Priority Order",
        "text": """1. When a student is shortlisted for simultaneous rounds across multiple companies, priority order is strictly determined by:
   a) Round Type: Final Interview > Technical Round > Group Discussion > Online Test.
   b) Company Tier: Tier-1 (Dream) > Tier-2 (Core) > Mass Recruiter.
2. The AI Placement Agent is authorized to automatically negotiate and re-slot the lower-priority round to an available buffer window to protect candidate participation in both."""
    }
]

# Initial Active Exceptions
EXCEPTIONS_SEED = [
    {
        "id": "EXC_001",
        "drive_id": "DRIVE_GOOGLE_2026",
        "company_name": "Google India",
        "type": "Panel Unavailable",
        "title": "Panel 2 (Fullstack & Distributed Systems) Unavailable",
        "description": "Panel 2 lead reported emergency illness. 18 shortlisted candidates are scheduled between 10:00 AM - 03:00 PM with no active interviewer.",
        "affected_count": 18,
        "affected_student_ids": ["STU001", "STU002", "STU004", "STU007", "STU009", "STU011", "STU014", "STU016", "STU018", "STU020", "STU022", "STU024", "STU026", "STU028", "STU030", "STU032", "STU034", "STU036"],
        "severity": "Critical",
        "status": "Pending Approval",
        "timestamp": "2026-08-22T09:15:00",
        "ai_recommendation": {
            "summary": "Reallocate 10 candidates to Panel 4 and 8 candidates to Panel 5.",
            "reasoning": "Panel 4 (Cloud & Backend) and Panel 5 (DSA & Problem Solving) share matching skill domains (Python, Java, Distributed Systems) and currently operate at 40% capacity with 14 combined available slots. Estimated delay is under 15 minutes.",
            "impact": {"delay_mins": 15, "panels_used": ["PANEL_04", "PANEL_05"], "unassigned": 0},
            "actions": [
                {"move": "10 students (STU001-STU020)", "to_panel": "PANEL_04 (Room 104)"},
                {"move": "8 students (STU022-STU036)", "to_panel": "PANEL_05 (Room 105)"}
            ]
        }
    },
    {
        "id": "EXC_002",
        "drive_id": "DRIVE_MSFT_2026",
        "company_name": "Microsoft",
        "type": "Student Opportunity Conflict",
        "title": "Overlapping Schedule for 3 Top Candidates",
        "description": "STU001 (Rahul Sharma), STU002 (Priya Nair), and STU004 (Sneha Roy) have overlapping interview slots with Google Technical Round 2 at 10:30 AM.",
        "affected_count": 3,
        "affected_student_ids": ["STU001", "STU002", "STU004"],
        "severity": "Medium",
        "status": "Pending Approval",
        "timestamp": "2026-08-22T09:30:00",
        "ai_recommendation": {
            "summary": "Reschedule Microsoft Round 1 interview to 02:30 PM slot in Room 201.",
            "reasoning": "Both companies are Tier-1 Dream opportunities. Shifting Microsoft slots to the afternoon buffer preserves all 3 candidate opportunities without violating panel constraints.",
            "impact": {"delay_mins": 0, "opportunity_loss": 0},
            "actions": [
                {"student_id": "STU001", "new_slot": "14:30 - 15:15", "room": "ROOM_201"},
                {"student_id": "STU002", "new_slot": "15:15 - 16:00", "room": "ROOM_201"},
                {"student_id": "STU004", "new_slot": "16:00 - 16:45", "room": "ROOM_201"}
            ]
        }
    }
]

# Initial Audit Trail
AUDIT_SEED = [
    {
        "id": "AUD_001",
        "timestamp": "2026-08-22T08:30:00",
        "action": "Parse & Structure JD",
        "trigger": "TPO Uploaded Google India SDE-1 JD",
        "ai_analysis": "Extracted 6 required technical skills, CGPA >= 7.5, zero backlogs, 4 evaluation rounds.",
        "recommendation": "Approve structured JD criteria for automated eligibility pipeline.",
        "confidence": 0.98,
        "approval_level": "Automatic",
        "human_approval": "System Auto",
        "status": "Completed"
    },
    {
        "id": "AUD_002",
        "timestamp": "2026-08-22T08:45:00",
        "action": "Batch Eligibility Verification",
        "trigger": "Student Drive Registration Closed",
        "ai_analysis": "Evaluated 48 candidate profiles against Google rules. 34 Eligible, 11 Ineligible (CGPA/Backlogs), 3 Needs Review.",
        "recommendation": "Notify 34 eligible candidates and send review alerts for 3 profiles.",
        "confidence": 0.96,
        "approval_level": "Automatic",
        "human_approval": "System Auto",
        "status": "Completed"
    },
    {
        "id": "AUD_003",
        "timestamp": "2026-08-22T09:00:00",
        "action": "Generate Multi-Panel Schedule",
        "trigger": "TPO Approved Shortlist of 22 Candidates",
        "ai_analysis": "Optimized interview distribution across 5 panels and 5 rooms, minimizing candidate idle time to < 12 mins.",
        "recommendation": "Publish schedule and dispatch calendar invites via Email & App Push.",
        "confidence": 0.94,
        "approval_level": "Approval Required",
        "human_approval": "Approved by TPO Dr. Ramanathan",
        "status": "Completed"
    }
]

# Initial Scheduled Interviews
SCHEDULED_INTERVIEWS_SEED = [
    {
        "id": "SCH_001",
        "drive_id": "DRIVE_GOOGLE_2026",
        "student_id": "STU001",
        "student_name": "Rahul Sharma",
        "company_name": "Google India",
        "role_title": "Software Development Engineer - I (SDE-1)",
        "round_name": "Technical Round 2 (System Design & Code Quality)",
        "panel_id": "PANEL_02",
        "panel_name": "Panel 2 - Fullstack & Distributed Systems",
        "room_id": "ROOM_102",
        "room_name": "Interview Room 102 (Block A)",
        "date": "2026-08-22",
        "start_time": "10:00",
        "end_time": "10:45",
        "status": "Needs Reschedule",
        "attendance_confirmed": True
    },
    {
        "id": "SCH_002",
        "drive_id": "DRIVE_GOOGLE_2026",
        "student_id": "STU002",
        "student_name": "Priya Nair",
        "company_name": "Google India",
        "role_title": "Software Development Engineer - I (SDE-1)",
        "round_name": "Technical Round 2 (System Design & Code Quality)",
        "panel_id": "PANEL_02",
        "panel_name": "Panel 2 - Fullstack & Distributed Systems",
        "room_id": "ROOM_102",
        "room_name": "Interview Room 102 (Block A)",
        "date": "2026-08-22",
        "start_time": "11:00",
        "end_time": "11:45",
        "status": "Needs Reschedule",
        "attendance_confirmed": True
    },
    {
        "id": "SCH_003",
        "drive_id": "DRIVE_GOOGLE_2026",
        "student_id": "STU004",
        "student_name": "Sneha Roy",
        "company_name": "Google India",
        "role_title": "Software Development Engineer - I (SDE-1)",
        "round_name": "Technical Round 1 (Algorithms & Data Structures)",
        "panel_id": "PANEL_01",
        "panel_name": "Panel 1 - Core CS & Algorithms",
        "room_id": "ROOM_101",
        "room_name": "Interview Room 101 (Block A)",
        "date": "2026-08-22",
        "start_time": "10:00",
        "end_time": "10:45",
        "status": "Confirmed",
        "attendance_confirmed": True
    }
]

# Initial Communications Log
COMMUNICATIONS_SEED = [
    {
        "id": "COMM_001",
        "student_id": "STU001",
        "student_name": "Rahul Sharma",
        "channel": "Email",
        "recipient": "rahul.sharma@apex.edu",
        "subject": "Shortlisted for Google India SDE-1 Technical Round 2",
        "message": "Hello Rahul, You have been shortlisted for the Software Engineer role at Google India. Round: Technical Interview 2. Date: 22 August, Time: 10:00 AM, Venue: Block A - Room 102. Please arrive 15 minutes early with your college ID and resume.",
        "timestamp": "2026-08-22T08:50:00",
        "status": "Delivered",
        "escalation_level": 1,
        "response_received": True
    },
    {
        "id": "COMM_002",
        "student_id": "STU003",
        "student_name": "Amit Patel",
        "channel": "Email",
        "recipient": "amit.patel@apex.edu",
        "subject": "TCS Digital Drive Registration Confirmation",
        "message": "Hello Amit, You are eligible for TCS Digital / Prime Engineer drive. Please confirm your attendance for the upcoming assessment.",
        "timestamp": "2026-08-22T09:00:00",
        "status": "Delivered (No Response)",
        "escalation_level": 1,
        "response_received": False
    },
    {
        "id": "COMM_003",
        "student_id": "STU003",
        "student_name": "Amit Patel",
        "channel": "App Notification",
        "recipient": "App Push STU003",
        "subject": "URGENT: Placement Confirmation Required",
        "message": "Action Required: Please confirm your TCS Digital test attendance within 3 hours to avoid debarment.",
        "timestamp": "2026-08-22T09:30:00",
        "status": "Delivered (Unopened)",
        "escalation_level": 2,
        "response_received": False
    }
]

# Authentication Users Seed
USERS_SEED = [
    {
        "id": "USR_OFFICER_01",
        "email": "officer@example.com",
        "password": "officer123",
        "name": "Dr. Ramanathan S.",
        "role": "placement_officer",
        "designation": "Head - Placement & Corporate Relations",
        "department": "Office of Career Services & Placement",
        "phone": "+91 98401 23456"
    },
    {
        "id": "USR_OFFICER_02",
        "email": "tpo@apex.edu",
        "password": "tpo123",
        "name": "Dr. Ramanathan S.",
        "role": "placement_officer",
        "designation": "Head - Placement & Corporate Relations",
        "department": "Office of Career Services & Placement",
        "phone": "+91 98401 23456"
    },
    {
        "id": "USR_STU_001",
        "email": "student@example.com",
        "password": "student123",
        "name": "Rahul Sharma",
        "role": "student",
        "student_id": "STU001",
        "department": "School of Computer Engineering",
        "branch": "Computer Science & Engineering"
    },
    {
        "id": "USR_STU_001_OFFICIAL",
        "email": "rahul.sharma@apex.edu",
        "password": "student123",
        "name": "Rahul Sharma",
        "role": "student",
        "student_id": "STU001",
        "department": "School of Computer Engineering",
        "branch": "Computer Science & Engineering"
    },
    {
        "id": "USR_STU_002",
        "email": "priya.nair@apex.edu",
        "password": "student123",
        "name": "Priya Nair",
        "role": "student",
        "student_id": "STU002",
        "department": "School of Information Technology",
        "branch": "Information Technology"
    },
    {
        "id": "USR_STU_003",
        "email": "amit.patel@apex.edu",
        "password": "student123",
        "name": "Amit Patel",
        "role": "student",
        "student_id": "STU003",
        "department": "School of Electrical & Electronics",
        "branch": "Electronics & Communication Engineering"
    },
    {
        "id": "USR_STU_004",
        "email": "sneha.roy@apex.edu",
        "password": "student123",
        "name": "Sneha Roy",
        "role": "student",
        "student_id": "STU004",
        "department": "School of Artificial Intelligence",
        "branch": "Artificial Intelligence & Data Science"
    }
]

# Student Applications Seed
APPLICATIONS_SEED = [
    {
        "id": "APP_001",
        "student_id": "STU001",
        "student_name": "Rahul Sharma",
        "student_email": "rahul.sharma@apex.edu",
        "drive_id": "DRIVE_GOOGLE_2026",
        "company_name": "Google India",
        "role_title": "Software Development Engineer - I (SDE-1)",
        "package": "₹ 32.5 LPA",
        "applied_at": "2026-08-10T14:30:00",
        "status": "INTERVIEW",
        "current_round": "Technical Round 2 (System Design & Distributed Systems)",
        "resume_filename": "Rahul_Sharma_Resume.pdf",
        "interview_details": {
            "panel_id": "PANEL_02",
            "panel_name": "Panel 2 - Fullstack & Distributed Systems",
            "interviewers": "Suresh Kumar (Tech Lead), Ananya Sen (Senior SWE)",
            "date": "2026-08-29",
            "time": "10:00 AM",
            "venue": "Block A - Room 102",
            "instructions": "Arrive 15 minutes early. Bring 2 copies of your resume and valid college ID."
        },
        "result_details": {
            "status": "INTERVIEW",
            "reason": "",
            "feedback": "Cleared Technical Round 1 with high score in Dynamic Programming and Graph Algorithms.",
            "next_step": "Technical Round 2 with Panel 2 (System Design)"
        }
    },
    {
        "id": "APP_002",
        "student_id": "STU001",
        "student_name": "Rahul Sharma",
        "student_email": "rahul.sharma@apex.edu",
        "drive_id": "DRIVE_MSFT_2026",
        "company_name": "Microsoft",
        "role_title": "Cloud Solutions & Software Engineer",
        "package": "₹ 28.0 LPA",
        "applied_at": "2026-08-12T11:15:00",
        "status": "SHORTLISTED",
        "current_round": "Round 1 Technical Coding & Cloud",
        "resume_filename": "Rahul_Sharma_Resume.pdf",
        "interview_details": {
            "panel_id": "PANEL_06",
            "panel_name": "Panel 6 - Azure & Cloud Architecture",
            "interviewers": "Vikram Malhotra (Principal Architect)",
            "date": "2026-08-30",
            "time": "02:30 PM",
            "venue": "Block B - Room 201",
            "instructions": "Bring your personal laptop configured with development IDE and stable browser."
        },
        "result_details": {
            "status": "SHORTLISTED",
            "reason": "",
            "feedback": "Shortlisted based on outstanding academic record and strong cloud/FastAPI portfolio.",
            "next_step": "Round 1 Coding & Cloud Interview"
        }
    },
    {
        "id": "APP_003",
        "student_id": "STU001",
        "student_name": "Rahul Sharma",
        "student_email": "rahul.sharma@apex.edu",
        "drive_id": "DRIVE_INFOSYS_2026",
        "company_name": "Infosys Ltd",
        "role_title": "Specialist Programmer & Digital Specialist Engineer",
        "package": "₹ 9.5 LPA",
        "applied_at": "2026-07-05T09:00:00",
        "status": "SELECTED",
        "current_round": "Offer Letter Released & Verified",
        "resume_filename": "Rahul_Sharma_Resume.pdf",
        "interview_details": {
            "panel_id": "PANEL_01",
            "panel_name": "Panel 1 - Core CS & Algorithms",
            "interviewers": "Nagesh Rao, Preeti Menon",
            "date": "2026-07-25",
            "time": "11:30 AM",
            "venue": "Placement Centre - Room 101",
            "instructions": "Complete the digital onboarding verification link sent to your email."
        },
        "result_details": {
            "status": "SELECTED",
            "offer_ctc": "₹ 9.5 LPA",
            "reason": "",
            "feedback": "Exceeded cutoffs across all rounds. Demonstrates excellent problem solving and architecture clarity.",
            "next_step": "HR Documentation & Offer Acceptance"
        }
    },
    {
        "id": "APP_004",
        "student_id": "STU001",
        "student_name": "Rahul Sharma",
        "student_email": "rahul.sharma@apex.edu",
        "drive_id": "DRIVE_AMAZON_2026",
        "company_name": "Amazon India",
        "role_title": "Software Development Engineer - I",
        "package": "₹ 34.0 LPA",
        "applied_at": "2026-08-16T18:20:00",
        "status": "NOT_SELECTED",
        "current_round": "Technical Assessment Round",
        "resume_filename": "Rahul_Sharma_Resume.pdf",
        "interview_details": {},
        "result_details": {
            "status": "NOT_SELECTED",
            "reason": "Assessment score below cutoff",
            "feedback": "Technical assessment score was below the required 85% cutoff in Tree/Graph Algorithms and System Concurrency.",
            "next_step": "Focus on high-concurrency coding problems for upcoming Tier-1 product drives."
        }
    },
    {
        "id": "APP_005",
        "student_id": "STU001",
        "student_name": "Rahul Sharma",
        "student_email": "rahul.sharma@apex.edu",
        "drive_id": "DRIVE_TCS_2026",
        "company_name": "Tata Consultancy Services (TCS)",
        "role_title": "TCS Digital / Prime Engineer",
        "package": "₹ 11.5 LPA",
        "applied_at": "2026-08-18T10:00:00",
        "status": "APPLIED",
        "current_round": "Application Verification",
        "resume_filename": "Rahul_Sharma_Resume.pdf",
        "interview_details": {},
        "result_details": {
            "status": "APPLIED",
            "reason": "",
            "feedback": "Application successfully registered. Hall ticket generation in progress for upcoming assessment.",
            "next_step": "Awaiting online assessment schedule."
        }
    },
    {
        "id": "APP_006",
        "student_id": "STU002",
        "student_name": "Priya Nair",
        "student_email": "priya.nair@apex.edu",
        "drive_id": "DRIVE_GOOGLE_2026",
        "company_name": "Google India",
        "role_title": "Software Development Engineer - I (SDE-1)",
        "package": "₹ 32.5 LPA",
        "applied_at": "2026-08-10T15:00:00",
        "status": "INTERVIEW",
        "current_round": "Technical Round 2 (System Design)",
        "resume_filename": "Priya_Nair_Resume.pdf",
        "interview_details": {
            "panel_id": "PANEL_02",
            "panel_name": "Panel 2 - Fullstack & Distributed Systems",
            "interviewers": "Suresh Kumar, Ananya Sen",
            "date": "2026-08-29",
            "time": "11:00 AM",
            "venue": "Block A - Room 102",
            "instructions": "Arrive 15 minutes early with college ID and resume."
        },
        "result_details": {
            "status": "INTERVIEW",
            "reason": "",
            "feedback": "Excellent performance in Data Structures round.",
            "next_step": "Technical Round 2"
        }
    },
    {
        "id": "APP_007",
        "student_id": "STU002",
        "student_name": "Priya Nair",
        "student_email": "priya.nair@apex.edu",
        "drive_id": "DRIVE_AMAZON_2026",
        "company_name": "Amazon India",
        "role_title": "Software Development Engineer - I",
        "package": "₹ 34.0 LPA",
        "applied_at": "2026-08-16T19:00:00",
        "status": "SHORTLISTED",
        "current_round": "Technical Interview 1",
        "resume_filename": "Priya_Nair_Resume.pdf",
        "interview_details": {
            "panel_id": "PANEL_03",
            "panel_name": "Panel 3 - AWS Core & Backend",
            "interviewers": "Kavita Reddy, Alok Verma",
            "date": "2026-09-08",
            "time": "10:30 AM",
            "venue": "Block A - Room 103",
            "instructions": "Be ready to write live code in shared environment."
        },
        "result_details": {
            "status": "SHORTLISTED",
            "reason": "",
            "feedback": "Top 5% score in online assessment.",
            "next_step": "Technical Interview 1"
        }
    },
    {
        "id": "APP_008",
        "student_id": "STU003",
        "student_name": "Amit Patel",
        "student_email": "amit.patel@apex.edu",
        "drive_id": "DRIVE_TCS_2026",
        "company_name": "Tata Consultancy Services (TCS)",
        "role_title": "TCS Digital / Prime Engineer",
        "package": "₹ 11.5 LPA",
        "applied_at": "2026-08-18T12:00:00",
        "status": "APPLIED",
        "current_round": "Attendance Confirmation Pending",
        "resume_filename": "Amit_Patel_Resume.pdf",
        "interview_details": {},
        "result_details": {
            "status": "APPLIED",
            "reason": "",
            "feedback": "Please confirm test attendance on student portal.",
            "next_step": "Attendance confirmation required."
        }
    },
    {
        "id": "APP_009",
        "student_id": "STU004",
        "student_name": "Sneha Roy",
        "student_email": "sneha.roy@apex.edu",
        "drive_id": "DRIVE_GOOGLE_2026",
        "company_name": "Google India",
        "role_title": "Software Development Engineer - I (SDE-1)",
        "package": "₹ 32.5 LPA",
        "applied_at": "2026-08-10T16:00:00",
        "status": "INTERVIEW",
        "current_round": "Technical Round 1 (Algorithms & Data Structures)",
        "resume_filename": "Sneha_Roy_Resume.pdf",
        "interview_details": {
            "panel_id": "PANEL_01",
            "panel_name": "Panel 1 - Core CS & Algorithms",
            "interviewers": "Dr. R. K. Saxena, Arvind Nair",
            "date": "2026-08-29",
            "time": "10:00 AM",
            "venue": "Block A - Room 101",
            "instructions": "Carry resume copies and AI/ML project portfolio documentation."
        },
        "result_details": {
            "status": "INTERVIEW",
            "reason": "",
            "feedback": "High aptitude and ML foundation verified.",
            "next_step": "Technical Round 1"
        }
    },
    {
        "id": "APP_010",
        "student_id": "STU001",
        "student_name": "Rahul Sharma",
        "student_email": "rahul.sharma@apex.edu",
        "drive_id": "DRIVE_GOOGLE_2026",
        "company_name": "Google India",
        "role_title": "Software Development Engineer - I (SDE-1)",
        "package": "₹ 32.5 LPA",
        "applied_at": "2026-08-10T14:30:00",
        "status": "SELECTED",
        "current_round": "Offer Letter Released",
        "resume_filename": "Rahul_Sharma_Resume.pdf",
        "interview_details": {
            "panel_id": "PANEL_02",
            "panel_name": "Panel 2 - Fullstack & Distributed Systems",
            "interviewers": "Suresh Kumar (Tech Lead), Ananya Sen (Senior SWE)",
            "date": "2026-08-29",
            "time": "10:00 AM",
            "venue": "Block A - Room 102"
        },
        "result_details": {
            "status": "SELECTED",
            "offer_ctc": "₹ 32.5 LPA",
            "reason": "Exceeded all technical and behavioral cutoffs.",
            "feedback": "Outstanding performance in system architecture and coding rounds.",
            "next_step": "Formal Offer Rollout & Documentation"
        }
    },
    {
        "id": "APP_011",
        "student_id": "STU005",
        "student_name": "Vikram Singh",
        "student_email": "vikram.singh@apex.edu",
        "drive_id": "DRIVE_GOOGLE_2026",
        "company_name": "Google India",
        "role_title": "Software Development Engineer - I (SDE-1)",
        "package": "₹ 32.5 LPA",
        "applied_at": "2026-08-11T10:00:00",
        "status": "NOT_SELECTED",
        "current_round": "Eligibility Rejection",
        "resume_filename": "Vikram_Singh_Resume.pdf",
        "interview_details": {},
        "result_details": {
            "status": "NOT_SELECTED",
            "reason": "CGPA below 7.5 threshold (6.8 CGPA) and 2 active backlogs",
            "feedback": "Candidate does not meet academic eligibility criteria of 0 active backlogs.",
            "next_step": "Clear standing backlogs and re-apply for open pool drives."
        }
    }
]

# Real-Time Student Notifications Seed
NOTIFICATIONS_SEED = [
    {
        "id": "NOTIF_001",
        "student_id": "STU001",
        "type": "SELECTION",
        "title": "🎉 Congratulations! Offer Received from Infosys",
        "message": "You have been selected for Specialist Programmer (₹ 9.5 LPA) at Infosys Ltd! Please review your offer details.",
        "is_read": False,
        "created_at": "2026-08-20T10:00:00",
        "link": "/applications"
    },
    {
        "id": "NOTIF_002",
        "student_id": "STU001",
        "type": "INTERVIEW_SCHEDULED",
        "title": "📅 Google India Technical Interview 2 Scheduled",
        "message": "Your Technical Interview 2 is scheduled for 29 Aug 2026 at 10:00 AM in Block A - Room 102 (Panel 2 - Fullstack & Distributed Systems).",
        "is_read": False,
        "created_at": "2026-08-21T14:30:00",
        "link": "/applications"
    },
    {
        "id": "NOTIF_003",
        "student_id": "STU001",
        "type": "NEW_DRIVE",
        "title": "🚀 New Placement Drive: Amazon India (₹ 34 LPA)",
        "message": "Amazon India SDE-1 drive is now accepting campus applications. Deadline: 31 Aug 2026.",
        "is_read": True,
        "created_at": "2026-08-15T09:00:00",
        "link": "/drives"
    },
    {
        "id": "NOTIF_004",
        "student_id": "STU001",
        "type": "APPLICATION_UPDATE",
        "title": "Application Status Update: TCS Digital",
        "message": "Your application for TCS Digital / Prime Engineer has been successfully submitted and is currently under review.",
        "is_read": True,
        "created_at": "2026-08-18T16:00:00",
        "link": "/applications"
    },
    {
        "id": "NOTIF_005",
        "student_id": "STU002",
        "type": "INTERVIEW_SCHEDULED",
        "title": "📅 Google India Technical Interview 2 Scheduled",
        "message": "Your Technical Interview 2 is scheduled for 29 Aug 2026 at 11:00 AM in Block A - Room 102.",
        "is_read": False,
        "created_at": "2026-08-21T14:30:00",
        "link": "/applications"
    },
    {
        "id": "NOTIF_006",
        "student_id": "STU003",
        "type": "ACTION_REQUIRED",
        "title": "⚠️ Attendance Confirmation Required: TCS Digital",
        "message": "Please confirm your attendance for the upcoming TCS Digital assessment to avoid slot cancellation.",
        "is_read": False,
        "created_at": "2026-08-22T09:30:00",
        "link": "/dashboard"
    },
    {
        "id": "NOTIF_007",
        "student_id": "STU004",
        "type": "INTERVIEW_SCHEDULED",
        "title": "📅 Google India Technical Interview 1 Scheduled",
        "message": "Your Technical Interview 1 is scheduled for 29 Aug 2026 at 10:00 AM in Block A - Room 101.",
        "is_read": False,
        "created_at": "2026-08-21T14:30:00",
        "link": "/applications"
    }
]
