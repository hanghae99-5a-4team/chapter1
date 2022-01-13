from pymongo import MongoClient
import jwt
import hashlib
from flask import Flask, render_template, jsonify, request, redirect, url_for
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from bson import ObjectId

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['UPLOAD_FOLDER'] = "./static/profile_pics"

SECRET_KEY = 'SPARTA'

client = MongoClient('localhost', 27017)
db = client.sale

#학진님 자료 ---------------------------------------------------------------------------------
@app.route('/post')
def post():
    return render_template("post.html")

#DB 저장
@app.route('/post', methods=['POST'])
def posting():
    # id_receive = request.form['id_give']
    img_receive = request.form['img_give']
    brand_name_receive = request.form['brand_name_give']
    food_name_receive = request.form['food_name_give']
    prime_prices_receive = request.form['prime_prices_give']
    sale_prices_receive = request.form['sale_prices_give']
    start_date_receive = request.form['start_date_give']
    end_date_receive = request.form['end_date_give']
    know_how_receive = request.form['know_how_give']
    comment_receive = request.form['comment_give']
    category = request.form['category_give']

    doc = {
        # 'id' : id_receive,
        'img' : img_receive,
        'brand_name' : brand_name_receive,
        'food_name' : food_name_receive,
        'prime_prices' : prime_prices_receive,
        'sale_prices' : sale_prices_receive,
        'start_date' : start_date_receive,
        'end_date' : end_date_receive,
        'know_how' : know_how_receive,
        'comment' : comment_receive,
        'like' : 0
    }
    print("hi")
    # 카테고리마다 다른 db에 저장
    if category == "한식":
        db.post1.insert_one(doc)
    elif category == "중식":
        db.post2.insert_one(doc)
    elif category == "일식":
        db.post3.insert_one(doc)
    else :
        db.post4.insert_one(doc)
    print(category)
    return jsonify({'msg':'노하우 등록이 완료되었습니다!'})

# 병재님 자료 -----------------------------------------------------------------------------------
# 프로필 정보 보여주는 페이지? 잠깐 보류
@app.route('/')
def home():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})
        return render_template('index.html', user_info=user_info)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))

#로그인 버튼을 클릭하면, 해당 아이디가 DB에 있는지 확인하고 성공하면 token을 보내는 역할이다. 프론트에서는 '/' 경로로 이동하는 동시에 받아온 토큰으로 브라우저의 쿠키를 설정한다.
@app.route('/sign_in', methods=['POST'])
def sign_in():
    # 로그인
    username_receive = request.form['username_give']
    password_receive = request.form['password_give']

    pw_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    result = db.users.find_one({'username': username_receive, 'password': pw_hash})

    if result is not None:
        payload = {
         'id': username_receive,
         'exp': datetime.utcnow() + timedelta(seconds=60 * 60 * 24)  # 로그인 24시간 유지
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

        return jsonify({'result': 'success', 'token': token})
    # 찾지 못하면
    else:
        return jsonify({'result': 'fail', 'msg': '아이디/비밀번호가 일치하지 않습니다.'})


@app.route('/login')
def login():
    msg = request.args.get("msg")
    return render_template('login.html', msg=msg)

@app.route('/login2')
def login2():
    msg = request.args.get("msg")
    return render_template('login2.html', msg=msg)




@app.route('/user/<username>')
def user(username):
    # 각 사용자의 프로필과 글을 모아볼 수 있는 공간
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        status = (username == payload["id"])  # 내 프로필이면 True, 다른 사람 프로필 페이지면 False

        user_info = db.users.find_one({"username": username}, {"_id": False})
        return render_template('user.html', user_info=user_info, status=status)
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))


@app.route('/sign_up/save', methods=['POST'])
def sign_up():
    username_receive = request.form['username_give']
    password_receive = request.form['password_give']
    agree_give_receive_1 = request.form['agree_give_1']
    agree_give_receive_2 = request.form['agree_give_2']
    agree_give_receive_3 = request.form['agree_give_3']
    email_give_receive = request.form['email_give']


    password_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    doc = {
        "username": username_receive,                               # 아이디
        "password": password_hash,                                  # 비밀번호
        "agree_give_1": agree_give_receive_1,                       # 프로필 이름 기본값은 아이디
        "agree_give_2": agree_give_receive_2,                        # 프로필 사진 파일 이름
        "agree_give_3": agree_give_receive_3,                   # 프로필 사진 기본 이미지
        "email_address": email_give_receive                               # 프로필 한 마디
    }
    db.users.insert_one(doc)
    return jsonify({'result': 'success'})


@app.route('/sign_up/check_dup', methods=['POST'])
def check_dup():
    username_receive = request.form['username_give']
    exists = bool(db.users.find_one({"username": username_receive}))
    return jsonify({'result': 'success', 'exists': exists})


@app.route('/update_profile', methods=['POST'])
def save_img():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        # 프로필 업데이트
        return jsonify({"result": "success", 'msg': '프로필을 업데이트했습니다.'})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))


#@app.route('/posting', methods=['POST'])
#def posting():
#    token_receive = request.cookies.get('mytoken')
#    try:
#        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
#        # 포스팅하기
#        return jsonify({"result": "success", 'msg': '포스팅 성공'})
#    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
#        return redirect(url_for("home"))


@app.route("/get_posts", methods=['GET'])
def get_posts():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        # 포스팅 목록 받아오기
        return jsonify({"result": "success", "msg": "포스팅을 가져왔습니다."})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))


@app.route('/update_like', methods=['POST'])
def update_like():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        # 좋아요 수 변경
        return jsonify({"result": "success", 'msg': 'updated'})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))


# 여기부터는 이성운 내용 --------------------------------------------------------------------------------------------------
# @app.route('/')
# def homepage():
#    return render_template('index.html',
#                            title='sale_site'
#                           )
@app.route('/api/reviewWrite', methods=['POST'])
def reviewWrite():
    token_receive = request.cookies.get('mytoken')
    payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
    username = payload["id"];
    comment = request.form['comment_give']
    id = request.form['id_give']
    now = datetime.today().strftime("%Y-%m/%d")
    doc = {'username':username,'comment':comment,'created':now}
    print(doc)
    db.post1.update_one({"_id": ObjectId(id)}, {"$addToSet": {"reviews": doc}})
    return jsonify({'result': 'success'})

@app.route('/api/get_reviews', methods=['GET'])
def getReviews():
    filter_receive = request.args.get('filter_give')
    id_give = request.args.get('id_give')
    if filter_receive == '한식':
        reviews = db.post1.find_one({"_id":ObjectId(id_give)},{'_id':False})
        return jsonify({'result': 'success','reviews':reviews})

@app.route('/api/foodlist', methods=['GET'])
def getDish():
    token_receive = request.cookies.get('mytoken')
    payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
    dish_receive = request.args.get('dish_give')
    if dish_receive == '한식':
        koreanfoods = list(db.post1.find({}))
        for koreanfood in koreanfoods:
            koreanfood["_id"] = str(koreanfood["_id"])
        return jsonify({'koreanfoods': koreanfoods,'id':payload["id"]})
    if dish_receive == '중식':
        chinafoods = list(db.post2.find({}))
        for chinafood in chinafoods:
            chinafood["_id"] = str(chinafood["_id"])
        return jsonify({'chinafoods': chinafoods, 'id':payload["id"]})


@app.route('/api/updatelike', methods=['PATCH'])
def updateLike():
    filter_list = request.form['filter_give']
    id = request.form['id_give']
    like = request.form['like_give']
    print(id);
    if  filter_list == '한식':
        db.post1.update_one({"_id": ObjectId(id)}, {"$set": {"like": str(int(like)+1)}})
        return jsonify({'result': 'success'})

    if  filter_list == '중식':
        db.post2.update_one({"_id":ObjectId(id)}, {"$set": {"like": str(int(like)+1)}})
        return jsonify({'result': 'success'})

@app.route('/api/deletelank', methods=['POST'])
def deleteLank():
    filter_list = request.form['filter_give']
    id = request.form['id_give']
    if filter_list =='한식':
        db.post1.delete_one({'_id':ObjectId(id)})
        return jsonify({'result': 'success'})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)



