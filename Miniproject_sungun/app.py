import json

from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client.sale

@app.route('/')
def homepage():
    return render_template('index.html',
                            title='sale_site'
                           )

@app.route('/api/foodlist', methods=['GET'])
def getDish():
    dish_receive = request.args.get('dish_give')
    if dish_receive == '한식':
        koreanfoods = list(db.post1.find({}, {'_id': False}))
        return jsonify({'koreanfoods': koreanfoods})
    if dish_receive == '중식':
        chinafoods = list(db.post2.find({}, {'_id': False}))
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

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)