var map, pickupMarker, dropoffMarker;

function initMap() {
    var chicago = { lat: 41.8781, lng: -87.6298 };
    map = new google.maps.Map(document.getElementById('map'), {
        center: chicago,
        zoom: 12
    });

    var inputPickup = document.getElementById('pickup-location');
    var autocompletePickup = new google.maps.places.Autocomplete(inputPickup);
    autocompletePickup.setBounds(new google.maps.LatLngBounds(
        new google.maps.LatLng(41.65, -87.95),
        new google.maps.LatLng(42.05, -87.50)
    ));
    autocompletePickup.addListener('place_changed', function () {
        var place = autocompletePickup.getPlace();
        if (!place.geometry) {
            return;
        }
        if (pickupMarker) {
            pickupMarker.setMap(null);
        }
        pickupMarker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        });
    });

    var inputDropoff = document.getElementById('dropoff-location');
    var autocompleteDropoff = new google.maps.places.Autocomplete(inputDropoff);
    autocompleteDropoff.setBounds(new google.maps.LatLngBounds(
        new google.maps.LatLng(41.65, -87.95),
        new google.maps.LatLng(42.05, -87.50)
    ));
    autocompleteDropoff.addListener('place_changed', function () {
        var place = autocompleteDropoff.getPlace();
        if (!place.geometry) {
            return;
        }
        if (dropoffMarker) {
            dropoffMarker.setMap(null);
        }
        dropoffMarker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });
    });
}

function calculateFare() {
    var pickupLat = pickupMarker.getPosition().lat();
    var pickupLng = pickupMarker.getPosition().lng();
    var dropoffLat = dropoffMarker.getPosition().lat();
    var dropoffLng = dropoffMarker.getPosition().lng();
    var company = $('#company').val();
    var paymentType = $('#payment-type').val();

    $.ajax({
        url: '/predict',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            pickup_lat: pickupLat,
            pickup_lon: pickupLng,
            dropoff_lat: dropoffLat,
            dropoff_lon: dropoffLng,
            company: company,
            payment_type: paymentType
        }),
        success: function(response) {
            $('#fare').text(response.fare);
            $('#travel-time').text(response.travel_time);
        },
        error: function(error) {
            console.error(error);
        }
    });
}

$(document).ready(function () {
    $('#predict-button').addClass('active');
});
