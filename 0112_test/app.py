from pymongo import MongoClient
import jwt
import datetime
import hashlib
from flask import Flask, render_template, jsonify, request, redirect, url_for
from datetime import datetime, timedelta


app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['UPLOAD_FOLDER'] = "./static/profile_pics"

SECRET_KEY = 'SPARTA'

client = MongoClient('localhost', 27017)
db = client.tema4


@app.route('/')
def home():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})
        return render_template('index.html', user_info=user_info,title='sale_site')
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))


@app.route('/api/foodlist', methods=['GET'])
def getDish():
    dish_receive = request.args.get('dish_give')
    if dish_receive == '한식':
        koreanfoods = list(db.post1.find({}))
        for koreanfood in koreanfoods:
            koreanfood["_id"] = str(koreanfood["_id"])
        return jsonify({'koreanfoods': koreanfoods})
    if dish_receive == '중식':
        chinafoods = list(db.post2.find({}))
        for chinafood in chinafoods:
            chinafood["_id"] = str(chinafood["_id"])
        return jsonify({'chinafoods': chinafoods})


@app.route('/api/updatelike', methods=['PATCH'])
def updateLike():
    filter_list = request.form['filter_give']
    name = request.form['name_give']
    like = request.form['like_give']
    print(filter_list, name, like)

    if  filter_list == '한식':
        db.post1.update_one({"food_name":name}, {"$set": {"like": str(int(like)+1)}})
        return jsonify({'result': 'success'})

    if  filter_list == '중식':
        db.post2.update_one({"food_name":name}, {"$set": {"like": str(int(like)+1)}})
        return jsonify({'result': 'success'})


@app.route('/login')
def login():
    msg = request.args.get("msg")
    return render_template('login.html', msg=msg)

@app.route('/login2')
def login2():
    msg = request.args.get("msg")
    return render_template('login2.html', msg=msg)

@app.route('/detail')
def detail():
    return render_template('detail.html')


@app.route('/postpage')
def postpage():
    return render_template('post.html')



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




@app.route('/post', methods=['POST'])
def post():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})
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
            "username": user_info["username"],
            'img': img_receive,
            'brand_name': brand_name_receive,
            'food_name': food_name_receive,
            'prime_prices': prime_prices_receive,
            'sale_prices': sale_prices_receive,
            'start_date': start_date_receive,
            'end_date': end_date_receive,
            'know_how': know_how_receive,
            'comment': comment_receive,
            'like': 0
        }
        # 카테고리마다 다른 db에 저장 1:한식, 2:중식, 3:일식, 4:양식
        if category == "한식":
            db.post1.insert_one(doc)
        elif category == "중식":
            db.post2.insert_one(doc)
        elif category == "일식":
            db.post3.insert_one(doc)
        else:
            db.post4.insert_one(doc)

        print(category)
        return jsonify({'msg': '노하우 등록이 완료되었습니다!'})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))


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



@app.route('/user/<username>')
def user(username):
    # 각 사용자의 프로필과 글을 모아볼 수 있는 공간
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        status = (username == payload["id"])  # 내 프로필이면 True, 다른 사람 프로필 페이지면 False

        user_info = db.users.find_one({"username": username}, {"_id": False})
        return render_template('post.html', user_info=user_info, status=status)
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))



if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)