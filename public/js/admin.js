$(document).ready(function()
{
    var APP_KEY = "tfkXbywrJUYNKFVW5NJsaAChQzx5VMNbpygBXQlR";
    var JS_KEY  = "IJBpaJoA9CRSywqFZxDCjHkEVh0OPbUUiT7225ts";

    Parse.initialize(APP_KEY, JS_KEY);

    var currentUser = Parse.User.current();

    //-------------------------------------------
    //              VIEW VARIABLES
    //-------------------------------------------   
    // var LoginView = Parse.View.extend(
    // {
    //     template: Handlebars.compile($('#signin-template').html()),
    //     events:
    //     {
    //         'submit .signin-form': 'login'
    //     },
    //     login: function(event)
    //     {
    //         // Prevent default submit event
    //         event.preventDefault();

    //         // Get data from the form and put them into the variables
    //         var data = $(event.target).serializeArray();
    //         var username = data[0].value;
    //         var password = data[0].value;

    //         // Call Parse login function 
    //         Parse.User.logIn(username, passsword,
    //         {
    //             // If the username and password matches
    //             success: function(user)
    //             {
    //                 window.location.href = "index.html";
    //             },
    //             error: function(user, error)
    //             {
    //                 console.log(error);
    //             }
    //         });
    //     },
    //     render: function()
    //     {
    //         this.$el.html(this.template());
    //     }
    // });
    
    //------------------------------------------- END View Variables

    // var loginView = new LoginView();
    // loginView.render();
    // $('.random-container').html(loginView.el);

    $(document).on("click", "#signin-nav", function(e)
    {
        if(currentUser)
            window.location.href = "index.html";
        else
            window.location.href = "signin.html";
    });
    $(document).on("click", "#signup-nav", function(e)
    {
        window.location.href = "signup.html";
    });
    $(document).on("click", "#signout-nav", function(e)
    {
        Parse.User.logOut();
        currentUser = Parse.User.current();
        window.location.href = "signin.html";
    });

    $("form.signin-form").submit(function(event)
    {
        // Prevent default submit event
        event.preventDefault();

        // Get data from the form and put them into the variables
        var data = $(this).serializeArray();
        var username = data[0].value;
        var password = data[1].value;

        // Call Parse login function 
        Parse.User.logIn(username, password,
        {
            // If the username and password matches
            success: function(user)
            {
                window.location.href = "index.html";
            },
            error: function(user, error)
            {
                console.log(error);
            }
        });
    });
});