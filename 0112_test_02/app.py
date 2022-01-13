from pymongo import MongoClient
import jwt
import datetime
import hashlib
from flask import Flask, render_template, jsonify, request, redirect, url_for
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename


app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['UPLOAD_FOLDER'] = "./static/profile_pics"

SECRET_KEY = 'SPARTA'

#client = MongoClient('mongodb://test:test@localhost', 27017)
client = MongoClient('localhost', 27017)
db = client.tema4

# 로그인 후 메인페이지로 가는 함수, 토큰이 없을 시 login 페이지로 보내짐
@app.route('/')
def home():
    # 로그인 시 보내준 토큰을 확인
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

# 로그인 페이지로 가는 함수
@app.route('/login')
def login():
    msg = request.args.get("msg")
    return render_template('login.html', msg=msg)

# 회원가입 페이지로 가는 함수
@app.route('/login2')
def login2():
    msg = request.args.get("msg")
    return render_template('login2.html', msg=msg)

# 포스트 페이지로 가는 함수
@app.route('/postpage')
def postpage():
    return render_template('post.html')


# 로그인 시 유저네임과 패스워드를 받아 확인하는 함수
@app.route('/sign_in', methods=['POST'])
def sign_in():
    # 로그인 유저네임과 패스워드 확인
    username_receive = request.form['username_give']
    password_receive = request.form['password_give']
    # 패스워드는 sha256 해시함수를 통해 암호화 하여 저장함
    pw_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    result = db.users.find_one({'username': username_receive, 'password': pw_hash})

    # 유저네임과 패스워드를 db에서 찾아서 있으면 토큰을 보내주는 조건문
    if result is not None:
        # 토큰에는 유저네임과 토큰의 유지 시간 정보를 넣음
        payload = {
         'id': username_receive,
         'exp': datetime.utcnow() + timedelta(seconds=60 * 60 * 24)  # 로그인 24시간 유지
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

        return jsonify({'result': 'success', 'token': token})
    # 찾지 못하면
    else:
        return jsonify({'result': 'fail', 'msg': '아이디/비밀번호가 일치하지 않습니다.'})

# 회원가입 함수로 유저의 정보를 받아 DB에 저장
@app.route('/sign_up/save', methods=['POST'])
def sign_up():
    username_receive = request.form['username_give']
    password_receive = request.form['password_give']
    agree_give_receive_1 = request.form['agree_give_1']
    agree_give_receive_2 = request.form['agree_give_2']
    agree_give_receive_3 = request.form['agree_give_3']
    email_give_receive = request.form['email_give']

    # 패스워드는 sha256 해시함수를 통해 암호화 하여 저장함
    password_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    doc = {
        "username": username_receive,                               # 아이디
        "password": password_hash,                                  # 비밀번호
        "agree_give_1": agree_give_receive_1,                       # 약관동의 필수1 체크상황
        "agree_give_2": agree_give_receive_2,                       # 약관동의 필수2 체크상황
        "agree_give_3": agree_give_receive_3,                       # 약관동의 선택1 체크상황
        "email_address": email_give_receive                         # 이메일 주소
    }
    db.users.insert_one(doc)
    return jsonify({'result': 'success'})

# 회원가입 시 유저 네임 중복체크 함수
@app.route('/sign_up/check_dup', methods=['POST'])
def check_dup():
    username_receive = request.form['username_give']
    # 유저 네임 받아서 DB속에 동일 네임이 있으면 true 아니면 false 반환
    exists = bool(db.users.find_one({"username": username_receive}))
    return jsonify({'result': 'success', 'exists': exists})




@app.route('/post', methods=['POST'])
def post():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})

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

        username = user_info["username"]
        food_name = food_name_receive
        if 'img_give' in request.files:
            file = request.files["img_give"]
            filename = secure_filename(file.filename)
            extension = filename.split(".")[-1]
            file_path = f"img_pics/{username}_{food_name}.{extension}"
            file.save("./static/"+file_path)
            doc["img"] = filename
            doc["img_path"] = file_path

        # 카테고리마다 다른 db에 저장 1:한식, 2:중식, 3:일식, 4:양식
        if category == "한식":
            db.post1.insert_one(doc)
        elif category == "중식":
            db.post2.insert_one(doc)
        elif category == "일식":
            db.post3.insert_one(doc)
        else:
            db.post4.insert_one(doc)

        print("hello")
        return jsonify({'msg': '노하우 등록이 완료되었습니다!'})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)