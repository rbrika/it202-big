var lat;
var long;
function initMap(){
    var chicago = {lat: 41.8781, lng: -87.6298};
    var map = new google.maps.Map(document.getElementById('map1'), {zoom: 12, center: chicago}); 
};
var yelpKey='8HMrAIZ_bA1azrlWFUB1J8WJ8z0EQEmro0Z3FZzsCyvzppZhxp8-px6_5XvK4Ttu05QOk0IxXEs8xlijmF7CV0CoGWbxAzJJ3jXIqcC9-fZHOyQzVl0hYr0cazG1XHYx';
$("#map1").css("display",  "none");
$("#list").css("display",  "none");
$("#movies").css("display", "none");
$("#about").css("display", "none");
$("#showtimes").css("display", "none");
$("#favorites").css("display","none"); 
$(document).ready(function () { 
    var db = new Dexie("yelp_database");
    db.version(1).stores({
        yelp: '++id,name,address,city,state,zipcode,phone,rating,reviewcount,image,lat,long,reviewCount,price',
        movie:'++id,title,releaseDate,shortDescription,uriImage',
        showtime:'++id,title,theatre,dateTime',
        theatres:'theatre'
    });
    var searchButton=mdc.ripple.MDCRipple.attachTo(document.querySelector('.mdc-button'));
    window.mdc.autoInit();            
    const topAppBar = document.getElementById('app-bar').MDCTopAppBar;
    const drawer= document.getElementById('drawer').MDCDrawer;
    topAppBar.setScrollTarget(document.getElementById('main-content'));
    topAppBar.listen('MDCTopAppBar:nav', () => {
        drawer.open = !drawer.open;
    });
    $('#searchTab').click(function() {
        console.log("search Clicked");
        $("#map1").empty();
        hideScreens();
        $("#search").css("display", "block");
    });
    $('#foodTab').click(function() {
        console.log("food Clicked");
        hideScreens();
        $("#list").css("display", "block");
    });
    $('#movieTab').click(function() {
        console.log("movie Clicked");
        hideScreens();
        $("#movies").css("display", "block");
    });
    $('#mapsTab').click(function() {
        console.log("map Clicked");
        hideScreens();
        $("#map1").css("display", "block");
    });
    $('#showTab').click(function() {
        console.log("favs Clicked");
        hideScreens();
        $("#showtimes").css("display", "block");
    });
    $('#favsTab').click(function(){
        hideScreens();
        $("#favorites").css("display","block"); 
    });
    $('#aboutTab').click(function() {
        console.log("favs Clicked");
        hideScreens();
        $("#about").css("display", "block");
    });
    $('#searchButton').click(function(){
        console.log("Searching"); 
        getLocation();
    });
    function addMarkers(){
        var chicago = {lat: 41.8781, lng: -87.6298};
        var map = new google.maps.Map(document.getElementById('map1'), {zoom: 12, center: chicago}); 
        db.yelp.each(function(v){
            console.log(v.id+" added marker");
            var infowindow = new google.maps.InfoWindow({
                content:
                '<div id="content">'+'<div id="siteNotice">'+
                '</div>'+'<h1 id="firstHeading" class="firstHeading">' 
                +v.name+'</h1>'+'<div id="bodyContent">'+
                '<b>Address: '+v.address+'<br>Completion Date:'+v.city+
                '</b><br><br><b>Where the Graffiti is located: '+v.state+
                '</b><br><br><b>What type of surface?: '+v.zipcode+'</b>'+
                '<br><br><b>Status: '+v.phone+'</b><br><br><b>Rating: '
                +v.rating+'</b>'+'</div>'+'</div>'
            });
            var iconColor="restaurant.png"
            var location = {lat: v.lat, lng: v.long};
            var marker = new google.maps.Marker({
                position: location, 
                map: map,
                icon: "blue-dot.png"
            });
            marker.set("id",v.id);
            marker.addListener('click', function() {
                var idM=marker.get("id");
                console.log("clicked on marker "+idM);
                infowindow.open(map, marker);
            });
        });
        var id=0;
        db.theatres.each(function(v){
            console.log(id+" Movie added marker");
            var infowindow = new google.maps.InfoWindow({
                content:
                '<div id="content">'+'<div id="siteNotice">'+
                '</div>'+'<h1 id="firstHeading" class="firstHeading">' 
                +v.theatre+'</h1>'+'</div>'
            });
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                'address': v.theatre
            }, function(results, status) {
                if(status == google.maps.GeocoderStatus.OK) {
                    var marker=new google.maps.Marker({
                        position: results[0].geometry.location,
                        map: map
                    });
                    marker.set("id",id);
                    marker.addListener('click', function() {
                        var idM=marker.get("id");
                        console.log("clicked on marker "+idM);
                        infowindow.open(map, marker);
                    });
                }
                else{
                    console.log("Cant add marker for "+v.theatre);
                }
            });
            id++;
        });
    }
    function myFunction(msg) {
        var x = document.getElementById("snackbar");
        x.className = "show";
        x.textContent=msg;
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000);
    }
    function loadCards(){
        db.yelp.each(function(v){
            console.log(v.name);
            var clone = $(".listTemp").clone();
            clone.find(".demo-card__media").css("background-image","url('"+v.image+"')");
            clone.find(".mdc-typography--headline6").text(v.name);
            clone.find(".mdc-typography--subtitle2").text(v.address+","+v.city+","+v.state+","+v.zipcode);
            clone.find(".mdc-typography--body2").text(v.phone+"   "+v.rating);
            clone.attr("data-id",v.id);
            clone.attr("id","FCard");
            clone.removeClass("listTemp");
            $("#cardsList").append(clone);
        }).then(() => {
            myFunction("All Restaurants loaded");   
        });
    }
    $("body").on("click","#favoriteButton",function(){
        var clone = $(this).closest(".demo-card").clone();
        $("#userFavs").append(clone);
    });
    function loadMovieCards(){
        db.movie.each(function(v){
            var clone = $(".movieTemp").clone();
            var str = v.title;
            var replaced = str.split(' ').join('+');
            var year = v.releaseDate.substr(0, 4);
            var url="https://api.themoviedb.org/3/search/movie?api_key=642b28a1e9be5b14f4a4394716c62c97&language=en-US&query="+replaced+"&page=1&include_adult=false&year="+year;
            var settings = {
                "async": true,
                "crossDomain": true,
                "url": url,
                "method": "GET",
                "headers": {},
                "data": "{}"
            }
            var image=new Image();
            $.ajax(settings).done(function (response) {
                if(response.results[0]==null){
                    var imgeURL="https://static.thenounproject.com/png/192321-200.png";
                    image.src=imgeURL;
                    clone.find(".demo-card__media").css("background-image","url('"+imgeURL+"')");
                }
                else{
                    var imgeURL="https://image.tmdb.org/t/p/w185"+response.results[0].poster_path;
                    image.src=imgeURL;
                    clone.find(".demo-card__media").css("background-image","url('"+imgeURL+"')");
                }
                
                clone.find(".demo-card__media").css("height","278px");
                clone.find(".demo-card__media").css("width","185px");
            });
            clone.find(".mdc-typography--headline6").text(v.title);
            clone.find(".mdc-typography--subtitle2").text("Date Released: "+v.releaseDate);
            clone.find(".mdc-typography--body2").text(v.longDescription);
            clone.attr("data-id",v.id);
            clone.attr("id","MCard");
            clone.removeClass("movieTemp");
            $("#movieList").append(clone);
        }).then(() => {
            myFunction("All Movies loaded");
        });
    }
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        }else { 
            myFunction("Geolocation is not supported by this browser."); 
        }
    }
    function makeAjax(){
        db.yelp.clear();
        db.movie.clear();
        db.showtime.clear();
        db.theatres.clear();
        $("#cardsList").empty();
        $("#movieList").empty();
        $("#showTimeForMovie").empty();
        var myurl = "https://cors-anywhere.herokuapp.com/"+
            "https://api.yelp.com/v3/businesses/search?latitude="+lat+"&longitude="+long;
        $.ajax({
            url: myurl,
            headers: {
                'Authorization':'Bearer '+yelpKey,
            },
            method: 'GET',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: function(data){
                // Grab the results from the API JSON return
                var totalresults = data.businesses.length;
                // If our results are greater than 0, continue
                if (totalresults > 0){
                    // Display a header on the page with the number of results
                    // Itirate through the JSON array of 'businesses' which was returned by the API
                    $.each(data.businesses, function(i, item) {
                        // Store each business's object in a variable
                        // console.log(item.name);
                        db.yelp.put({
                            name:item.name,
                            address:item.location.address1,
                            city:item.location.city,
                            state:item.location.state,
                            zipcode:item.location.zip_code,
                            phone:item.display_phone,
                            rating:item.rating,
                            reviewcount:item.review_count,
                            image:item.image_url,
                            lat:item.coordinates.latitude,
                            long:item.coordinates.longitude,
                            reviewCount:item.review_count,
                            price:item.price
                        });
                    });
                    loadCards();
                    addMarkers();
                } else {
                }
            }
        }); 
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = yyyy + '-' + mm + '-' + dd;
        var url2='https://data.tmsapi.com/v1.1/movies/showings?'
        +'startDate='+today+'&lat='+lat+'&lng='+long+'&api_key=jy4njh7ntqmafe5ybp6fja4t';
        $.ajax({
            url: url2,
            method: 'GET',
            dataType: 'json',
            success: function(data){
                //Grab the results from the API JSON return
                var totalresults = data.length;
                // If our results are greater than 0, continue
                if (totalresults > 0){
                    // Display a header on the page with the number of results
                    $('#header').append('<h5>We discovered ' + totalresults + ' results!</h5>');
                    // Itirate through the JSON array of 'businesses' which was returned by the API
                    $.each(data, function(i, item) {
                        //console.log(item);
                        // Store each business's object in a variable
                        db.movie.put({
                             title:item.title,
                             releaseDate:item.releaseDate,
                             longDescription:item.shortDescription,
                             uriImage:item.preferredImage.uri
                         });
                        $.each(item.showtimes,function(i,v){
                            db.showtime.put({
                                name:item.title,
                                theatre:v.theatre.name,
                                dateTime:v.dateTime
                            });
                            db.theatres.put({theatre:v.theatre.name});
                        });
                    });
                    loadMovieCards();
                    addMarkers();
                } else {
                }
            }
        });
    }
    function showPosition(position) {
        lat=position.coords.latitude;
        long=position.coords.longitude;
        
        $("#location").text(lat+"  "+long);
        console.log("Latitude: " + position.coords.latitude + 
              "<br>Longitude: " + position.coords.longitude);
        makeAjax();
        console.log("MADE AJAX CALLS");
    }
    function hideScreens() {
        console.log("Hiding Screens");
        $("#search").css("display","none");
        $("#list").css("display","none");
        $("#header").css("display","none");
        $("#about").css("display","none");
        $("#movies").css("display","none");
        $("#showtimes").css("display","none");
        $("#map1").css("display",  "none");
        $("#favorites").css("display","none");
    }
    function movieExpand(id){
        $("#showTimeForMovie").empty();
        console.log(id);
        db.movie.get(parseInt(id)).then (function (movie) {
            console.log ("Friend with id "+id+": " + movie.title);
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
            today =  mm + '-' + dd + '-' + yyyy ;
            $("#headerShowtime").text("SHOWTIMES FOR "+movie.title +" ON "+today);
            db.showtime.each(function(v){
                if(v.name==movie.title){
                    var clone = $(".showtime-Temp").clone();
                    clone.find(".mdc-typography--headline6").text(v.theatre);
                    clone.find(".mdc-typography--subtitle2").text(v.dateTime);
                    clone.find(".mdc-typography--body2").text(v.phone+"   "+v.rating);
                    clone.attr("data-id",v.id);
                    clone.attr("id","SCard");
                    clone.removeClass("showtime-Temp");
                    $("#showTimeForMovie").append(clone);
                }
            });
        }).then(() => {
            myFunction("Movie Showtime Loaded");
        });
    }
    $("body").on("click","#MCard",function(){
        movieExpand($(this).attr("data-id"));
    });
});