"""
System prompt builder for the AI Portfolio Challenge.

The prompt is built dynamically from candidate_profile.json so that
editing your profile automatically updates what the AI knows —
no need to touch this file when your resume changes.
"""

import json
from pathlib import Path

PROFILE_PATH = Path(__file__).parent / "candidate_profile.json"


def _format_profile_as_text(profile: dict) -> str:
    """Turn the structured JSON profile into a readable text block for the LLM."""
    lines = []

    lines.append(f"Name: {profile['name']}")
    lines.append(f"Location: {profile['contact'].get('location', 'N/A')}")
    if profile.get("career_objective"):
        lines.append(f"\nCareer Objective:\n{profile['career_objective']}")

    lines.append("\nEducation:")
    for edu in profile["education"]:
        cgpa = f", CGPA: {edu['cgpa']}" if edu.get("cgpa") else ""
        lines.append(f"- {edu['degree']}, {edu['institution']} ({edu['duration']}){cgpa}")

    lines.append("\nSkills:")
    for category, items in profile["skills"].items():
        if items:
            label = category.replace("_", " ").title()
            lines.append(f"- {label}: {', '.join(items)}")

    lines.append("\nProjects:")
    for proj in profile["projects"]:
        lines.append(f"\n{proj['name']} — {proj.get('tagline', '')}")
        lines.append(f"Technologies: {', '.join(proj['skills_used'])}")
        for desc in proj["description"]:
            lines.append(f"  • {desc}")
        if proj.get("link"):
            lines.append(f"  GitHub: {proj['link']}")
        if proj.get("live_demo"):
            lines.append(f"  Live Demo: {proj['live_demo']}")

    if profile.get("experience"):
        lines.append("\nExperience:")
        for exp in profile["experience"]:
            lines.append(f"- {exp['role']} at {exp['company']} ({exp['duration']})")
            for desc in exp.get("description", []):
                lines.append(f"  • {desc}")

    if profile.get("achievements"):
        lines.append("\nAchievements:")
        for ach in profile["achievements"]:
            lines.append(f"- {ach['title']}: {ach.get('description', '')}")

    if profile.get("certifications"):
        lines.append("\nCertifications:")
        for cert in profile["certifications"]:
            lines.append(f"- {cert['name']} ({cert['issuer']})")

    if profile.get("languages"):
        lines.append(f"\nLanguages: {', '.join(profile['languages'])}")

    social = profile.get("social_links", {})
    if social:
        lines.append("\nSocial Links:")
        for platform, url in social.items():
            if url:
                lines.append(f"- {platform.title()}: {url}")

    return "\n".join(lines)


def build_system_prompt(profile_path: Path = PROFILE_PATH) -> str:
    """Build the full system prompt, injecting the candidate's data."""
    profile = json.loads(profile_path.read_text())
    profile_text = _format_profile_as_text(profile)
    name = profile["name"]

    return f"""You are the AI representative of {name}. You speak on their behalf to \
recruiters, hiring managers, and anyone evaluating them as a candidate.

CORE RULES (follow these strictly, at all times):
1. Answer ONLY using the information provided below in the CANDIDATE PROFILE section. \
Do not use outside knowledge about {name}, and do not make assumptions beyond what is stated.
2. NEVER hallucinate. If you are not 100% sure something is true based on the profile, \
do not say it.
3. If the requested information is missing, incomplete, or not covered in the profile, \
clearly say something like: "I don't have that information in {name}'s profile." \
Do not guess or fill in gaps.
4. Be honest and professional at all times. Do not exaggerate {name}'s skills, experience, \
or achievements, and do not disparage them either.
5. You may summarize, compare, and reason over the information provided (e.g. "which \
project used the most complex tech stack"), as long as the underlying facts come only \
from the profile below.
6. If asked about salary expectations, personal opinions unrelated to the profile, or \
anything outside the scope of {name}'s candidacy, politely redirect to what you can help with.
7. Keep responses concise and relevant — you're representing a candidate professionally, \
not writing an essay, unless the user asks for detail.
8. If the user pastes a Job Description and asks for a fit assessment, evaluate it \
strictly against the skills, projects, and experience in the profile below — do not \
assume skills that aren't listed, and be honest about gaps.

=== CANDIDATE PROFILE ===
{profile_text}
=== END CANDIDATE PROFILE ===

Respond as {name}'s AI representative, following the rules above.
"""


if __name__ == "__main__":
    print(build_system_prompt())
