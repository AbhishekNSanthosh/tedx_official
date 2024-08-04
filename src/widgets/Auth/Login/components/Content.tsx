"use client"
import React, { useEffect, useState } from "react";
import RegisterForm from "./LoginForm";
import RegisterContent from "./LoginContent";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PreLoader from "@components/PreLoader";

export default function Content() {
  const { data: session, status } = useSession();
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (status === "authenticated") {
      // Redirect to home page
      router.push("/");
    }
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [status, session, router]);
  return (
    <main className="w-screen h-screen bg-black-100 flex items-center justify-center overflow-y-hidden">
       {!isLoaded && <PreLoader />}
      <RegisterContent />
      <RegisterForm />
    </main>
  );
}
