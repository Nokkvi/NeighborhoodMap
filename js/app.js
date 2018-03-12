var listings = [
  {
    title: 'Bobby Fischer Center',
    location: {
      lat: 63.937436,
      lng: -20.996411
    }
  },
  {
    title: 'CrossFit Gym',
    location: {
      lat: 63.933787,
      lng: -21.011054
    }
  },
  {
    title: 'World Class',
    location: {
      lat: 63.934572,
      lng: -20.997046
    }
  },
  {
    title: 'Kaffi Krús',
    location: {
      lat: 63.937476,
      lng: -21.000595
    }
  },
  {
    title: 'Ölfusárbrú',
    location: {
      lat: 63.938839,
      lng: -21.004932
    }
  },
  {
    title: 'Selfossvöllur',
    location: {
      lat: 63.932979,
      lng: -20.992709
    }
  },
  {
    title: 'Svarfhólsvöllur',
    location: {
      lat: 63.948028,
      lng: -20.979610
    }
  },
];

var map;
var markers = [];
var listingsList = ko.observableArray([]);

//The model
var Listing = function(data) {
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
};

var ViewModel = function() {
  var self = this;
  var infowindow = new google.maps.InfoWindow();


  var defaultIcon = makeMarkerIcon('EE3333');
  //The icon displayed when marker is hovered over
  var highlightedIcon = makeMarkerIcon('FFFF00');

  this.listingsList = ko.observableArray(listingsList());

  //Filter variable
  this.filter = ko.observable();
  //Putting the listings into an observableArray item
  listings.forEach(function(listing) {
    self.listingsList.push( new Listing(listing));
  });

  //Map init
  this.map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 63.937347, lng:  -21.002303},
    zoom: 14
  });

  //Creation of the markers
  for(var i = 0; i<this.listingsList().length; i++) {
    var position = this.listingsList()[i].location();
    var title = this.listingsList()[i].title();

    var marker = new google.maps.Marker({
      map: this.map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i,
      icon: defaultIcon
    });

    markers.push(marker);
  }
  //Event listeners for markers
  markers.forEach(function(marker){
    marker.addListener('click', function() {
      popupInfoWindow(marker, infowindow);
    });

    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });

    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });

    marker.addListener('dblclick', function() {
      self.map.setCenter(this.position);
    });
  });
//Sets center to the location coords of the listing
  this.setCenter = function(listing) {
    self.map.setCenter(listing.location());
    self.map.setZoom(17);
  };

  this.filteredList = ko.computed(function() {
      var filter = self.filter();
			if(filter === ""|| filter === undefined) {
				return self.listingsList();
			} else {
				var tempList = self.listingsList().slice();

				return tempList.filter(function(listing) {
					return listing.title().indexOf(filter) !== -1;
				});
			}
		});
};

// -- Helper Functions --
function popupInfoWindow(marker, infowindow) {
  if(infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });

    var streetViewService = new google.maps.StreetViewService();
    var radius = 100;

    //Gets the panorama from StreetView
    var getStreetView = function(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
          infowindow.setContent('<div>' + marker.title + '</div><div class="pano" id="pano"></div>');
          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 30
            }
          };
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent('<div>' + marker.title + '</div>' +
          '<div>No Street View Found</div>');
      }
    };
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

    infowindow.open(map, marker);
  }
}

//Creates a marker with the input color
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(18, 30),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 30),
    new google.maps.Size(18,30));
  return markerImage;
}


//Called from the Html to initialize the app
function initMap() {
  $(function(){
    /*
    I wanted to use jquery for everything but I ran into a issue
    with asyncrounously calling the google maps api.
    I just recently realized that I could've used the ajax method.
    */

    //hamburger implementation
    $( ".cross" ).hide();
    $( ".side-panel" ).hide();
    $( ".hamburger" ).click(function() {
      $( ".hamburger" ).hide();
      $( ".cross" ).show();
      $( ".side-panel" ).slideToggle("slow");
    });

    $( ".cross" ).click(function() {
      $( ".cross" ).hide();
      $( ".hamburger" ).show();
      $( ".side-panel" ).slideToggle("slow");
    });

  });

  //Foursquare variables
  var url = 'https://api.foursquare.com/v2/venues/explore';
  var client_id = 'MY2SYNUFJQ23CY3DA3ZYQVNLWDXQPJ4E4DOEV2IL50EEZVDV';
  var client_secret = 'HO41NUJSWBWC531GIZEAAW4ID5WMODIHQ1CW0QSCRS3LZ3BH';
  var limit = 10;
  var lat = 63.937347;
  var lng = -21.002303;
  var fullFoursquareURL = url + '?client_id=' + client_id + '&client_secret=' + client_secret + '&ll=' + lat + ',' + lng + '&limit' + limit + '&v=20180224';
  //Using foursquare api to populate a list of locations
  $.getJSON(fullFoursquareURL)
    .done(function(data) {
    var FourSquareVenues = data.response.groups[0].items;
    var FourSquareVenuesLength = FourSquareVenues.length;

    FourSquareVenues.forEach(function(data) {
      var location = {lat : data.venue.location.lat, lng : data.venue.location.lng};
      var listing = {title : data.venue.name, location : location};
      listingsList.push(new Listing(listing));
    });
    //Initialization of the ViewModel
    ko.applyBindings(new ViewModel());
    $(function(){
      $( ".location-item" ).click(function() {
        $( ".cross" ).hide();
        $( ".hamburger" ).show();
        $( ".side-panel" ).slideToggle( "slow");
      });
    });
    }).fail(function(error) {
      // error loading API data
      alert("Failed to load page");
      console.log(error);
    });

  //This jquery needed to be ran after the initialization of the ViewModel
}
