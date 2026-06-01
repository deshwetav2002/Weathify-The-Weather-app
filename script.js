const apiKey = "ac355f3af158a11ca2f391bd3af72912";

window.addEventListener("load", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let lon = position.coords.longitude;
                let lat = position.coords.latitude;

                // FIX 1: Use actual coordinates instead of hardcoded city
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

                fetch(url)
                    .then(res => res.json())
                    .then(data => {
                        console.log(data);
                        weatherReport(data);
                    })
                    .catch(err => showError("Could not fetch weather for your location."));
            },
            () => {
                // Fallback if user denies location
                weatherReport({ name: "Delhi" });
                weatherReportByName("Delhi");
            }
        );
    } else {
        weatherReportByName("Delhi");
    }
});

document.getElementById('Search').addEventListener('click', () => {
    var place = document.getElementById('input').value.trim();
    if (!place) return;
    weatherReportByName(place);
    document.getElementById('input').value = '';
});

document.getElementById('input').addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        document.getElementById('Search').click();
    }
});

function weatherReportByName(city) {
    var urlsearch = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    fetch(urlsearch)
        .then(res => res.json())
        .then(data => {
            if (data.cod !== 200) {
                showError(`City "${city}" not found. Please try again.`);
                return;
            }
            console.log(data);
            weatherReport(data);
        })
        .catch(err => showError("Network error. Please check your connection."));
}

function weatherReport(data) {
    var urlcast = `https://api.openweathermap.org/data/2.5/forecast?q=${data.name}&appid=${apiKey}`;

    fetch(urlcast)
        .then(res => res.json())
        .then(forecast => {
            if (forecast.cod !== "200") {
                showError("Could not load forecast data.");
                return;
            }
            console.log(forecast);
            hourForecast(forecast);
            dayForecast(forecast);

            document.getElementById('City').innerText = data.name + ', ' + data.sys.country;

            // FIX 2: Correct Kelvin to Celsius conversion
            document.getElementById('temperature').innerText = Math.round(data.main.temp - 273.15) + ' °C';
            document.getElementById('clouds').innerText = data.weather[0].description;

            let icon = data.weather[0].icon;
            let iconurl = "https://api.openweathermap.org/img/w/" + icon + ".png";
            document.getElementById('img').src = iconurl;
        })
        .catch(err => showError("Could not load forecast."));
}

function hourForecast(forecast) {
    document.querySelector('.templist').innerHTML = '';
    for (let i = 0; i < 5; i++) {
        var date = new Date(forecast.list[i].dt * 1000);
        let hourR = document.createElement('div');
        hourR.setAttribute('class', 'next');

        let div = document.createElement('div');

        let time = document.createElement('p');
        time.setAttribute('class', 'time');

        // FIX 3: Correct options object for toLocaleTimeString
        time.innerText = date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata'
        });

        // FIX 4: Correct Kelvin conversion
        let temp = document.createElement('p');
        temp.innerText =
            Math.round(forecast.list[i].main.temp_max - 273.15) + ' °C' +
            ' / ' +
            Math.round(forecast.list[i].main.temp_min - 273.15) + ' °C';

        div.appendChild(time);
        div.appendChild(temp);

        let desc = document.createElement('p');
        desc.setAttribute('class', 'desc');
        desc.innerText = forecast.list[i].weather[0].description;

        hourR.appendChild(div);
        hourR.appendChild(desc);
        document.querySelector('.templist').appendChild(hourR);
    }
}

function dayForecast(forecast) {
    document.querySelector('.weekF').innerHTML = '';
    for (let i = 8; i < forecast.list.length; i += 8) {
        let div = document.createElement('div');
        div.setAttribute('class', 'dayF');

        let day = document.createElement('p');
        day.setAttribute('class', 'date');

        // FIX 5: toDateString ignores timezone args; use toLocaleDateString instead
        day.innerText = new Date(forecast.list[i].dt * 1000).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            timeZone: 'Asia/Kolkata'
        });
        div.appendChild(day);

        let temp = document.createElement('p');
        temp.innerText =
            Math.round(forecast.list[i].main.temp_max - 273.15) + ' °C' +
            ' / ' +
            Math.round(forecast.list[i].main.temp_min - 273.15) + ' °C';
        div.appendChild(temp);

        let description = document.createElement('p');
        description.setAttribute('class', 'description');
        description.innerText = forecast.list[i].weather[0].description;
        div.appendChild(description);

        document.querySelector('.weekF').appendChild(div);
    }
}

// FIX 6: Added error display function
function showError(message) {
    document.getElementById('City').innerText = 'Error';
    document.getElementById('temperature').innerText = '--';
    document.getElementById('clouds').innerText = message;
}
