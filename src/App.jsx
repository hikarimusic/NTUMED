import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://https://ugdmbcekdmznjcjuolsv.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnZG1iY2VrZG16bmpjanVvbHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUxMTI2MDMsImV4cCI6MjA0MDY4ODYwM30.vVRBN_Axpj63-6YOlPSfc5xdD47IoU2C5UCFIyr6HAc");

function App() {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    getCountries();
  }, []);

  async function getCountries() {
    const { data } = await supabase.from("countries").select();
    setCountries(data);
  }

  return (
    <ul>
      {countries.map((country) => (
        <li key={country.name}>{country.name}</li>
      ))}
    </ul>
  );
}

export default App;