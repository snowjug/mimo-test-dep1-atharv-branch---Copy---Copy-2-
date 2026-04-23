import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { MimoCoinsDisplay } from "./mimo-coins-display";
import { apiFetch } from "../lib/api";

export function MimoHeader() {
  const navigate = useNavigate();
  const [name, setName] = useState(() => localStorage.getItem("mimo_user_name") || "Admin User");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await apiFetch("/mimo/user", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (data.name) {
          setName(data.name);

          // keep localStorage sync (your original logic safe)
          localStorage.setItem("mimo_user_name", data.name);
        }

      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();

  }, []);

  return (
    <>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap');`}
      </style>
      <div className="flex items-end justify-between border-b-[8px] border-[#093765] mb-4 sm:mb-8 pt-4">
        <div className="flex items-end gap-2 cursor-pointer group" onClick={() => navigate("/upload")}>
          <h1 
            className="text-5xl sm:text-6xl font-black tracking-widest text-[#093765] leading-none select-none m-0 -mb-[4px] sm:-mb-[6px] relative top-1"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            MIMO
          </h1>
        </div>
        <div className="flex items-center gap-1 sm:gap-3 pb-3">
          <MimoCoinsDisplay />
          <div 
            className="flex items-center gap-1 sm:gap-3 cursor-pointer p-1 sm:p-2 hover:bg-slate-200/50 rounded-xl transition-colors" 
            onClick={() => navigate("/user-profile")}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-700">{name}</p>
              <p className="text-xs text-gray-500">View Profile</p>
            </div>
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarFallback className="bg-[#093765] text-white font-bold">
                {name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </>
  );
}