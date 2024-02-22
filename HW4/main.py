from flask import Flask, make_response
import requests
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta



Today = date.today()
Before_30 = Today - timedelta(days=30)
# Before_6M = Today - timedelta(month=6)
Before_6M = Today - relativedelta(months=+6)

app = Flask(__name__, static_url_path='')

Header = {
    "Content-type" : "application/json"
}

finhub_api_url = "https://finnhub.io/api/v1/"
finhub_api_key = "cn092npr01qkcvkfsgm0cn092npr01qkcvkfsgmg"
polygonio_api_key = "6FUPI6O67nSi_0JTVJp_G5vNsV1F7wDF"




@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/profile/<ticker>", methods = ['GET'])
def getProfileDetails(ticker):

    endpoint_url = f'{finhub_api_url}stock/profile2?symbol={ticker}&token={finhub_api_key}'

    response = requests.get(endpoint_url, headers = Header).json()

    return make_response(response, 200) 

@app.route("/quote/<ticker>", methods = ['GET'])
def getQuoteDetails(ticker):

    endpoint_url = f'{finhub_api_url}quote?symbol={ticker}&token={finhub_api_key}'

    response = requests.get(endpoint_url, headers = Header).json()

    return make_response(response, 200) 

@app.route("/recommendation/<ticker>", methods = ['GET'])
def getRecommendationDetails(ticker):

    endpoint_url = f'{finhub_api_url}stock/recommendation?symbol={ticker}&token={finhub_api_key}'

    response = requests.get(endpoint_url, headers = Header).json()

    return make_response(response, 200) 

@app.route("/chart/<ticker>", methods = ['GET'])
def getChartDetails(ticker):


    endpoint_url = f'https://api.polygon.io/v2/aggs/ticker/{ticker}/range/1/day/{Before_6M}/{Today}?adjusted=true&sort=asc&apiKey={polygonio_api_key}'

    response = requests.get(endpoint_url, headers = Header).json()

    return make_response(response, 200) 

@app.route("/news/<ticker>", methods = ['GET'])
def getCompanyNewsDetails(ticker):

    endpoint_url = f'{finhub_api_url}company-news?symbol={ticker}&from={Before_30}&to={Today}&token={finhub_api_key}'

    response = requests.get(endpoint_url, headers = Header).json()

    return make_response(response, 200) 



if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)