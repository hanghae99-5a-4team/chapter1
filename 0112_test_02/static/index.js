$(document).ready(function () {
    getDish();
});

let filterList = ['한식', '최저가'];

/**
 * 각각의 음식 국적과 각 음식 랭킹 순위를 클릭하면, 그 클릭한 내용에 맞게 필터링이 적용된다.
 * 이 밑에 두 함수는 필터링이 적용된 자료로 배열에 저장돼 있다.
 * 배열의 내용을 바꾸고, getDish()호출만 하면 된다!*/
function filterDish(dish) {
    filterList = [dish, filterList[1]]
    getDish();
}

function filterRank(rank) {
    filterList = [filterList[0], rank]
    getDish();
}

function movepost(){
    window.location.replace("/postpage")
}

/**
 * 좋아요를 클릭하면, {filterList[0],name,like} give를 통해서 DB에서 음식 국적에서 똑같은 이름을 찾고, 현재의
 * 좋아요 수보다 +1을 하는 함수다! */
function updateLike(id, like) {
    $.ajax({
        type: 'PATCH',
        url: '/api/updatelike',
        data: {
            filter_give: filterList[0],
            id_give: id,
            like_give: like
        },
        success: function (response) {
            getDish()
        }
    });
}


function reviewSubmit(id) {
    event.preventDefault();
    let comment = $('#comment_give').val()
    console.log(comment);
    $.ajax({
        type: 'POST',
        url: '/api/reviewWrite',
        data: {
            id_give: id,
            comment_give: comment
        },
        success: function (response) {
            console.log('포스팅이 성공했습니다!')
            $.ajax({
                url: `/api/get_reviews?id_give=${id}&filter_give=${filterList[0]}`,
                method: "GET",
                data: {},
                success: function (response) {
                    while (document.querySelector('.review_list').hasChildNodes()) {
                        document.querySelector('.review_list').removeChild(document.querySelector('.review_list').firstChild)
                    }
                    let reviews = response['reviews'].reviews;
                    for (let i = 0; i < reviews.length; i++) {
                        let comment = reviews[i].comment;
                        let created = reviews[i].created;
                        let username = reviews[i].username;
                        let temp_html = `<div class="review_item">
                                          <span>${username}:</span>
                                          <span>${comment}</span>
                                          <span class="buttonContainer">
                                                            <button>수정</button>
                                                            <button>삭제</button>
                                          </span>
                                         <span class="created">${created}</span>
                                    </div>`
                        $('.review_list').append(temp_html);
                    }
                }
            })
           //location.reload()
        }
    })
}

const reviewOn = [];

function reviewToggle(id) {
    if (reviewOn.includes(id)) {
        let rank_item = (event.target.parentNode.parentNode.nextSibling);
        rank_item.remove()
        for (let i = 0; i < reviewOn.length; i++) {
            if (reviewOn[i] === id) {
                reviewOn.splice(i, 1);
            }
        }
    } else {
        reviewOn.push(id);
        let rank_item = (event.target.parentNode.parentNode)
        rank_item.insertAdjacentHTML('afterend', `<div class="review">
                                <h1>REVIEW</h1> 
                                <div class="review_list">
                                </div>
                                <form>
                                    <input type="text" id="comment_give" placeholder="후기를 남겨주세요!" autocomplete="off"/>
                                    <button onclick="reviewSubmit('${id}')">등록하기</button>
                                </form>
                                </div>`)
        $.ajax({
            url: `/api/get_reviews?id_give=${id}&filter_give=${filterList[0]}`,
            method: "GET",
            data: {},
            success: function (response) {
                let reviews = response['reviews'].reviews;
                if(reviews) {
                    while (document.querySelector('.review_list').hasChildNodes()) {
                        document.querySelector('.review_list').removeChild(document.querySelector('.review_list').firstChild)
                    }
                    for (let i = 0; i < reviews.length; i++) {
                        let comment = reviews[i].comment;
                        let created = reviews[i].created;
                        let username = reviews[i].username;
                        let temp_html = `<div class="review_item">
                                          <span>${username}:</span>
                                          <span>${comment}</span>
                                          <span class="buttonContainer">
                                                            <button>수정</button>
                                                            <button>삭제</button>
                                          </span>
                                         <span class="created">${created}</span>
                                    </div>`
                        $('.review_list').append(temp_html);
                    }
                }
            }
        })
    }
}






function deleteLank(id){
    $.ajax({
        type:'POST',
        url: '/api/deletelank',
        data: {
            id_give: id,
            filter_give: filterList[0]
        },
        success: function (response){
            getDish();
        }
    })
}

/**
 * DB에서 필터링으로 걸러진 음식만 가져오는 함수다.
 */
function getDish() {
    let rank_list = document.querySelector('.rank_list');
    while (rank_list.hasChildNodes()) {
        rank_list.removeChild(rank_list.firstChild)
    }
    if (filterList[0] === '한식') {
        document.querySelector('.filter_dish .dish:nth-of-type(3)').classList.remove('selected')
        document.querySelector('.filter_dish .dish:nth-of-type(2)').classList.remove('selected')
        document.querySelector('.filter_dish .dish:nth-of-type(1)').classList.add('selected')
        $.ajax({
            type: 'GET',
            url: '/api/foodlist?dish_give=한식',
            data: {},
            success: function (response) {
                let koreanFoods = response['koreanfoods'];
                let loginName = response['id'];
                if (filterList[1] === '최저가') {
                    document.querySelector('.filter_rank .rank:nth-of-type(3)').classList.remove('selected')
                    document.querySelector('.filter_rank .rank:nth-of-type(2)').classList.remove('selected')
                    document.querySelector('.filter_rank .rank:nth-of-type(1)').classList.add('selected')
                    let sortedKoreanFoods = koreanFoods.sort((a, b) => parseInt(a.sale_prices, 10) - parseInt(b.sale_prices, 10))
                    for (let i = 0; i < sortedKoreanFoods.length; i++) {
                        //밑에 부분 줄일 수 있을 거 같은데?
                        let rank_number = `${i + 1}`;
                        let food_name = sortedKoreanFoods[i]['food_name'];
                        let start_date = sortedKoreanFoods[i]['start_date'];
                        let end_date = sortedKoreanFoods[i]['end_date'];
                        let comment = sortedKoreanFoods[i]['comment'];
                        let prime_prices = sortedKoreanFoods[i]['prime_prices'];
                        let sale_prices = sortedKoreanFoods[i]['sale_prices'];
                        let like = sortedKoreanFoods[i]['like'] || '0';
                        //sale_rate는 데이터 타입이 숫자이다!
                        let sale_rate = Math.floor((parseInt((sortedKoreanFoods[i]['sale_prices']), 10) / parseInt((sortedKoreanFoods[i]['prime_prices']), 10)) * 100)
                        let food_img = sortedKoreanFoods[i]['img'];
                        let know_how = sortedKoreanFoods[i]['know_how'];
                        let username = sortedKoreanFoods[i]['id'];
                        let dbId = sortedKoreanFoods[i]['_id'];
                        let temp_html = `<div class="rank_item">
                                                    <div class="rank_item_number">${rank_number}</div>
                                                    <div class="rank_item_img">
                                                        <img src=${food_img} />
                                                    </div>
                                                    <div class="rank_item_content">
                                                        <div class="rank_item_title">
                                                            <div class="dishName">${food_name}</div>
                                                        </div>
                                                        <div class="rank_item_comment">
                                                            ${comment}
                                                        </div>
                                                        <div class="rank_item_knowhow">
                                                            ${know_how}
                                                        </div>
                                                        <button class='reviewButton' onclick="reviewToggle('${dbId}')">리뷰</button>
                                                    </div>
                                                    <div class="rank_item_sub">
                                                        <div class="rank_item_expires">
                                                             <span class="expires_text">유통기한:</span>
                                                             <span class="expires_start">${start_date}</span>
                                                             <span>~</span>
                                                             <span class="expires_last">${end_date}</span>
                                                        </div>
                                                        <div class="rank_item_priceTag">
                                                            <span>할인율</span>
                                                            <span>할인가격</span>
                                                            <span>좋아요 수</span>
                                                        </div>
                                                        <div class="right_item_price">
                                                            <div class="sale_rate">
                                                                <div>
                                                                    ${sale_rate}%
                                                                </div>
                                                            </div>
                                                            <div class="sale_price">
                                                                <div>
                                                                    <div class="before_price">${prime_prices}</div>
                                                                    <div class="current_price">${sale_prices}</div>
                                                                </div>
                                                            </div>
                                                            <div class="sale_like" onclick="updateLike('${dbId}','${like}')">
                                                                <div>
                                                                    <div><i class="fa fa-thumbs-up"></i> </div>
                                                                    <div>${like}</div>
                                                                </div>
                                                            </div>
                                                        </div>       
                                                        <div class='button_container'>
                                                            <button class='modify_button'>수정</button>
                                                            <button class='delete_button' onclick="deleteLank('${dbId}')">삭제</button>
                                                        </div>                        
                                                    </div>
                                                </div>`
                        let temp_html2 = `<div class="rank_item">
                                                    <div class="rank_item_number">${rank_number}</div>
                                                    <div class="rank_item_img">
                                                        <img src=${food_img} />
                                                    </div>
                                                    <div class="rank_item_content">
                                                        <div class="rank_item_title">
                                                            <div class="dishName">${food_name}</div>
                                                        </div>
                                                        <div class="rank_item_comment">
                                                            ${comment}
                                                        </div>
                                                        <div class="rank_item_knowhow">
                                                            ${know_how}
                                                        </div>
                                                        <button class='reviewButton' onclick="reviewToggle('${dbId}')">리뷰</button>
                                                    </div>
                                                    <div class="rank_item_sub">
                                                        <div class="rank_item_expires">
                                                             <span class="expires_text">유통기한:</span>
                                                             <span class="expires_start">${start_date}</span>
                                                             <span>~</span>
                                                             <span class="expires_last">${end_date}</span>
                                                        </div>
                                                        <div class="rank_item_priceTag">
                                                            <span>할인율</span>
                                                            <span>할인가격</span>
                                                            <span>좋아요 수</span>
                                                        </div>
                                                        <div class="right_item_price">
                                                            <div class="sale_rate">
                                                                <div>
                                                                    ${sale_rate}%
                                                                </div>
                                                            </div>
                                                            <div class="sale_price">
                                                                <div>
                                                                    <div class="before_price">${prime_prices}</div>
                                                                    <div class="current_price">${sale_prices}</div>
                                                                </div>
                                                            </div>
                                                            <div class="sale_like" onclick="updateLike('${dbId}','${like}')">
                                                                <div>
                                                                    <div><i class="fa fa-thumbs-up"></i> </div>
                                                                    <div>${like}</div>
                                                                </div>
                                                            </div>
                                                        </div>                          
                                                    </div>
                                                </div>`
                        if(loginName !== username){
                            $('.rank_list').append(temp_html2);
                        } else {
                            $('.rank_list').append(temp_html);
                        }
                    }

                }
                if (filterList[1] === '인기순') {
                    document.querySelector('.filter_rank .rank:nth-of-type(3)').classList.remove('selected')
                    document.querySelector('.filter_rank .rank:nth-of-type(1)').classList.remove('selected')
                    document.querySelector('.filter_rank .rank:nth-of-type(2)').classList.add('selected')
                    let sortedKoreanFoods = koreanFoods.sort((a, b) => b.like - a.like)
                    for (let i = 0; i < sortedKoreanFoods.length; i++) {
                        let rank_number = `${i + 1}`;
                        let food_name = sortedKoreanFoods[i]['food_name'];
                        let start_date = sortedKoreanFoods[i]['start_date'];
                        let end_date = sortedKoreanFoods[i]['end_date'];
                        let comment = sortedKoreanFoods[i]['comment'];
                        let prime_prices = sortedKoreanFoods[i]['prime_prices'];
                        let sale_prices = sortedKoreanFoods[i]['sale_prices'];
                        let like = sortedKoreanFoods[i]['like'] || 0;
                        let sale_rate = Math.floor((parseInt((sortedKoreanFoods[i]['sale_prices']), 10) / parseInt((sortedKoreanFoods[i]['prime_prices']), 10)) * 100)
                        let food_img = sortedKoreanFoods[i]['img'];
                        let know_how = sortedKoreanFoods[i]['know_how'];
                        let username = sortedKoreanFoods[i]['id'];
                        let dbId = sortedKoreanFoods[i]['_id'];
                                                let temp_html = `<div class="rank_item">
                                                    <div class="rank_item_number">${rank_number}</div>
                                                    <div class="rank_item_img">
                                                        <img src=${food_img} />
                                                    </div>
                                                    <div class="rank_item_content">
                                                        <div class="rank_item_title">
                                                            <div class="dishName">${food_name}</div>
                                                        </div>
                                                        <div class="rank_item_comment">
                                                            ${comment}
                                                        </div>
                                                        <div class="rank_item_knowhow">
                                                            ${know_how}
                                                        </div>
                                                        <button class='reviewButton' onclick="reviewToggle()">리뷰</button>
                                                    </div>
                                                    <div class="rank_item_sub">
                                                        <div class="rank_item_expires">
                                                             <span class="expires_text">유통기한:</span>
                                                             <span class="expires_start">${start_date}</span>
                                                             <span>~</span>
                                                             <span class="expires_last">${end_date}</span>
                                                        </div>
                                                        <div class="rank_item_priceTag">
                                                            <span>할인율</span>
                                                            <span>할인가격</span>
                                                            <span>좋아요 수</span>
                                                        </div>
                                                        <div class="right_item_price">
                                                            <div class="sale_rate">
                                                                <div>
                                                                    ${sale_rate}%
                                                                </div>
                                                            </div>
                                                            <div class="sale_price">
                                                                <div>
                                                                    <div class="before_price">${prime_prices}</div>
                                                                    <div class="current_price">${sale_prices}</div>
                                                                </div>
                                                            </div>
                                                            <div class="sale_like" onclick="updateLike('${dbId}','${like}')">
                                                                <div>
                                                                    <div><i class="fa fa-thumbs-up"></i> </div>
                                                                    <div>${like}</div>
                                                                </div>
                                                            </div>
                                                        </div>       
                                                        <div class="position">
                                                        <div class='button_container'>
                                                            <button class='modify_button'>수정</button>
                                                            <button class='delete_button' onclick="deleteLank('${dbId}')">삭제</button></div>
                                                        </div>                        
                                                    </div>
                                                </div>`
                        $('.rank_list').append(temp_html);
                        if(loginName !== username){
                            let hideButton = document.querySelectorAll('.button_container')
                            for(let i =0; i<hideButton.length; i++){
                                hideButton[i].classList.add('remove')
                            }
                        }
                    }
                }
                if (filterList[1] === '할인순') {
                    document.querySelector('.filter_rank .rank:nth-of-type(1)').classList.remove('selected')
                    document.querySelector('.filter_rank .rank:nth-of-type(2)').classList.remove('selected')
                    document.querySelector('.filter_rank .rank:nth-of-type(3)').classList.add('selected')
                    let sortedKoreanFoods = koreanFoods.sort((a, b) => Math.floor(parseInt(b.sale_prices, 10) / parseInt(b.prime_prices, 10) * 100) - Math.floor(parseInt(a.sale_prices, 10) / parseInt(a.prime_prices, 10) * 100))
                    //Math.floor((parseInt((sortedKoreanFoods[i]['sale_prices']),10)/parseInt((sortedKoreanFoods[i]['prime_prices']),10))*100)
                    for (let i = 0; i < sortedKoreanFoods.length; i++) {
                        let rank_number = `${i + 1}`;
                        let food_name = sortedKoreanFoods[i]['food_name'];
                        let start_date = sortedKoreanFoods[i]['start_date'];
                        let end_date = sortedKoreanFoods[i]['end_date'];
                        let comment = sortedKoreanFoods[i]['comment'];
                        let prime_prices = sortedKoreanFoods[i]['prime_prices'];
                        let sale_prices = sortedKoreanFoods[i]['sale_prices'];
                        let like = sortedKoreanFoods[i]['like'] || 0;
                        let sale_rate = Math.floor((parseInt((sortedKoreanFoods[i]['sale_prices']), 10) / parseInt((sortedKoreanFoods[i]['prime_prices']), 10)) * 100)
                        let food_img = sortedKoreanFoods[i]['img'];
                        let know_how = sortedKoreanFoods[i]['know_how'];
                        let username = sortedKoreanFoods[i]['id'];
                        let dbId = sortedKoreanFoods[i]['_id'];
                                               let temp_html = `<div class="rank_item">
                                                    <div class="rank_item_number">${rank_number}</div>
                                                    <div class="rank_item_img">
                                                        <img src=${food_img} />
                                                    </div>
                                                    <div class="rank_item_content">
                                                        <div class="rank_item_title">
                                                            <div class="dishName">${food_name}</div>
                                                        </div>
                                                        <div class="rank_item_comment">
                                                            ${comment}
                                                        </div>
                                                        <div class="rank_item_knowhow">
                                                            ${know_how}
                                                        </div>
                                                        <button class='reviewButton' onclick="reviewToggle()">리뷰</button>
                                                    </div>
                                                    <div class="rank_item_sub">
                                                        <div class="rank_item_expires">
                                                             <span class="expires_text">유통기한:</span>
                                                             <span class="expires_start">${start_date}</span>
                                                             <span>~</span>
                                                             <span class="expires_last">${end_date}</span>
                                                        </div>
                                                        <div class="rank_item_priceTag">
                                                            <span>할인율</span>
                                                            <span>할인가격</span>
                                                            <span>좋아요 수</span>
                                                        </div>
                                                        <div class="right_item_price">
                                                            <div class="sale_rate">
                                                                <div>
                                                                    ${sale_rate}%
                                                                </div>
                                                            </div>
                                                            <div class="sale_price">
                                                                <div>
                                                                    <div class="before_price">${prime_prices}</div>
                                                                    <div class="current_price">${sale_prices}</div>
                                                                </div>
                                                            </div>
                                                            <div class="sale_like" onclick="updateLike('${dbId}','${like}')">
                                                                <div>
                                                                    <div><i class="fa fa-thumbs-up"></i> </div>
                                                                    <div>${like}</div>
                                                                </div>
                                                            </div>
                                                        </div>       
                                                        <div class="position">
                                                        <div class='button_container'>
                                                            <button class='modify_button'>수정</button>
                                                            <button class='delete_button' onclick="deleteLank('${dbId}')">삭제</button></div>
                                                        </div>                        
                                                    </div>
                                                </div>`
                        $('.rank_list').append(temp_html);
                        if(loginName !== username){
                            let hideButton = document.querySelectorAll('.button_container')
                            for(let i =0; i<hideButton.length; i++){
                                hideButton[i].classList.add('remove')
                            }
                        }
                    }
                }
            }
        });
    }

    if (filterList[0] === '중식') {
        document.querySelector('.filter_dish .dish:nth-of-type(1)').classList.remove('selected')
        document.querySelector('.filter_dish .dish:nth-of-type(3)').classList.remove('selected')
        document.querySelector('.filter_dish .dish:nth-of-type(2)').classList.add('selected')
        $.ajax({
            type: 'GET',
            url: '/api/foodlist?dish_give=중식',
            data: {},
            success: function (response) {
                let loginName = response['id'];
                let chinaFoods = response['chinafoods'];
                if (filterList[1] === '최저가') {
                    document.querySelector('.filter_rank .rank:nth-of-type(2)').classList.remove('selected')
                    document.querySelector('.filter_rank .rank:nth-of-type(3)').classList.remove('selected')
                    document.querySelector('.filter_rank .rank:nth-of-type(1)').classList.add('selected')
                    let sortedChinaFoods = chinaFoods.sort((a, b) => parseInt(a.sale_prices, 10) - parseInt(b.sale_prices, 10))
                    for (let i = 0; i < sortedChinaFoods.length; i++) {
                        let rank_number = `${i + 1}`;
                        let food_name = sortedChinaFoods[i]['food_name'];
                        let start_date = sortedChinaFoods[i]['start_date'];
                        let end_date = sortedChinaFoods[i]['end_date'];
                        let comment = sortedChinaFoods[i]['comment'];
                        let prime_prices = sortedChinaFoods[i]['prime_prices'];
                        let sale_prices = sortedChinaFoods[i]['sale_prices'];
                        let like = sortedChinaFoods[i]['like'] || 0;
                        let sale_rate = Math.floor((parseInt((sortedChinaFoods[i]['sale_prices']), 10) / parseInt((sortedChinaFoods[i]['prime_prices']), 10)) * 100)
                        // let sale_rate = Math.floor((parseInt((sortedKoreanFoods[i]['sale_prices']), 10) / parseInt((sortedKoreanFoods[i]['prime_prices']), 10)) * 100)
                        let food_img = sortedChinaFoods[i]['img'];
                        let know_how = sortedChinaFoods[i]['know_how'];
                        let username = sortedChinaFoods[i]['id'];
                        let dbId = sortedChinaFoods[i]['_id'];
                                              let temp_html = `<div class="rank_item">
                                                    <div class="rank_item_number">${rank_number}</div>
                                                    <div class="rank_item_img">
                                                        <img src=${food_img} />
                                                    </div>
                                                    <div class="rank_item_content">
                                                        <div class="rank_item_title">
                                                            <div class="dishName">${food_name}</div>
                                                        </div>
                                                        <div class="rank_item_comment">
                                                            ${comment}
                                                        </div>
                                                        <div class="rank_item_knowhow">
                                                            ${know_how}
                                                        </div>
                                                        <button class='reviewButton' onclick="reviewToggle()">리뷰</button>
                                                    </div>
                                                    <div class="rank_item_sub">
                                                        <div class="rank_item_expires">
                                                             <span class="expires_text">유통기한:</span>
                                                             <span class="expires_start">${start_date}</span>
                                                             <span>~</span>
                                                             <span class="expires_last">${end_date}</span>
                                                        </div>
                                                        <div class="rank_item_priceTag">
                                                            <span>할인율</span>
                                                            <span>할인가격</span>
                                                            <span>좋아요 수</span>
                                                        </div>
                                                        <div class="right_item_price">
                                                            <div class="sale_rate">
                                                                <div>
                                                                    ${sale_rate}%
                                                                </div>
                                                            </div>
                                                            <div class="sale_price">
                                                                <div>
                                                                    <div class="before_price">${prime_prices}</div>
                                                                    <div class="current_price">${sale_prices}</div>
                                                                </div>
                                                            </div>
                                                            <div class="sale_like" onclick="updateLike('${dbId}','${like}')">
                                                                <div>
                                                                    <div><i class="fa fa-thumbs-up"></i> </div>
                                                                    <div>${like}</div>
                                                                </div>
                                                            </div>
                                                        </div>       
                                                        <div class="position">
                                                        <div class='button_container'>
                                                            <button class='modify_button'>수정</button>
                                                            <button class='delete_button' onclick="deleteLank('${dbId}')">삭제</button></div>
                                                        </div>                        
                                                    </div>
                                                </div>`
                        $('.rank_list').append(temp_html);
                        if(loginName !== username){
                            let hideButton = document.querySelectorAll('.button_container')
                            for(let i =0; i<hideButton.length; i++){
                                hideButton[i].classList.add('remove')
                            }
                        }
                    }
                }
                if (filterList[1] === '인기순') {
                    document.querySelector('.filter_rank .rank:nth-of-type(3)').classList.remove('selected')
                    document.querySelector('.filter_rank .rank:nth-of-type(1)').classList.remove('selected')
                    document.querySelector('.filter_rank .rank:nth-of-type(2)').classList.add('selected')
                    let sortedChinaFoods = chinaFoods.sort((a, b) => b.like - a.like)
                    for (let i = 0; i < sortedChinaFoods.length; i++) {
                        let rank_number = `${i + 1}`;
                        let food_name = sortedChinaFoods[i]['food_name'];
                        let start_date = sortedChinaFoods[i]['start_date'];
                        let end_date = sortedChinaFoods[i]['end_date'];
                        let comment = sortedChinaFoods[i]['comment'];
                        let prime_prices = sortedChinaFoods[i]['prime_prices'];
                        let sale_prices = sortedChinaFoods[i]['sale_prices'];
                        let like = sortedChinaFoods[i]['like'] || 0;
                        let sale_rate = Math.floor((parseInt((sortedChinaFoods[i]['sale_prices']), 10) / parseInt((sortedChinaFoods[i]['prime_prices']), 10)) * 100)
                        let food_img = sortedChinaFoods[i]['img'];
                        let know_how = sortedChinaFoods[i]['know_how'];
                        let username = sortedChinaFoods[i]['id'];
                        let dbId = sortedChinaFoods[i]['_id'];
                                               let temp_html = `<div class="rank_item">
                                                    <div class="rank_item_number">${rank_number}</div>
                                                    <div class="rank_item_img">
                                                        <img src=${food_img} />
                                                    </div>
                                                    <div class="rank_item_content">
                                                        <div class="rank_item_title">
                                                            <div class="dishName">${food_name}</div>
                                                        </div>
                                                        <div class="rank_item_comment">
                                                            ${comment}
                                                        </div>
                                                        <div class="rank_item_knowhow">
                                                            ${know_how}
                                                        </div>
                                                        <button class='reviewButton' onclick="reviewToggle()">리뷰</button>
                                                    </div>
                                                    <div class="rank_item_sub">
                                                        <div class="rank_item_expires">
                                                             <span class="expires_text">유통기한:</span>
                                                             <span class="expires_start">${start_date}</span>
                                                             <span>~</span>
                                                             <span class="expires_last">${end_date}</span>
                                                        </div>
                                                        <div class="rank_item_priceTag">
                                                            <span>할인율</span>
                                                            <span>할인가격</span>
                                                            <span>좋아요 수</span>
                                                        </div>
                                                        <div class="right_item_price">
                                                            <div class="sale_rate">
                                                                <div>
                                                                    ${sale_rate}%
                                                                </div>
                                                            </div>
                                                            <div class="sale_price">
                                                                <div>
                                                                    <div class="before_price">${prime_prices}</div>
                                                                    <div class="current_price">${sale_prices}</div>
                                                                </div>
                                                            </div>
                                                            <div class="sale_like" onclick="updateLike('${dbId}','${like}')">
                                                                <div>
                                                                    <div><i class="fa fa-thumbs-up"></i> </div>
                                                                    <div>${like}</div>
                                                                </div>
                                                            </div>
                                                        </div>       
                                                        <div class="position">
                                                        <div class='button_container'>
                                                            <button class='modify_button'>수정</button>
                                                            <button class='delete_button' onclick="deleteLank('${dbId}')">삭제</button></div>
                                                        </div>                        
                                                    </div>
                                                </div>`
                        $('.rank_list').append(temp_html);
                        if(loginName !== username){
                            let hideButton = document.querySelectorAll('.button_container')
                            for(let i =0; i<hideButton.length; i++){
                                hideButton[i].classList.add('remove')
                            }
                        }
                    }
                }
                if (filterList[1] === '할인순') {
                    document.querySelector('.filter_rank .rank:nth-of-type(1)').classList.remove('selected')
                    document.querySelector('.filter_rank .rank:nth-of-type(2)').classList.remove('selected')
                    document.querySelector('.filter_rank .rank:nth-of-type(3)').classList.add('selected')
                    let sortedChinaFoods = chinaFoods.sort((a, b) => Math.floor(parseInt(b.sale_prices, 10) / parseInt(b.prime_prices, 10) * 100) - Math.floor(parseInt(a.sale_prices, 10) / parseInt(a.prime_prices, 10) * 100))
                    for (let i = 0; i < sortedChinaFoods.length; i++) {
                        let rank_number = `${i + 1}`;
                        let food_name = sortedChinaFoods[i]['food_name'];
                        let start_date = sortedChinaFoods[i]['start_date'];
                        let end_date = sortedChinaFoods[i]['end_date'];
                        let comment = sortedChinaFoods[i]['comment'];
                        let prime_prices = sortedChinaFoods[i]['prime_prices'];
                        let sale_prices = sortedChinaFoods[i]['sale_prices'];
                        let like = sortedChinaFoods[i]['like'] || 0;
                        let sale_rate = Math.floor((parseInt((sortedChinaFoods[i]['sale_prices']), 10) / parseInt((sortedChinaFoods[i]['prime_prices']), 10)) * 100)
                        let food_img = sortedChinaFoods[i]['img'];
                        let know_how = sortedChinaFoods[i]['know_how'];
                        let username = sortedChinaFoods[i]['id'];
                        let dbId = sortedChinaFoods[i]['_id'];
                                               let temp_html = `<div class="rank_item">
                                                    <div class="rank_item_number">${rank_number}</div>
                                                    <div class="rank_item_img">
                                                        <img src=${food_img} />
                                                    </div>
                                                    <div class="rank_item_content">
                                                        <div class="rank_item_title">
                                                            <div class="dishName">${food_name}</div>
                                                        </div>
                                                        <div class="rank_item_comment">
                                                            ${comment}
                                                        </div>
                                                        <div class="rank_item_knowhow">
                                                            ${know_how}
                                                        </div>
                                                        <button class='reviewButton' onclick="reviewToggle()">리뷰</button>
                                                    </div>
                                                    <div class="rank_item_sub">
                                                        <div class="rank_item_expires">
                                                             <span class="expires_text">유통기한:</span>
                                                             <span class="expires_start">${start_date}</span>
                                                             <span>~</span>
                                                             <span class="expires_last">${end_date}</span>
                                                        </div>
                                                        <div class="rank_item_priceTag">
                                                            <span>할인율</span>
                                                            <span>할인가격</span>
                                                            <span>좋아요 수</span>
                                                        </div>
                                                        <div class="right_item_price">
                                                            <div class="sale_rate">
                                                                <div>
                                                                    ${sale_rate}%
                                                                </div>
                                                            </div>
                                                            <div class="sale_price">
                                                                <div>
                                                                    <div class="before_price">${prime_prices}</div>
                                                                    <div class="current_price">${sale_prices}</div>
                                                                </div>
                                                            </div>
                                                            <div class="sale_like" onclick="updateLike('${dbId}','${like}')">
                                                                <div>
                                                                    <div><i class="fa fa-thumbs-up"></i> </div>
                                                                    <div>${like}</div>
                                                                </div>
                                                            </div>
                                                        </div>       
                                                        <div class="position">
                                                        <div class='button_container'>
                                                            <button class='modify_button'>수정</button>
                                                            <button class='delete_button' onclick="deleteLank('${dbId}')">삭제</button></div>
                                                        </div>                        
                                                    </div>
                                                </div>`
                        $('.rank_list').append(temp_html);
                        if(loginName !== username){
                            let hideButton = document.querySelectorAll('.button_container')
                            for(let i =0; i<hideButton.length; i++){
                                hideButton[i].classList.add('remove')
                            }
                        }
                    }
                }
            }
        });
    }
}