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
            console.log('image handle: ' + theHandle);
            console.log('image url: ' + res.filesUploaded[0].url);
            // put theHandle into our database, that's the image
            // the user uploaded

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
                    // put longitude into database
                    makeThePin(latitude, longitude);
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
                document.getElementById('content').appendChild(img)
            }).catch((error) => {
                console.error(error);
            });
        }
    };

    function convertDMSToDD(degrees, minutes, seconds, direction) {
        var dd = parseInt(degrees) + minutes / 60 + seconds / 3600;
        if (direction == "S" || direction == "W") {
            dd = dd * -1;
        } // Don't do anything for N or E
        return dd;
    }

    document.getElementById('upload').onclick = function () { client.picker(options).open(); };


    var userLatitude = 35.8235; // hard-wired for now in lieu of geolocation
    var userLongitude = -78.8256; // "
    var initMapLatLong;
    var map;
    var service;
    var infowindow;
    var request;
    const usersArray = [];
    let queryURL;
    var breakFlag = false;
    var theCount = 0;

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            geolocationStatusField.text("Geolocation is not supported by this browser");
        }
    }

    function showPosition(position) { // shows position of user
        userLatitude = parseFloat(position.coords.latitude);
        userLongitude = parseFloat(position.coords.longitude);
        if (initMapLatLong != userLatitude, userLongitude) {
            console.log("redoing initMap: " + initMapLatLong + " / " + userLatitude, userLongitude);
            initMap();
        } else {
            console.log("show position: " + userLatitude, userLongitude);
        }
    }

    function initMap() {
        console.log("init map: " + userLatitude, userLongitude);
        initMapLatLong = userLatitude, userLongitude;
        var userLatLong = { lat: userLatitude, lng: userLongitude };
        map = new google.maps.Map(document.getElementById("map"), {
            zoom: 2,
            center: userLatLong
        });
        var marker = new google.maps.Marker({
            position: userLatLong,
            map: map,
            title: "You are here"
        });
    }

    function makeThePin(latitude, longitude) {
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
        let oceanCheckUrl = `https://secure.geonames.org/oceanJSON?formatted=true&lat=${latitude}&lng=${longitude}&username=angiespong&style=full`
        $.get(oceanCheckUrl, function (response, status) {
            console.log(response);
            if (!Object.keys(response).includes('ocean')) {
                theCount++;
                usersArray.push(newUser);
                var userLatLong = { lat: latitude, lng: longitude };
                var marker = new google.maps.Marker({
                    position: userLatLong,
                    map: map,
                    icon: icons.tree.icon,
                    title: firstNameCapitalized
                });
            }
            // }
        });
    };
});
