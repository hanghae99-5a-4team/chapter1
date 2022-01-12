import json
from datetime import datetime
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

from pymongo import MongoClient
client = MongoClient('localhost', 27017)
db = client.team4


@app.route('/')
def homepage():
    return render_template('index.html', title='sale_site')

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







# 1.num(댓글번호)=_id(원문글, db=post1) /  2.content(내용)= re_input(글보기의 input내용),
# 3.review_id(글쓴이)= username(db=user) /       4.date(댓글날짜)= date(작성날짜)

### 댓글 만드는 순서
#1.db-review에 배열로(1,2,3) 저장
# 1).content(내용)
# 2).review_id(글쓴이)
# 3).date(작성날짜)
#
#2.db-post1의 [_id]에 배열 붙이기
# 1.을 2에 배열로 붙이기
#
#
### 알아야 할것
#db에 배열로 저장하는 방법 - insert() 명령: mongo 컬렉션에 한번에 여러 문서 삽입
#2) userid를 가져오는 방법
#


# # num댓글번호  > 원문글번호를  _id로 할떄( db.post1)
# review_num_info = list(db.post1.find({}))
# for review_num in review_num_info:
#     print(review_num['_id'])



# #글쓴이
# review_id_info = list(db.users.find({}, {'_id': False}))
# for review_ids in review_id_info:
#     review_id = review_ids['username']

@app.route('/review', methods=['POST'])
def write_reviews():
    ##1. 내용,작성날짜, 글쓴이 구하기
    #  content 내용
    re_input_receive = request.form['re_input_give']
    # 작성날짜
    today = datetime.today().strftime("%Y-%m/%d")
    # 글쓴이 users컬렉션의 username도큐먼트 가져온다
    review_id_info = list(db.users.find({}, {'_id': False}))
    for review_ids in review_id_info:
        review_id = review_ids['username']

    #2 review_array배열에 내용, 작성날짜, 글쓴이 값을 넣는다.  여기서 post1에 insertMany(review_array)하는지확인할것
    review_array = [{'content'  :re_input_receive},
                  {'date'     :today},
                  {'review_id':review_id}]
    
    #3. 값을 넣은 review_array배열을 post1에 넣어준다
    a = db.post1.insert_one(review_array)
    print(a)
    # return jsonify({'msg': '리뷰 저장 완료!!'})
    
    
# @app.route('/review', methods=['PATCH'])
# def update_reviews():
#
#
#     #4. post1의 _id를 가져와서 내가 선택한 원문글인지(review_array와 같은 도큐먼트에 있는지) 확인하고
#     #   있으면 붙이고 보여준다.
#     post1id_reviewid_ck = list(db.post1.find({}))
#     for post1id_reviewid in post1id_reviewid_ck:
#         post1id = post1id_reviewid['_id']
#         # post1의 id와 review_array가 같은 도큐먼트에 있는지
#         # / 같다는 의미가 1.똑같은 값이지 2.같은 도큐먼트에있는지 확인하는 방법
#         a = list(db.post1.find(review_array))
#         for ck in a:
#             print(ck)
#
#         db.post1.update_one{"_id": ObjectId(아이디값이 같은지)},{"$set": {"review_array": }}

        
        # #review_array의 review_id가 사용자와 같으면 수정, 삭제 기능 가능
        # if post1id == db.post1.review_array['review_id'] :
        #     db.post1.insert({"review_list": review_array})
        #
        #
        #     return jsonify({'msg': '리뷰 저장 완료!! 리뷰를 확인하세요'})



    #review_list를 하나의 도큐먼트로 post1 컬렉션에 추가(삽입)
    # id가 같으면
    # if review_array ==
    # db.post1.update_one({"_id": ObjectId(id)}, {"$set": {"review_list": str( +)}})





# 리뷰버튼을 눌렀을때 리뷰리스트를 보여주기

# 리뷰보기페이지
@app.route('/review', methods=['GET'])  # /review url로 GET방식
def read_reviews():
    reviews = list(db.post1.find({},{'_id':False}))  # post1디비에서 전부를 reviews변수에 담아 가져오기
    # return jsonify({'all_reviews': reviews})        # reviews를 all_reviews로 담아 클라이언트에서 내려준다
    print(reviews)                                                # 이제 클라이언트에서 all_reviews가 잘내려오면
                                                    # 그걸 이용해 for문을 돌려 reviews들을 붙여준다







if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)