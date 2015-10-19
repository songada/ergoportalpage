angular.module('ergo', ['ngDialog', 'googlechart']);

/*
var clientId = '837128193476-foihlrrkhng730e7uj93oo44v0sc794b.apps.googleusercontent.com';
var apiKey = 'AIzaSyDJNJBwMoUY0o3BNZkoUZyIWx0rKYVhHfs';
var scopes = 'https://www.googleapis.com/auth/drive';

// Use a button to handle authentication the first time.
function handleClientLoad() {
    gapi.client.setApiKey(apiKey);
    window.setTimeout(checkAuth,1);
}

function checkAuth() {
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
}

function handleAuthResult(authResult) {
    var authorizeButton = document.getElementById('loginDrive');
    if (authResult && !authResult.error) {
        $('#driveBeforeLogin').hide();
        $('#driveAfterLogin').show();
        $('#driveCover').show().click(function(){
            var win = window.open('https://drive.google.com/drive/my-drive', '_blank');
            win.focus();
        });

        authorizeButton.style.visibility = 'hidden';
        makeApiCall();
    } else {
        authorizeButton.style.visibility = '';
        authorizeButton.onclick = handleAuthClick;
    }
}

function handleAuthClick(event) {
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
    return false;
}

// Load the API and make an API call.  Display the results on the screen.
function makeApiCall() {
    gapi.client.load('drive', 'v2', function() {

        var request = gapi.client.drive.files.list ( {'maxResults': 10 } );

        request.execute(function(resp) {
            for (i=0; i<resp.items.length; i++) {
                var titulo = resp.items[i].title;
                var fechaUpd = resp.items[i].modifiedDate;
                var userUpd = resp.items[i].lastModifyingUserName;


                $('#driveFileList').append($('<li style="margin-bottom:10px;">' + titulo + ' - BY: ' + userUpd + '</strong></li>'));
            }
        });
    });
}
*/