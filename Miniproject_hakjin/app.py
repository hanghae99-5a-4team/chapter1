from flask import Flask, render_template, jsonify, request

from pymongo import MongoClient
client = MongoClient('localhost', 27017)
db = client.team4

app = Flask(__name__)


@app.route('/')
def main():
    return render_template("index.html")

@app.route('/detail')
def detail():
    return render_template("detail.html")

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
        'comment' : comment_receive
    }
    print("hi")
    # 카테고리마다 다른 db에 저장 1:한식, 2:중식, 3:일식, 4:양식
    if category == 1:
        db.post1.insert_one(doc)
    elif category == 2:
        db.post2.insert_one(doc)
    elif category == 3:
        db.post3.insert_one(doc)
    else :
        db.post4.insert_one(doc)
    print("hello")
    return jsonify({'msg':'노하우 등록이 완료되었습니다!'})

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)