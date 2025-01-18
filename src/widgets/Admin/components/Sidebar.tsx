"use client";
import Button from "@components/Button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { FaRegRectangleList } from "react-icons/fa6";
import { TiTicket } from "react-icons/ti";
import { MdOutlineAddBox } from "react-icons/md";
import { MdOutlineContactSupport } from "react-icons/md";
import { MdLogout } from "react-icons/md";
import { TiHomeOutline } from "react-icons/ti";
import { signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname(); // Get the current path
const router  = useRouter();
  const menu = [
    {
      title: "List Users",
      link: "/admin/list-users",
      icon: <FaRegRectangleList />,
    },
    {
      title: "Purchased",
      link: "/admin/purchased",
      icon: <TiTicket />,
    },
    {
      title: "Support-Tickets",
      link: "/admin/support-tickets",
      icon: <MdOutlineContactSupport />,
    },
    {
      title: "New Ticket",
      link: "/admin/newTicket",
      icon: <MdOutlineAddBox />,
    },
    {
      title: "Checked In",
      link: "/admin/checkedIn",
      icon: <MdOutlineAddBox />,
    },
  ];

  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logging out...");
  };

  return (
    <div className="flex flex-col px-[2vw] w-[250px] bg-black-100 min-h-screen justify-between relative">
      <div className="py-5 flex flex-col gap-2 flex-grow">
        {menu.map((item) => {
          const isActive = pathname === item.link;
          return (
            <Link key={item.link} href={item.link}>
              <div
                className={`w-full flex items-center gap-3 px-4 py-2 rounded ${
                  isActive
                    ? "bg-primary-700 text-white"
                    : "bg-black-100 text-gray-400"
                } hover:bg-primary-700 hover:text-white transition-all duration-200`}
              >
                {item?.icon}
                {item.title}
              </div>
            </Link>
          );
        })}
      </div>
      <div className="absolute bottom-[8rem] w-full flex flex-col gap-2">
        <Link href={"/"} className="w-full">
          <Button
            title="Go to home"
            position="left"
            icon={<TiHomeOutline />}
            className="flex items-center gap-2 justify-center bg-primary-700 py-2 w-[12rem] rounded-[10px] text-xl"
          />
          </Link>{" "}
          <Button
            title="Logout"
            onClick={()=>{
              signOut()
            }}
            position="left"
            icon={<MdLogout />}
            className="flex items-center gap-2 justify-center border border-primary-700 text-primary-700 py-2 w-[12rem] rounded-[10px] text-xl"
          />
      </div>
    </div>
  );
}
