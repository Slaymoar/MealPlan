window.onload = function() {

    function renderItems(response, direction) {
        /** 
            <div data-id="12312eaefag12313">
                <div class="name">Ian Butthole Chili</div>
                <div class="author">Martha Stewert</div>
                <div class="small">
                    <span class="ready-in-time">60 minutes</span>
                    <span class="servers">Serves: 4</span>
                </div>
                <div class="ingredients">
                    <span class="ingredient">1lb Ground beef</span>
                    ...
                </div>
            </div>
        **/
        var html;
        for (var i=0; i<response.length; i++) {
            var data = response[i];
            html = sprintf('<div data-id="%s" class="item">', data['_id']);
            html += sprintf('<div class="name"><h4>%s<h4></div>', data['name']);
            html += sprintf('<div class="author">Author: %s</div>', data['author']);
            
            html += '<div class="small">';
            html += sprintf('<span class="ready-in-time">%s minutes</span>', data['total_time']);
            html += sprintf('<span class="serves">Serves: %s</span>', data['serves']);
            html += '</div>';

            html += '<h5>Ingredients</h5>'
            if (data['ingredients']) {
                html += '<div class="ingredients">';
                for (var x=0; x<data['ingredients'].length; x++) {
                    var d = data['ingredients'][x];
                    html += sprintf('<span class="item">%s%s %s</span>', d['amount'], d['units'], d['name']);  
                }
                html += '</div>';  
            }

            html += '<h5>Directions</h5>';
            if (data['directions']) {
                html += '<div class="directions">';
                for (var x=0; x<data['directions'].length; x++) {
                    var d = data['directions'][x];
                    html += sprintf('<div class="item">- %s</div>', d);
                }
                html += '</div>'  
            }

            html += sprintf('<button title="Delete" class="delete">Delete</button>');

            html += '</div>'
            if (direction === "prepend") {
                $('#recipes').prepend(html);
            } else {
                $('#recipes').append(html);
            }
        }
    }

    /**
     * Fire a new POST request to /api/recipe
     */
    $("#new-recipe #addStep").on('click', function(e) {
        console.log('addStep');
        /**
            When clicked the addStep will...
                -Display editable text box with id=0 (or id=1)
                -When "addStep" clicked again
                -store previous text box string
                -id=2 ect.
                -Previous steps displyed next to "recipe"
        */
    });

    $("#new-recipe #submit").on('click', function(e) {
        console.log('submit');
        e.preventDefault();
        var values = {};
        // iterate over each form input and put the value into
        // the values object
        $.each($("form#new-recipe :input"), function(i, field) {
            if (field.name === "submit") return;
            values[field.name] = field.value;
        });

        // fire off the ajax request to post the new data
        $.ajax({
            url: "/api/recipe",
            method: "POST",
            dataType: "json",
            data: JSON.stringify(values)
        }).done(function(response, status, xhr) {
            if (response['id']) {
                $("form#new-recipe :input").val("");
                $.getJSON("/api/recipe/" + response['id']).done(function(response, status, xhr) {
                    renderItems(response, "prepend");
                }).fail(function() {
                    // @todo
                    //Pop-up window says "Error loading data"
                });
            }
        }).fail(function() {
            // @todo 
            // shit failed yo
        });
    });

    /**
     * Make a request to /api/recipe
     * Load that data into the table#recipes
     */
    $.getJSON("/api/recipe").done(function(response, status, xhr) {
        renderItems(response);
    }).fail(function() {
        // @todo
    });


    $("#recipes").on('click', '.item .delete', function(e) {
        var id = $(e.currentTarget).parent('[data-id]').attr('data-id');
        $.ajax({
            url: "/api/recipe/" + id,
            method: "DELETE",
            dataType: "json"
        }).done(function(response, status, xhr) {
            $(sprintf("#recipes > .item[data-id=%s]", response.id)).remove();
            $('#messages').html('Deleted');

        }).fail(function() {
            // @todo
        });
    });

    /**
    * Make an Instructions box thats able to be stored.
    */

    

};