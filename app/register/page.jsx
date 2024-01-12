"use client";

import Fifth from "@/components/register/fifth";
import First from "@/components/register/first";
import Fourth from "@/components/register/fourth";
import Second from "@/components/register/second";
import Third from "@/components/register/third";
import { useState } from "react";

export default function RegisterPage() {
  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    username: "",
    code: 0,
  });

  function conditionalComponent() {
    switch (page) {
      case 1:
        return (
          <First
            formData={formData}
            setFormData={setFormData}
            page={page}
            setPage={setPage}
          />
        );
      case 2:
        return (
          <Second
            formData={formData}
            setFormData={setFormData}
            page={page}
            setPage={setPage}
          />
        );
      case 3:
        return (
          <Third
            formData={formData}
            setFormData={setFormData}
            page={page}
            setPage={setPage}
          />
        );
      case 4:
        return (
          <Fourth
            formData={formData}
            setFormData={setFormData}
            page={page}
            setPage={setPage}
          />
        );
      case 5:
        return (
          <Fifth
            formData={formData}
            setFormData={setFormData}
            page={page}
            setPage={setPage}
          />
        );
      default:
        return (
          <First
            formData={formData}
            setFormData={setFormData}
            page={page}
            setPage={setPage}
          />
        );
    }
  }

  return (
    <div className="mx-12 sm:mx-20 mt-8">
      <h1 className="title text-center font-bold">Registrierung</h1>
      {/* {conditionalComponent()} */}
      <div className="flex flex-col items-center w-full mt-8">
        <h1 className="title font-extrabold text-error text-center">Die Registrierung ist temporär abgeschaltet</h1>
      </div>
    </div>
  );
}
