from flask import Blueprint, jsonify, request, session
from models.models import db, SavedReport
from functools import wraps
import logging

reports_bp = Blueprint("reports", __name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            logger.error("User not authenticated")
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)

    return decorated_function


@reports_bp.route("/api/reports/save", methods=["POST"])
@login_required
def save_report():
    try:
        data = request.get_json()
        title = data.get("title")
        content = data.get("content")
        report_type = data.get("type")

        if not title or not content or not report_type:
            logger.error("Missing required fields")
            return jsonify({"error": "Missing required fields"}), 400

        if report_type not in ["soap", "analysis"]:
            logger.error(f"Invalid report type: {report_type}")
            return jsonify({"error": "Invalid report type"}), 400

        report = SavedReport(
            user_id=session["user_id"],
            title=title,
            content=content,
            report_type=report_type,
        )

        db.session.add(report)
        db.session.commit()
        logger.info(f"Successfully saved report with ID: {report.id}")

        return (
            jsonify(
                {
                    "message": "Report saved successfully",
                    "report": {
                        "id": report.id,
                        "title": report.title,
                        "type": report.report_type,
                        "created_at": report.created_at.isoformat(),
                    },
                }
            ),
            201,
        )
    except Exception as e:
        logger.error(f"Error saving report: {str(e)}")
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@reports_bp.route("/api/reports", methods=["GET"])
@login_required
def get_reports():
    try:
        reports = (
            SavedReport.query.filter_by(user_id=session["user_id"])
            .order_by(SavedReport.created_at.desc())
            .all()
        )

        return jsonify(
            {
                "reports": [
                    {
                        "id": report.id,
                        "title": report.title,
                        "content": report.content,
                        "type": report.report_type,
                        "created_at": report.created_at.isoformat(),
                    }
                    for report in reports
                ]
            }
        )
    except Exception as e:
        logger.error(f"Error fetching reports: {str(e)}")
        return jsonify({"error": str(e)}), 500
