"""
Pydantic models for the AI Portfolio candidate profile.

Run this file directly to validate candidate_profile.json:
    python models.py
"""

import json
from pathlib import Path
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class Contact(BaseModel):
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None


class Education(BaseModel):
    degree: str
    institution: str
    duration: str
    cgpa: Optional[float] = None


class Skills(BaseModel):
    programming_languages: List[str] = Field(default_factory=list)
    web_development: List[str] = Field(default_factory=list)
    backend_and_databases: List[str] = Field(default_factory=list)
    ai_and_ml: List[str] = Field(default_factory=list)
    tools_and_ides: List[str] = Field(default_factory=list)
    core_cs_concepts: List[str] = Field(default_factory=list)


class Project(BaseModel):
    name: str
    tagline: Optional[str] = None
    skills_used: List[str] = Field(default_factory=list)
    description: List[str] = Field(default_factory=list)
    link: Optional[str] = None
    live_demo: Optional[str] = None


class Experience(BaseModel):
    role: str
    company: str
    duration: str
    description: List[str] = Field(default_factory=list)


class Achievement(BaseModel):
    title: str
    description: Optional[str] = None


class Certification(BaseModel):
    name: str
    issuer: str
    verify_link: Optional[str] = None


class SocialLinks(BaseModel):
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None


class CandidateProfile(BaseModel):
    name: str
    contact: Contact
    career_objective: Optional[str] = None
    education: List[Education]
    skills: Skills
    projects: List[Project]
    experience: List[Experience] = Field(default_factory=list)
    achievements: List[Achievement] = Field(default_factory=list)
    certifications: List[Certification] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    social_links: SocialLinks


def load_profile(path: str = "candidate_profile.json") -> CandidateProfile:
    """Load and validate the candidate profile JSON file."""
    data = json.loads(Path(path).read_text())
    return CandidateProfile(**data)


if __name__ == "__main__":
    profile = load_profile()
    print(f"Validated profile for: {profile.name}")
    print(f"Projects: {len(profile.projects)}")
    print(f"Certifications: {len(profile.certifications)}")
