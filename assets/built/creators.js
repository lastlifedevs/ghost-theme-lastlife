$(document).ready(function(){$("#postsLink").attr("href","/browse-posts"),$(".profile-icon").hover(function(){let e=$(this),o=$("#profiles-container"),t=$("#profile-"+$.escapeSelector($(this).data("prof-id")));t.show();let i=o.outerHeight();t.hide();let r=e.offset().top-$(window).scrollTop()+e.outerHeight();r+i+100>$(document).outerHeight()&&(r-=e.outerHeight()+i),o.css("top",r+"px"),$(".creator-profile").stop().hide(),t.fadeIn()},function(){$(".creator-profile").hide()})});
//# sourceMappingURL=creators.js.map
