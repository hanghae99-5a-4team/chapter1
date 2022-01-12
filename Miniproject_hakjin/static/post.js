// 날짜 포맷팅
let dateChange = () => {
    let date_input = document.getElementById("date1");
    let value = date_input.value;
    let result = value.split('-')
};

// 게시글 작성
function post() {
    // let id = $("#").val()
    let img = $("#img").val()
    let brand_name = $("#brand_name").val()
    let food_name = $("#food_name").val()
    let prime_prices = $("#prime_prices").val()
    let sale_prices = $("#sale_prices").val()
    let start_date = $("#date1").val()
    let end_date = $("#date2").val()
    let know_how = $("#know_how").val()
    let comment = $("#comment").val()

    $.ajax({
        type: "POST",
        url: "/post",
        data: {
            img_give: img,
            brand_name_give: brand_name,
            food_name_give: food_name,
            prime_prices_give: prime_prices,
            sale_prices_give: sale_prices,
            start_date_give: start_date,
            end_date_give: end_date,
            know_how_give: know_how,
            comment_give: comment
        },
        success: function (response) {
            console.log(response["msg"]);
            alert(response["msg"]);
            window.location.href("/detail")
        }
    })
}

// 업로드한 이미지 미리보기
function previewImage(targetObj, View_area) {
    var preview = document.getElementById(View_area); //div id
    var ua = window.navigator.userAgent;

    //ie일때(IE8 이하에서만 작동)
    if (ua.indexOf("MSIE") > -1) {
        targetObj.select();
        try {
            var src = document.selection.createRange().text; // get file full path(IE9, IE10에서 사용 불가)
            var ie_preview_error = document.getElementById("ie_preview_error_" + View_area);

            if (ie_preview_error) {
                preview.removeChild(ie_preview_error); //error가 있으면 delete
            }
            var img = document.getElementById(View_area); //이미지가 뿌려질 곳

            //이미지 로딩, sizingMethod는 div에 맞춰서 사이즈를 자동조절 하는 역할
            img.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "', sizingMethod='scale')";
        } catch (e) {
            if (!document.getElementById("ie_preview_error_" + View_area)) {
                var info = document.createElement("<p>");
                info.id = "ie_preview_error_" + View_area;
                info.innerHTML = e.name;
                preview.insertBefore(info, null);
            }
        }
        //ie가 아닐때(크롬, 사파리, FF)
    } else {
        var files = targetObj.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var imageType = /image.*/; //이미지 파일일경우만.. 뿌려준다.
            if (!file.type.match(imageType))
                continue;
            var prevImg = document.getElementById("prev_" + View_area); //이전에 미리보기가 있다면 삭제
            if (prevImg) {
                preview.removeChild(prevImg);
            }
            var img = document.createElement("img");
            img.id = "prev_" + View_area;
            img.classList.add("obj");
            img.file = file;
            img.style.width = '100px';
            img.style.height = '100px';
            preview.appendChild(img);
            if (window.FileReader) { // FireFox, Chrome, Opera 확인.
                var reader = new FileReader();
                reader.onloadend = (function (aImg) {
                    return function (e) {
                        aImg.src = e.target.result;
                    };
                })(img);
                reader.readAsDataURL(file);
            } else { // safari is not supported FileReader
                //alert('not supported FileReader');
                if (!document.getElementById("sfr_preview_error_"
                    + View_area)) {
                    var info = document.createElement("p");
                    info.id = "sfr_preview_error_" + View_area;
                    info.innerHTML = "not supported FileReader";
                    preview.insertBefore(info, null);
                }
            }
        }
    }
}
