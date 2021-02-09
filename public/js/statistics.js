/**
 * Fetches data from an URL by using window.fetch.
 *
 * @param {string} url - URL from which the data is fetched
 * @returns {Promise} promise that will resolve to JSON data
 */
const getJSON = (url) => fetch(url).then(res => res.json());

/**
 * Returns as string representation of a Date object fromatted as "month/day/year".
 * 
 * @param {Date} date 
 * @returns
 */
const getDateAsString = (date) => {
    const month = date.getMonth() + 1; // months begin at 0 for some reason
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

/**
 * Adds the results into view by appending the parameters into a template.
 * 
 * @param {object} list - Stores the longest bullish trend in days and its dates.
 */
const resultA = (list) => {
    const cloneA = document.querySelector("#answer-A").content.cloneNode(true);

    cloneA.querySelector("#days").innerHTML += `<b>${list.max}</b>`;

    const dates = cloneA.querySelector("#dates");
    for (let i = 0; i < list.dates.length; ++i) {
        const date = getDateAsString(list.dates[i]);
        if (i === list.dates.length - 1) dates.innerHTML += `${date}.`;
        else if (i === list.dates.length - 2) dates.innerHTML += `${date} and `;
        else dates.innerHTML += `${date}, `;
    }

    document.querySelector("#answers").appendChild(cloneA);
}

/**
 * Adds the results into view by inserting the list data into a table.
 * 
 * @param {Array<object>} list - Historical stock data results
 */
const resultB = (list) => {
    const cloneB = document.querySelector("#answer-B").content.cloneNode(true);
    list.forEach(obj => {
        const date = getDateAsString(obj.date);
        const volume = obj.volume;
        const change = obj.change.toFixed(2); // display only two decimals

        cloneB.querySelector("#tbody")
            .insertAdjacentHTML("beforeend", 
            `<tr><td>${date}</td><td>${volume}</td><td>${change}$</td></tr>`);
    });
    document.querySelector("#answers").appendChild(cloneB);
}

/**
 * Adds the results into view by inserting the list data into a table.
 * 
 * @param {Array<object>} list - Historical stock data results
 */
const resultC = (list) => {
    const cloneC = document.querySelector("#answer-C").content.cloneNode(true);
    list.forEach(obj => {
        const date = getDateAsString(obj.date);
        const percentage = obj.percentage.toFixed(2); // display only 4 decimals

        cloneC.querySelector("#tbody")
            .insertAdjacentHTML("beforeend", 
            `<tr><td>${date}</td><td>${percentage}%</td></tr>`);
    });
    document.querySelector("#answers").appendChild(cloneC);
}

/**
 * Validates user input and calls the appropriate functions.
 * 
 * @param {event} e - Click event
 * @param {*} quotes - All available historical stock data
 * @returns
 */
const handleForm = (e, quotes) => {
    e.preventDefault();
    const form = e.target.form;
    const start = new Date(form.elements["start"].value.split("-"));
    const end = new Date(form.elements["end"].value.split("-"));

    // remove previous results or errors
    document.querySelector("#answers").innerHTML = "";
    document.querySelector("#error-checkbox").removeAttribute('data-show');
    document.querySelector("#error-date").removeAttribute('data-show');
    document.querySelector("#error-sma5").removeAttribute('data-show');

    // show an error if end date is not before the start time
    if (start > end) {
        document.querySelector("#error-date").setAttribute('data-show', '');
        return;
    }
    // show an erre if user has not checked checkboxes
    if (!(form.elements["A"].checked) && !(form.elements["B"].checked) && 
        !(form.elements["C"].checked)) {
        document.querySelector("#error-checkbox").setAttribute('data-show', '');
        return;
    }

    // filter quotes by the given start and end dates
    const filteredQuotes = quotes.filter(obj => 
        start <= obj.date && obj.date <= end);

    if (form.elements["A"].checked) {
        const days = calculateA(filteredQuotes);
        resultA(days, getDateAsString(start), getDateAsString(end));
    }
    if (form.elements["B"].checked) {
        const list = calculateB(filteredQuotes);
        resultB(list);
    }
    if (form.elements["C"].checked) {
        // add the last 5 days entries to the array
        // so SMA 5 can be calculated on the start day
        const index = quotes.findIndex(obj => obj.date === filteredQuotes[0].date)
        // show error if 5 last days are inavailable
        if (index < 5) {
            document.querySelector("#error-sma5").setAttribute('data-show', '');
            return;
        }
        for (let i = index - 1; i >= index - 5 ; --i) {
            filteredQuotes.unshift(quotes[i]);
        }
        const list = calculateC(filteredQuotes);
        resultC(list);
    }
    // uncheck all checkboxes
    document.querySelectorAll("input[type='checkbox']")
        .forEach(box => box.checked = false);
};

/*
 * Fetches historical quotes JSON data, modifies it to be more usable
 * and assigns event listeners.
 */
(async () => {
    const quotes = await getJSON("/api/historicalquotes");

    // set date picker min/max values according to the data
    const maxDate = quotes[0].Date.split("/");
    const minDate = quotes[quotes.length - 1].Date.split("/");

    document.querySelectorAll("input[type='date']").forEach(date => {
        date.max = `${maxDate[2]}-${maxDate[0]}-${maxDate[1]}`;
        date.min = `${minDate[2]}-${minDate[0]}-${minDate[1]}`;
        date.value = `${maxDate[2]}-${maxDate[0]}-${maxDate[1]}`;
    });

    // mapping strings to int and date -values & sorting by ascending date
    const mappedQuotes = quotes
        .map(obj => ({
            "date": new Date(obj.Date.split("/")),
            "close": parseFloat(obj["Close/Last"].replace("$","")),
            "volume": obj.Volume,
            "open": parseFloat(obj["Open"].replace("$","")),
            "high": parseFloat(obj["High"].replace("$","")),
            "low": parseFloat(obj["Low"].replace("$",""))
        }))
        .sort((a, b) => a.date - b.date);
    
    const earliest = getDateAsString(mappedQuotes[5].date);
    // add to SMA 5 error message
    document.querySelector("#error-sma5>p").innerHTML +=
        `Earliest available start date is ${earliest}.`;

    // event listeners
    document.querySelector("#submit")
        .addEventListener("click", (e) => handleForm(e, mappedQuotes));
})();
