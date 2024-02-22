chartData = [];

function initialLoad() {
    var ticker = document.getElementById("ticker").value;
    resetTab();
    console.log("tic--->"+ticker);
    getProfile("profile", ticker);
    getQuote("quote", ticker);
    getRecommendation("recommendation", ticker);
    getChart("chart", ticker.toUpperCase());
    getNews("news", ticker);

}

function resetTab() {
    document.getElementById("details").style.display = "none";
    document.getElementById("error").style.display = "none";
}

function getProfile(endpoint, ticker) {
    var request = new XMLHttpRequest();
    request.open("GET", "/" + endpoint + "/" + ticker, true);
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            profileDetails = JSON.parse(this.responseText);
            console.log("here 0");
            console.log("AT last result change-->" + JSON.stringify(profileDetails));
            document.getElementById("profileImg").src = profileDetails.logo;
            var profile = document.getElementsByTagName("td");
            console.log("prod" + JSON.stringify(profile[1]));
            profile[1].innerHTML = profileDetails.name;
            profile[11].innerHTML = profileDetails.ticker;
            profile[3].innerHTML = profileDetails.ticker;
            profile[5].innerHTML = profileDetails.exchange;
            profile[7].innerHTML = profileDetails.ipo;
            profile[9].innerHTML = profileDetails.finnhubIndustry;
            openTab('companyBtn', 'company');
            console.log("here");
            console.log("here" + profileDetails);
            if(profileDetails.name) {
                console.log("here 1");
                document.getElementById("details").style.display = "block";
            }
            else {
                document.getElementById("error").style.display = "block";
            }
        }
    };
    request.send(null);

}

function getQuote(endpoint, ticker) {
    var request = new XMLHttpRequest();
    request.open("GET", "/" + endpoint + "/" + ticker, true);
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            quoteDetails = JSON.parse(this.responseText);
            console.log("AT last result change quote-->" + JSON.stringify(quoteDetails));
            var quote = document.getElementsByTagName("td");
            console.log("prod" + JSON.stringify(quote[23].innerHTML));
            quote[13].innerHTML = getDate(quoteDetails.t);
            quote[15].innerHTML = quoteDetails.pc;
            quote[17].innerHTML = quoteDetails.o;
            quote[19].innerHTML = quoteDetails.h;
            quote[21].innerHTML = quoteDetails.l;
            document.getElementById("changeImg").src = Math.sign(parseFloat(quoteDetails.d)) == 1 ? "img/GreenArrowUp.png" : "img/RedArrowDown.png";
            document.getElementById("percentImg").src = Math.sign(parseFloat(quoteDetails.dp)) == 1 ? "img/GreenArrowUp.png" : "img/RedArrowDown.png";
            var change = document.getElementById("changeImg");
            var changeper = document.getElementById("percentImg");
            quote[23].innerHTML = quoteDetails.d + " ";
            quote[23].appendChild(change);
            quote[25].innerHTML = quoteDetails.dp + " ";
            quote[25].appendChild(changeper);
        }
    };
    request.send(null);
}

function getRecommendation(endpoint, ticker) {
    var request = new XMLHttpRequest();
    request.open("GET", "/" + endpoint + "/" + ticker, true);
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            recDetails = JSON.parse(this.responseText);
            console.log("AT last result change rcc-->" + JSON.stringify(recDetails));
            var recc = document.getElementsByTagName("button");
            console.log("prod" + JSON.stringify(recc[4].innerHTML));
            recc[7].innerHTML = recDetails[0].strongSell;
            recc[8].innerHTML = recDetails[0].sell;
            recc[9].innerHTML = recDetails[0].hold;
            recc[10].innerHTML = recDetails[0].buy;
            recc[11].innerHTML = recDetails[0].strongBuy;
        }
    };
    request.send(null);
}

function getChart(endpoint, ticker) {
    var request = new XMLHttpRequest();
    request.open("GET", "/" + endpoint + "/" + ticker, true);
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            chartData = JSON.parse(this.responseText);
            console.log("AT last result change chart-->" + JSON.stringify(chartData));
            makechart();
        }
    };
    request.send(null);
}

function getNews(endpoint, ticker) {
    var request = new XMLHttpRequest();
    request.open("GET", "/" + endpoint + "/" + ticker, true);
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            newsDetails = JSON.parse(this.responseText);
            console.log("AT last result change news-->" + JSON.stringify(newsDetails));
            var news = document.getElementsByClassName("news");
            if(news.length > 1) {
                for(i = n; i > 0; i--) {
                    news[i].remove();
                }
            }
            console.log("prod newsss " + JSON.stringify(news[0].innerHTML));
            console.log("prod newsss " + news[0].innerHTML);
            var newsNum = 0;
            for (let i = 0; i < newsDetails.length; i++) {
                if (newsDetails[i].image.length && newsDetails[i].headline.length && JSON.stringify(newsDetails[i].datetime).length && newsDetails[i].url.length) {
                    var clone = news[0].cloneNode(true);
                    console.log("prod newsss 2 clone " + clone.innerHTML);
                    console.log("prod newsss 2 clone " + newsDetails[i].image);
                    clone.innerHTML = clone.innerHTML.replace("image", newsDetails[i].image);
                    clone.innerHTML = clone.innerHTML.replace("Heading", newsDetails[i].headline);
                    clone.innerHTML = clone.innerHTML.replace("Date", getDate(newsDetails[i].datetime));
                    clone.innerHTML = clone.innerHTML.replace("link", newsDetails[i].url);
                    console.log("prod newsss 2 clone " + clone.innerHTML);
                    clone.style.display = "block";
                    document.getElementById("news").appendChild(clone);
                    newsNum++;
                }
                if (newsNum > 4) { break; }
            }
        }
    };
    request.send(null);
}

function getDate(newsDate) {
    const regex = /[ ]\d{1,2}[,]/g;
    const date = new Date(newsDate  * 1000);
    const formattedNewsDate = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const day = formattedNewsDate.match(regex)[0].replace(",", "");
    return(day.replace(" ", "") + " " + formattedNewsDate.replace(day, ""));
}


function makechart() {

    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    const stockPrice = [], volume = [];
    console.log("chartData data-->" + JSON.stringify(chartData));
    //console.log("chartData len-->" + JSON.stringify(chartData.results.length));

    for (let i = 0; i < chartData.results.length; i += 1) {
        console.log("chartData I" + JSON.stringify(chartData.results[i]));
        stockPrice.push([
            chartData.results[i].t, // the date
            chartData.results[i].c, // open
        ]);

        volume.push([
            chartData.results[i].t, // the date
            chartData.results[i].v // the volume
        ]);
    }

    console.log("stock price-->" + JSON.stringify(stockPrice));
    console.log("volume-->" + JSON.stringify(volume));
    // Create the chart
    Highcharts.stockChart('chart', {

        rangeSelector: {
            buttons: [{
                type: 'day',
                count: 1,
                text: '7d'
            }, {
                type: 'day',
                count: 1,
                text: '15d'
            }, {
                type: 'month',
                count: 1,
                text: '1m'
            }, {
                type: 'month',
                count: 1,
                text: '3m'
            }, {
                type: 'month',
                count: 1,
                text: '6m'
            }],
            inputEnabled: false, // it supports only days
            selected: 1 // all
        },

        title: {
            text: 'Stock Price TSLA ${year}-${month}-${day}'
        },

        subtitle: {
            text: '<a href="https://polygon.io/" target="_blank">Source: Polygon.io</a>',
            useHTML: true
        },

        navigator: {
            series: {
                accessibility: {
                    exposeAsGroupOnly: true
                }
            }
        },

        yAxis: [{

            title: {
                text: 'Stock'
            },
            opposite: false

        }, {
            title: {
                text: 'Volume'
            },
            opposite: true
        }],

        series: [{
            name: 'AAPL Stock Price',
            data: stockPrice,
            type: 'area',
            threshold: null,
            tooltip: {
                valueDecimals: 2
            },
            fillColor: {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops: [
                    [0, Highcharts.getOptions().colors[0]],
                    [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                ]
            }
        }],

    });
};

function openTab(btnName, tabName) {
    Array.from(document.getElementsByClassName("tab-content")).forEach(element => {
        element.style.display = "none";
    });
    Array.from(document.getElementsByClassName("tabBtn")).forEach(element => {
        element.className = element.className.replace(" active", "");
    });
    document.getElementById(tabName).style.display = "block";
    document.getElementById(btnName).className += " active";
}
