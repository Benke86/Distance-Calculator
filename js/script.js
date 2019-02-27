var start_location_data = [];

$(document).ready(function () {
    getContinents();
    getCountries();
    getStreetTypes();
    startLocation();

    $('#continent_manual_fill').change(function () {
        if ($(this).is(':checked')) {
            $('#continent_holder').html('<input type="text">');
            $('#country_holder').html('<input type="text">');
            $('#country_manual_fill').prop('checked', true);
            $('#country_manual_fill').prop('disabled', true);
        }
        else {
            $('#country_manual_fill').prop('disabled', false);
            getContinents();
        }
    });

    $('#country_manual_fill').change(function () {
        if ($(this).is(':checked')) {
            $('#country_holder').html('<input type="text">');
        }
        else {
            getCountries();
        }
    });

    $('#continent_holder').change('#continent_options', function () {
        if ($(this).children('input').length == 0) {
            getCountries();
        }
    });

    $('#submit_request').click(function () {
        var submitted_values = [];
        $('table tbody tr td:nth-child(2)').each(function () {
            var row_name = $(this).parent().attr('id');
            if ($(this).children('div').children('select').length > 0) {
                submitted_values[row_name] = $.trim($(this).children('div').children('select').val());
            }
            else if ($(this).children('div').children('input:text').length > 0) {
                submitted_values[row_name] = $.trim($(this).children('div').children('input').val());
            }
            else if ($(this).children('input:text').length > 0) {
                submitted_values[row_name] = $.trim($(this).children('input').val());
            }
        });
        var validation_result = validate(submitted_values);
        if (validation_result == 1) {
            getLocation(submitted_values);
        }
    });
});



function getContinents (){
    var continents_options;
    $.getJSON('locations/continents.json', function (data) {
        $.each(data, function (key, val) {
            continents_options += '<option value="' + val + '">' + val + '</option>';
        });
        $('#continent_holder').html('<select id="continent_options">' + continents_options + '</select>');
    });
}

function getCountries (){
    var countries_options;
    if ($('#country_manual_fill').is(':checked')) {
        $('#country_manual_fill').prop('checked', false);
    }
    $.getJSON('locations/countries.json', function (data) {
        $.each(data, function (key, val) {
            if (key == $('#continent_options').val()) {
                $.each(val, function (prefix, country) {
                    countries_options += '<option value="' + country + '">' + country + '</option>';
                });
            }
        });
        $('#country_holder').html('<select id="country_options">' + countries_options + '</select>');
    });
}

function getStreetTypes(){
    var street_types;
    $.getJSON('locations/street_types.json', function (data) {
        $.each(data, function (key, val) {
            street_types += '<option value="' + key + '">' + val + '</option>';
        });
        $('#street_type_holder').html('<select id="street_type_options">' + street_types + '</select>');
    });
}

function validate (passed_array){
    var letters_only_regex = /^[a-zA-Zóőúéáűßä][a-zA-Zóőúéáűßä\s]*$/;
    var house_number_regex = new RegExp("^\\d+/?\\d*[a-zA-Z]?(?<!/)$");
    var err_txt = '';
    var err_marker = '';
    var final_result = 1;

    for(var key in passed_array) {
        if(passed_array[key] == '' || passed_array[key] == '-'){
            err_txt = 'No value provided.';
            err_marker = 'red';
            final_result = 0;
        }
        else if(key == 'continent' || key == 'country' || key == 'city' || key == 'street'){
            if (letters_only_regex.test(passed_array[key]) == false) {
                err_txt = 'Illegal character(s).';
                err_marker = 'red';
                final_result = 0;
            }
            else{
                err_txt = '';
                err_marker = 'green';
            }
        }        
        else if(key == 'house'){
            if (house_number_regex.test(passed_array[key]) == false) {
                err_txt = 'Illegal format.';
                err_marker = 'red';
                final_result = 0;
            }
            else{
                err_txt = '';
                err_marker = 'green';
            }
        }
        else{
            err_txt = '';
            err_marker = 'green';
        }        
        $('#' + key + ' td:nth-child(2)').css('border', '1px solid ' + err_marker);
        $('#' + key + '_err').html(err_txt);
    }

    return final_result;
}

function getLocation(validated_values){
    var buffer = [];
    var search_lat;
    var search_lng;
    var address_queried;
    var api_key = 'YOUR_API_KEY';
    var result = '';

    for(var key in validated_values) {
        buffer = validated_values[key].split(' ');
        validated_values[key] = buffer.join('+');
    }

    var address = validated_values['city'] + ',+' + validated_values['street'] + '+' + validated_values['type'] + '+' + validated_values['house'] + ',+' + validated_values['postal'] + ',+' + validated_values['country'] + ',+' + validated_values['continent'];

    var query_url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + api_key;

    $.getJSON({
        url: query_url,
        success: function (data) {
            $.each(data.results, function (key, val) {
                search_lat = val.geometry.location.lat;
                search_long = val.geometry.location.lng;
                address_queried = val.formatted_address
                var result_src = 'https://maps.google.com/maps?q=' + address_queried + '&z=17&ie=UTF8&output=embed';

                if ((start_location_data['lat'] == search_lat) && (start_location_data['lng'] == search_long)) {
                    dist_km = 0;
                    dist_m = 0;
                }
                else {
                    var radlat1 = Math.PI * start_location_data['lat'] / 180;
                    var radlat2 = Math.PI * search_lat / 180;
                    var theta = start_location_data['lng'] - search_long;
                    var radtheta = Math.PI * theta / 180;
                    var distance = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                    if (distance > 1) {
                        distance = 1;
                    }
                    distance = Math.acos(distance);
                    distance = distance * 180 / Math.PI;
                    distance = distance * 60 * 1.1515;
                    dist_km = distance * 1.609344;
                    dist_m = dist_km * 1000;
                }

                result = '<div class="mapouter_out">' +
                            '<div><h4>Destination Address Selected</h4></div>' +
                            '<div class="gmap_canvas_out">' +
                                '<iframe width="400" height="218" id="gmap_canvas_out" src="' + result_src + '"></iframe>' +
                            '</div>' +
                            '<div id="destination_location_data">' +
                                '<table>' +
                                    '<tr><td><label>Longitude:</label></td><td>' + search_long + '</td></tr>' +
                                    '<tr><td><label>Lattitude:</label></td><td>' + search_lat + '</td></tr>' +
                                    '<tr><td><label>Address:</label></td><td>' + address_queried + '</td></tr>' +
                                    '<tr><td><label>Distance in km:</label></td><td>' + dist_km.toFixed(2) + '</td></tr>' +
                                    '<tr><td><label>Distance in m:</label></td><td>' + dist_m.toFixed(2) + '</td></tr>' +
                                '</table>'
                            '</div>' +
                         '</div>';

                $('#results').html(result);
            });
        }
    });
}

function startLocation (){
    var buffer = [];
    var result = '';
    $.getJSON('locations/electool.json', function (data) {
        start_lat = data.results[0].geometry.location.lat;
        start_long = data.results[0].geometry.location.lng;
        address_queried = data.results[0].formatted_address

        start_location_data['lat'] = start_lat;
        start_location_data['lng'] = start_long;

        result = '<table>' +
                    '<tr><td><label>Longitude:</label></td><td>' + start_long + '</td></tr>' +
                    '<tr><td><label>Lattitude:</label></td><td>' + start_lat + '</td></tr>' +
                    '<tr><td><label>Address:</label></td><td>' + address_queried + '</td></tr>' +
                 '</table>';

        $('#start_location_data').html(result);

        buffer = address_queried.split(' ');
        address_queried = buffer.join('+');

        $('.gmap_canvas iframe').attr('src', 'https://maps.google.com/maps?q=' + address_queried + '&z=17&ie=UTF8&output=embed');
    });

}