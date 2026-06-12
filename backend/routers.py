from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import schemas as schemas
import services as services
from database import get_db

# Création des routeurs individuels
router_projects = APIRouter(prefix="/projects", tags=["Projects"])
router_messages = APIRouter(prefix="/messages", tags=["Love Messages"])
router_stories = APIRouter(prefix="/stories", tags=["Love Stories"])
router_experiences = APIRouter(prefix="/experiences", tags=["Experiences"])
router_services = APIRouter(prefix="/services", tags=["Services"])
router_testimonials = APIRouter(prefix="/testimonials", tags=["Testimonials"])
router_skills = APIRouter(prefix="/skills", tags=["Skills"])
router_certifications = APIRouter(prefix="/certifications", tags=["Certifications"])
router_contacts = APIRouter(prefix="/contacts", tags=["Contacts"])
router_queen = APIRouter(prefix="/queen", tags=["Queen Replies"])

# ==========================================
# Projects Routes
# ==========================================
@router_projects.get("/", response_model=List[schemas.Project])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_projects(db, skip=skip, limit=limit)

@router_projects.post("/", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    return services.create_project(db=db, project=project)

# ==========================================
# Love Messages Routes
# ==========================================
@router_messages.get("/", response_model=List[schemas.LoveMessage])
def read_love_messages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_love_messages(db, skip=skip, limit=limit)

@router_messages.post("/", response_model=schemas.LoveMessage)
def create_love_message(message: schemas.LoveMessageCreate, db: Session = Depends(get_db)):
    return services.create_love_message(db=db, message=message)

# ==========================================
# Love Stories Routes
# ==========================================
@router_stories.get("/", response_model=List[schemas.LoveStory])
def read_love_stories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_love_stories(db, skip=skip, limit=limit)

@router_stories.post("/", response_model=schemas.LoveStory)
def create_love_story(story: schemas.LoveStoryCreate, db: Session = Depends(get_db)):
    return services.create_love_story(db=db, story=story)

# ==========================================
# Experiences Routes
# ==========================================
@router_experiences.get("/", response_model=List[schemas.Experience])
def read_experiences(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_experiences(db, skip=skip, limit=limit)

@router_experiences.post("/", response_model=schemas.Experience)
def create_experience(experience: schemas.ExperienceCreate, db: Session = Depends(get_db)):
    return services.create_experience(db=db, experience=experience)

# ==========================================
# Services (Prestations) Routes
# ==========================================
@router_services.get("/", response_model=List[schemas.Service])
def read_services(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_services(db, skip=skip, limit=limit)

@router_services.post("/", response_model=schemas.Service)
def create_service(service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    return services.create_service(db=db, service=service)

# ==========================================
# Testimonials Routes
# ==========================================
@router_testimonials.get("/", response_model=List[schemas.Testimonial])
def read_testimonials(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_testimonials(db, skip=skip, limit=limit)

@router_testimonials.post("/", response_model=schemas.Testimonial)
def create_testimonial(testimonial: schemas.TestimonialCreate, db: Session = Depends(get_db)):
    return services.create_testimonial(db=db, testimonial=testimonial)

# ==========================================
# Skills Routes
# ==========================================
@router_skills.get("/", response_model=List[schemas.Skill])
def read_skills(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_skills(db, skip=skip, limit=limit)

@router_skills.post("/", response_model=schemas.Skill)
def create_skill(skill: schemas.SkillCreate, db: Session = Depends(get_db)):
    return services.create_skill(db=db, skill=skill)

# ==========================================
# Certifications Routes
# ==========================================
@router_certifications.get("/", response_model=List[schemas.Certification])
def read_certifications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_certifications(db, skip=skip, limit=limit)

@router_certifications.post("/", response_model=schemas.Certification)
def create_certification(certification: schemas.CertificationCreate, db: Session = Depends(get_db)):
    return services.create_certification(db=db, certification=certification)

# ==========================================
# Contacts Routes
# ==========================================
@router_contacts.get("/", response_model=List[schemas.ContactMessage])
def read_contacts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_contact_messages(db, skip=skip, limit=limit)

@router_contacts.post("/", response_model=schemas.ContactMessage)
def create_contact(contact: schemas.ContactMessageCreate, db: Session = Depends(get_db)):
    return services.create_contact_message(db=db, message=contact)

# ==========================================
# Queen Replies Routes
# ==========================================
@router_queen.get("/", response_model=List[schemas.QueenReply])
def read_queen_replies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_queen_replies(db, skip=skip, limit=limit)

@router_queen.post("/", response_model=schemas.QueenReply)
def create_queen_reply(reply: schemas.QueenReplyCreate, db: Session = Depends(get_db)):
    return services.create_queen_reply(db=db, reply=reply)

# ==========================================
# Main API Router
# ==========================================
api_router = APIRouter(prefix="/api/v1")
api_router.include_router(router_projects)
api_router.include_router(router_messages)
api_router.include_router(router_stories)
api_router.include_router(router_experiences)
api_router.include_router(router_services)
api_router.include_router(router_testimonials)
api_router.include_router(router_skills)
api_router.include_router(router_certifications)
api_router.include_router(router_contacts)
api_router.include_router(router_queen)
