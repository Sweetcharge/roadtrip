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

var latCoords;
var longCoords;

var places_results = [];
var markers = [];

var added_places = [];
var added_places_markers = []
var added_place_index = 0;

var loc_p = document.getElementById("location");
var resultList = document.getElementById("resultList");
var places_div = document.getElementById("places");
var searchQuery = document.getElementById("userPlace");
var clearText = document.getElementById("clearText");

function initMap(){
    map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: 0, 
            lng: 0
        },
        zoom: 1
    });
    setGeocoder();
    getCurrentLocation();
}

document.getElementById("locationLabel").addEventListener("click", resetMap);

function resetMap(){
    console.log(latCoords);
    console.log(longCoords);
    deleteMarkers(markers);
    updateMap(latCoords,longCoords,map);
    console.log(markers.length);
    console.log(added_places_markers.length);
}
function getCurrentLocation(){
    if("geolocation" in navigator){
        navigator.geolocation.getCurrentPosition(function(position){
            latCoords = position.coords.latitude;
            longCoords = position.coords.longitude;
            updateMap(latCoords, longCoords, map);

            // Convert coordinates to a location
            loc_p.innerHTML = "Gathering location...";
            req = new XMLHttpRequest();
            url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+latCoords+","+longCoords+"&key=AIzaSyAVmJ3EWDCAA1Go7BMxBUjcAPH3-9H1Uno";

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
            }; //onload e\nd
            req.send();
        }); // getCurrentPosition end
    } else {
        console.log("ERROR: Cannot get location");
    }
}

// ===== CLEAR LIST =====
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

            places_results.push(searchBox.getPlaces()[i]);
            addMarker(markers, map, long, lat);

            // Add to the container that holds the results
            resultList.innerHTML += 
            "<div class='resultContainer'>"+
                "<p class='resultLabel' id='storeName'>"+name+"</p>"+
                "<p class='resultLabel' id='storeRating'>Rating: "+rating+" <span id='userRating'> ("+userRating+")</span></p>"+
                "<p class='resultLabel' id='storeAddress'>"+openText+" | "+address+"</p>"+
                "<button class='addBtn' id='"+i+"'> Add to trip </button>"+
                // "<button class='dirBtn' > Directions from current location </button>"+
            "</div>";
        } // for end

        // Add event listeners to the add buttons
        let addBtn = document.getElementsByClassName("addBtn");
        addEvent(addBtn);

    }); // addListener end
} // setGeocoder end

function addEvent(btn){
    for(var i=0; i<btn.length; i++){
        btn[i].addEventListener("click", addToList);
    }
}

// Method to clear the result list when nothing is inputted in the text box
searchQuery.addEventListener("keyup", removeResults);

function removeResults(){
    if(searchQuery.value == ""){
        clearText.style.visibility = "hidden";
        clearList(resultList);
        clearMarkers(markers);
        deleteMarkers(markers);
    } else{
        clearText.style.visibility = "visible";
    } 
}

// ===== CLEAR TEXT BOX WITH ONE BUTTON =====
clearText.addEventListener("click", removeText);
clearText.addEventListener("click", removeResults);

function removeText(){
    searchQuery.value = "";
}

// ===== UPDATE MAP =====
function updateMap(latitude, longitude, resultMap){
    if(latitude == 0 && longitude == 0){
        resultMap.setZoom(1);
    } else {
        resultMap.setCenter({
            lat: latitude,
            lng: longitude
        });
        addMarker(markers, resultMap, longitude, latitude);
        map.setZoom(14);
    }
}

// ===== ADD MARKER =====
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
    resultMap.fitBounds(bounds);
}

// Sets the map on all marker elements
function setMapOnAll(map, markersArray){
    for(var i=0; i<markersArray.length; i++){
        markersArray[i].setMap(map);
    }
}

// Removes references to all the markers 
function clearMarkers(markersArray){
    setMapOnAll(null, markersArray);
}

// Removes markers from array
function deleteMarkers(markersArray){
    clearMarkers(markersArray);
    markersArray = [];

    let marker = new google.maps.Marker({
        position: {
            lat: latCoords,
            lng: longCoords
        },
        label: "My Location",
        map: map
    });

    markersArray[0] = marker;
}

function isExpanded(){
    if(places_div.classList.contains("open")){
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

// ===== ADD TO LIST OF DESTINATIONS =====
function addToList(){
    let destText = document.getElementById("destText");
    isExpanded();
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

    addMarker(added_places_markers,map,placeLong,placeLat);

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

// ===== EXPAND DESTINATIONS CONTAINER =====
document.getElementById("expand").addEventListener("click", expand);

function expand(){
    let addBtn = document.getElementById("expand");
    places_div.classList.toggle("open");
    
    if(places_div.classList.contains("open")){
        addBtn.innerHTML = "<";
    } else {
        addBtn.innerHTML = ">";
    }
}
 
// ===== CLEAR LIST =====
document.getElementById("clearList").addEventListener("click", clear);

function clear(){
    deleteMarkers(added_places_markers);
    deleteMarkers(markers);
    let destText = document.getElementById("destText");
    added_places.length = 0;
    destText.innerHTML = added_places;
    added_place_index = 0;
}


