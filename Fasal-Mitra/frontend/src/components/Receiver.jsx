import React, { useState } from 'react';
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
// import "../styles/Receiver.css";

const stripePromise = loadStripe("YOUR_STRIPE_PUBLISHABLE_KEY");

const Receiver = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const machines = [
    { id: 1, name: "Tractor", location: "New York, USA", price: "$100/day" },
    { id: 2, name: "Harvester", location: "California, USA", price: "$150/day" },
    { id: 3, name: "Plow", location: "Texas, USA", price: "$80/day" },
    { id: 4, name: "Seeder", location: "Florida, USA", price: "$120/day" },
    { id: 5, name: "Sprayer", location: "Washington, USA", price: "$90/day" },
    { id: 6, name: "Tractor", location: "Oregon, USA", price: "$110/day" }
  ];

  const filteredMachines = machines.filter(
    (machine) =>
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookNow = (machine) => {
    setSelectedMachine(machine);
  };

  return (
    <div>
      <div className="Rent-machine-Equipment">
        <h2>Rent Machine Equipment</h2>
        <p>Find and rent farming machines from nearby farmers to boost your efficiency.</p>

        <div className="bg-gray-100 min-h-screen p-4">
          <header className="bg-white p-4 shadow-md flex justify-between items-center">
            <h1 className="text-xl font-bold">Rental Marketplace</h1>
            <input
              type="text"
              placeholder="Search..."
              className="border p-2 rounded w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </header>

          <div className="max-w-6xl mx-auto py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredMachines.length > 0 ? (
              filteredMachines.map((machine) => (
                <div key={machine.id} className="bg-white p-4 rounded-lg shadow-md">
                  <img
                    src="https://via.placeholder.com/300"
                    alt={machine.name}
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <h2 className="text-lg font-semibold mt-2">{machine.name}</h2>
                  <p className="text-sm text-gray-600">Location: {machine.location}</p>
                  <p className="text-green-500 font-bold">{machine.price}</p>
                  <div className="flex justify-between mt-3">
                    <button className="bg-green-500 border p-2 rounded w-1/2 mt-2">Call Vendor</button>
                    <button
                      className="bg-green-500 text-white p-2 rounded w-1/2"
                      onClick={() => handleBookNow(machine)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 col-span-3">No machines found</p>
            )}
          </div>

          {selectedMachine && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold">Complete Your Payment</h3>
              <div>
                <p>Machine: {selectedMachine.name}</p>
                <p>Price: {selectedMachine.price}</p>
              </div>

              <Elements stripe={stripePromise}>
                <PaymentForm
                  selectedMachine={selectedMachine}
                  setPaymentSuccess={setPaymentSuccess}
                />
              </Elements>
            </div>
          )}

          {paymentSuccess && (
            <div className="mt-4 text-green-500">
              <p>Payment Successful! Your machine rental is confirmed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PaymentForm = ({ selectedMachine, setPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    const { token, error } = await stripe.createToken(cardElement);

    if (error) {
      console.error(error);
    } else {
      // Simulate a successful payment for this example
      setPaymentSuccess(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <CardElement />
      </div>
      <button
        type="submit"
        disabled={!stripe}
        className="bg-green-500 text-white p-2 rounded w-full"
      >
        Pay {selectedMachine.price}
      </button>
    </form>
  );
};

export default Receiver;