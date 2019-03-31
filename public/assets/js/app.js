/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
$('#add-user').on('click', function (event) {
  event.preventDefault();

  const newAccount = {
    firstName: $('#inputFirst').val().trim(),
    lastName: $('#inputLast').val().trim(),
    email: $('#inputEmail').val().trim(),
    password: $('#inputPassword').val().trim(),
    city: $('#inputCity').val().trim(),
    state: $('#inputState').val().trim(),
    country: $('#inputCountry').val().trim()
  };

  if (newAccount.password.length > 0 && newAccount.email.length > 0 && newAccount.lastName.length > 0 && newAccount.firstName.length > 0) {
    $.ajax({
      type: 'POST',
      url: '/api/register',
      data: newAccount
    }).then(() => {
      window.location.href = '/';
    });
  } else {
    console.log('**Please fill out entire form**');
    $('#create-err-msg').empty('').text('**Please fill out entire form**');
  }
});

$('#update-user').on('click', function (event) {
  event.preventDefault();

  const id = $(this).data('id');

  // capture All changes
  const changeUser = {
    firstName: $('#inputFirst').val().trim(),
    lastName: $('#inputLast').val().trim(),
    email: $('#inputEmail').val().trim(),
    password: $('#inputPassword').val().trim(),
    city: $('#inputCity').val().trim(),
    state: $('#inputState').val().trim(),
    country: $('#inputCountry').val().trim()
  };
  $('#err-msg').empty('');
  // $('#change-user-modal').modal('show');
  console.log(changeUser);

  if (changeUser.password.length > 0 && changeUser.email.length > 0 && changeUser.lastName.length > 0 && changeUser.firstName.length > 0) {
    $.ajax({
      type: 'PUT',
      url: `/api/user/${id}`,
      data: changeUser
    }).then((result) => {
      console.log('Updated user:', result);
      // Reload the page to get the updated list
      window.location.href = '/logout';
    });
  } else {
    console.log('**Please fill out entire form**');
    $('#update-err-msg').empty('').text('**Please fill out entire form**');
  }
});

// DELETE   ***************************************************
$('#delete-user').on('click', function (event) {
  event.preventDefault();
  $('#err-msg').empty('');
  $('#delete-user-modal').modal('show');
});

$('#confirm-delete').on('click', function (event) {
  event.preventDefault();

  const id = $(this).data('id');

  const deleteUser = {
    email: $('#userEmail').val().trim(),
    password: $('#userPassword').val().trim()
  };

  if (deleteUser.email.length > 0 && deleteUser.password.length > 0) {
    $.ajax({
      type: 'POST',
      url: '/api/user/confirm',
      data: deleteUser
    }).then((result) => {
      if (result) {
        $.ajax(`/api/user/${id}`, {
          type: 'DELETE'
        }).then(() => {
          console.log('Deleted user', deleteUser);
          // Reload the page to get the updated list
          window.location.href = '/logout';
        });
      } else {
        $('#err-msg').empty('').text('Wrong credentials!');
      }
    });
  } else {
    console.log('fill out entire form');
    $('#err-msg').empty('').text('fill out entire form');
  }
});

$('#register').on('click', function (event) {
  event.preventDefault();
  window.location.href = '/register';
});

$('#login-modal').on('click', function (event) {
  event.preventDefault();
  $('#user-info').modal('show');
});

$('#go-home').on('click', function (event) {
  event.preventDefault();
  window.location.href = '/';
});

$('#login').on('click', function (event) {
  event.preventDefault();

  const user = {
    email: $('#email').val().trim(),
    password: $('#user_password').val().trim()
  };

  $.post('/api/login', user, (result) => {
    // console.log(result);
    if (result.loggedIn) {
      $(document.location).attr('href', '/dashboard');
    } else {
      $('#login-err-msg').empty('').text(result.error);
      $('#user-info').modal('hide');
    }
  });
});

// inserting filestack
var userLatitude;
var userLongitude;
var initMapLatLong;
var map;
// var request;

function getLocation () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    // eslint-disable-next-line no-undef
    geolocationStatusField.text('Geolocation is not supported by this browser');
  }
};

function showPosition (position) {
  userLatitude = parseFloat(position.coords.latitude);
  userLongitude = parseFloat(position.coords.longitude);
  // eslint-disable-next-line no-sequences
  if (initMapLatLong !== userLatitude, userLongitude) {
    console.log('redoing initMap: ' + initMapLatLong + ' / ' + userLatitude, userLongitude);
    initMap();
  } else {
    console.log('show position: ' + userLatitude, userLongitude);
  }
};

function initMap () {
  console.log('init map: ' + userLatitude, userLongitude);
  // eslint-disable-next-line no-unused-expressions
  // eslint-disable-next-line no-sequences
  initMapLatLong = userLatitude, userLongitude;
  var userLatLong = { lat: userLatitude, lng: userLongitude };
  // eslint-disable-next-line no-undef
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 2,
    center: userLatLong
  });
  // eslint-disable-next-line no-undef
  var marker = new google.maps.Marker({
    position: userLatLong,
    map: map,
    title: 'You are here'
  });
};

function placeMarker (latitude, longitude) {
  var iconBase =
                'http://maps.google.com/mapfiles/';
  var icons = {
    tree: {
      icon: 'parks_small.png'
    },
    caution: {
      icon: iconBase + 'kml/shapes/caution.png'
    }
  };
  let oceanCheckUrl = `https://secure.geonames.org/oceanJSON?formatted=true&lat=${latitude}&lng=${longitude}&username=angiespong&style=full`;
  $.get(oceanCheckUrl, function (response, status) {
    console.log(response);
    if (!Object.keys(response).includes('ocean')) {
      var userLatLong = { lat: latitude, lng: longitude };
      // eslint-disable-next-line no-undef
      var marker = new google.maps.Marker({
        position: userLatLong,
        map: map,
        icon: icons.tree.icon
      });
    }
  });
};

window.addEventListener('DOMContentLoaded', function () {
  // we will hide this key and the security.policy and
  // security.signature in our .env file
  const apikey = 'ALu7LkiIIR3moIv9EV6sRz';

  const clientOptions = {
    security: {
      policy: 'eyJleHBpcnkiOjI1MjQ2MjYwMDAsImNhbGwiOlsicGljayIsInJlYWQiLCJzdGF0Iiwid3JpdGUiLCJ3cml0ZVVybCIsInN0b3JlIiwiY29udmVydCIsInJlbW92ZSIsImV4aWYiLCJydW5Xb3JrZmxvdyJdfQ==',
      signature: '4b764be43ffa32d14c20d96fe343a777d3e241b8dde4bd78d8820dbb696a6eac'
    }
  };

  // eslint-disable-next-line no-undef
  const client = filestack.init(apikey, clientOptions);

  const options = {
    cleanupImageExif: false,
    maxFiles: 1,
    uploadInBackground: false,
    // imageMax resizes image to a maximum size
    imageMax: [800, 600],
    imageMin: [40, 30],
    // maxSize is in bytes, it is set to limit the file upload to 10.5MB
    maxSize: 10500000,
    // onOpen could be used if we want to know that the modal is opened
    // onOpen: () => console.log('opened!'),
    onUploadDone: (res) => {
      let theHandle = res.filesUploaded[0].handle;
      let theUrl = res.filesUploaded[0].url;

      // the following block returns exif data which may include GPS
      // if we don't get GPS data out of this then we can geolocate
      // the device or ask the user to enter an address
      client.metadata(theHandle, { exif: true })
        .then((res) => {
          // extract and parse the geotag data
          let latitudeRef = res.exif['GPS GPSLatitudeRef'];
          let latitudeArray = res.exif['GPS GPSLatitude'].substring(1);
          latitudeArray = (latitudeArray.slice(0, -1)).split(', ');
          let longitudeRef = res.exif['GPS GPSLongitudeRef'];
          let longitudeArray = res.exif['GPS GPSLongitude'].substring(1);
          longitudeArray = (longitudeArray.slice(0, -1)).split(', ');

          // convert degrees, minutes, seconds into decimal
          let latitude = convertDMSToDD(latitudeArray[0], latitudeArray[1], (latitudeArray[2].split('/')[0] / latitudeArray[2].split('/')[1]), latitudeRef);
          console.log('latitude: ' + latitude);
          // put latitude into database

          let longitude = convertDMSToDD(longitudeArray[0], longitudeArray[1], (longitudeArray[2].split('/')[0] / longitudeArray[2].split('/')[1]), longitudeRef);
          console.log('longitude: ' + longitude);
          console.log('image handle: ' + theHandle);
          console.log('image url: ' + theUrl);

          var subid = $('#content').attr('data-id');
          const treeData =
          { UserId: subid,
            tree_image_link: theUrl,
            latitude: latitude,
            longitude: longitude
          };
          // put theHandle into our database, that's the image
          // the user uploaded
          // put longitude into database
          $.ajax({
            type: 'POST',
            url: '/api/usertrees',
            data: treeData
          }).then((result) => {
            // window.location.href = '/';
            console.log(result);
          });

          // grab all the tree data from db
          placeMarker(latitude, longitude);
        })
        .catch((err) => {
          console.log(err);
        });

      // the following block retrieves the image
      client.retrieve(theHandle).then((blob) => {
        const urlCreator = window.URL || window.webkitURL;
        const img = document.createElement('img');
        // we set the width *or* height as we wish for different contexts
        // img.width = 720;
        img.height = 200;
        img.src = urlCreator.createObjectURL(blob);
        document.getElementById('content').appendChild(img);
      }).catch((error) => {
        console.error(error);
      });
    }
  };

  function convertDMSToDD (degrees, minutes, seconds, direction) {
    var dd = parseInt(degrees) + minutes / 60 + seconds / 3600;
    if (direction === 'S' || direction === 'W') {
      dd = dd * -1;
    } // Don't do anything for N or E
    return dd;
  };

  document.getElementById('upload').onclick = function () { client.picker(options).open(); };
});
