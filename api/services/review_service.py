"""Module for review service."""
from flask_rest_api import Blueprint, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models.review import Review, SeasonNotFoundError
from models.show import RequestException
from schemas.review_schema import ReviewSchema

blp = Blueprint('Review', 'Review', url_prefix='/review')


@blp.route('', methods=['POST'])
@blp.arguments(ReviewSchema)
@blp.response(ReviewSchema, code=201)
@jwt_required()
def create_review(review_data: dict) -> dict:
    """Creates a new review."""
    review_data['reviewer_id'] = get_jwt_identity().get('_id')
    try:
        review = Review(review_data)
    except ValueError as e:
        abort(400, message=str(e))
    try:
        review.complete_season_info()
    except (RequestException, SeasonNotFoundError) as e:
        abort(e.code, message=e.message)
    res = review.insert().to_json()
    return res