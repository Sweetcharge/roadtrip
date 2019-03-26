/*

# Geocoding API Key: AIzaSyAVmJ3EWDCAA1Go7BMxBUjcAPH3-9H1Uno

! = Easy
!! = Moderate
!!! = Difficult/Have to research
    
TO DO 
- Find the shortest route between all inputted locations [!!!]
- Remove destinations individually
- Finishing touches
*/
var map;

var currentLocationLatitude;
var currentLocationLongitude;

var places_results = [];
var markers = [];

var added_places = [];
var added_places_markers = []
var added_place_index = 0;

var loc_p = document.getElementById("location");
var resultList = document.getElementById("resultList");
var places_div = document.getElementById("places");
var result_div = document.getElementById("result");
var searchQuery = document.getElementById("userPlace");
var clearText = document.getElementById("clearText");
var resetMapLabel = document.getElementById("locationLabel");
var calculateBtn = document.getElementById("calc");
var clearBtn = document.getElementById("clearList");
var mainContainer = document.getElementById("mainContainer");
var direction_div = document.getElementById("directions");

var searchBtn = document.getElementById("searchBtn");
var destBtn = document.getElementById("destBtn");
var dirBtn = document.getElementById("dirBtn");

var directionsService = "";
var directionsDisplay = "";

// Event listeners
resetMapLabel.addEventListener("click", resetMap);
searchQuery.addEventListener("keyup", removeResults); // Clears the results list when nothing is typed
clearText.addEventListener("click", removeText);
clearText.addEventListener("click", removeResults);

searchBtn.addEventListener("click", switchToSearch);
destBtn.addEventListener("click", switchToDestinations);
dirBtn.addEventListener("click", switchToDirections);

calculateBtn.addEventListener("click", calculateTrip);
//calculateBtn.addEventListener("click", getRoute);

clearBtn.addEventListener("click", clearTrip);

function initMap(){
    map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: currentLocationLatitude, 
            lng: currentLocationLongitude
        },
        zoom: 1,
        mapTypeControlOptions: {
            mapTypeIds: [],
        },
        fullscreenControl: false,
        styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ]
    });
    setGeocoder();
    getCurrentLocation();
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setOptions({
        suppressMarkers: true,
        polylineOptions: {
            strokeWeight: 5,
            strokeOpacity: 0.8,
            strokeColor:  '#3BB28D' 
        },
    })
    directionsDisplay.setMap(map);
}

function resetMap(){
    deleteMarkers(markers);
    updateMap(currentLocationLatitude, currentLocationLongitude, map);
}

function getCurrentLocation(){
    if("geolocation" in navigator){
        navigator.geolocation.getCurrentPosition(function(position){
            currentLocationLatitude = position.coords.latitude;
            currentLocationLongitude = position.coords.longitude;
            updateMap(currentLocationLatitude, currentLocationLongitude, map);
            addMarker(markers, map, currentLocationLongitude, currentLocationLatitude);
            addMarker(added_places_markers, map, currentLocationLongitude, currentLocationLatitude);

            // Convert coordinates to a location
            loc_p.innerHTML = "Gathering location...";
            req = new XMLHttpRequest();
            url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+currentLocationLatitude+","+currentLocationLongitude+"&key=AIzaSyAVmJ3EWDCAA1Go7BMxBUjcAPH3-9H1Uno";

            // Create the request
            // req.open Syntax: (GET/POST, url, ASYNC or not)
            req.open("GET", url, true);
            req.onload = function(){
                if(req.status == 200){
                    locJSON = JSON.parse(req.response);
                    for(i = 0; i<locJSON.results.length; i++){
                        loc_p.innerHTML = locJSON.results[0].formatted_address;
                    }
                } else{
                    console.log("ERROR: Request not complete");
                }
            }; //onload end
            req.send();
        }); // getCurrentPosition end
    } else {
        console.log("ERROR: Cannot get location");
    }
}


function updateMap(latitude, longitude, resultMap){
    if(latitude == 0 && longitude == 0){
        resultMap.setZoom(1);
    } else {
        resultMap.setCenter({
            lat: latitude,
            lng: longitude
        });
        resultMap.setZoom(18);
    }
}

function addMarker(markerArray, resultMap, long, lat){
    var marker = new google.maps.Marker({
        position: {
            lat: lat,
            lng: long
        },
        map: resultMap,
    });
    markerArray.push(marker);

    let bounds = new google.maps.LatLngBounds();
    for(var i = 0; i<markerArray.length; i++){
        bounds.extend(markerArray[i].getPosition());
    }

    if (markerArray.length == 1){
        resultMap.setZoom(17);
    } else {
        resultMap.fitBounds(bounds);
    }
}

function addCustomMarker(ogIndex, markerArray, resultMap, long, lat){
    var marker = new google.maps.Marker({
        position: {
            lat: lat,
            lng: long
        },
        icon: {                             
            url: "destinationPic.png",
            scaledSize: new google.maps.Size(30, 30)                          
        },
        map: resultMap,
    });
    markerArray.push(marker);
}


function clearList(list){
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
}

function setGeocoder(){
    var searchBox = new google.maps.places.SearchBox(searchQuery);    

    map.addListener("bounds_changed", function(){
        searchBox.setBounds(map.getBounds());
    });
    
    searchBox.addListener("places_changed", function(){
        clearList(resultList);
        deleteMarkers(markers);
        places_results.length = 0;

        for(var i = 0; i<(searchBox.getPlaces().length); i++){
            let openHours = searchBox.getPlaces()[i].opening_hours;
            let openText = "";

            // Check if the store is open or closed 
            if(typeof openHours != "undefined") {
                let open = searchBox.getPlaces()[i].opening_hours.open_now;
                if(open == true) {
                    openText = "Open";
                } else {
                    openText = "Closed";
                }
            } else if(typeof openHours == "undefined"){
                openText = "N/a";
            }

            let name = searchBox.getPlaces()[i].name;
            let rating = searchBox.getPlaces()[i].rating;
            let userRating = searchBox.getPlaces()[i].user_ratings_total;
            let address = searchBox.getPlaces()[i].formatted_address.split(", USA")[0];
            let lat = searchBox.getPlaces()[i].geometry.location.lat();
            let long = searchBox.getPlaces()[i].geometry.location.lng()

            // Places_results is an array that holds the places given the search query
            places_results.push(searchBox.getPlaces()[i]);
            addMarker(markers, map, long, lat);

            // Add to the container that holds the results
            resultList.innerHTML += 
            "<div class='resultContainer'>"+
                "<p class='resultLabel' id='storeName'>"+name+"</p>"+
                "<p class='resultLabel' id='storeRating'>Rating: "+rating+" <span id='userRating'> ("+userRating+")</span></p>"+
                "<p class='resultLabel' id='storeAddress'>"+openText+" | "+address+"</p>"+
                "<button class='addBtn' id='"+i+"'> Add to trip </button>"+
                "<button class='directionBtn' id='"+i+"'> Directions </button>"+
            "</div>";
        } // for end

        // Add event listeners to the add buttons
        let addBtn = document.getElementsByClassName("addBtn");
        addEvent(addBtn, addToList);

        let directionBtn = document.getElementsByClassName("directionBtn");
        addEvent(directionBtn, getDirectionsFromSinglePlace);

    }); // addListener end
} // setGeocoder end

function addEvent(btn, event){
    for(var i=0; i<btn.length; i++){
        btn[i].addEventListener("click", event);
    }
}

function removeText(){
    searchQuery.value = "";
}
function removeResults(){
    if(searchQuery.value == ""){
        clearText.style.visibility = "hidden";
        clearList(resultList);
        deleteMarkers(markers);
    } else{
        clearText.style.visibility = "visible";
    } 
}

function deleteMarkers(markersArray){
    clearMarkers(markersArray);
    markersArray.length = 0;

    let marker = new google.maps.Marker({
        position: {
            lat: currentLocationLatitude,
            lng: currentLocationLongitude
        },
        icon: {                             
            url: "myLocation.png",
            scaledSize: new google.maps.Size(50, 50)                          
        },
        map: map
    });
    markersArray[0] = marker;
}
function clearMarkers(markersArray){
    setMapOnAll(null, markersArray);
}
function setMapOnAll(map, markersArray){
    for(var i=0; i<markersArray.length; i++){
        markersArray[i].setMap(map);
    }
}

function isExpanded(){
    if(places_div.classList.contains("openFull")){
        places_div.classList.add("itemAddedAnimation");
        setTimeout(function(){
            places_div.classList.remove("itemAddedAnimation");
        }, 500);
    } else {
        places_div.classList.add("addItemAnimation");
        setTimeout(function(){
            places_div.classList.remove("addItemAnimation");
        }, 500);
    }
}

function addToList(){
    let destText = document.getElementById("destText");
    isExpanded();
    let originalMarkerIndex = this.id;
    added_places.push(places_results[this.id]);
    destBtn.innerHTML = "Destinations ("+added_places.length+")";

    document.getElementById(this.id).classList.remove("addBtn");
    document.getElementById(this.id).classList.add("added");
    document.getElementById(this.id).innerHTML = "Added!";
    document.getElementById(this.id).removeEventListener("click", addToList);

    let openHours = added_places[added_place_index].opening_hours;
    let openText = "";
    let name = added_places[added_place_index].name;
    let rating = added_places[added_place_index].rating;
    let userRating = added_places[added_place_index].user_ratings_total;
    let address = added_places[added_place_index].formatted_address.split(", USA")[0];
    let icon = added_places[added_place_index].icon;

    let placeLat = added_places[added_place_index].geometry.location.lat();
    let placeLong = added_places[added_place_index].geometry.location.lng();

    addCustomMarker(originalMarkerIndex,added_places_markers,map,placeLong,placeLat);

    // Check if the store is open or closed 
    if(typeof openHours != "undefined"){
        let open = added_places[added_place_index].opening_hours.open_now;
        if(open == true){
            openText = "Open";
        } else{
            openText =  "Closed";
            }
        } else {
            openText = "N/a";
        }

    destText.innerHTML += 
    "<div class='resultContainer'>"+
        "<img src='"+icon+"' id='icon'></img>"+
        "<p class='placesLabel' id='storeName_places'>"+name+"</p>"+
        "<p class='placesLabel' id='storeRating_places'>Rating: "+rating+" <span id='userRating_places'> ("+userRating+")</span></p>"+
        "<p class='placesLabel' id='storeAddress_places'>"+openText+" | "+address+"</p>"+
    "</div>";

    added_place_index++;   
}

function expand(){
    let addBtn = document.getElementById("expand");
    places_div.classList.toggle("openSemi");
    places_div.classList.toggle("openFull");
    
    if(places_div.classList.contains("openFull")){
        addBtn.innerHTML = "←";
    } else {
        addBtn.innerHTML = "→";
    }
}

function expandSearch(){
    let addBtn = document.getElementById("expandSearch");
    result_div.classList.toggle("open");
    places_div.classList.toggle("openSemi");
    
    if(result_div.classList.contains("open")){
        addBtn.innerHTML = "←";
    } else {
        addBtn.innerHTML = "→";
    }
}


function clearTrip(){
    console.log("Cleared");
    let destText = document.getElementById("destText");
    clearList(destText);
    deleteMarkers(added_places_markers);
    added_places = [];
    destBtn.innerHTML = "Destinations ("+added_places.length+")";
}

function getDirectionsFromSinglePlace(){
    let locationLat = places_results[this.id].geometry.location.lat();
    let locationLong = places_results[this.id].geometry.location.lng();
    // calculateTrip(locationLat, locationLong);
}

function calculateTrip(){
    let distanceRequest = new google.maps.DistanceMatrixService();
    let destinationLat = added_places[added_places.length-1].geometry.location.lat();
    let destinationLng = added_places[added_places.length-1].geometry.location.lng();
    // distanceRequest.getDistanceMatrix(
    //     {
    //       origins: [{
    //           lat: currentLocationLatitude,
    //           lng: currentLocationLongitude
    //       }],
    //       destinations: [{
    //           lat: destinationLat,
    //           lng: destinationLng
    //       }],
    //       travelMode: 'DRIVING',
    //       unitSystem: google.maps.UnitSystem.IMPERIAL
    //     //   transitOptions: TransitOptions,
    //     //   drivingOptions: DrivingOptions,
    //     //   avoidHighways: Boolean,
    //     //   avoidTolls: Boolean,
    //     }, getDistance);
    getRoute(destinationLat, destinationLng); 
}

function getDistance(response, status){
    if(status == "OK"){
        let distanceLablel = document.getElementById("distanceNumber");
        let timeLabel = document.getElementById("timeNumber");
        let timeInfoContainer = document.getElementById("tripInfo");

        timeInfoContainer.style.visibility = "visible";
        timeLabel.innerHTML = response.rows[0].elements[0].duration.text
        distanceLablel.innerHTML = response.rows[0].elements[0].distance.text;
        console.log(response);
    }
}

function getRoute(destinationLatitude, destinationLongitude){
    var waypts = [];
    waypts = getWaypoints(waypts);
    console.log(waypts);
    
    let directionRequest = {
        origin: {
            lat: currentLocationLatitude,
            lng: currentLocationLongitude
        },
        destination: {
            lat: destinationLatitude,
            lng: destinationLongitude
        },
        travelMode: 'DRIVING',
        waypoints: waypts,
        optimizeWaypoints: true
      };
      directionsService.route(directionRequest, function(response, status){
        if(status == "OK"){
            directionsDisplay.setDirections(response);
        }
    });
}

function getWaypoints(a){
    for(var j = 0; j < added_places.length; j++){
        a.push({
            location: added_places[j].formatted_address,
            stopover: true
        });   
    }
    return a;
}

function switchToDestinations(){
    places_div.style.display = "block";
    result_div.style.display = "none";
    direction_div.style.display = "none";

    // destBtn.classList.toggle("notSelected");
    // destBtn.classList.toggle("selected");

    // searchBtn.classList.toggle("selected");
    // searchBtn.classList.toggle("notSelected");

    mainContainer.style.gridTemplateAreas = '"search search search search" ". . . ." ". . . navigation" "map map map places"';
}

function switchToSearch(){
    result_div.style.display = "block";
    places_div.style.display = "none";
    direction_div.style.display = "none";

    mainContainer.style.gridTemplateAreas = '"search search search search" ". . . ." ". . . navigation" "map map map results"';
}

function switchToDirections(){
    direction_div.style.display = "block";
    result_div.style.display = "none";
    places_div.style.display = "none";

    mainContainer.style.gridTemplateAreas = '"search search search search" ". . . ." ". . . navigation" "map map map directions"';
}
