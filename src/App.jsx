import { useState } from 'react'
import './App.css'

const cars = [
  { make: 'Toyota', model: 'Camry', year: 2021 },
  { make: 'Honda', model: 'Civic', year: 2020 },
  { make: 'Ford', model: 'Mustang', year: 2022 }
];

const CarDropdown = () => {
  const [carSelected, setCarSelected] = useState('');

  const handleSelectChange = (event) => {
    setSelectedCar(event.target.value);
  };

  return (
    <>
      <h1>Hotel Rental</h1>
      
    </>
  )
}

export default App
