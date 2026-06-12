from sqlalchemy.orm import Session
import models, schemas

# ==========================================
# LoveMessage Services
# ==========================================
def get_love_messages(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.LoveMessage).offset(skip).limit(limit).all()

def create_love_message(db: Session, message: schemas.LoveMessageCreate):
    db_message = models.LoveMessage(**message.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

# ==========================================
# LoveStory Services
# ==========================================
def get_love_stories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.LoveStory).offset(skip).limit(limit).all()

def create_love_story(db: Session, story: schemas.LoveStoryCreate):
    db_story = models.LoveStory(**story.model_dump())
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    return db_story

# ==========================================
# Project Services
# ==========================================
def get_projects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Project).offset(skip).limit(limit).all()

def get_project_by_id(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def create_project(db: Session, project: schemas.ProjectCreate):
    db_project = models.Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

# ==========================================
# Experience Services
# ==========================================
def get_experiences(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Experience).offset(skip).limit(limit).all()

def create_experience(db: Session, experience: schemas.ExperienceCreate):
    db_exp = models.Experience(**experience.model_dump())
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)
    return db_exp

# ==========================================
# Service (Prestations) Services
# ==========================================
def get_services(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Service).offset(skip).limit(limit).all()

def get_service_by_id(db: Session, service_id: str):
    return db.query(models.Service).filter(models.Service.id == service_id).first()

def create_service(db: Session, service: schemas.ServiceCreate):
    db_service = models.Service(**service.model_dump())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

# ==========================================
# Testimonial Services
# ==========================================
def get_testimonials(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Testimonial).offset(skip).limit(limit).all()

def create_testimonial(db: Session, testimonial: schemas.TestimonialCreate):
    db_testimonial = models.Testimonial(**testimonial.model_dump())
    db.add(db_testimonial)
    db.commit()
    db.refresh(db_testimonial)
    return db_testimonial

# ==========================================
# Skill Services
# ==========================================
def get_skills(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Skill).offset(skip).limit(limit).all()

def create_skill(db: Session, skill: schemas.SkillCreate):
    db_skill = models.Skill(**skill.model_dump())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

# ==========================================
# Certification Services
# ==========================================
def get_certifications(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Certification).offset(skip).limit(limit).all()

def create_certification(db: Session, certification: schemas.CertificationCreate):
    db_cert = models.Certification(**certification.model_dump())
    db.add(db_cert)
    db.commit()
    db.refresh(db_cert)
    return db_cert

# ==========================================
# ContactMessage Services
# ==========================================
def get_contact_messages(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ContactMessage).offset(skip).limit(limit).all()

def create_contact_message(db: Session, message: schemas.ContactMessageCreate):
    db_message = models.ContactMessage(**message.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

# ==========================================
# QueenReply Services
# ==========================================
def get_queen_replies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.QueenReply).offset(skip).limit(limit).all()

def create_queen_reply(db: Session, reply: schemas.QueenReplyCreate):
    db_reply = models.QueenReply(**reply.model_dump())
    db.add(db_reply)
    db.commit()
    db.refresh(db_reply)
    return db_reply
