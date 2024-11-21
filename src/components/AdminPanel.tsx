"use client";

import { useState, useEffect } from "react";
import { TiLocation } from "react-icons/ti";
import { IoIosTime } from "react-icons/io";
import toast from "react-hot-toast";


// Helper function to get cookie value by name
const getCookie = (name: string): string | undefined => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
};

// Helper function to set a cookie with form data
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

const AdminPanel: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [details, setDetails] = useState<any[]>([]);
  const [newDetails, setNewDetails] = useState({
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleLogin = () => {
    if (password === "admin123") {
      setIsLoggedIn(true);
      toast.success("Login successful");
    } else {
      toast.error("Invalid password");
    }
  };

  // Load schedule data from cookies when the component mounts
  useEffect(() => {
    const savedData = getCookie("pickupDropDetails");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setDetails(Array.isArray(parsedData) ? parsedData : [parsedData]); // Ensure data is always an array
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewDetails({
      ...newDetails,
      [name]: value,
    });
  };

  const handleSwitch = (value: boolean) => {
    setNewDetails({
      ...newDetails,
      isPickup: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedDetails = [...details, newDetails];
    setCookie("pickupDropDetails", JSON.stringify(updatedDetails)); // Store in cookies
    setDetails(updatedDetails); // Update the local state
    setIsSubmitting(true);
    toast.success("Details have been saved!");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-200 via-purple-300 to-purple-400">
      <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-2xl border border-gray-200">
        {!isLoggedIn ? (
          <div>
            <h2 className="text-3xl font-bold text-center text-purple-600 mb-6">Admin Login</h2>
            <div className="flex justify-center mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-64 border rounded-md py-2 px-3 text-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter password"
              />
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleLogin}
                className="px-6 py-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition duration-300"
              >
                Login
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-semibold text-center text-purple-600 mb-8">
              Admin Panel - Pickup and Drop Schedules
            </h2>

            {/* Display Existing Schedules */}
            <h3 className="text-2xl font-semibold text-center text-purple-600 mt-10 mb-4">Existing Schedules</h3>
            <div className="mt-4">
              {details.length === 0 ? (
                <p className="text-center text-gray-500">No schedules available</p>
              ) : (
                <ul className="space-y-6">
                  {details.map((item, index) => (
                    <li key={index} className="p-6 border-l-4 border-purple-500 bg-gradient-to-r from-gray-100 via-gray-200 to-white rounded-lg shadow-lg">
                      <div className="text-xl font-semibold text-purple-800">
                        {item.isPickup ? "Pickup" : "Drop-off"} on{" "}
                        {new Date(item.isPickup ? item.pickupDateTime : item.dropDateTime).toLocaleString()}
                      </div>
                      <div className="text-gray-700 mt-2">{item.location}</div>
                      <div className="text-gray-600 mt-1">{item.foodType} - {item.foodQuantity}</div>
                      <div className="text-gray-600 mt-1">{item.foodDescription}</div>
                      <div className="text-gray-600 mt-1">Contact: {item.contactNumber} | Email: {item.email}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
