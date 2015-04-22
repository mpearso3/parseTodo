$(document).ready(function()
{
//------------------------------------------------------------------
//                        VARIABLES
//------------------------------------------------------------------
    var ListItem;
    var query;

    var currentUser = Parse.User.current();

    var ShowUserView = Parse.View.extend(
    {
        template: Handlebars.compile($('#home-template').html()),
        render: function()
        {
            var attributes = this.model.toJSON();
            this.$el.html(this.template(attributes));
        }
    });
    var ShowSigninView = Parse.View.extend(
    {
        template: Handlebars.compile($('#signin-template').html()),
        render: function()
        {
            this.$el.html(this.template());
        }
    });
    var ShowSignupView = Parse.View.extend(
    {
        template: Handlebars.compile($('#signup-template').html()),
        render: function()
        {
            this.$el.html(this.template());
        }
    });
//------------------------------------------------------------------ END Variables

    $(document).on("click", "#signin-nav", function(e)
    {
        CheckUser(ShowUserView, ShowSigninView, currentUser);
    });
    $(document).on("click", "#signup-nav", function(e)
    {
        // window.location.href = "signup.html";
        SignUp(ShowSignupView);
    });
    $(document).on("click", "#signout-nav", function(e)
    {
        Parse.User.logOut();
        currentUser = Parse.User.current();
        // window.location.href = "signin.html";
        CheckUser(ShowUserView, ShowSigninView, currentUser);
    });
    $(document).on("submit", "form.signin-form", function(event)
    {
        // Prevent default submit event
        event.preventDefault();

        // Get data from the form and put them into the variables
        var data = $(this).serializeArray();
        var username = data[0].value;
        var password = $.sha256(data[1].value);

        // Call Parse login function 
        Parse.User.logIn(username, password,
        {
            // If the username and password matches
            success: function(user)
            {
                // window.location.href = "index.html";
                currentUser = Parse.User.current();
                CheckUser(ShowUserView, ShowSigninView, currentUser);
                GetMostRecentItems(10);
            },
            error: function(user, error)
            {
                console.log(error);
                // Empty the inputs
                $("#username-input").val(""); 
                $("#password-input").val("");

                // Check error code
                if(error.code == "101")
                    $("#input-wrapper").prepend("Incorrect username or password, try again.");
            }
        });
    });
    $(document).on("submit", "form.signup-form", function(event)
    {
        // Prevent default submit event
        event.preventDefault();

        // Get data from the form and put them into the variables
        var data = $(this).serializeArray();
        var username = data[0].value;
        var password = $.sha256(data[1].value);
        var repeatPassword = $.sha256(data[2].value);

        if(password == repeatPassword)
        {
            var user = new Parse.User();
            user.set("username", username);
            user.set("password", password);

            user.signUp(null,
            {
                success: function(user)
                {
                    ShowUser(ShowUserView, currentUser);
                },
                error: function(user, error)
                {
                    console.log("Error: "+error.code+" "+error.message);
                    $("#username-input").val("");
                    $("#password-input").val("");
                    $("#re-password-input").val("");
                }
            });
        }
        else
        {
            $("#input-wrapper").prepend("Passwords didn't match, try again.");
            $("#password-input").val("");
            $("#re-password-input").val("");
        }
    });

    $(document).on("click", "#list-item-submit", function(e)
    {   // Save newly typed Todo item
        SaveNewTodo();
    });

    GetMostRecentItems(10);

    CheckUser(ShowUserView, ShowSigninView, currentUser);
});


//----------------------------------------------------------------
// SaveNewTodo 
//      purpose: Save input text as a new Todo and add to the DOM
//----------------------------------------------------------------
function SaveNewTodo()
{
    // Get the current Todo item
    var text = $("#list-input").val();

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
            $("#no-incomplete-message").addClass('hidden');
            var html = " <li class='list-item'><input type='checkbox' id='"+item.id+"'>"+item.attributes.content+"</li>";
            $("#incomplete-items").append(html);
            $("#list-input").focus();
            $("#list-input").val("");
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
function GetMostRecentItems(amount)
{
    console.log("GetMostRecentItems >>>>");
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
                $("#no-incomplete-message").addClass('hidden');

            // Append each of the incomplete tasks to the Inccomplete List
            $.each(results, function(index, value)
            {
                var html = " <li class='list-item'><input type='checkbox' id='"+value.id+"'>"+value.attributes.content+"</li>";
                $("#incomplete-items").append(html);
            });

            // When the checkbox is clicked for any of the items in the Incomplete List, update the list
            $("#incomplete-items").on("click", "li", function(e)
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
                        $("#no-incomplete-message").removeClass('hidden');
                });
            });
        },
        error: function(error)
        {
            console.log("Error when retrieving Todo's: "+error.code+" "+error.message);
        }
    });
    console.log("<<<< GetMostRecentItems");
}

//----------------------------------------------------------------
// CheckUser 
//      purpose: See if the user is signed in
//----------------------------------------------------------------
function CheckUser(ShowUserView, ShowSigninView, currentUser)
{
    var path = window.location.pathname;

    if(!currentUser)
    {   // Not currently signed in so show signin page
        SignIn(ShowSigninView);
    }
    else if(currentUser)
    {   // Properly signed in so show user home page
        ShowUser(ShowUserView, currentUser);
    }
}

//----------------------------------------------------------------
// ShowUser 
//      purpose: Render ShowUserView 
//----------------------------------------------------------------
function ShowUser(ShowUserView, currentUser)
{
    var showUserView = new ShowUserView({model: currentUser});
    showUserView.render();
    $('.random-container').html(showUserView.el);
}
//----------------------------------------------------------------
// SignIn 
//      purpose: Render ShowSigninView 
//----------------------------------------------------------------
function SignIn(ShowSigninView)
{
    var showSigninView = new ShowSigninView();
    showSigninView.render();
    $('.random-container').html(showSigninView.el);
}
//----------------------------------------------------------------
// SignUp 
//      purpose: Render ShowSignupView 
//----------------------------------------------------------------
function SignUp(ShowSignupView)
{
    var showSignupView = new ShowSignupView();
    showSignupView.render();
    $('.random-container').html(showSignupView.el);
}