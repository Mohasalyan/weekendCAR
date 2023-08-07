const{agencies}= require("./agency-data");
const{agencies}= require("./customer");
const{agencies}= require("./taxesAuthority");

const CarAgencyManager = {
    agencies: [],
  
    searchAgency: function (idOrName) {
      return this.agencies.find((agency) => agency.name === idOrName || agency.id === idOrName) || null;
    },
  
    getAllAgencies: function () {
      return this.agencies.map((agency) => agency.name);
    },
  
    addCarToAgency: function (agencyId, car) {
      let agency = this.agencies.find((agency) => agency.id === agencyId);
      if (agency) {
        agency.cars.push(car);
        return true;
      }
      return false;
    },
  
    removeCarFromAgency: function (agencyId, carId) {
        for (let i = 0; i < this.agencies.length; i++) {
          const agency = this.agencies[i];
          if (agency.id === agencyId) {
            const carIndex = agency.cars.findIndex((car) => car.id === carId);
            if (carIndex !== -1) {
              agency.cars.splice(carIndex, 1);
              return true;
            }
            break; 
          }
        }
        return false;
      },
    
  
    changeAgencyCashOrCredit: function (agencyId, cashOrCredit) {
      const agency = this.agencies.find((agency) => agency.id === agencyId);
      if (agency) {
        agency.cashOrCredit = cashOrCredit;
        return true;
      }
      return false;
    },
  
    updateCarPrice: function (agencyId, carId, newPrice) {
      const agency = this.agencies.find((agency) => agency.id === agencyId);
      if (agency) {
        let car = agency.cars.find((car) => car.id === carId);
        if (car) {
          car.price = newPrice;
          return true;
        }
      }
      return false;
    },
  
    getTotalAgencyRevenue: function (agencyId) {
      const agency = this.agencies.find((agency) => agency.id === agencyId);
      if (agency) {
        return agency.cars.reduce((total, car) => total + car.price, 0);
      }
      return 0;
    },
  
    transferCarBetweenAgencies: function (fromAgencyId, toAgencyId, carId) {
      const fromAgency = this.agencies.find((agency) => agency.id === fromAgencyId);
      const toAgency = this.agencies.find((agency) => agency.id === toAgencyId);
  
      if (!fromAgency || !toAgency) {
        return false;
      }
  
      const carIndex = fromAgency.cars.findIndex((car) => car.id === carId);
      if (carIndex === -1) {
        return false;
      }
  
      const car = fromAgency.cars.splice(carIndex, 1)[0];
      toAgency.cars.push(car);
      return true;
    },
  };
  
  const CustomerManager = {
    customers: [],
  
    searchCustomer: function (idOrName) {
      return this.customers.find((customer) => customer.name === idOrName || customer.id === idOrName) || null;
    },
  
    getAllCustomers: function () {
      return this.customers.map((customer) => customer.name);
    },
  
    changeCustomerCash: function (customerId, cash) {
      const customer = this.customers.find((customer) => customer.id === customerId);
      if (customer) {
        customer.cash = cash;
        return true;
      }
      return false;
    },
  
    getCustomerTotalCarValue: function (customerId) {
      const customer = this.customers.find((customer) => customer.id === customerId);
      if (customer) {
        return customer.carsOwned.reduce((total, car) => total + car.price, 0);
      }
      return 0;
    },
  };
  
  const CarManager = {
    agencies: [],
  
    getAllCars: function () {
      return this.agencies.reduce((cars, agency) => cars.concat(agency.cars), []);
    },
  
    searchCars: function (year, price, brand) {
      return this.getAllCars().filter((car) => {
        return (!year || car.year === year) && (!price || car.price <= price) && (!brand || car.make.toLowerCase() === brand.toLowerCase());
      });
    },
  
    getMostExpensiveCar: function () {
      const allCars = this.getAllCars();
      return allCars.reduce((maxCar, car) => (car.price > maxCar.price ? car : maxCar), allCars[0]);
    },
  
    getCheapestCar: function () {
      const allCars = this.getAllCars();
      return allCars.reduce((minCar, car) => (car.price < minCar.price ? car : minCar), allCars[0]);
    },
  };
  
  const CarPurchaseManager = {
    agencies: [],
    customers: [],
    taxesAuthority: {
      totalTaxesPaid: 0,
      sumOfAllTransactions: 0,
      numberOfTransactions: 0,
    },
  
    sellCar: function (carId, customerId) {
      const car = CarManager.getAllCars().find((car) => car.id === carId);
      const customer = CustomerManager.customers.find((customer) => customer.id === customerId);
  
      if (!car || !customer) {
        return false;
      }
  
      const totalPrice = car.price + car.price * 0.1; 
      if (customer.cash < totalPrice) {
        return false;
      }
  
      const agency = CarManager.agencies.find((agency) => agency.cars.includes(car));
      if (!agency) {
        return false;
      }
  
      agency.cash += totalPrice;
      CarAgencyManager.changeAgencyCashOrCredit(agency.id, agency.cash);
  
      const taxAmount = car.price * 0.1;
      this.taxesAuthority.totalTaxesPaid += taxAmount;
      this.taxesAuthority.sumOfAllTransactions += totalPrice;
      this.taxesAuthority.numberOfTransactions++;
  
      customer.cash -= totalPrice;
      customer.carsOwned.push(car);
  
      return true;
    },
  
    getTotalMarketRevenue: function () {
      return CarManager.agencies.reduce((total, agency) => total + CarAgencyManager.getTotalAgencyRevenue(agency.id), 0);
    },
  };
  