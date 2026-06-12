from pydantic import BaseModel, ConfigDict
from typing import List, Optional

# ==========================================
# LoveMessage Schemas
# ==========================================
class LoveMessageBase(BaseModel):
    id: str
    sender: str
    text: str
    timestamp: int
    emoji: str = "💖"
    bubble_color: str
    x: Optional[int] = None
    y: Optional[int] = None
    scale: Optional[float] = None
    speed: Optional[int] = None

class LoveMessageCreate(LoveMessageBase):
    pass

class LoveMessage(LoveMessageBase):
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# LoveStory Schemas
# ==========================================
class LoveStoryBase(BaseModel):
    title: str
    tag: str
    reading_time: str
    emoji: str
    date: str
    paragraphs: List[str]

class LoveStoryCreate(LoveStoryBase):
    pass

class LoveStory(LoveStoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Project Schemas
# ==========================================
class ProjectBase(BaseModel):
    title: str
    category: str
    image: str
    techs: List[str]
    description: str
    details: str
    github: str = "#"
    demo: str = "#"

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Experience Schemas
# ==========================================
class ExperienceBase(BaseModel):
    role: str
    company: str
    period: str
    description: List[str]
    details: str
    technologies: List[str]
    achievements: List[str]

class ExperienceCreate(ExperienceBase):
    pass

class Experience(ExperienceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Service Schemas
# ==========================================
class ServiceBase(BaseModel):
    id: str
    title: str
    description: str
    long_description: str
    icon_name: str
    color: str
    features: List[str]
    advantages: List[str]
    use_cases: List[str]
    technologies: List[str]
    duration: str
    deliverables: List[str]

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase):
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Testimonial Schemas
# ==========================================
class TestimonialBase(BaseModel):
    name: str
    role: str
    message: str
    avatar: str
    rating: int = 5
    service_id: Optional[str] = None

class TestimonialCreate(TestimonialBase):
    pass

class Testimonial(TestimonialBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Skill Schemas
# ==========================================
class SkillBase(BaseModel):
    category: str
    name: str
    level: int

class SkillCreate(SkillBase):
    pass

class Skill(SkillBase):
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Certification Schemas
# ==========================================
class CertificationBase(BaseModel):
    id: str
    title: str
    issuer: str
    date: str
    credential_id: str
    category: str
    skills: List[str]
    description: str
    verify_url: str
    logo_color: str

class CertificationCreate(CertificationBase):
    pass

class Certification(CertificationBase):
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# Contact Message Schemas
# ==========================================
class ContactMessageBase(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    created_at: int

class ContactMessageCreate(ContactMessageBase):
    pass

class ContactMessage(ContactMessageBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# Queen Reply Schemas
# ==========================================
class QueenReplyBase(BaseModel):
    name: str
    message: str
    mood: str
    created_at: int

class QueenReplyCreate(QueenReplyBase):
    pass

class QueenReply(QueenReplyBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
