"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getUser } from "@/utils/getUser";


export default function RegisterStore() {
  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerMobile, setOwnerMobile] = useState("");
  
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedcity, setSelectedCity] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [storeform, setStoreform] = useState(false);
  const [landmark,setLandmark] = useState("")
  const topRef = useRef<HTMLDivElement>(null);
  
  const user = getUser();
  

  useEffect(() => {
    if (!user) return;

    if (user.role === "agent") {
      setSelectedState(user.state || "");
      setSelectedCity(user.city || "");
    } else if (user.role === "superadmin") {
      fetch("/api/states")
        .then((res) => res.json())
        .then((data) => setStates(data))
        .catch((err) => console.error("Error fetching states:", err));
    }
  }, []);

 /*  useEffect(() => {
    fetch("/api/states")
      .then(res => res.json())
      .then(data => setStates(data));      
  }, []); */
// 2. ONLY for Superadmin: Fetch cities when a state changes
  useEffect(() => {
    // If there is no state selected, or if the user is an agent (since their city is fixed), don't fetch
    if (!selectedState || user?.role === "agent") return;

    fetch("/api/cities/" + selectedState)
      .then((res) => res.json())
      .then((data) => setCities(data))
      .catch((err) => console.error("Error fetching cities:", err));

    // Reset downstream selections when state changes
    setSectors([]);
    setSelectedSector("");
    setSelectedCity("");
  }, [selectedState]);

  /* useEffect(() => {
    console.log('state changes');
    fetch("/api/cities/"+selectedState)
      .then(res => res.json())
      .then(data => setCities(data));
      setSectors([])
      setSelectedSector("")
      setSelectedCity("")
            
  }, [selectedState]); */

  useEffect(() => {
  if (!selectedcity) return;

   fetch("/api/sector/" + selectedcity)
    .then(res => res.json())
    .then(data => setSectors(data));
}   , [selectedcity]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Store Registered:", { storeName, ownerName, address });
    setMessage("Store registered successfully!");
    setStoreName("");
    setOwnerName("");
    setAddress("");


    const payload = {
      storeName,
      ownerName,
      ownerMobile,
      state: selectedState,
      city: selectedcity,
      sector: selectedSector,
      address,
      landmark: landmark // you can add state for this later
    };
    
    const res = await fetch("/api/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Store registered successfully!");
      setStoreName("");
      setOwnerName("");
      setOwnerMobile("");
      setAddress("");
      setTimeout(() => {
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      setMessage("Error saving store");
      setTimeout(() => {
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }


  };

  return (
    <div className="min-h-screen flex flex-col items-start justify-start bg-gray-100 p-8 pt-12">
     {!storeform && (
      <div className="min-h-screen bg-gray-100 p-8 pt-12">
        {user?.role === "agent" ? (
        <div id="select_state">     
          <div className="flex gap-3">
             <h1> Select the State </h1> : 
             <div  className={`px-3 py-1 rounded-full border transition 
                   bg-blue-600 text-white border-blue-700 mb-2`}
              > {selectedState} </div>
          </div>
        </div>
        ): (
        <div id="select_state">
          <h1> Select the State </h1>
          <div className="flex gap-3">
            {states.map((s: any) => (
              <button
                key={s.id}
                onClick={() => setSelectedState(s.name)}
                className={`px-5 py-2 rounded-full border transition 
                  ${selectedState === s.name 
                    ? "bg-blue-600 text-white border-blue-700" 
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        )}
         {user?.role === "agent" ? (
        <div id="select_city">
          <div className="flex gap-3">
           <h1> Select the City </h1> : 
            <div  className={`px-3 py-1 rounded-full border transition 
                   bg-blue-600 text-white border-blue-700 mb-2`}
              > 
              {selectedcity}
              </div>

          </div>
        </div>
         ):(
        <div id="select_city">
          <h1> Select the City </h1>
          <div className="flex gap-3">
            {cities.map((city: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedCity(city)}
                className={`px-5 py-2 rounded-full border transition 
                  ${selectedcity === city 
                    ? "bg-blue-600 text-white border-blue-700" 
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
              >
                {city}
              </button>
            ))}

          </div>
        </div>

         )}

      <div id="select_sector">
        <h1>Select the Sector / Area</h1>

        <div className="flex gap-3 flex-wrap">
          {sectors.map((sector: string, index: number) => (
            <button
              key={index}
              onClick={() => setSelectedSector(sector)}
              className={`px-5 py-2 rounded-full border transition 
                ${selectedSector === sector 
                  ? "bg-blue-600 text-white border-blue-700" 
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
            >
              {sector}
            </button>

          ))}
        </div>

        {selectedSector && (
          <button 
          className="mt-4 px-5 py-2 bg-green-600 text-white rounded"
           onClick={() => setStoreform(true)}
          >
            Proceed to next step
          </button>
        )}
      </div>
      </div>
    )}
      {storeform && (
      <form 
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Register New Store</h2>

        {message && (
          <p className="text-green-600 text-center font-medium">{message}</p>
        )}

        <div>
          <label className="block mb-1 font-medium">Store Name</label>
          <input
            type="text"
            className="w-full p-3 border rounded"
            placeholder="Enter store name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Owner Name</label>
          <input
            type="text"
            className="w-full p-3 border rounded"
            placeholder="Enter owner name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Owner mobile number</label>
          <input
            type="text"
            className="w-full p-3 border rounded"
            placeholder="Enter owner name"
            value={ownerMobile}
            onChange={(e) => setOwnerMobile(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">State</label>
          <input className="w-full p-3 border rounded" value={selectedState} />      
        </div>

        <div>
          <label className="block mb-1 font-medium">City</label>
          <input className="w-full p-3 border rounded" value={selectedcity} />      
        </div>

        <div>
          <label className="block mb-1 font-medium">Sector/Area</label>
          <input className="w-full p-3 border rounded" value={selectedSector} />      
        </div>

        <div>
          <label className="block mb-1 font-medium">Landmark</label>
          <input className="w-full p-3 border rounded" value={landmark}
          onChange={(e)=>setLandmark(e.target.value)}
          />      
        </div>

        <div>
          <label className="block mb-1 font-medium">Store Address</label>
          <textarea
            className="w-full p-3 border rounded"
            placeholder="Enter store address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          Create Store
        </button>
      </form>
      )}
    </div>
    
  );
}
