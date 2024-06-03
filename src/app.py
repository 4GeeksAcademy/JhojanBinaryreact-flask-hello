import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, User
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_cors import CORS

from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required, JWTManager
from flask_bcrypt import Bcrypt
from datetime import timedelta

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../public/')
app = Flask(__name__)
app.url_map.strict_slashes = False
CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT-KEY")
jwt = JWTManager(app)

bcrypt = Bcrypt(app)

db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)


setup_admin(app)


setup_commands(app)

app.register_blueprint(api, url_prefix='/api')

@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # evitar caché
    return response
###############################################################################################

@app.route('/register', methods=['POST'])
def register():
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'body is empty'}), 400
    if 'email' not in body:
        return jsonify({'msg': 'field email is required'}), 400
    if 'password' not in body:
        return jsonify({'msg': 'field password is required'}), 400

    new_user = User()
    new_user.email = body['email']
    new_user.password = bcrypt.generate_password_hash(body['password']).decode('utf-8')
    new_user.is_active = True

    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=new_user.email, expires_delta=False)
    refresh_token = create_refresh_token(identity=new_user.email, expires_delta=False)
    return jsonify({'msg': 'ok', 'access_token': access_token, 'refresh_token': refresh_token}), 201

##########################################################################################################

@app.route('/login', methods=['POST'])
def login():
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'body is empty'}), 400
    if 'email' not in body:
        return jsonify({'msg': 'field email is required'}), 400
    if 'password' not in body:
        return jsonify({'msg': 'field password is required'}), 400

    user = User.query.filter_by(email=body['email']).all()
    if len(user) == 0:
        return jsonify({'msg': 'user or password incorrect'}), 400
    correct_password = bcrypt.check_password_hash(user[0].password, body['password'])

    if correct_password is False:
        return jsonify({'msg': "user or password incorrect"}), 400

    access_token = create_access_token(identity=user[0].email, expires_delta=False)
    refresh_token = create_refresh_token(identity=user[0].email, expires_delta=False)
    return jsonify({'msg': 'ok', 'access_token': access_token, 'refresh_token': refresh_token}), 200

@app.route('/token/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    return jsonify({'access_token': new_access_token}), 200


#######################################################################################
@app.route('/private', methods=['GET'])
@jwt_required()
def private():
    return jsonify({'msg': 'This is a private message'})

# Esto solo se ejecuta si se ejecuta `$ python src/main.py`
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
