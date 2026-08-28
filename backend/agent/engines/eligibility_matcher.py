import re

class EligibilityAndMatcherEngine:
    def verify_student(self, student, requirements):
        """
        Compares a single student profile against company requirements.
        Returns:
            status: "Eligible" | "Not Eligible" | "Needs Review"
            reasons: list of detailed explanations
            factors: dict of passed/failed constraints
            confidence: float (0.0 to 1.0)
        """
        reasons = []
        factors = {}
        status = "Eligible"

        # 1. CGPA Check
        min_cgpa = requirements.get("min_cgpa", 7.0)
        student_cgpa = student.get("cgpa", 0.0)
        if student_cgpa >= min_cgpa:
            factors["cgpa"] = {"passed": True, "value": student_cgpa, "required": min_cgpa}
        else:
            factors["cgpa"] = {"passed": False, "value": student_cgpa, "required": min_cgpa}
            status = "Not Eligible"
            reasons.append(f"CGPA {student_cgpa} is below minimum requirement of {min_cgpa}")

        # 2. Backlogs Check
        max_backlogs = requirements.get("max_backlogs", 0)
        student_backlogs = student.get("backlogs", 0)
        if student_backlogs <= max_backlogs:
            factors["backlogs"] = {"passed": True, "value": student_backlogs, "allowed": max_backlogs}
        else:
            factors["backlogs"] = {"passed": False, "value": student_backlogs, "allowed": max_backlogs}
            status = "Not Eligible"
            reasons.append(f"Active backlogs ({student_backlogs}) exceeds maximum allowed ({max_backlogs})")

        # 3. Branch Check
        allowed_branches = requirements.get("branches") or requirements.get("allowed_branches") or []
        student_branch = student.get("branch", "")
        if not allowed_branches or student_branch in allowed_branches or "All" in allowed_branches:
            factors["branch"] = {"passed": True, "value": student_branch}
        else:
            factors["branch"] = {"passed": False, "value": student_branch, "allowed": allowed_branches}
            status = "Not Eligible"
            reasons.append(f"Branch '{student_branch}' is not in the eligible branches list")

        # 4. Graduation Year Check
        req_grad_year = requirements.get("graduation_year", 2026)
        student_grad_year = student.get("graduation_year")
        if not student_grad_year:
            factors["graduation_year"] = {"passed": False, "value": "Missing"}
            if status != "Not Eligible":
                status = "Needs Review"
                reasons.append("Graduation year information is missing in student profile; TPO review required.")
        elif student_grad_year == req_grad_year:
            factors["graduation_year"] = {"passed": True, "value": student_grad_year}
        else:
            factors["graduation_year"] = {"passed": False, "value": student_grad_year, "required": req_grad_year}
            status = "Not Eligible"
            reasons.append(f"Graduation year {student_grad_year} does not match required batch {req_grad_year}")

        # 5. Dream Offer Delisting Check
        if student.get("placement_status") == "Placed (Dream Offer)":
            status = "Not Eligible"
            factors["placement_policy"] = {"passed": False, "reason": "Already accepted Tier-1 Dream Offer"}
            reasons.append("Student has already secured a Tier-1 Dream offer; college policy restricts multiple dream offers.")

        if not reasons:
            reasons.append(f"All academic criteria satisfied: CGPA {student_cgpa} >= {min_cgpa}, 0 disqualifying backlogs, matching branch ({student_branch}).")

        confidence = 0.98 if status != "Needs Review" else 0.85

        return {
            "student_id": student.get("id"),
            "student_name": student.get("name"),
            "status": status,
            "reasons": reasons,
            "factors": factors,
            "confidence": confidence,
            "recommended_action": "Allow shortlist registration" if status == "Eligible" else ("Review transcripts manually" if status == "Needs Review" else "Delist candidate from this drive")
        }

    def calculate_skill_match(self, student, requirements):
        """
        Calculates role-fit score and multidimensional breakdown with natural language explanation.
        """
        req_skills = [s.lower() for s in requirements.get("required_skills", [])]
        pref_skills = [s.lower() for s in requirements.get("preferred_skills", [])]

        stu_tech = [s.lower() for s in student.get("technical_skills", [])]
        stu_pref = [s.lower() for s in student.get("preferred_skills", [])]
        all_stu_skills = set(stu_tech + stu_pref)

        # 1. Required Skills Score (30%)
        if req_skills:
            req_matched = [s for s in req_skills if any(s in st or st in s for st in all_stu_skills)]
            req_score = round((len(req_matched) / len(req_skills)) * 100, 1)
        else:
            req_matched = []
            req_score = 85.0

        # 2. Preferred Skills Score (15%)
        if pref_skills:
            pref_matched = [s for s in pref_skills if any(s in st or st in s for st in all_stu_skills)]
            pref_score = round((len(pref_matched) / len(pref_skills)) * 100, 1)
        else:
            pref_matched = []
            pref_score = 75.0

        # 3. Projects Relevance (15%)
        projects = student.get("projects", [])
        proj_score = min(100, len(projects) * 45) if projects else 40

        # 4. Coding Ability (15%)
        coding_score = student.get("coding_score", 70)

        # 5. Aptitude (15%)
        aptitude_score = student.get("aptitude_score", 70)

        # 6. Communication (10%)
        comm_score = student.get("communication_score", 70)

        # Overall Weighted Match
        overall = round(
            (req_score * 0.30) +
            (pref_score * 0.15) +
            (proj_score * 0.15) +
            (coding_score * 0.15) +
            (aptitude_score * 0.15) +
            (comm_score * 0.10),
            1
        )

        # Generate Explainable AI narrative
        top_skills_str = ", ".join(student.get("technical_skills", [])[:4])
        matched_str = ", ".join([s.title() for s in req_matched[:3]]) or "Fundamental CS concepts"

        explanation_parts = []
        if overall >= 85:
            explanation_parts.append(f"Exceptional candidate profile for this role. Demonstrated strong mastery in {matched_str} with coding score of {coding_score}/100 and aptitude of {aptitude_score}/100.")
        elif overall >= 70:
            explanation_parts.append(f"Solid role alignment with {len(req_matched)}/{len(req_skills)} required skills matched. Demonstrates good foundational knowledge in {top_skills_str}.")
        else:
            explanation_parts.append(f"Moderate fit. Coding ability ({coding_score}) and project complexity meet baseline requirements, but skill gaps exist in {', '.join([s.title() for s in req_skills if s not in req_matched][:2]) or 'advanced tools'}.")

        if proj_score >= 80:
            explanation_parts.append(f"Includes {len(projects)} highly relevant hands-on engineering projects.")

        explanation = " ".join(explanation_parts)

        return {
            "student_id": student.get("id"),
            "student_name": student.get("name"),
            "overall_match": overall,
            "breakdown": {
                "required_skills": req_score,
                "preferred_skills": pref_score,
                "projects": proj_score,
                "coding_ability": coding_score,
                "aptitude": aptitude_score,
                "communication": comm_score
            },
            "matched_skills": [s.title() for s in req_matched + pref_matched],
            "missing_skills": [s.title() for s in req_skills if s not in req_matched],
            "explanation": explanation,
            "confidence": 0.94,
            "recommendation": "Strongly Recommend for Shortlist" if overall >= 85 else ("Recommend for Shortlist" if overall >= 72 else "Borderline Candidate")
        }

eligibility_matcher_engine = EligibilityAndMatcherEngine()
