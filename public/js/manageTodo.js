$(document).ready(function()
{
//------------------------------------------------------------------
//                        VARIABLES
//------------------------------------------------------------------
    var ListItem;
    var query;
    var noTasksMessage      = $("#no-incomplete-message:first");
    var SubmitButton        = $("#list-item-submit:first");
    var incompleteItemList  = $("#incomplete-items:first");
    var completeItemList    = $("#complete-items:first");
    var input               = $("#list-input:first");

    var currentUser = Parse.User.current();

    var ShowUserView = Parse.View.extend(
    {
        template: Handlebars.compile($('#username-template').html()),
        render: function()
        {
            var attributes = this.model.toJSON();
            this.$el.html(this.template(attributes));
        }
    });
//------------------------------------------------------------------ END Variables

    SubmitButton.on('click', function(e)
    {   // Save newly typed Todo item
        SaveNewTodo(noTasksMessage, incompleteItemList, input);
    });

    GetMostRecentItems(10, noTasksMessage, incompleteItemList);

    CheckUser(ShowUserView, currentUser);
});


//----------------------------------------------------------------
// SaveNewTodo 
//      purpose: Save input text as a new Todo and add to the DOM
//----------------------------------------------------------------
function SaveNewTodo(noTasksMessage, incompleteItemList, input)
{
    // Get the current Todo item
    var text = $("#list-input:first").val();

    // Extend native Parse Object class
    var ListItem = Parse.Object.extend("ListItem");
    var listItem = new ListItem();

    // Set the text and completion status
    listItem.set("content", text);
    listItem.set("isComplete", false);

    // Save the new Todo to the database
    listItem.save(null, 
    {
        success: function(item)
        {
            noTasksMessage.addClass('hidden');
            var html = " <li class='list-item'><input type='checkbox' id='"+item.id+"'>"+item.attributes.content+"</li>";
            incompleteItemList.append(html);
            input.focus();
            input.val("");
        },
        error: function(error)
        {
            console.log("Error when saving Todos: "+error.code+" "+error.message);
        }
    });
}

//----------------------------------------------------------------
// GetMostRecentItems 
//      purpose: Get the the next "amount" of unfinished Todo
//----------------------------------------------------------------
function GetMostRecentItems(amount, noTasksMessage, incompleteItemList)
{
    var ListItem = Parse.Object.extend("ListItem");
    var query    = new Parse.Query(ListItem);

    // Set the constraints of the query
    query.equalTo("isComplete", false);
    query.limit = amount;
    query.descending("createdAt");

    // Submit the query
    query.find(
    {
        success: function(results)
        {
            if(results.length > 0)
                noTasksMessage.addClass('hidden');

            // Append each of the incomplete tasks to the Inccomplete List
            $.each(results, function(index, value)
            {
                var html = " <li class='list-item'><input type='checkbox' id='"+value.id+"'>"+value.attributes.content+"</li>";
                incompleteItemList.append(html);
            });

            // When the checkbox is clicked for any of the items in the Incomplete List, update the list
            incompleteItemList.on("click", "li", function(e)
            {
                var query           = new Parse.Query(ListItem);
                var id              = $(this).find('input').attr('id');
                var todoListLength  = $("#incomplete-items li").length - 2;

                query.get(id,
                {
                    success: function(item)
                    {
                        item.set("isComplete", true);
                        item.save();
                    },
                    error: function(object, error)
                    {
                        console.log("Error when updating todo items: "+error.code+" "+error.message);
                    }
                });

                // After fadeOut finished, remove from DOM
                $(this).fadeOut(600, function()
                {
                    $(this).remove();
                    // If no more todo items exist, show no task message
                    if(todoListLength <= 0)
                        noTasksMessage.removeClass('hidden');
                });
            });
        },
        error: function(error)
        {
            console.log("Error when retrieving Todo's: "+error.code+" "+error.message);
        }
    });
}

//----------------------------------------------------------------
// CheckUser 
//      purpose: See if the user is signed in
//----------------------------------------------------------------
function CheckUser(ShowUserView, currentUser)
{
    var path = window.location.pathname;
    // Show current user
    if(!currentUser && path != "/parseTodo/public/signin.html")
    {
        window.location.href = "signin.html";
    }
    if(currentUser)
    {
        var showUserView = new ShowUserView({model: currentUser});
        showUserView.render();
        $('.random-container').html(showUserView.el);
    }
}