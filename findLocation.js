/*

# Geocoding API Key: AIzaSyAVmJ3EWDCAA1Go7BMxBUjcAPH3-9H1Uno

! = Easy
!! = Moderate
!!! = Difficult/Have to research
    
TO DO 
- Find distance between two locations [!!]
- Find the shortest route between all inputted locations [!!!]
- Remove destinations individually
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

var directionsService = "";
var directionsDisplay = "";


/* ===== Initialize map =====
* Creates the map object and calls the setGeocoder() and getCurrentLocation() functions
*/
function initMap(){
    map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: 0, 
            lng: 0
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
    directionsDisplay.setMap(map);
}

/* ===== Reset Map =====
* Resets the maps' markers and centers the map to the current location
*/
document.getElementById("locationLabel").addEventListener("click", resetMap);

function resetMap(){
    deleteMarkers(markers);
    updateMap(currentLocationLatitude, currentLocationLongitude, map);
}

/* ===== Get current location =====
* Gets the current location of the user and upates the map
* Passes through the retrieved data to the updateMap() function which calls the addMarker() function
*/
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

/* ===== Update map =====
* Centers the map to the passed latitude and longitude
* Proceeds to add a marker based off of the latitude and longitude parameters
*/
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

/* ===== Add marker =====
* Adds a marker to the map passed through the function
* A marker object is pushed to the array passed through the function
* Fits the maps' bounds to fit all of the markers
* Arrays: 
    - Markers from search result 
*/
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
        resultMap.setZoom(18);
    } else {
        resultMap.fitBounds(bounds);
    }
}

/* ===== Add custom marker ===== NOT DONE
* Adds a custom marker to the map passed through the function
* The marker represents a location that the user wants to visit
* The marker object is pushed to another array containing the rest of the user's destination spots
*/
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

/* ===== Clear list =====
* Clears the list that is passed through the function; Userful for having a "refresh" effect
*/
function clearList(list){
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
}

/* ===== Initiate SearchBox Library =====
* Uses Google's SearchBox library to have an autocomplete or suggestions feature given a user's search query
* - Checks to see if the store is open
* - Retrieves the 10 closest locations based off of the search query
*/
function setGeocoder(){
    var searchBox = new google.maps.places.SearchBox(searchQuery);    

    map.addListener("bounds_changed", function(){
        searchBox.setBounds(map.getBounds());
    });
    
    searchBox.addListener("places_changed", function(){
        clearList(resultList);
        deleteMarkers(markers);
        places_results.length = 0;

        for(var i = 0; i<10; i++){
            let openHours = searchBox.getPlaces()[i].opening_hours;
            let openText = "";

            // Check if the store is open or closed 
            if(typeof openHours != "undefined"){
                let open = searchBox.getPlaces()[i].opening_hours.open_now;
                if(open == true){
                    openText = "Open";
                } else{
                    openText = "Closed";
                }
            } else {
                openText = "N/a";
            }

            let name = searchBox.getPlaces()[i].name;
            let rating = searchBox.getPlaces()[i].rating;
            let userRating = searchBox.getPlaces()[i].user_ratings_total;
            let address = searchBox.getPlaces()[i].formatted_address.split(", USA")[0];
            let icon = searchBox.getPlaces()[i].icon;
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

// ===== Clear the search results when nothing is typed =====
searchQuery.addEventListener("keyup", removeResults);

// ===== Clear the textbox with a click of a button =====
clearText.addEventListener("click", removeText);
clearText.addEventListener("click", removeResults);

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

/* ===== Process to remove markers =====
* Removes marker references from the map by setting each marker's map to null
* Clears the markers array 
* Creates a new marker just for the current location to indicate where the user is
*/
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

// Checks to see if the added_places element is expanded; different animation if the element is already expanded and a user adds a place
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

// ===== Add to list of destinations =====
function addToList(){
    let destText = document.getElementById("destText");
    isExpanded();
    let originalMarkerIndex = this.id;
    added_places.push(places_results[this.id]);

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

/* ===== Expand =====
* CSS adjustment to expand/close the places_div element
*/
document.getElementById("expand").addEventListener("click", expand);

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

document.getElementById("expandSearch").addEventListener("click", expandSearch);

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

/* ===== Clear list of destination =====
* Clears the map and the destinations container
*/
document.getElementById("clearList").addEventListener("click", clearTrip);

function clearTrip(){
    let destText = document.getElementById("destText");
    clearList(destText);
    deleteMarkers(added_places_markers);
}

/* === Calculate Trip ===
* Calculates trip between locations
* Finds the best distance between all of the places
*/
document.getElementById("calc").addEventListener("click", calculateTrip);
document.getElementById("calc").addEventListener("click", getRoute);

function getDirectionsFromSinglePlace(){
    let locationLat = places_results[this.id].geometry.location.lat();
    let locationLong = places_results[this.id].geometry.location.lng();
    calculateTrip(locationLat, locationLong);
    getRoute(locationLat, locationLong);
}

function calculateTrip(destinationLatitude, destinationLongitude){
    let distanceRequest = new google.maps.DistanceMatrixService();
    distanceRequest.getDistanceMatrix(
        {
          origins: [{
              lat: currentLocationLatitude,
              lng: currentLocationLongitude
          }],
          destinations: [{
              lat: destinationLatitude,
              lng: destinationLongitude
          }],
          travelMode: 'DRIVING',
          unitSystem: google.maps.UnitSystem.IMPERIAL
        //   transitOptions: TransitOptions,
        //   drivingOptions: DrivingOptions,
        //   avoidHighways: Boolean,
        //   avoidTolls: Boolean,
        }, getDistance);
}

function getDistance(response, status){
    if(status == "OK"){
        console.log("Distance: "+response.rows[0].elements[0].distance.text);
        console.log("Duration: "+response.rows[0].elements[0].duration.text);
    }
}

function getRoute(destinationLatitude, destinationLongitude){
    // let destinationLatitude = added_places_markers[1].position.lat();
    // let destinationLongitude = added_places_markers[1].position.lng();
    let directionRequest = {
        origin: {
            lat: currentLocationLatitude,
            lng: currentLocationLongitude
        },
        destination: {
            lat: destinationLatitude,
            lng: destinationLongitude
        },
        travelMode: 'DRIVING'
      };
      directionsService.route(directionRequest, function(response, status){
        if(status == "OK"){
            directionsDisplay.setDirections(response);
        }
    });
}


