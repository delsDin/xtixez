from sqlalchemy import Column, Integer, String, Text, Float, Boolean, BigInteger, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import ARRAY, TEXT
from sqlalchemy.orm import relationship
from database import Base

class LoveMessage(Base):
    __tablename__ = "love_messages"
    id = Column(String(50), primary_key=True)
    sender = Column(String(30), nullable=False)
    text = Column(String(200), nullable=False)
    timestamp = Column(BigInteger, nullable=False)
    emoji = Column(String(8), default="💖")
    bubble_color = Column(TEXT, nullable=False)
    x = Column(Integer, CheckConstraint('x BETWEEN 0 AND 100'))
    y = Column(Integer, CheckConstraint('y BETWEEN 0 AND 100'))
    scale = Column(Float, CheckConstraint('scale > 0'))
    speed = Column(Integer, CheckConstraint('speed > 0'))

class LoveStory(Base):
    __tablename__ = "love_stories"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(150), nullable=False)
    tag = Column(String(50), nullable=False)
    reading_time = Column(String(50), nullable=False)
    emoji = Column(String(10), nullable=False)
    date = Column(String(50), nullable=False)
    paragraphs = Column(ARRAY(TEXT), nullable=False)

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    category = Column(String(20), CheckConstraint("category IN ('Dev', 'Data', 'Autres')"))
    image = Column(String(255), nullable=False)
    techs = Column(ARRAY(TEXT), nullable=False)
    description = Column(TEXT, nullable=False)
    details = Column(TEXT, nullable=False)
    github = Column(String(255), default="#")
    demo = Column(String(255), default="#")

class Experience(Base):
    __tablename__ = "experiences"
    id = Column(Integer, primary_key=True, autoincrement=True)
    role = Column(String(100), nullable=False)
    company = Column(String(100), nullable=False)
    period = Column(String(30), nullable=False)
    description = Column(ARRAY(TEXT), nullable=False)
    details = Column(TEXT, nullable=False)
    technologies = Column(ARRAY(TEXT), nullable=False)
    achievements = Column(ARRAY(TEXT), nullable=False)

class Service(Base):
    __tablename__ = "services"
    id = Column(String(50), primary_key=True)
    title = Column(String(100), nullable=False)
    description = Column(TEXT, nullable=False)
    long_description = Column(TEXT, nullable=False)
    icon_name = Column(String(30), nullable=False)
    color = Column(String(100), nullable=False)
    features = Column(ARRAY(TEXT), nullable=False)
    advantages = Column(ARRAY(TEXT), nullable=False)
    use_cases = Column(ARRAY(TEXT), nullable=False)
    technologies = Column(ARRAY(TEXT), nullable=False)
    duration = Column(String(30), nullable=False)
    deliverables = Column(ARRAY(TEXT), nullable=False)

class Testimonial(Base):
    __tablename__ = "testimonials"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(105), nullable=False)
    role = Column(String(100), nullable=False)
    message = Column(TEXT, nullable=False)
    avatar = Column(String(255), nullable=False)
    rating = Column(Integer, default=5, server_default='5')
    service_id = Column(String(50), ForeignKey('services.id', ondelete='SET NULL'), nullable=True)

class Skill(Base):
    __tablename__ = "skills"
    category = Column(String(30), primary_key=True)
    name = Column(String(50), primary_key=True)
    level = Column(Integer, CheckConstraint('level BETWEEN 0 AND 100'))

class Certification(Base):
    __tablename__ = "certifications"
    id = Column(String(50), primary_key=True)
    title = Column(String(150), nullable=False)
    issuer = Column(String(100), nullable=False)
    date = Column(String(50), nullable=False)
    credential_id = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    skills = Column(ARRAY(TEXT), nullable=False)
    description = Column(TEXT, nullable=False)
    verify_url = Column(String(255), nullable=False)
    logo_color = Column(String(100), nullable=False)

class ContactMessage(Base):
    __tablename__ = "contact_messages"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    subject = Column(String(200), nullable=False)
    message = Column(TEXT, nullable=False)
    created_at = Column(BigInteger, nullable=False)

class QueenReply(Base):
    __tablename__ = "queen_replies"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    message = Column(TEXT, nullable=False)
    mood = Column(String(50), nullable=False)
    created_at = Column(BigInteger, nullable=False)
