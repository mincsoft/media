$(function(){

    $(".work-report-div ul li").on("click", function (event) {
        var _this = this;
        $(".goal_top_title span.view_name").attr("data-value", $(_this).find("a").attr("data-value")).html($(_this).find("a").text());
    });

    $(".goal_top_title .view_now").on("click", function (event) {
        $(".goal_top_title .work-report-div").toggle();
        return false;
    });
});