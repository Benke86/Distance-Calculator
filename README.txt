Distance Calculator from a Specified Start Point

To use this tool:
- either set up a webserver for relative script and style paths or change them to an absolute one in the index.html file, found in the head tag
- if the tool is used without a webserver, change the json files location to an absolute path in the js/scripts.js
- use your own Google API key for location services:
    -- Open the js/script.js file and and replace the 'YOUR_API_KEY' with a valid Google API key.

This tool has basic validation checks on the input fields, such as:
- only letetrs are alowed in the Continent, Country, City, Street Name
- house numbers are validated in formats:
    -- 12, 12a, 12/a, 12/aa, 12aa
- postal codes have no restrictions
- white spaces from the start and end of the input strings are trimmed
- empty input fields are not allowed
- imput fields containing only '-' character are not allowed

Functionalities:
- calculates the flight distance between a set point and a queried one using the Google Location API.

Changing start point:
- edit the json/electool.json file or use the Google API to retrieve a location JSON format
    -- results.formatted_address is used for google maps query display
    -- results.geometry.location.lat and results.geometry.location.lng are used to calculate flight path towards the other location.


This tool is free to use, however a Google API key is required. See above on how to set your key in the script file.



Created by Attila Benke 2019.02.27