from flask import Flask, request, render_template, jsonify
import pickle
import datetime
from haversine import haversine

app = Flask(__name__)

# Load models
puca_model = pickle.load(open('models/puca.pkl', 'rb'))
doca_model = pickle.load(open('models/doca.pkl', 'rb'))
fare_model = pickle.load(open('models/fare_model.pkl', 'rb'))

company_mapping = {'Flash Cab': 1, 'Taxicab Insurance Agency Llc': 2, 'City Service': 3, 'Chicago Independents': 4, 'Taxi Affiliation Services': 5, 'Sun Taxi': 6, '5 Star Taxi': 7, 'Globe Taxi': 8, 'Blue Ribbon Taxi Association': 9, 'Medallion Leasin': 10}
payment_type_mapping = {'Credit Card': 1, 'Mobile': 2, 'Cash': 3, 'Prcard': 4, 'Coupon': 5}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    
    pickup_lat = data['pickup_lat']
    pickup_lon = data['pickup_lon']
    dropoff_lat = data['dropoff_lat']
    dropoff_lon = data['dropoff_lon']
    company = data['company']
    payment_type = data['payment_type']

    trip_miles = haversine((pickup_lat, pickup_lon), (dropoff_lat, dropoff_lon))
    pickup_community_area = puca_model.predict([[pickup_lat, pickup_lon]])[0]
    dropoff_community_area = doca_model.predict([[dropoff_lat, dropoff_lon]])[0]
    trip_minutes = trip_miles / 0.32
    trip_start_hour = datetime.datetime.now().hour
    trip_start_day = datetime.datetime.now().weekday()
    
    input_features = [[
        trip_miles, 
        pickup_community_area, 
        dropoff_community_area, 
        trip_minutes, 
        trip_start_hour, 
        trip_start_day, 
        company_mapping[company], 
        0, 
        0, 
        0, 
        payment_type_mapping[payment_type]
    ]]

    fare = fare_model.predict(input_features)[0]
    travel_time = trip_minutes

    return jsonify({
        'fare': round(fare, 2),
        'travel_time': round(travel_time, 2)
    })

@app.route('/dashboard')
def dashboard():
    return redirect('YOUR_TABLEAU_DASHBOARD_LINK')

if __name__ == '__main__':
    app.run(debug=True)
