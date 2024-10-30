$().ready(function () {
    const map = L.map('CatoPOPs').setView([47.81,15], 3);
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);

        var catoIcon = L.icon({
            iconUrl: 'images/cato_pop_icon.svg',
            iconSize:     [23, 30], // size of the icon
            iconAnchor:   [22, 50], // point of the icon which will correspond to marker's location
            // shadowAnchor: [4, 62],  // the same for the shadow
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        });


    const data = d3.csv("ajax/parsed_pop_locations_uniq.csv", function(data) {

            pop_up_desc = "POP: " + data.City
            if (data.Via.length > 0) {
                pop_up_desc += " via " + data.Via
            }

            L.marker([data.Latitude, data.Longitude], {icon: catoIcon}).addTo(map).bindPopup(pop_up_desc);

            /*
            L.circle([data.Latitude, data.Longitude], {
                color: 'green',
                fillColor: 'white',
                fillOpacity: 0.5,
                radius: 50000
            }).addTo(map).bindPopup(pop_up_desc);
            */

        }
    )
});