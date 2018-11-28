$(document).ready((function() {
    $("#postsLink").attr('href','/browse-posts');
    $(".profile-icon").hover(function(){
        let currentIcon = $(this);
        let profContainer = $("#profiles-container");
        let selectedProfile = $("#profile-"+$.escapeSelector($(this).data("prof-id")));
        selectedProfile.show();
        let profContainerHeight = profContainer.outerHeight();
        selectedProfile.hide();
        let profileLoc = (currentIcon.offset().top - $(window).scrollTop()) + currentIcon.outerHeight();
        if (profileLoc + profContainerHeight + 100 > $(document).outerHeight()) {
            profileLoc -= (currentIcon.outerHeight() + profContainerHeight);
        }
        profContainer.css("top", profileLoc + "px");
        $(".creator-profile").stop().hide();
        selectedProfile.fadeIn();
    }, function() {
        $(".creator-profile").hide();
    });
}));