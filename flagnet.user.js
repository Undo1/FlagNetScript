// ==UserScript==
// @name FlagNetScript
// @description Show FlagNet predictions for flags inline
// @namespace Undo
// @author Undo
// @include http://stackoverflow.com/admin/dashboar*
// @include https://stackoverflow.com/admin/dashboar*

// ==/UserScript==
function with_jquery(f) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.textContent = "(" + f.toString() + ")(jQuery)";
    document.body.appendChild(script);
}

with_jquery(function($) {
  console.log("oy");

  function showFlagnetResults($) {
    $(".active-flag").each(function(i) {
      score = localStorage.getItem("FlagNet-" + $(this).text());
      if (score !== null) {
        color = "black";
        if (score >= 0.7) {
          color = "green";
        }
        else if (score <= 0.4) {
          color = "red";
        }

        $(this).append("<span style='color:" + color + "; font-weight:bold'> (" + (score * 100).toFixed(1) + "%)</span>");
      }
    });
  }

  $("div#sidebar").append('<input type="button" class="reload-flagnet" value="reload flagnet">');

  $(".reload-flagnet").on("click", function() {
    $.get( "/admin/all-flags", { for: "John" } ).done(function(data) {
      console.log(data);
      data = $.map($.grep($.map(data, function(n) { return n["flags"] } ), function(n, i) { return n["flagType"]=="PostOther" }), function(n) {return n["description"] } );

      $.ajax({type: "POST",
              url: "https://soflagnet.erwaysoftware.com/batch",
             data: JSON.stringify({flags: data}),
      contentType: "application/json; charset=utf-8",
         dataType: "json",
          success: function(response) {
                      response.forEach(function(s,i) {
                        localStorage.setItem("FlagNet-" + data[i], s);
                      });
                   }
              });
    });
  });
  showFlagnetResults($);
});
