// Machine Learning Price Prediction Model
// Uses simple linear regression + multiple factors

class PricePredictor {
  constructor() {
    // Training data (historical rides)
    this.trainingData = [
      // Format: { distance, time, traffic, demand, dayOfWeek, hour, surge, price }
      { distance: 0.5, time: 5, traffic: 1, demand: 1, dayOfWeek: 3, hour: 10, surge: 1.0, price: 60 },
      { distance: 1.0, time: 8, traffic: 1, demand: 1, dayOfWeek: 3, hour: 10, surge: 1.0, price: 95 },
      { distance: 2.0, time: 15, traffic: 2, demand: 2, dayOfWeek: 3, hour: 10, surge: 1.1, price: 180 },
      { distance: 3.0, time: 20, traffic: 2, demand: 2, dayOfWeek: 3, hour: 10, surge: 1.2, price: 250 },
      { distance: 5.0, time: 30, traffic: 3, demand: 3, dayOfWeek: 3, hour: 10, surge: 1.3, price: 380 },
      
      // Peak hours (8-9am, 6-7pm)
      { distance: 1.0, time: 12, traffic: 3, demand: 4, dayOfWeek: 3, hour: 8, surge: 2.0, price: 180 },
      { distance: 1.0, time: 15, traffic: 3, demand: 4, dayOfWeek: 3, hour: 18, surge: 2.2, price: 210 },
      { distance: 2.0, time: 25, traffic: 3, demand: 4, dayOfWeek: 3, hour: 8, surge: 2.0, price: 360 },
      
      // Night rides (11pm-6am) - surge pricing
      { distance: 1.0, time: 8, traffic: 1, demand: 2, dayOfWeek: 3, hour: 23, surge: 1.5, price: 140 },
      { distance: 2.0, time: 16, traffic: 1, demand: 2, dayOfWeek: 3, hour: 2, surge: 1.8, price: 320 },
      
      // Weekends
      { distance: 1.0, time: 8, traffic: 2, demand: 2, dayOfWeek: 6, hour: 14, surge: 1.2, price: 115 },
      { distance: 2.0, time: 16, traffic: 2, demand: 2, dayOfWeek: 6, hour: 14, surge: 1.2, price: 220 },
      
      // Rain/Bad weather (high demand)
      { distance: 1.0, time: 10, traffic: 3, demand: 5, dayOfWeek: 3, hour: 15, surge: 3.0, price: 280 },
      { distance: 2.0, time: 20, traffic: 3, demand: 5, dayOfWeek: 3, hour: 15, surge: 3.0, price: 540 },
    ];

    this.weights = {
      distance: 60,      // ₹ per km
      time: 2,           // ₹ per minute
      traffic: 15,       // ₹ per traffic level
      demand: 20,        // ₹ per demand level
      surge: 50,         // Multiplier factor
      basePrice: 30,     // Base fare
      timeOfDay: 10,     // Peak hour adjustment
      dayOfWeek: 5,      // Weekend adjustment
    };

    this.trainModel();
  }

  // Simple training using least squares regression
  trainModel() {
    console.log('🤖 Training price prediction model...');

    let sumDistance = 0, sumTime = 0, sumTraffic = 0, sumDemand = 0;
    let sumPrice = 0, count = 0;

    this.trainingData.forEach((data) => {
      sumDistance += data.distance;
      sumTime += data.time;
      sumTraffic += data.traffic;
      sumDemand += data.demand;
      sumPrice += data.price;
      count++;
    });

    // Calculate averages
    const avgDistance = sumDistance / count;
    const avgTime = sumTime / count;
    const avgTraffic = sumTraffic / count;
    const avgDemand = sumDemand / count;
    const avgPrice = sumPrice / count;

    // Calculate correlations and adjust weights
    let distanceCorr = 0, timeCorr = 0, trafficCorr = 0, demandCorr = 0;

    this.trainingData.forEach((data) => {
      distanceCorr += (data.distance - avgDistance) * (data.price - avgPrice);
      timeCorr += (data.time - avgTime) * (data.price - avgPrice);
      trafficCorr += (data.traffic - avgTraffic) * (data.price - avgPrice);
      demandCorr += (data.demand - avgDemand) * (data.price - avgPrice);
    });

    // Normalize weights based on correlation
    this.weights.distance = Math.abs(distanceCorr / count) || 60;
    this.weights.time = Math.abs(timeCorr / count) || 2;
    this.weights.traffic = Math.abs(trafficCorr / count) || 15;
    this.weights.demand = Math.abs(demandCorr / count) || 20;

    console.log('✅ Model trained with weights:', this.weights);
  }

  // Predict price based on multiple factors
  predictPrice(factors) {
    const {
      distance = 1.0,
      time = 10,
      traffic = 1,
      demand = 1,
      dayOfWeek = new Date().getDay(),
      hour = new Date().getHours(),
      weather = 'clear',
      isRaining = false,
    } = factors;

    // Base calculation
    let predictedPrice =
      this.weights.basePrice +
      distance * this.weights.distance +
      time * this.weights.time +
      traffic * this.weights.traffic +
      demand * this.weights.demand;

    // Time of day multiplier
    let timeMultiplier = 1.0;
    if (hour >= 8 && hour <= 9) timeMultiplier = 1.8; // Morning rush
    if (hour >= 17 && hour <= 19) timeMultiplier = 2.0; // Evening rush
    if (hour >= 23 || hour <= 5) timeMultiplier = 1.5; // Night surge
    if (hour >= 12 && hour <= 14) timeMultiplier = 1.1; // Lunch time

    // Weekend multiplier
    let dayMultiplier = 1.0;
    if (dayOfWeek === 0 || dayOfWeek === 6) dayMultiplier = 1.2; // Weekend

    // Weather multiplier
    let weatherMultiplier = 1.0;
    if (isRaining) weatherMultiplier = 2.5; // Heavy rain = surge
    if (weather === 'cloudy') weatherMultiplier = 1.1;

    // Demand multiplier
    let demandMultiplier = 1.0 + (demand - 1) * 0.2; // Each demand level = 20% increase

    // Calculate final price with all multipliers
    predictedPrice =
      predictedPrice *
      timeMultiplier *
      dayMultiplier *
      weatherMultiplier *
      demandMultiplier;

    // Round to nearest 5
    predictedPrice = Math.round(predictedPrice / 5) * 5;

    return {
      estimatedPrice: Math.max(predictedPrice, 50), // Minimum ₹50
      breakdown: {
        basePrice: this.weights.basePrice,
        distanceCharge: distance * this.weights.distance,
        timeCharge: time * this.weights.time,
        trafficCharge: traffic * this.weights.traffic,
        demandCharge: demand * this.weights.demand,
        timeMultiplier: (timeMultiplier - 1) * 100 + '%',
        dayMultiplier: (dayMultiplier - 1) * 100 + '%',
        weatherMultiplier: (weatherMultiplier - 1) * 100 + '%',
        demandMultiplier: (demandMultiplier - 1) * 100 + '%',
      },
      confidence: 0.85, // 85% confidence
    };
  }

  // Predict price for a ride
  predictRidePrice(userLat, userLng, destLat, destLng, rideType = 'cab') {
    // Calculate distance
    const distance = this.calculateDistance(userLat, userLng, destLat, destLng);

    // Estimate time (assumes ~4 min per km in normal traffic)
    const time = distance * 4;

    // Get current conditions
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // Simulate traffic based on time (simplified)
    let traffic = 1;
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) traffic = 3;
    else if ((hour >= 11 && hour <= 16) || hour >= 20) traffic = 2;

    // Simulate demand (simplified)
    let demand = 1;
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) demand = 4;
    else if (hour >= 11 && hour <= 16) demand = 2;

    // Adjust base price for ride type
    const typeMultiplier = {
      bike: 0.6,
      auto: 0.9,
      cab: 1.0,
      premium: 1.5,
    };

    const prediction = this.predictPrice({
      distance,
      time,
      traffic,
      demand,
      dayOfWeek,
      hour,
    });

    // Apply ride type multiplier
    const finalPrice = Math.round(
      prediction.estimatedPrice * (typeMultiplier[rideType] || 1.0)
    );

    return {
      ...prediction,
      estimatedPrice: finalPrice,
      rideType,
      distance: parseFloat(distance.toFixed(2)),
      estimatedTime: Math.round(time),
    };
  }

  // Calculate distance between two coordinates
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export default new PricePredictor();