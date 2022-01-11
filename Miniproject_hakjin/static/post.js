function post() {
    // let id = $("#").val()
    // let img = $("#").val()
    let brand_name = $("#brand_name").val()
    let food_name = $("#food_name").val()
    let prime_prices = $("#prime_prices").val()
    let sale_prices = $("#sale_prices").val()
    // let start_date = $("#start_date").val()
    // let end_date = $("#end_date").val()
    let know_how = $("#know_how").val()
    let comment = $("#comment").val()

    $.ajax({
        type: "POST",
        url: "/post",
        data: {
            brand_name_give: brand_name,
            food_name_give: food_name,
            prime_prices_give: prime_prices,
            sale_prices_give: sale_prices,
            // start_date_give: start_date,
            // end_date_give: end_date,
            know_how_give: know_how,
            comment_give: comment
        },
        success: function (response) {
            console.log(response["msg"]);
            alert(response["msg"]);
            window.location.reload()
        }
    })
}