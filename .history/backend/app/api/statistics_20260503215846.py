"""
API Statistiques — KPIs, compteurs, données temps réel.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from collections import OrderedDict

from app.database import get_db
from app.models.user import User, UserRole
from app.models.qcm import QCM, UserQCMResult
from app.models.course import Course
from app.models.feedback import Feedback
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/statistics", tags=["Statistics"])


# --- Helpers ---

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        from fastapi import HTTPException
        raise HTTPException(403, "Accès réservé aux administrateurs")
    return current_user


# ===================== ADMIN STATS =====================

@router.get("/admin")
def admin_statistics(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    """Statistiques globales pour le dashboard admin."""
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    admin_count = db.query(func.count(User.id)).filter(User.role == UserRole.admin).scalar() or 0
    formateur_count = db.query(func.count(User.id)).filter(User.role == UserRole.formateur).scalar() or 0
    apprenant_count = db.query(func.count(User.id)).filter(User.role == UserRole.apprenant).scalar() or 0

    total_qcm = db.query(func.count(QCM.id)).scalar() or 0
    published_qcm = db.query(func.count(QCM.id)).filter(QCM.is_published == True).scalar() or 0
    total_qcm_results = db.query(func.count(UserQCMResult.id)).scalar() or 0
    avg_score = db.query(func.avg(UserQCMResult.score)).scalar()
    passed_count = db.query(func.count(UserQCMResult.id)).filter(UserQCMResult.passed == True).scalar() or 0
    pass_rate = round((passed_count / total_qcm_results * 100), 1) if total_qcm_results > 0 else 0

    total_courses = db.query(func.count(Course.id)).scalar() or 0
    published_courses = db.query(func.count(Course.id)).filter(Course.is_published == True).scalar() or 0

    total_feedback = db.query(func.count(Feedback.id)).scalar() or 0
    positive_feedback = db.query(func.count(Feedback.id)).filter(Feedback.is_positive == True).scalar() or 0
    negative_feedback = total_feedback - positive_feedback
    positive_ratio = round((positive_feedback / total_feedback * 100), 1) if total_feedback > 0 else 0.0

    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "admins": admin_count,
            "formateurs": formateur_count,
            "apprenants": apprenant_count,
        },
        "qcm": {
            "total": total_qcm,
            "published": published_qcm,
            "total_results": total_qcm_results,
            "avg_score": round(avg_score, 1) if avg_score else 0,
            "pass_rate": pass_rate,
        },
        "courses": {
            "total": total_courses,
            "published": published_courses,
        },
        "feedback": {
            "total": total_feedback,
            "positive": positive_feedback,
            "negative": negative_feedback,
            "positive_ratio": positive_ratio,
        },
    }


@router.get("/admin/details")
def admin_statistics_details(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    """Données détaillées pour rendre le dashboard admin entièrement dynamique."""
    now = datetime.utcnow()

    # 7 derniers mois (incluant le mois courant)
    month_keys = []
    month_labels = OrderedDict()
    for i in range(6, -1, -1):
        month = ((now.month - i - 1) % 12) + 1
        year = now.year + ((now.month - i - 1) // 12)
        key = f"{year:04d}-{month:02d}"
        month_keys.append((year, month))
        month_labels[key] = 0

    users = db.query(User).all()
    for user in users:
        created = getattr(user, "created_at", None)
        if not created:
            continue
        key = created.strftime("%Y-%m")
        if key in month_labels:
            month_labels[key] += 1

    monthly_registrations = [
        {
            "label": f"{month:02d}/{str(year)[-2:]}",
            "count": month_labels[f"{year:04d}-{month:02d}"],
        }
        for year, month in month_keys
    ]

    qcm_items = db.query(QCM).all()
    qcm_category_map = {q.id: (q.category or "general") for q in qcm_items}
    qcm_category_labels = {
        "code_route": "Code route",
        "signalisation": "Signalisation",
        "securite": "Sécurité",
        "priorite": "Priorité",
        "infractions": "Infractions",
        "general": "Général",
    }
    category_acc = {}
    results = db.query(UserQCMResult).all()
    for result in results:
        category = qcm_category_map.get(result.qcm_id, "general")
        if category not in category_acc:
            category_acc[category] = {"count": 0, "passed": 0}
        category_acc[category]["count"] += 1
        if result.passed:
            category_acc[category]["passed"] += 1

    qcm_success_by_category = []
    for category, values in category_acc.items():
        count = values["count"]
        success_rate = round((values["passed"] / count) * 100, 1) if count > 0 else 0
        qcm_success_by_category.append(
            {
                "category": category,
                "label": qcm_category_labels.get(category, category.replace("_", " ").title()),
                "success_rate": success_rate,
                "attempts": count,
            }
        )

    qcm_success_by_category.sort(key=lambda x: x["attempts"], reverse=True)
    qcm_success_by_category = qcm_success_by_category[:5]

    top_courses = []
    courses = db.query(Course).order_by(Course.created_at.desc()).limit(5).all()
    for course in courses:
        top_courses.append(
            {
                "title": course.title,
                "is_published": bool(course.is_published),
                "created_at": course.created_at,
                "category": course.category,
            }
        )

    recent_activities = []
    new_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    for user in new_users:
        recent_activities.append(
            {
                "type": "user_register",
                "user": user.username,
                "action": "s'est inscrit sur la plateforme",
                "created_at": user.created_at,
            }
        )

    latest_results = (
        db.query(UserQCMResult, User, QCM)
        .join(User, User.id == UserQCMResult.user_id)
        .join(QCM, QCM.id == UserQCMResult.qcm_id)
        .order_by(UserQCMResult.completed_at.desc())
        .limit(5)
        .all()
    )
    for result, user, qcm in latest_results:
        recent_activities.append(
            {
                "type": "qcm_result",
                "user": user.username,
                "action": f"a terminé le QCM '{qcm.title}' avec {round(result.score)}%",
                "created_at": result.completed_at,
            }
        )

    recent_activities.sort(key=lambda x: x.get("created_at") or datetime.min, reverse=True)
    recent_activities = recent_activities[:8]

    return {
        "monthly_registrations": monthly_registrations,
        "qcm_success_by_category": qcm_success_by_category,
        "top_courses": top_courses,
        "recent_activities": recent_activities,
    }


# ===================== FORMATEUR STATS =====================

@router.get("/formateur")
def formateur_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Statistiques pour le dashboard formateur (ses cours)."""
    my_courses = db.query(Course).filter(Course.created_by == current_user.id).all()
    course_ids = [c.id for c in my_courses]

    total_courses = len(my_courses)
    published = sum(1 for c in my_courses if c.is_published)
    total_apprenants = db.query(func.count(User.id)).filter(User.role == UserRole.apprenant).scalar() or 0

    return {
        "courses": {
            "total": total_courses,
            "published": published,
            "draft": total_courses - published,
        },
        "users": {
            "apprenants": total_apprenants,
        },
    }


# ===================== APPRENANT STATS =====================

@router.get("/apprenant")
def apprenant_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Statistiques pour le dashboard apprenant."""
    results = db.query(UserQCMResult).filter(UserQCMResult.user_id == current_user.id).all()
    total_qcm_done = len(results)
    passed = sum(1 for r in results if r.passed)
    avg_score = round(sum(r.score for r in results) / total_qcm_done, 1) if total_qcm_done > 0 else 0

    # Total published QCM and courses
    total_qcm = db.query(func.count(QCM.id)).filter(QCM.is_published == True).scalar() or 0
    total_courses = db.query(func.count(Course.id)).filter(Course.is_published == True).scalar() or 0

    return {
        "qcm": {
            "completed": total_qcm_done,
            "passed": passed,
            "failed": total_qcm_done - passed,
            "available": total_qcm,
            "avg_score": avg_score,
        },
        "courses": {
            "available": total_courses,
        },
    }


# ===================== QCM PASS RATES =====================

@router.get("/qcm-pass-rates")
def qcm_pass_rates(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    """Taux de reussite par QCM pour le graphique du dashboard."""
    qcms = db.query(QCM).filter(QCM.is_published == True).all()

    result = []
    for qcm in qcms:
        total_attempts = db.query(func.count(UserQCMResult.id)).filter(
            UserQCMResult.qcm_id == qcm.id
        ).scalar() or 0

        passed_attempts = db.query(func.count(UserQCMResult.id)).filter(
            and_(UserQCMResult.qcm_id == qcm.id, UserQCMResult.passed == True)
        ).scalar() or 0

        pass_rate = round((passed_attempts / total_attempts * 100), 1) if total_attempts > 0 else 0

        result.append({
            "qcm_id": qcm.id,
            "title": qcm.title,
            "pass_rate": pass_rate,
            "total_attempts": total_attempts,
            "passed_attempts": passed_attempts,
        })

    return {"qcms": sorted(result, key=lambda x: x["title"])}


# ===================== USER REGISTRATIONS =====================

@router.get("/user-registrations")
def user_registrations(
    period: str = Query("month", regex="^(day|week|month)$"),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Evolution des inscriptions groupees par periode (jour/semaine/mois)."""
    now = datetime.utcnow()

    if period == "day":
        days_back = 7
        date_format = "%d-%m"
        labels = [(now - timedelta(days=i)).strftime(date_format) for i in range(days_back - 1, -1, -1)]
    elif period == "week":
        days_back = 56
        date_format = "W%W"
        labels = []
        for i in range(7, -1, -1):
            week_start = now - timedelta(weeks=i)
            week_num = week_start.strftime("W%W")
            labels.append(week_num)
    else:
        days_back = 180
        date_format = "%m-%Y"
        labels = [(now - timedelta(days=30 * i)).strftime(date_format) for i in range(5, -1, -1)]

    registrations = db.query(
        func.date(User.created_at).label("registration_date"),
        func.count(User.id).label("count"),
    ).filter(
        User.created_at >= now - timedelta(days=days_back)
    ).group_by(
        func.date(User.created_at)
    ).all()

    data_dict = {r.registration_date.strftime(date_format): r.count for r in registrations if r.registration_date}

    data = [data_dict.get(label, 0) for label in labels]

    return {
        "period": period,
        "labels": labels,
        "data": data,
    }
