"use client";

import { useState, useEffect } from "react";
import { TiLocation } from "react-icons/ti"; // For location icon
import { IoIosTime } from "react-icons/io"; // For time icon
import toast from "react-hot-toast";

interface PickupDropDetails {
  pickupDateTime: string;
  dropDateTime: string;
  location: string;
  foodType: string;
  foodQuantity: string;
  foodDescription: string;
  contactNumber: string;
  email: string;
  isPickup: boolean;
}

// Function to get cookie value by name
const getCookie = (name: string): string | undefined => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
};

// Function to set a cookie with form data
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

const PickupAndDrop: React.FC = () => {
  const [details, setDetails] = useState<PickupDropDetails>({
    pickupDateTime: "2024-11-10T10:00", // Default date-time for pickup
    dropDateTime: "2024-11-10T14:00", // Default date-time for drop
    location: "",
    foodType: "Organic",
    foodQuantity: "",
    foodDescription: "",
    contactNumber: "",
    email: "",
    isPickup: true, // Default to Pickup form
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load form data from cookies when the component mounts
  useEffect(() => {
    const savedData = getCookie("pickupDropDetails");
    if (savedData) {
      setDetails(JSON.parse(savedData)); // Set the cookie data if available
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDetails({
      ...details,
      [name]: value,
    });
  };

  const handleSwitch = (value: boolean) => {
    setDetails({
      ...details,
      isPickup: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Details have been saved!");
    console.log(details);

    // Store form data in cookies
    setCookie("pickupDropDetails", JSON.stringify(details));
    setIsSubmitting(true);
    // Switch to viewing the saved details after submitting
    setIsEditing(false);
  };

  // Show the form if there is no data in cookies, else show the details
  const isFormVisible = !getCookie("pickupDropDetails") || isEditing;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-r shadow-xl rounded-lg">
      <h2 className="text-3xl font-semibold text-center text-purple-600 mb-4">
        Schedule {details.isPickup ? "Pickup" : "Drop"}
      </h2>

      {/* If there is no data in the cookie or if editing is enabled, show the form */}
      {isFormVisible && !isSubmitting ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Switch for Pickup/Drop Navigation */}
          <div className="flex justify-center space-x-8 mb-6">
            <button
              type="button"
              onClick={() => handleSwitch(true)}
              className={`px-4 py-2 rounded-full ${details.isPickup ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-800"} transition duration-300`}
            >
              Pickup
            </button>
            <button
              type="button"
              onClick={() => handleSwitch(false)}
              className={`px-4 py-2 rounded-full ${!details.isPickup ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-800"} transition duration-300`}
            >
              Drop
            </button>
          </div>

          {/* Pickup and Drop Date-Time */}
          {details.isPickup ? (
            <div className="flex space-x-4 text-purple-600">
              <div className="flex-1">
                <label className="block text-sm font-medium text-purple-800">Pickup Date & Time</label>
                <div className="flex items-center space-x-2 mt-2">
                  <IoIosTime className="text-purple-700" />
                  <input
                    type="datetime-local"
                    name="pickupDateTime"
                    value={details.pickupDateTime}
                    onChange={handleChange}
                    className="w-full border rounded-md py-2 px-3 text-gray-700"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-purple-800">Drop-off Date & Time</label>
                <div className="flex items-center space-x-2 mt-2">
                  <IoIosTime className="text-purple-700" />
                  <input
                    type="datetime-local"
                    name="dropDateTime"
                    value={details.dropDateTime}
                    onChange={handleChange}
                    className="w-full border rounded-md py-2 px-3 text-gray-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-purple-800">Pickup Location</label>
            <div className="flex items-center space-x-2 mt-2">
              <TiLocation className="text-purple-700" />
              <input
                type="text"
                name="location"
                value={details.location}
                onChange={handleChange}
                className="w-full border rounded-md py-2 px-3 text-gray-700"
                placeholder="Enter location"
              />
            </div>
          </div>

          {/* Food Type Selection */}
          <div>
            <label className="block text-sm font-medium text-purple-800">Food Type</label>
            <select
              name="foodType"
              value={details.foodType}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 text-gray-700 mt-2"
            >
              <option value="Organic">Organic</option>
              <option value="Non-Organic">Non-Organic</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          {/* Additional Food Details */}
          <div>
            <label className="block text-sm font-medium text-purple-800">Food Quantity</label>
            <input
              type="number"
              name="foodQuantity"
              value={details.foodQuantity}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 text-gray-700 mt-2"
              placeholder="Enter quantity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-800">Food Description</label>
            <textarea
              name="foodDescription"
              value={details.foodDescription}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 text-gray-700 mt-2"
              placeholder="Describe the food (optional)"
            />
          </div>

          {/* Contact Information */}
          <div>
            <label className="block text-sm font-medium text-purple-800">Contact Number</label>
            <input
              type="text"
              name="contactNumber"
              value={details.contactNumber}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 text-gray-700 mt-2"
              placeholder="Enter contact number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-800">Email</label>
            <input
              type="email"
              name="email"
              value={details.email}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 text-gray-700 mt-2"
              placeholder="Enter email address"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition duration-300"
            >
              Schedule {details.isPickup ? "Pickup" : "Drop"}
            </button>
          </div>
        </form>
      ) : (
        // If data is in the cookie, show the details
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-semibold text-purple-700">
              {details.isPickup ? "Pickup" : "Drop"} Details
            </h3>
            
          </div>

          <div>
            <p><strong>{details.isPickup ? "Pickup" : "Drop"} Date & Time:</strong> {details.isPickup ? details.pickupDateTime : details.dropDateTime}</p>
            <p><strong>Location:</strong> {details.location}</p>
            <p><strong>Food Type:</strong> {details.foodType}</p>
            <p><strong>Quantity:</strong> {details.foodQuantity}</p>
            <p><strong>Description:</strong> {details.foodDescription}</p>
            <p><strong>Contact:</strong> {details.contactNumber}</p>
            <p><strong>Email:</strong> {details.email}</p>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm">Helping the planet, one pickup at a time! 🌱</p>
      </div>
    </div>
  );
};

export default PickupAndDrop;

